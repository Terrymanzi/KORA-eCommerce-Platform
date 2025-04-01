"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { Profile } from "@/types/supabase"
import { getCurrentUser, signIn, signOut, signUp, updateProfile } from "@/lib/supabase/auth"

type AuthContextType = {
  user: Profile | null
  loading: boolean
  signIn: (email: string) => Promise<{ success: boolean; error: any }>
  signUp: (email: string, password: string, userData: any) => Promise<{ success: boolean; error: any }>
  signOut: () => Promise<void>
  updateUser: (updates: Partial<Profile>) => Promise<{ success: boolean; error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUser() {
      try {
        const { data } = await getCurrentUser()
        setUser(data)
      } catch (error) {
        console.error("Error loading user:", error)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  async function handleSignIn(email: string) {
    try {
      const { data, error } = await signIn(email)

      if (error) throw error

      setUser(data)

      // Set cookie for server-side auth check
      document.cookie = `user=${JSON.stringify(data)}; path=/; max-age=604800; SameSite=Strict`

      return { success: true, error: null }
    } catch (error) {
      console.error("Error signing in:", error)
      return { success: false, error }
    }
  }

  async function handleSignUp(email: string, password: string, userData: any) {
    try {
      const { data, error } = await signUp(email, password, userData)

      if (error) throw error

      setUser(data)

      // Set cookie for server-side auth check
      document.cookie = `user=${JSON.stringify(data)}; path=/; max-age=604800; SameSite=Strict`

      return { success: true, error: null }
    } catch (error) {
      console.error("Error signing up:", error)
      return { success: false, error }
    }
  }

  async function handleSignOut() {
    try {
      await signOut()
      setUser(null)

      // Clear cookie
      document.cookie = "user=; path=/; max-age=0; SameSite=Strict"
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  async function handleUpdateUser(updates: Partial<Profile>) {
    try {
      if (!user) throw new Error("No user logged in")

      const { data, error } = await updateProfile(user.id, updates)

      if (error) throw error

      setUser(data)

      // Update cookie
      document.cookie = `user=${JSON.stringify(data)}; path=/; max-age=604800; SameSite=Strict`

      return { success: true, error: null }
    } catch (error) {
      console.error("Error updating user:", error)
      return { success: false, error }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn: handleSignIn,
        signUp: handleSignUp,
        signOut: handleSignOut,
        updateUser: handleUpdateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

