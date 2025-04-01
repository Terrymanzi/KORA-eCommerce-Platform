import { database } from "@/lib/firebase"
import { ref, get, set, update, query, orderByChild, equalTo } from "firebase/database"

export type UserRole = "customer" | "wholesaler" | "dropshipper" | "admin"

export interface UserProfile {
  uid: string
  email: string | null
  displayName: string | null
  phoneNumber: string | null
  role: UserRole
  profileComplete?: boolean
  profileImage?: string
  address?: {
    street?: string
    city?: string
    state?: string
    country?: string
    postalCode?: string
  }
  settings?: {
    notifications: boolean
    emailUpdates: boolean
  }
  createdAt: number
}

export const userService = {
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const userRef = ref(database, `users/${userId}`)
      const snapshot = await get(userRef)

      if (!snapshot.exists()) {
        return null
      }

      return snapshot.val() as UserProfile
    } catch (error) {
      console.error(`Error fetching user profile for ${userId}:`, error)
      throw error
    }
  },

  async updateUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<void> {
    try {
      const userRef = ref(database, `users/${userId}`)

      // Get current profile data
      const snapshot = await get(userRef)
      if (!snapshot.exists()) {
        throw new Error(`User with ID ${userId} not found`)
      }

      const updates = {
        ...profileData,
        updatedAt: Date.now(),
      }

      await update(userRef, updates)
    } catch (error) {
      console.error(`Error updating user profile for ${userId}:`, error)
      throw error
    }
  },

  async completeUserProfile(
    userId: string,
    profileData: {
      displayName?: string
      phoneNumber?: string
      address?: UserProfile["address"]
      profileImage?: string
    },
  ): Promise<void> {
    try {
      const userRef = ref(database, `users/${userId}`)

      // Get current profile data
      const snapshot = await get(userRef)
      if (!snapshot.exists()) {
        throw new Error(`User with ID ${userId} not found`)
      }

      const updates = {
        ...profileData,
        profileComplete: true,
        updatedAt: Date.now(),
      }

      await update(userRef, updates)
    } catch (error) {
      console.error(`Error completing user profile for ${userId}:`, error)
      throw error
    }
  },

  async updateUserRole(userId: string, role: UserRole): Promise<void> {
    try {
      const userRef = ref(database, `users/${userId}`)

      // Only admins should be able to update roles
      // This should be enforced with Firebase Security Rules

      await update(userRef, {
        role,
        updatedAt: Date.now(),
      })
    } catch (error) {
      console.error(`Error updating role for user ${userId}:`, error)
      throw error
    }
  },

  async getUsersByRole(role: UserRole): Promise<UserProfile[]> {
    try {
      const usersRef = ref(database, "users")
      const usersQuery = query(usersRef, orderByChild("role"), equalTo(role))
      const snapshot = await get(usersQuery)

      if (!snapshot.exists()) {
        return []
      }

      const users: UserProfile[] = []
      snapshot.forEach((childSnapshot) => {
        users.push(childSnapshot.val() as UserProfile)
      })

      return users
    } catch (error) {
      console.error(`Error fetching users with role ${role}:`, error)
      throw error
    }
  },

  async updateUserSettings(userId: string, settings: UserProfile["settings"]): Promise<void> {
    try {
      const settingsRef = ref(database, `users/${userId}/settings`)
      await set(settingsRef, settings)
    } catch (error) {
      console.error(`Error updating settings for user ${userId}:`, error)
      throw error
    }
  },

  async checkUserExists(email: string): Promise<boolean> {
    try {
      const usersRef = ref(database, "users")
      const usersQuery = query(usersRef, orderByChild("email"), equalTo(email))
      const snapshot = await get(usersQuery)

      return snapshot.exists()
    } catch (error) {
      console.error(`Error checking if user with email ${email} exists:`, error)
      throw error
    }
  },

  // Admin functions
  async getAllUsers(): Promise<UserProfile[]> {
    try {
      const usersRef = ref(database, "users")
      const snapshot = await get(usersRef)

      if (!snapshot.exists()) {
        return []
      }

      const users: UserProfile[] = []
      snapshot.forEach((childSnapshot) => {
        users.push(childSnapshot.val() as UserProfile)
      })

      return users
    } catch (error) {
      console.error("Error fetching all users:", error)
      throw error
    }
  },

  async deleteUser(userId: string): Promise<void> {
    try {
      // Note: This only deletes the user from the database
      // You should also delete the user from Firebase Auth
      const userRef = ref(database, `users/${userId}`)
      await set(userRef, null)
    } catch (error) {
      console.error(`Error deleting user ${userId}:`, error)
      throw error
    }
  },
}

