import { database } from "@/lib/firebase"
import { ref, get, set, update, push, remove, query, orderByChild, equalTo } from "firebase/database"

export type StoreOwnerType = "wholesaler" | "dropshipper"
export type StoreStatus = "active" | "inactive" | "suspended"

export interface StoreAddress {
  street: string
  city: string
  state: string
  country: string
  postalCode: string
}

export interface StoreSocialLinks {
  website?: string
  facebook?: string
  instagram?: string
  twitter?: string
}

export interface Store {
  id: string
  name: string
  ownerId: string
  ownerType: StoreOwnerType
  description: string
  logo?: string
  bannerImage?: string
  contactEmail: string
  contactPhone: string
  address: StoreAddress
  socialLinks?: StoreSocialLinks
  status: StoreStatus
  rating: number
  reviews: number
  createdAt: number
  updatedAt: number
}

export interface StoreInput {
  name: string
  description: string
  logo?: string
  bannerImage?: string
  contactEmail: string
  contactPhone: string
  address: StoreAddress
  socialLinks?: StoreSocialLinks
}

export const storeService = {
  async createStore(ownerId: string, ownerType: StoreOwnerType, storeData: StoreInput): Promise<Store> {
    try {
      const storesRef = ref(database, "stores")
      const newStoreRef = push(storesRef)
      const storeId = newStoreRef.key!

      const now = Date.now()
      const store: Store = {
        id: storeId,
        ownerId,
        ownerType,
        name: storeData.name,
        description: storeData.description,
        logo: storeData.logo,
        bannerImage: storeData.bannerImage,
        contactEmail: storeData.contactEmail,
        contactPhone: storeData.contactPhone,
        address: storeData.address,
        socialLinks: storeData.socialLinks,
        status: "active",
        rating: 0,
        reviews: 0,
        createdAt: now,
        updatedAt: now,
      }

      await set(newStoreRef, store)

      // Also create a reference in the user's stores
      const userStoreRef = ref(database, `userStores/${ownerId}/${storeId}`)
      await set(userStoreRef, true)

      return store
    } catch (error) {
      console.error("Error creating store:", error)
      throw error
    }
  },

  async getStoreById(storeId: string): Promise<Store | null> {
    try {
      const storeRef = ref(database, `stores/${storeId}`)
      const snapshot = await get(storeRef)

      if (!snapshot.exists()) {
        return null
      }

      return snapshot.val() as Store
    } catch (error) {
      console.error(`Error fetching store with ID ${storeId}:`, error)
      throw error
    }
  },

  async getStoresByOwner(ownerId: string): Promise<Store[]> {
    try {
      const storesRef = ref(database, "stores")
      const storesQuery = query(storesRef, orderByChild("ownerId"), equalTo(ownerId))
      const snapshot = await get(storesQuery)

      if (!snapshot.exists()) {
        return []
      }

      const stores: Store[] = []
      snapshot.forEach((childSnapshot) => {
        stores.push(childSnapshot.val() as Store)
      })

      return stores
    } catch (error) {
      console.error(`Error fetching stores for owner ${ownerId}:`, error)
      throw error
    }
  },

  async getStoresByType(ownerType: StoreOwnerType): Promise<Store[]> {
    try {
      const storesRef = ref(database, "stores")
      const storesQuery = query(storesRef, orderByChild("ownerType"), equalTo(ownerType))
      const snapshot = await get(storesQuery)

      if (!snapshot.exists()) {
        return []
      }

      const stores: Store[] = []
      snapshot.forEach((childSnapshot) => {
        stores.push(childSnapshot.val() as Store)
      })

      return stores
    } catch (error) {
      console.error(`Error fetching stores of type ${ownerType}:`, error)
      throw error
    }
  },

  async updateStore(storeId: string, storeData: Partial<StoreInput>): Promise<void> {
    try {
      const storeRef = ref(database, `stores/${storeId}`)

      // Get current store data
      const snapshot = await get(storeRef)
      if (!snapshot.exists()) {
        throw new Error(`Store with ID ${storeId} not found`)
      }

      const updates = {
        ...storeData,
        updatedAt: Date.now(),
      }

      await update(storeRef, updates)
    } catch (error) {
      console.error(`Error updating store with ID ${storeId}:`, error)
      throw error
    }
  },

  async updateStoreStatus(storeId: string, status: StoreStatus): Promise<void> {
    try {
      const storeRef = ref(database, `stores/${storeId}`)
      await update(storeRef, {
        status,
        updatedAt: Date.now(),
      })
    } catch (error) {
      console.error(`Error updating status for store ${storeId}:`, error)
      throw error
    }
  },

  async deleteStore(storeId: string, ownerId: string): Promise<void> {
    try {
      // Delete the store
      const storeRef = ref(database, `stores/${storeId}`)
      await remove(storeRef)

      // Remove the reference from the user's stores
      const userStoreRef = ref(database, `userStores/${ownerId}/${storeId}`)
      await remove(userStoreRef)
    } catch (error) {
      console.error(`Error deleting store ${storeId}:`, error)
      throw error
    }
  },

  async getAllStores(): Promise<Store[]> {
    try {
      const storesRef = ref(database, "stores")
      const snapshot = await get(storesRef)

      if (!snapshot.exists()) {
        return []
      }

      const stores: Store[] = []
      snapshot.forEach((childSnapshot) => {
        stores.push(childSnapshot.val() as Store)
      })

      return stores
    } catch (error) {
      console.error("Error fetching all stores:", error)
      throw error
    }
  },

  async addStoreReview(storeId: string, rating: number): Promise<void> {
    try {
      const storeRef = ref(database, `stores/${storeId}`)

      // Get current store data
      const snapshot = await get(storeRef)
      if (!snapshot.exists()) {
        throw new Error(`Store with ID ${storeId} not found`)
      }

      const store = snapshot.val() as Store
      const currentRating = store.rating || 0
      const currentReviews = store.reviews || 0

      // Calculate new average rating
      const newReviews = currentReviews + 1
      const newRating = (currentRating * currentReviews + rating) / newReviews

      await update(storeRef, {
        rating: Number.parseFloat(newRating.toFixed(1)),
        reviews: newReviews,
        updatedAt: Date.now(),
      })
    } catch (error) {
      console.error(`Error adding review for store ${storeId}:`, error)
      throw error
    }
  },
}

