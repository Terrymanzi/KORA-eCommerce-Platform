import { supabase } from "./client"
import type { Partnership } from "@/types/supabase"

export async function createPartnership(partnershipData: Omit<Partnership, "id" | "created_at" | "updated_at">) {
  try {
    const { data, error } = await supabase.from("partnerships").insert(partnershipData).select().single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error("Error creating partnership:", error)
    return { data: null, error }
  }
}

export async function updatePartnership(id: string, updates: Partial<Partnership>) {
  try {
    const { data, error } = await supabase.from("partnerships").update(updates).eq("id", id).select().single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error("Error updating partnership:", error)
    return { data: null, error }
  }
}

export async function getPartnershipById(id: string) {
  try {
    const { data, error } = await supabase
      .from("partnerships")
      .select(
        "*, wholesaler:profiles!partnerships_wholesaler_id_fkey(*), dropshipper:profiles!partnerships_dropshipper_id_fkey(*)",
      )
      .eq("id", id)
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error("Error getting partnership:", error)
    return { data: null, error }
  }
}

export async function getPartnershipsByUserId(userId: string, role?: "wholesaler" | "dropshipper") {
  try {
    let query = supabase
      .from("partnerships")
      .select(
        "*, wholesaler:profiles!partnerships_wholesaler_id_fkey(*), dropshipper:profiles!partnerships_dropshipper_id_fkey(*)",
      )

    if (role === "wholesaler") {
      query = query.eq("wholesaler_id", userId)
    } else if (role === "dropshipper") {
      query = query.eq("dropshipper_id", userId)
    } else {
      query = query.or(`wholesaler_id.eq.${userId},dropshipper_id.eq.${userId}`)
    }

    const { data, error } = await query

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error("Error getting partnerships by user:", error)
    return { data: null, error }
  }
}

export async function checkPartnershipExists(wholesalerId: string, dropshipperId: string) {
  try {
    const { data, error } = await supabase
      .from("partnerships")
      .select("*")
      .eq("wholesaler_id", wholesalerId)
      .eq("dropshipper_id", dropshipperId)
      .single()

    if (error && error.code !== "PGRST116") throw error // PGRST116 is "No rows returned" error
    return { exists: !!data, data, error: null }
  } catch (error) {
    console.error("Error checking partnership:", error)
    return { exists: false, data: null, error }
  }
}

