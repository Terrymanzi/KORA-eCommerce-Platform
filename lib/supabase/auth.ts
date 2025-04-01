import { supabase } from "./client"
import { createServerSupabaseClient } from "./server"
import { redirect } from "next/navigation"

export async function signUp(
  email: string,
  password: string,
  userData: {
    full_name: string
    phone: string
    user_type: "dropshipper" | "wholesaler" | "customer"
  },
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: userData.full_name,
        phone: userData.phone,
        user_type: userData.user_type,
      },
    },
  })

  if (error) {
    throw error
  }

  // Create profile record
  if (data.user) {
    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      full_name: userData.full_name,
      phone: userData.phone,
      user_type: userData.user_type,
    })

    if (profileError) {
      throw profileError
    }
  }

  return data
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw error
  }

  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw error
  }
}

export async function getSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error) {
    throw error
  }

  return session
}

export async function getUserProfile() {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session) {
    return null
  }

  const { data, error } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  if (error) {
    throw error
  }

  return data
}

export async function updateUserProfile(profileData: any) {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session) {
    throw new Error("Not authenticated")
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(profileData)
    .eq("id", session.user.id)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function requireAuth() {
  const supabase = createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  return session
}

export async function requireAdmin() {
  const supabase = createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("user_type")
    .eq("id", session.user.id)
    .single()

  if (error || profile?.user_type !== "admin") {
    redirect("/dashboard")
  }

  return session
}

