"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import {
  type User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  PhoneAuthProvider,
  signInWithCredential,
} from "firebase/auth"
import { ref, set, get } from "firebase/database"
import { auth, database } from "@/lib/firebase"

type UserRole = "dropshipper" | "wholesaler" | "customer" | "admin"

interface UserData {
  uid: string
  email: string | null
  displayName: string | null
  phoneNumber: string | null
  role: UserRole
  createdAt: number
}

interface AuthContextType {
  user: User | null
  userData: UserData | null
  loading: boolean
  signUp: (email: string, password: string, fullName: string, phone: string, role: UserRole) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signInWithPhone: (verificationId: string, code: string) => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateUserProfile: (data: Partial<UserData>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Only run this effect on the client side
    if (typeof window === "undefined" || !auth) return

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)

      if (user && database) {
        // Fetch additional user data from the database
        try {
          const userRef = ref(database, `users/${user.uid}`)
          const snapshot = await get(userRef)
          if (snapshot.exists()) {
            setUserData(snapshot.val())
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
        }
      } else {
        setUserData(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, fullName: string, phone: string, role: UserRole) => {
    if (!auth || !database) throw new Error("Firebase not initialized")

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Update profile
      await updateProfile(user, {
        displayName: fullName,
      })

      // Save additional user data to the database
      const userData: UserData = {
        uid: user.uid,
        email: user.email,
        displayName: fullName,
        phoneNumber: phone,
        role: role,
        createdAt: Date.now(),
      }

      await set(ref(database, `users/${user.uid}`), userData)
      setUserData(userData)

      return user
    } catch (error) {
      console.error("Error signing up:", error)
      throw error
    }
  }

  const signIn = async (email: string, password: string) => {
    if (!auth) throw new Error("Firebase not initialized")

    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      console.error("Error signing in:", error)
      throw error
    }
  }

  const signInWithPhone = async (verificationId: string, code: string) => {
    if (!auth) throw new Error("Firebase not initialized")

    try {
      const credential = PhoneAuthProvider.credential(verificationId, code)
      await signInWithCredential(auth, credential)
    } catch (error) {
      console.error("Error signing in with phone:", error)
      throw error
    }
  }

  const logout = async () => {
    if (!auth) throw new Error("Firebase not initialized")

    try {
      await signOut(auth)
    } catch (error) {
      console.error("Error signing out:", error)
      throw error
    }
  }

  const resetPassword = async (email: string) => {
    if (!auth) throw new Error("Firebase not initialized")

    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error) {
      console.error("Error resetting password:", error)
      throw error
    }
  }

  const updateUserProfile = async (data: Partial<UserData>) => {
    if (!user || !auth || !database) throw new Error("User not logged in or Firebase not initialized")

    try {
      // Update in Firebase Auth if name is provided
      if (data.displayName) {
        await updateProfile(user, {
          displayName: data.displayName,
        })
      }

      // Update in Realtime Database
      const userRef = ref(database, `users/${user.uid}`)
      const snapshot = await get(userRef)

      if (snapshot.exists()) {
        const currentData = snapshot.val()
        const updatedData = { ...currentData, ...data }
        await set(userRef, updatedData)
        setUserData(updatedData)
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      throw error
    }
  }

  // Provide a default value when Firebase is not initialized (SSR)
  if (typeof window === "undefined" || !auth || !database) {
    return (
      <AuthContext.Provider
        value={{
          user: null,
          userData: null,
          loading: false,
          signUp: async () => {},
          signIn: async () => {},
          signInWithPhone: async () => {},
          logout: async () => {},
          resetPassword: async () => {},
          updateUserProfile: async () => {},
        }}
      >
        {children}
      </AuthContext.Provider>
    )
  }

  const value = {
    user,
    userData,
    loading,
    signUp,
    signIn,
    signInWithPhone,
    logout,
    resetPassword,
    updateUserProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Default export for dynamic import
export default { AuthProvider }

