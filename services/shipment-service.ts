import { database } from "@/lib/firebase"
import { ref, push, set, get, update, query, orderByChild, equalTo } from "firebase/database"

export interface ShipmentEvent {
  status: string
  location: string
  timestamp: number
  description: string
}

export interface Shipment {
  id: string
  orderId: string
  trackingNumber: string
  carrier: string
  status: "pending" | "in_transit" | "out_for_delivery" | "delivered" | "failed"
  estimatedDelivery: number
  actualDelivery?: number
  origin: string
  destination: string
  events: ShipmentEvent[]
  createdAt: number
  updatedAt: number
}

export const shipmentService = {
  async createShipment(
    orderId: string,
    carrier: string,
    origin: string,
    destination: string,
    estimatedDelivery: number,
  ): Promise<Shipment> {
    try {
      const shipmentsRef = ref(database, "shipments")
      const newShipmentRef = push(shipmentsRef)

      const now = Date.now()
      const trackingNumber = `KR-${Math.floor(Math.random() * 1000000)}-${orderId.substring(0, 4)}`

      const shipment: Omit<Shipment, "id"> = {
        orderId,
        trackingNumber,
        carrier,
        status: "pending",
        estimatedDelivery,
        origin,
        destination,
        events: [
          {
            status: "pending",
            location: origin,
            timestamp: now,
            description: "Shipment created and pending processing",
          },
        ],
        createdAt: now,
        updatedAt: now,
      }

      await set(newShipmentRef, shipment)

      // Update order status
      const orderRef = ref(database, `orders/${orderId}`)
      await update(orderRef, {
        status: "processing",
        updatedAt: now,
      })

      return { id: newShipmentRef.key!, ...shipment }
    } catch (error) {
      console.error("Error creating shipment:", error)
      throw error
    }
  },

  async getShipmentByOrderId(orderId: string): Promise<Shipment | null> {
    try {
      const shipmentsRef = ref(database, "shipments")
      const shipmentsQuery = query(shipmentsRef, orderByChild("orderId"), equalTo(orderId))
      const snapshot = await get(shipmentsQuery)

      if (!snapshot.exists()) {
        return null
      }

      let shipment: Shipment | null = null
      snapshot.forEach((childSnapshot) => {
        shipment = { id: childSnapshot.key, ...childSnapshot.val() } as Shipment
        return true // Break the forEach loop
      })

      return shipment
    } catch (error) {
      console.error("Error fetching shipment by order ID:", error)
      throw error
    }
  },

  async getShipmentByTrackingNumber(trackingNumber: string): Promise<Shipment | null> {
    try {
      const shipmentsRef = ref(database, "shipments")
      const shipmentsQuery = query(shipmentsRef, orderByChild("trackingNumber"), equalTo(trackingNumber))
      const snapshot = await get(shipmentsQuery)

      if (!snapshot.exists()) {
        return null
      }

      let shipment: Shipment | null = null
      snapshot.forEach((childSnapshot) => {
        shipment = { id: childSnapshot.key, ...childSnapshot.val() } as Shipment
        return true // Break the forEach loop
      })

      return shipment
    } catch (error) {
      console.error("Error fetching shipment by tracking number:", error)
      throw error
    }
  },

  async updateShipmentStatus(
    shipmentId: string,
    status: Shipment["status"],
    location: string,
    description: string,
  ): Promise<void> {
    try {
      const shipmentRef = ref(database, `shipments/${shipmentId}`)
      const snapshot = await get(shipmentRef)

      if (!snapshot.exists()) {
        throw new Error(`Shipment with ID ${shipmentId} not found`)
      }

      const shipment = snapshot.val() as Omit<Shipment, "id">
      const now = Date.now()

      // Add new event
      const newEvent: ShipmentEvent = {
        status,
        location,
        timestamp: now,
        description,
      }

      const events = [...shipment.events, newEvent]

      // Update shipment
      const updates: Partial<Shipment> = {
        status,
        events,
        updatedAt: now,
      }

      // If delivered, set actual delivery date
      if (status === "delivered") {
        updates.actualDelivery = now

        // Also update order status
        const orderRef = ref(database, `orders/${shipment.orderId}`)
        await update(orderRef, {
          status: "delivered",
          updatedAt: now,
        })
      }

      await update(shipmentRef, updates)
    } catch (error) {
      console.error("Error updating shipment status:", error)
      throw error
    }
  },

  async getShipmentsByWholesaler(wholesalerId: string): Promise<Shipment[]> {
    try {
      // This is more complex as we need to find shipments for orders that contain products from this wholesaler
      // For simplicity, we'll fetch all shipments and filter them
      const shipmentsRef = ref(database, "shipments")
      const snapshot = await get(shipmentsRef)

      if (!snapshot.exists()) {
        return []
      }

      const shipments: Shipment[] = []

      // Get all orders for this wholesaler
      // This would require a more complex query in a real app
      // For now, we'll assume all shipments are relevant
      snapshot.forEach((childSnapshot) => {
        const shipment = { id: childSnapshot.key, ...childSnapshot.val() } as Shipment
        shipments.push(shipment)
      })

      // Sort by creation date, newest first
      return shipments.sort((a, b) => b.createdAt - a.createdAt)
    } catch (error) {
      console.error(`Error fetching shipments for wholesaler:`, error)
      throw error
    }
  },
}

