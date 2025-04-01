import { supabase } from "./client"
import type { Profile } from "@/types/supabase"

export async function signUp(
  email: string,
  password: string,
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
}

