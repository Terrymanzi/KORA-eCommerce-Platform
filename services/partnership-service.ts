import { database } from "@/lib/firebase"
import { ref, get, set, update, push, remove } from "firebase/database"
import { notificationService } from "./notification-service"

export type PartnershipStatus = "pending" | "active" | "rejected" | "terminated"

export interface Partnership {
  id: string
  wholesalerId: string
  wholesalerStoreId: string
  wholesalerName: string
  dropshipperId: string
  dropshipperStoreId: string
  dropshipperName: string
  status: PartnershipStatus
  commission: number
  products: number
  terms?: string
  requestMessage?: string
  responseMessage?: string
  since?: number
  requestedAt: number
  updatedAt: number
}

export interface PartnershipRequest {
  dropshipperId: string
  dropshipperStoreId: string
  dropshipperName: string
  wholesalerStoreId: string
  requestMessage?: string
}

export interface PartnershipResponse {
  status: "active" | "rejected"
  commission: number
  responseMessage?: string
}

export interface PartnershipProduct {
  id: string
  partnershipId: string
  dropshipperPrice: number
  status: "active" | "inactive"
  addedAt: number
}

export const partnershipService = {
  async requestPartnership(request: PartnershipRequest): Promise<string> {
    try {
      // Get wholesaler info
      const storeRef = ref(database, `stores/${request.wholesalerStoreId}`)
      const storeSnapshot = await get(storeRef)

      if (!storeSnapshot.exists()) {
        throw new Error(`Store with ID ${request.wholesalerStoreId} not found`)
      }

      const store = storeSnapshot.val()

      // Create partnership request
      const partnershipsRef = ref(database, "partnerships")
      const newPartnershipRef = push(partnershipsRef)
      const partnershipId = newPartnershipRef.key!

      const now = Date.now()
      const partnership: Partnership = {
        id: partnershipId,
        wholesalerId: store.ownerId,
        wholesalerStoreId: request.wholesalerStoreId,
        wholesalerName: store.name,
        dropshipperId: request.dropshipperId,
        dropshipperStoreId: request.dropshipperStoreId,
        dropshipperName: request.dropshipperName,
        status: "pending",
        commission: 0, // Will be set when accepted
        products: 0,
        requestMessage: request.requestMessage,
        requestedAt: now,
        updatedAt: now,
      }

      await set(newPartnershipRef, partnership)

      // Create references for quick access
      await set(ref(database, `userPartnerships/${request.dropshipperId}/${partnershipId}`), true)
      await set(ref(database, `userPartnerships/${store.ownerId}/${partnershipId}`), true)

      // Send notification to wholesaler
      await notificationService.createNotification({
        userId: store.ownerId,
        type: "partnership",
        title: "New Partnership Request",
        message: `${request.dropshipperName} has requested to partner with your store.`,
        data: {
          partnershipId,
        },
      })

      return partnershipId
    } catch (error) {
      console.error("Error requesting partnership:", error)
      throw error
    }
  },

  async respondToPartnershipRequest(
    partnershipId: string,
    wholesalerId: string,
    response: PartnershipResponse,
  ): Promise<void> {
    try {
      const partnershipRef = ref(database, `partnerships/${partnershipId}`)
      const snapshot = await get(partnershipRef)

      if (!snapshot.exists()) {
        throw new Error(`Partnership with ID ${partnershipId} not found`)
      }

      const partnership = snapshot.val() as Partnership

      // Verify that the wholesaler is the one responding
      if (partnership.wholesalerId !== wholesalerId) {
        throw new Error("Unauthorized to respond to this partnership request")
      }

      // Update partnership status
      const now = Date.now()
      const updates: Partial<Partnership> = {
        status: response.status,
        commission: response.commission,
        responseMessage: response.responseMessage,
        updatedAt: now,
      }

      if (response.status === "active") {
        updates.since = now
      }

      await update(partnershipRef, updates)

      // Send notification to dropshipper
      await notificationService.createNotification({
        userId: partnership.dropshipperId,
        type: "partnership",
        title: response.status === "active" ? "Partnership Request Accepted" : "Partnership Request Rejected",
        message:
          response.status === "active"
            ? `${partnership.wholesalerName} has accepted your partnership request.`
            : `${partnership.wholesalerName} has rejected your partnership request.`,
        data: {
          partnershipId,
        },
      })
    } catch (error) {
      console.error(`Error responding to partnership request ${partnershipId}:`, error)
      throw error
    }
  },

  async terminatePartnership(partnershipId: string, userId: string): Promise<void> {
    try {
      const partnershipRef = ref(database, `partnerships/${partnershipId}`)
      const snapshot = await get(partnershipRef)

      if (!snapshot.exists()) {
        throw new Error(`Partnership with ID ${partnershipId} not found`)
      }

      const partnership = snapshot.val() as Partnership

      // Verify that the user is part of the partnership
      if (partnership.wholesalerId !== userId && partnership.dropshipperId !== userId) {
        throw new Error("Unauthorized to terminate this partnership")
      }

      // Update partnership status
      await update(partnershipRef, {
        status: "terminated",
        updatedAt: Date.now(),
      })

      // Send notification to the other party
      const recipientId = partnership.wholesalerId === userId ? partnership.dropshipperId : partnership.wholesalerId

      const senderName = partnership.wholesalerId === userId ? partnership.wholesalerName : partnership.dropshipperName

      await notificationService.createNotification({
        userId: recipientId,
        type: "partnership",
        title: "Partnership Terminated",
        message: `${senderName} has terminated the partnership.`,
        data: {
          partnershipId,
        },
      })
    } catch (error) {
      console.error(`Error terminating partnership ${partnershipId}:`, error)
      throw error
    }
  },

  async getPartnershipById(partnershipId: string): Promise<Partnership | null> {
    try {
      const partnershipRef = ref(database, `partnerships/${partnershipId}`)
      const snapshot = await get(partnershipRef)

      if (!snapshot.exists()) {
        return null
      }

      return snapshot.val() as Partnership
    } catch (error) {
      console.error(`Error fetching partnership with ID ${partnershipId}:`, error)
      throw error
    }
  },

  async getUserPartnerships(userId: string): Promise<Partnership[]> {
    try {
      // Get partnership IDs for the user
      const userPartnershipsRef = ref(database, `userPartnerships/${userId}`)
      const userPartnershipsSnapshot = await get(userPartnershipsRef)

      if (!userPartnershipsSnapshot.exists()) {
        return []
      }

      // Get partnership details
      const partnershipIds = Object.keys(userPartnershipsSnapshot.val())
      const partnerships: Partnership[] = []

      for (const partnershipId of partnershipIds) {
        const partnershipRef = ref(database, `partnerships/${partnershipId}`)
        const partnershipSnapshot = await get(partnershipRef)

        if (partnershipSnapshot.exists()) {
          partnerships.push(partnershipSnapshot.val() as Partnership)
        }
      }

      return partnerships
    } catch (error) {
      console.error(`Error fetching partnerships for user ${userId}:`, error)
      throw error
    }
  },

  async getActivePartnerships(userId: string, role: "wholesaler" | "dropshipper"): Promise<Partnership[]> {
    try {
      const partnerships = await this.getUserPartnerships(userId)

      return partnerships.filter(
        (p) =>
          p.status === "active" && (role === "wholesaler" ? p.wholesalerId === userId : p.dropshipperId === userId),
      )
    } catch (error) {
      console.error(`Error fetching active partnerships for user ${userId}:`, error)
      throw error
    }
  },

  async getPendingPartnerships(userId: string, role: "wholesaler" | "dropshipper"): Promise<Partnership[]> {
    try {
      const partnerships = await this.getUserPartnerships(userId)

      return partnerships.filter(
        (p) =>
          p.status === "pending" && (role === "wholesaler" ? p.wholesalerId === userId : p.dropshipperId === userId),
      )
    } catch (error) {
      console.error(`Error fetching pending partnerships for user ${userId}:`, error)
      throw error
    }
  },

  async addProductToPartnership(partnershipId: string, productId: string, dropshipperPrice: number): Promise<void> {
    try {
      const partnershipRef = ref(database, `partnerships/${partnershipId}`)
      const partnershipSnapshot = await get(partnershipRef)

      if (!partnershipSnapshot.exists()) {
        throw new Error(`Partnership with ID ${partnershipId} not found`)
      }

      const partnership = partnershipSnapshot.val() as Partnership

      if (partnership.status !== "active") {
        throw new Error("Cannot add products to inactive partnerships")
      }

      // Add product to partnership products
      const partnershipProductRef = ref(database, `partnershipProducts/${partnershipId}/${productId}`)
      const now = Date.now()

      const partnershipProduct: PartnershipProduct = {
        id: productId,
        partnershipId,
        dropshipperPrice,
        status: "active",
        addedAt: now,
      }

      await set(partnershipProductRef, partnershipProduct)

      // Update product count in partnership
      await update(partnershipRef, {
        products: partnership.products + 1,
        updatedAt: now,
      })

      // Send notification to dropshipper
      await notificationService.createNotification({
        userId: partnership.dropshipperId,
        type: "product",
        title: "New Product Available",
        message: `A new product has been added to your partnership with ${partnership.wholesalerName}.`,
        data: {
          partnershipId,
          productId,
        },
      })
    } catch (error) {
      console.error(`Error adding product ${productId} to partnership ${partnershipId}:`, error)
      throw error
    }
  },

  async removeProductFromPartnership(partnershipId: string, productId: string): Promise<void> {
    try {
      // Remove product from partnership products
      const partnershipProductRef = ref(database, `partnershipProducts/${partnershipId}/${productId}`)
      await remove(partnershipProductRef)

      // Update product count in partnership
      const partnershipRef = ref(database, `partnerships/${partnershipId}`)
      const partnershipSnapshot = await get(partnershipRef)

      if (partnershipSnapshot.exists()) {
        const partnership = partnershipSnapshot.val() as Partnership

        await update(partnershipRef, {
          products: Math.max(0, partnership.products - 1),
          updatedAt: Date.now(),
        })
      }
    } catch (error) {
      console.error(`Error removing product ${productId} from partnership ${partnershipId}:`, error)
      throw error
    }
  },

  async getPartnershipProducts(partnershipId: string): Promise<PartnershipProduct[]> {
    try {
      const partnershipProductsRef = ref(database, `partnershipProducts/${partnershipId}`)
      const snapshot = await get(partnershipProductsRef)

      if (!snapshot.exists()) {
        return []
      }

      const products: PartnershipProduct[] = []
      snapshot.forEach((childSnapshot) => {
        products.push(childSnapshot.val() as PartnershipProduct)
      })

      return products
    } catch (error) {
      console.error(`Error fetching products for partnership ${partnershipId}:`, error)
      throw error
    }
  },
}

