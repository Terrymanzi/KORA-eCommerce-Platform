import { supabase } from "./client"
import type { Profile } from "@/types/supabase"

// For demo purposes only - in a real app, you would use proper authentication
// This is a simplified approach that doesn't require database schema changes
const USER_CREDENTIALS_KEY = "kora_user_credentials"

// Store credentials in localStorage (for demo purposes only)
// In a real app, you would use a secure authentication system
function storeCredentials(email: string, password: string, userId: string) {
  try {
    // Get existing credentials
    const existingCredentialsStr = localStorage.getItem(USER_CREDENTIALS_KEY)
    const existingCredentials = existingCredentialsStr ? JSON.parse(existingCredentialsStr) : {}

    // Add new credentials
    existingCredentials[email] = {
      password,
      userId,
    }

    // Save back to localStorage
    localStorage.setItem(USER_CREDENTIALS_KEY, JSON.stringify(existingCredentials))
    return true
  } catch (error) {
    console.error("Error storing credentials:", error)
    return false
  }
}

// Verify credentials from localStorage (for demo purposes only)
function verifyCredentials(email: string, password: string) {
  try {
    const credentialsStr = localStorage.getItem(USER_CREDENTIALS_KEY)
    if (!credentialsStr) return { valid: false, userId: null }

    const credentials = JSON.parse(credentialsStr)
    const userCred = credentials[email]

    if (!userCred || userCred.password !== password) {
      return { valid: false, userId: null }
    }

    return { valid: true, userId: userCred.userId }
  } catch (error) {
    console.error("Error verifying credentials:", error)
    return { valid: false, userId: null }
  }
}

export async function signUp(
  email: string,
  password: string,
  userData: Omit<Profile, "id" | "created_at" | "updated_at">,
) {
  try {
    // Check if user already exists
    const { data: existingUser } = await supabase.from("profiles").select("*").eq("email", email).single()

    if (existingUser) {
      throw new Error("User with this email already exists")
    }

    // Generate a UUID for the user
    const userId = crypto.randomUUID()

    // Create the user profile
    const { data, error } = await supabase
      .from("profiles")
      .insert({
        ...userData,
        id: userId,
        email,
      })
      .select()
      .single()

    if (error) throw error

    // Store credentials in localStorage (for demo purposes only)
    storeCredentials(email, password, userId)

    return { data, error: null }
  } catch (error) {
    console.error("Error signing up:", error)
    return { data: null, error }
  }
}

export async function signIn(email: string, password: string) {
  try {
    // Verify credentials from localStorage
    const { valid, userId } = verifyCredentials(email, password)

    if (!valid || !userId) {
      // If credentials don't match, check if this is a pre-existing user without password
      // (for backward compatibility with existing users)
      const { data: existingUser } = await supabase.from("profiles").select("*").eq("email", email).single()

      if (existingUser) {
        // For existing users, store their credentials for future logins
        storeCredentials(email, password, existingUser.id)
        return { data: existingUser, error: null }
      }

      throw new Error("Invalid email or password")
    }

    // Get user profile
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

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

