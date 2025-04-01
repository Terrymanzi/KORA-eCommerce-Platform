import { database } from "@/lib/firebase"
import { ref, get, set, remove } from "firebase/database"

export interface WishlistItem {
  id: string
  addedAt: number
}

export const wishlistService = {
  async addToWishlist(userId: string, productId: string): Promise<void> {
    try {
      const wishlistItemRef = ref(database, `wishlists/${userId}/${productId}`)

      const wishlistItem: WishlistItem = {
        id: productId,
        addedAt: Date.now(),
      }

      await set(wishlistItemRef, wishlistItem)
    } catch (error) {
      console.error(`Error adding product ${productId} to wishlist for user ${userId}:`, error)
      throw error
    }
  },

  async removeFromWishlist(userId: string, productId: string): Promise<void> {
    try {
      const wishlistItemRef = ref(database, `wishlists/${userId}/${productId}`)
      await remove(wishlistItemRef)
    } catch (error) {
      console.error(`Error removing product ${productId} from wishlist for user ${userId}:`, error)
      throw error
    }
  },

  async getWishlist(userId: string): Promise<any[]> {
    try {
      const wishlistRef = ref(database, `wishlists/${userId}`)
      const snapshot = await get(wishlistRef)

      if (!snapshot.exists()) {
        return []
      }

      const wishlistItems: Record<string, WishlistItem> = snapshot.val()
      const productIds = Object.keys(wishlistItems)

      // Get product details
      const products: any[] = []

      for (const productId of productIds) {
        const productRef = ref(database, `products/${productId}`)
        const productSnapshot = await get(productRef)

        if (productSnapshot.exists()) {
          const product = productSnapshot.val()
          products.push({
            ...product,
            addedAt: wishlistItems[productId].addedAt,
          })
        }
      }

      // Sort by added date (newest first)
      return products.sort((a, b) => b.addedAt - a.addedAt)
    } catch (error) {
      console.error(`Error fetching wishlist for user ${userId}:`, error)
      throw error
    }
  },

  async isInWishlist(userId: string, productId: string): Promise<boolean> {
    try {
      const wishlistItemRef = ref(database, `wishlists/${userId}/${productId}`)
      const snapshot = await get(wishlistItemRef)

      return snapshot.exists()
    } catch (error) {
      console.error(`Error checking if product ${productId} is in wishlist for user ${userId}:`, error)
      throw error
    }
  },

  async clearWishlist(userId: string): Promise<void> {
    try {
      const wishlistRef = ref(database, `wishlists/${userId}`)
      await remove(wishlistRef)
    } catch (error) {
      console.error(`Error clearing wishlist for user ${userId}:`, error)
      throw error
    }
  },
}

