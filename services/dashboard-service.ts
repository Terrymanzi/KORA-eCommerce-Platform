import { database } from "@/lib/firebase"
import { ref, get, set, push, update, query, orderByChild, equalTo } from "firebase/database"
import type { Product, ProductInput } from "./product-service"

export interface Order {
  id: string
  userId: string
  userName: string
  items: {
    productId: string
    productName: string
    price: number
    quantity: number
  }[]
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  shippingAddress: {
    name: string
    address: string
    city: string
    district: string
    phone: string
  }
  paymentMethod: string
  subtotal: number
  shipping: number
  total: number
  createdAt: number
  updatedAt: number
}

export interface Partnership {
  id: string
  dropshipperId: string
  dropshipperName: string
  wholesalerId: string
  wholesalerName: string
  status: "pending" | "active" | "rejected"
  commission: number
  products: number
  createdAt: number
  updatedAt: number
}

export const dashboardService = {
  // Product Management for Wholesalers
  async getWholesalerProducts(userId: string): Promise<Product[]> {
    try {
      const productsRef = ref(database, "products")
      const productsQuery = query(productsRef, orderByChild("supplierId"), equalTo(userId))
      const snapshot = await get(productsQuery)

      if (!snapshot.exists()) {
        return []
      }

      const products: Product[] = []
      snapshot.forEach((childSnapshot) => {
        const product = { id: childSnapshot.key, ...childSnapshot.val() } as Product
        products.push(product)
      })

      return products
    } catch (error) {
      console.error(`Error fetching wholesaler products:`, error)
      throw error
    }
  },

  async createWholesalerProduct(userId: string, supplierName: string, productData: ProductInput): Promise<Product> {
    try {
      const productsRef = ref(database, "products")
      const newProductRef = push(productsRef)

      const now = Date.now()
      const product: Omit<Product, "id"> = {
        ...productData,
        supplierId: userId,
        supplier: supplierName,
        rating: 0,
        reviews: 0,
        createdAt: now,
        updatedAt: now,
      }

      await set(newProductRef, product)

      return { id: newProductRef.key!, ...product }
    } catch (error) {
      console.error("Error creating wholesaler product:", error)
      throw error
    }
  },

  // Order Management
  async getUserOrders(userId: string): Promise<Order[]> {
    try {
      const ordersRef = ref(database, "orders")
      const ordersQuery = query(ordersRef, orderByChild("userId"), equalTo(userId))
      const snapshot = await get(ordersQuery)

      if (!snapshot.exists()) {
        return []
      }

      const orders: Order[] = []
      snapshot.forEach((childSnapshot) => {
        const order = { id: childSnapshot.key, ...childSnapshot.val() } as Order
        orders.push(order)
      })

      // Sort by creation date, newest first
      return orders.sort((a, b) => b.createdAt - a.createdAt)
    } catch (error) {
      console.error(`Error fetching user orders:`, error)
      throw error
    }
  },

  async getWholesalerOrders(userId: string): Promise<Order[]> {
    try {
      // This is more complex as we need to find orders that contain products from this wholesaler
      // For simplicity, we'll fetch all orders and filter them
      const ordersRef = ref(database, "orders")
      const snapshot = await get(ordersRef)

      if (!snapshot.exists()) {
        return []
      }

      const orders: Order[] = []

      // Get all products from this wholesaler
      const wholesalerProducts = await this.getWholesalerProducts(userId)
      const wholesalerProductIds = wholesalerProducts.map((p) => p.id)

      snapshot.forEach((childSnapshot) => {
        const order = { id: childSnapshot.key, ...childSnapshot.val() } as Order

        // Check if any order item contains a product from this wholesaler
        const hasWholesalerProduct = order.items.some((item) => wholesalerProductIds.includes(item.productId))

        if (hasWholesalerProduct) {
          orders.push(order)
        }
      })

      // Sort by creation date, newest first
      return orders.sort((a, b) => b.createdAt - a.createdAt)
    } catch (error) {
      console.error(`Error fetching wholesaler orders:`, error)
      throw error
    }
  },

  async updateOrderStatus(orderId: string, status: Order["status"]): Promise<void> {
    try {
      const orderRef = ref(database, `orders/${orderId}`)
      await update(orderRef, {
        status,
        updatedAt: Date.now(),
      })
    } catch (error) {
      console.error(`Error updating order status:`, error)
      throw error
    }
  },

  // Partnership Management
  async getDropshipperPartnerships(dropshipperId: string): Promise<Partnership[]> {
    try {
      const partnershipsRef = ref(database, "partnerships")
      const partnershipsQuery = query(partnershipsRef, orderByChild("dropshipperId"), equalTo(dropshipperId))
      const snapshot = await get(partnershipsQuery)

      if (!snapshot.exists()) {
        return []
      }

      const partnerships: Partnership[] = []
      snapshot.forEach((childSnapshot) => {
        const partnership = { id: childSnapshot.key, ...childSnapshot.val() } as Partnership
        partnerships.push(partnership)
      })

      return partnerships
    } catch (error) {
      console.error(`Error fetching dropshipper partnerships:`, error)
      throw error
    }
  },

  async getWholesalerPartnerships(wholesalerId: string): Promise<Partnership[]> {
    try {
      const partnershipsRef = ref(database, "partnerships")
      const partnershipsQuery = query(partnershipsRef, orderByChild("wholesalerId"), equalTo(wholesalerId))
      const snapshot = await get(partnershipsQuery)

      if (!snapshot.exists()) {
        return []
      }

      const partnerships: Partnership[] = []
      snapshot.forEach((childSnapshot) => {
        const partnership = { id: childSnapshot.key, ...childSnapshot.val() } as Partnership
        partnerships.push(partnership)
      })

      return partnerships
    } catch (error) {
      console.error(`Error fetching wholesaler partnerships:`, error)
      throw error
    }
  },

  async createPartnershipRequest(
    dropshipperId: string,
    dropshipperName: string,
    wholesalerId: string,
    wholesalerName: string,
    commission: number,
  ): Promise<Partnership> {
    try {
      const partnershipsRef = ref(database, "partnerships")
      const newPartnershipRef = push(partnershipsRef)

      const now = Date.now()
      const partnership: Omit<Partnership, "id"> = {
        dropshipperId,
        dropshipperName,
        wholesalerId,
        wholesalerName,
        status: "pending",
        commission,
        products: 0,
        createdAt: now,
        updatedAt: now,
      }

      await set(newPartnershipRef, partnership)

      return { id: newPartnershipRef.key!, ...partnership }
    } catch (error) {
      console.error("Error creating partnership request:", error)
      throw error
    }
  },

  async updatePartnershipStatus(partnershipId: string, status: Partnership["status"]): Promise<void> {
    try {
      const partnershipRef = ref(database, `partnerships/${partnershipId}`)
      await update(partnershipRef, {
        status,
        updatedAt: Date.now(),
      })
    } catch (error) {
      console.error(`Error updating partnership status:`, error)
      throw error
    }
  },
}

