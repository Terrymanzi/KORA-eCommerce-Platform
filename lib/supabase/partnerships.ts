import { supabase } from "./client"

export async function getPartnerships(
  options: {
    userId?: string
    status?: "pending" | "active" | "rejected"
    role?: "dropshipper" | "wholesaler"
  } = {},
) {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session) {
    throw new Error("Not authenticated")
  }

  const userId = options.userId || session.user.id

  let query = supabase.from("partnerships").select(`
      *,
      dropshipper:profiles!dropshipper_id (
        id,
        full_name,
        avatar_url
      ),
      wholesaler:profiles!wholesaler_id (
        id,
        full_name,
        avatar_url
      )
    `)

  if (options.role === "dropshipper") {
    query = query.eq("dropshipper_id", userId)
  } else if (options.role === "wholesaler") {
    query = query.eq("wholesaler_id", userId)
  } else {
    query = query.or(`dropshipper_id.eq.${userId},wholesaler_id.eq.${userId}`)
  }

  if (options.status) {
    query = query.eq("status", options.status)
  }

  query = query.order("updated_at", { ascending: false })

  const { data, error } = await query

  if (error) {
    throw error
  }

  return data
}

export async function getPartnershipById(id: string) {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session) {
    throw new Error("Not authenticated")
  }

  const { data, error } = await supabase
    .from("partnerships")
    .select(`
      *,
      dropshipper:profiles!dropshipper_id (
        id,
        full_name,
        avatar_url
      ),
      wholesaler:profiles!wholesaler_id (
        id,
        full_name,
        avatar_url
      )
    `)
    .eq("id", id)
    .single()

  if (error) {
    throw error
  }

  // Check if user is part of the partnership
  if (data.dropshipper_id !== session.user.id && data.wholesaler_id !== session.user.id) {
    throw new Error("Unauthorized")
  }

  return data
}

export async function requestPartnership(wholesalerId: string, commissionRate: number) {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session) {
    throw new Error("Not authenticated")
  }

  // Check if user is a dropshipper
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("user_type")
    .eq("id", session.user.id)
    .single()

  if (profileError) {
    throw profileError
  }

  if (profile.user_type !== "dropshipper") {
    throw new Error("Only dropshippers can request partnerships")
  }

  // Check if wholesaler exists and is a wholesaler
  const { data: wholesaler, error: wholesalerError } = await supabase
    .from("profiles")
    .select("user_type")
    .eq("id", wholesalerId)
    .single()

  if (wholesalerError) {
    throw wholesalerError
  }

  if (wholesaler.user_type !== "wholesaler") {
    throw new Error("Can only partner with wholesalers")
  }

  // Check if partnership already exists
  const { count, error: countError } = await supabase
    .from("partnerships")
    .select("id", { count: "exact" })
    .eq("dropshipper_id", session.user.id)
    .eq("wholesaler_id", wholesalerId)

  if (countError) {
    throw countError
  }

  if (count > 0) {
    throw new Error("Partnership already exists")
  }

  // Create partnership request
  const { data: partnership, error: createError } = await supabase
    .from("partnerships")
    .insert({
      dropshipper_id: session.user.id,
      wholesaler_id: wholesalerId,
      status: "pending",
      commission_rate: commissionRate,
    })
    .select()
    .single()

  if (createError) {
    throw createError
  }

  return partnership
}

export async function respondToPartnershipRequest(partnershipId: string, accept: boolean) {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session) {
    throw new Error("Not authenticated")
  }

  // Check if user is the wholesaler in this partnership
  const { data: partnership, error: partnershipError } = await supabase
    .from("partnerships")
    .select("wholesaler_id, status")
    .eq("id", partnershipId)
    .single()

  if (partnershipError) {
    throw partnershipError
  }

  if (partnership.wholesaler_id !== session.user.id) {
    throw new Error("Unauthorized")
  }

  if (partnership.status !== "pending") {
    throw new Error("Partnership request is not pending")
  }

  // Update partnership status
  const { data: updatedPartnership, error: updateError } = await supabase
    .from("partnerships")
    .update({
      status: accept ? "active" : "rejected",
    })
    .eq("id", partnershipId)
    .select()
    .single()

  if (updateError) {
    throw updateError
  }

  return updatedPartnership
}

export async function updateCommissionRate(partnershipId: string, commissionRate: number) {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session) {
    throw new Error("Not authenticated")
  }

  // Check if user is part of the partnership
  const { data: partnership, error: partnershipError } = await supabase
    .from("partnerships")
    .select("dropshipper_id, wholesaler_id, status")
    .eq("id", partnershipId)
    .single()

  if (partnershipError) {
    throw partnershipError
  }

  if (partnership.dropshipper_id !== session.user.id && partnership.wholesaler_id !== session.user.id) {
    throw new Error("Unauthorized")
  }

  if (partnership.status !== "active") {
    throw new Error("Partnership is not active")
  }

  // Update commission rate
  const { data: updatedPartnership, error: updateError } = await supabase
    .from("partnerships")
    .update({
      commission_rate: commissionRate,
    })
    .eq("id", partnershipId)
    .select()
    .single()

  if (updateError) {
    throw updateError
  }

  return updatedPartnership
}

export async function terminatePartnership(partnershipId: string) {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session) {
    throw new Error("Not authenticated")
  }

  // Check if user is part of the partnership
  const { data: partnership, error: partnershipError } = await supabase
    .from("partnerships")
    .select("dropshipper_id, wholesaler_id")
    .eq("id", partnershipId)
    .single()

  if (partnershipError) {
    throw partnershipError
  }

  if (partnership.dropshipper_id !== session.user.id && partnership.wholesaler_id !== session.user.id) {
    throw new Error("Unauthorized")
  }

  // Delete partnership
  const { error: deleteError } = await supabase.from("partnerships").delete().eq("id", partnershipId)

  if (deleteError) {
    throw deleteError
  }

  return true
}

