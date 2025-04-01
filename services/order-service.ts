import { database } from "@/lib/firebase"
import { ref, get, set, update, push, query, orderByChild, equalTo } from "firebase/database"
import { notificationService } from "./notification-service"
import { productService } from "./product-service"

export type OrderStatus = "pending" | "processing" | "shipped" | "out_for_delivery" | "delivered" | "cancelled"
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded"

export interface OrderItem {
  productId: string
  productName: string
  quantity: number
  price: number
  total: number
  options?: {
    color?: string
    size?: string
  }
}

export interface ShippingAddress {
  name: string
  street: string
  city: string
  state: string
  country: string
  postalCode: string
  phone: string
}

export interface Order {
  id: string
  customerId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  storeId: string
  storeName: string
  items: OrderItem[]
  subtotal: number
  shipping: number
  tax: number
  total: number
  paymentMethod: string
  paymentStatus: PaymentStatus
  paymentId?: string
  shippingAddress: ShippingAddress
  status: OrderStatus
  notes?: string
  trackingNumber?: string
  trackingUrl?: string
  createdAt: number
  updatedAt: number
}

export interface OrderInput {
  customerId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  storeId: string
  storeName: string
  items: OrderItem[]
  subtotal: number
  shipping: number
  tax: number
  total: number
  paymentMethod: string
  paymentId?: string
  shippingAddress: ShippingAddress
  notes?: string
}

export const orderService = {
  async createOrder(orderInput: OrderInput): Promise<Order> {
    try {
      const ordersRef = ref(database, "orders")
      const newOrderRef = push(ordersRef)
      const orderId = newOrderRef.key!

      const now = Date.now()
      const order: Order = {
        id: orderId,
        ...orderInput,
        paymentStatus: "pending",
        status: "pending",
        createdAt: now,
        updatedAt: now,
      }

      await set(newOrderRef, order)

      // Create references for quick access
      await set(ref(database, `userOrders/${orderInput.customerId}/${orderId}`), true)
      await set(ref(database, `storeOrders/${orderInput.storeId}/${orderId}`), true)

      // Update product stock
      for (const item of orderInput.items) {
        await productService.updateProductStock(item.productId, item.quantity, "decrease")
      }

      // Send notification to store owner
      // First, get the store owner ID
      const storeRef = ref(database, `stores/${orderInput.storeId}`)
      const storeSnapshot = await get(storeRef)

      if (storeSnapshot.exists()) {
        const store = storeSnapshot.val()

        await notificationService.createNotification({
          userId: store.ownerId,
          type: "order",
          title: "New Order Received",
          message: `You have received a new order worth RWF ${orderInput.total.toLocaleString()}.`,
          data: {
            orderId,
            storeId: orderInput.storeId,
          },
        })
      }

      return order
    } catch (error) {
      console.error("Error creating order:", error)
      throw error
    }
  },

  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const orderRef = ref(database, `orders/${orderId}`)
      const snapshot = await get(orderRef)

      if (!snapshot.exists()) {
        return null
      }

      return snapshot.val() as Order
    } catch (error) {
      console.error(`Error fetching order with ID ${orderId}:`, error)
      throw error
    }
  },

  async getCustomerOrders(customerId: string): Promise<Order[]> {
    try {
      // Get order IDs for the customer
      const userOrdersRef = ref(database, `userOrders/${customerId}`)
      const userOrdersSnapshot = await get(userOrdersRef)

      if (!userOrdersSnapshot.exists()) {
        return []
      }

      // Get order details
      const orderIds = Object.keys(userOrdersSnapshot.val())
      const orders: Order[] = []

      for (const orderId of orderIds) {
        const orderRef = ref(database, `orders/${orderId}`)
        const orderSnapshot = await get(orderRef)

        if (orderSnapshot.exists()) {
          orders.push(orderSnapshot.val() as Order)
        }
      }

      // Sort by creation date (newest first)
      return orders.sort((a, b) => b.createdAt - a.createdAt)
    } catch (error) {
      console.error(`Error fetching orders for customer ${customerId}:`, error)
      throw error
    }
  },

  async getStoreOrders(storeId: string): Promise<Order[]> {
    try {
      // Get order IDs for the store
      const storeOrdersRef = ref(database, `storeOrders/${storeId}`)
      const storeOrdersSnapshot = await get(storeOrdersRef)

      if (!storeOrdersSnapshot.exists()) {
        return []
      }

      // Get order details
      const orderIds = Object.keys(storeOrdersSnapshot.val())
      const orders: Order[] = []

      for (const orderId of orderIds) {
        const orderRef = ref(database, `orders/${orderId}`)
        const orderSnapshot = await get(orderRef)

        if (orderSnapshot.exists()) {
          orders.push(orderSnapshot.val() as Order)
        }
      }

      // Sort by creation date (newest first)
      return orders.sort((a, b) => b.createdAt - a.createdAt)
    } catch (error) {
      console.error(`Error fetching orders for store ${storeId}:`, error)
      throw error
    }
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    try {
      const orderRef = ref(database, `orders/${orderId}`)
      const snapshot = await get(orderRef)

      if (!snapshot.exists()) {
        throw new Error(`Order with ID ${orderId} not found`)
      }

      const order = snapshot.val() as Order

      await update(orderRef, {
        status,
        updatedAt: Date.now(),
      })

      // Send notification to customer
      let title = ""
      let message = ""

      switch (status) {
        case "processing":
          title = "Order Processing"
          message = "Your order is now being processed."
          break
        case "shipped":
          title = "Order Shipped"
          message = "Your order has been shipped."
          break
        case "out_for_delivery":
          title = "Out for Delivery"
          message = "Your order is out for delivery."
          break
        case "delivered":
          title = "Order Delivered"
          message = "Your order has been delivered."
          break
        case "cancelled":
          title = "Order Cancelled"
          message = "Your order has been cancelled."

          // If order is cancelled, restore product stock
          for (const item of order.items) {
            await productService.updateProductStock(item.productId, item.quantity, "increase")
          }
          break
      }

      if (title && message) {
        await notificationService.createNotification({
          userId: order.customerId,
          type: "order",
          title,
          message,
          data: {
            orderId,
          },
        })
      }
    } catch (error) {
      console.error(`Error updating status for order ${orderId}:`, error)
      throw error
    }
  },

  async updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus, paymentId?: string): Promise<void> {
    try {
      const orderRef = ref(database, `orders/${orderId}`)
      const snapshot = await get(orderRef)

      if (!snapshot.exists()) {
        throw new Error(`Order with ID ${orderId} not found`)
      }

      const order = snapshot.val() as Order

      const updates: Record<string, any> = {
        paymentStatus,
        updatedAt: Date.now(),
      }

      if (paymentId) {
        updates.paymentId = paymentId
      }

      await update(orderRef, updates)

      // If payment is successful, update order status to processing
      if (paymentStatus === "paid" && order.status === "pending") {
        await this.updateOrderStatus(orderId, "processing")
      }

      // Send notification to customer
      let title = ""
      let message = ""

      switch (paymentStatus) {
        case "paid":
          title = "Payment Successful"
          message = "Your payment has been processed successfully."
          break
        case "failed":
          title = "Payment Failed"
          message = "Your payment has failed. Please try again."
          break
        case "refunded":
          title = "Payment Refunded"
          message = "Your payment has been refunded."
          break
      }

      if (title && message) {
        await notificationService.createNotification({
          userId: order.customerId,
          type: "order",
          title,
          message,
          data: {
            orderId,
          },
        })
      }
    } catch (error) {
      console.error(`Error updating payment status for order ${orderId}:`, error)
      throw error
    }
  },

  async updateTrackingInfo(orderId: string, trackingNumber: string, trackingUrl?: string): Promise<void> {
    try {
      const orderRef = ref(database, `orders/${orderId}`)
      const snapshot = await get(orderRef)

      if (!snapshot.exists()) {
        throw new Error(`Order with ID ${orderId} not found`)
      }

      const order = snapshot.val() as Order

      const updates: Record<string, any> = {
        trackingNumber,
        updatedAt: Date.now(),
      }

      if (trackingUrl) {
        updates.trackingUrl = trackingUrl
      }

      await update(orderRef, updates)

      // Send notification to customer
      await notificationService.createNotification({
        userId: order.customerId,
        type: "order",
        title: "Tracking Information Updated",
        message: `Your order has been shipped. Tracking number: ${trackingNumber}`,
        data: {
          orderId,
        },
      })
    } catch (error) {
      console.error(`Error updating tracking info for order ${orderId}:`, error)
      throw error
    }
  },

  async getOrdersByStatus(status: OrderStatus): Promise<Order[]> {
    try {
      const ordersRef = ref(database, "orders")
      const ordersQuery = query(ordersRef, orderByChild("status"), equalTo(status))
      const snapshot = await get(ordersQuery)

      if (!snapshot.exists()) {
        return []
      }

      const orders: Order[] = []
      snapshot.forEach((childSnapshot) => {
        orders.push(childSnapshot.val() as Order)
      })

      // Sort by creation date (newest first)
      return orders.sort((a, b) => b.createdAt - a.createdAt)
    } catch (error) {
      console.error(`Error fetching orders with status ${status}:`, error)
      throw error
    }
  },

  async getRecentOrders(limit = 10): Promise<Order[]> {
    try {
      const ordersRef = ref(database, "orders")
      const snapshot = await get(ordersRef)

      if (!snapshot.exists()) {
        return []
      }

      const orders: Order[] = []
      snapshot.forEach((childSnapshot) => {
        orders.push(childSnapshot.val() as Order)
      })

      // Sort by creation date (newest first) and limit
      return orders.sort((a, b) => b.createdAt - a.createdAt).slice(0, limit)
    } catch (error) {
      console.error("Error fetching recent orders:", error)
      throw error
    }
  },
}

