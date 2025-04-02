import { supabase } from "./client"
<<<<<<< HEAD
import type { Profile } from "@/types/supabase"
=======
import { createServerSupabaseClient } from "./server"
import { redirect } from "next/navigation"
>>>>>>> 6a74f7da2e64b207934e20c42703be7a59e35ddf

export async function signUp(
  email: string,
  password: string,
<<<<<<< HEAD
  userData: Omit<Profile, "id" | "created_at" | "updated_at">,
) {
  try {
    // Since we're not using real authentication, we'll just create a profile
    const { data, error } = await supabase
      .from("profiles")
      .insert({
        ...userData,
        id: crypto.randomUUID(), // Generate a UUID for the user
        email,
      })
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error("Error signing up:", error)
    return { data: null, error }
  }
}

export async function signIn(email: string) {
  try {
    const { data, error } = await supabase.from("profiles").select("*").eq("email", email).single()

    if (error) throw error

    // Store user data in localStorage for session management
    if (data) {
      localStorage.setItem("user", JSON.stringify(data))
    }

    return { data, error: null }
  } catch (error) {
    console.error("Error signing in:", error)
    return { data: null, error }
  }
}

export async function signOut() {
  // Remove user data from localStorage
  localStorage.removeItem("user")
  return { error: null }
}

export async function getCurrentUser() {
  try {
    // Get user data from localStorage
    const userData = localStorage.getItem("user")
    if (!userData) return { data: null, error: null }

    const user = JSON.parse(userData) as Profile

    // Verify the user still exists in the database
    const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error("Error getting current user:", error)
    // Clear invalid session
    localStorage.removeItem("user")
    return { data: null, error }
  }
}

export async function updateProfile(id: string, updates: Partial<Profile>) {
  try {
    const { data, error } = await supabase.from("profiles").update(updates).eq("id", id).select().single()

    if (error) throw error

    // Update localStorage if user is updating their own profile
    const userData = localStorage.getItem("user")
    if (userData) {
      const user = JSON.parse(userData) as Profile
      if (user.id === id) {
        localStorage.setItem("user", JSON.stringify({ ...user, ...updates }))
      }
    }

    return { data, error: null }
  } catch (error) {
    console.error("Error updating profile:", error)
    return { data: null, error }
  }
}

export async function getProfileById(id: string) {
  try {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", id).single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error("Error getting profile:", error)
    return { data: null, error }
  }
}

export async function getProfiles(userType?: string) {
  try {
    let query = supabase.from("profiles").select("*")

    if (userType) {
      query = query.eq("user_type", userType)
    }

    const { data, error } = await query

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error("Error getting profiles:", error)
    return { data: null, error }
  }
=======
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
>>>>>>> 6a74f7da2e64b207934e20c42703be7a59e35ddf
}

