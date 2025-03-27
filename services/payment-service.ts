import { database } from "@/lib/firebase"
import { ref, push, set, get, update } from "firebase/database"

export interface PaymentMethod {
  id: string
  userId: string
  type: "mobile_money" | "card" | "bank_transfer"
  details: {
    phoneNumber?: string
    cardNumber?: string
    expiryDate?: string
    bankName?: string
    accountNumber?: string
  }
  isDefault: boolean
  createdAt: number
}

export interface Payment {
  id: string
  orderId: string
  userId: string
  amount: number
  currency: string
  status: "pending" | "completed" | "failed" | "refunded"
  paymentMethod: string
  transactionId?: string
  createdAt: number
  updatedAt: number
}

export const paymentService = {
  async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    try {
      const paymentMethodsRef = ref(database, `paymentMethods/${userId}`)
      const snapshot = await get(paymentMethodsRef)

      if (!snapshot.exists()) {
        return []
      }

      const paymentMethods: PaymentMethod[] = []
      snapshot.forEach((childSnapshot) => {
        const paymentMethod = { id: childSnapshot.key, ...childSnapshot.val() } as PaymentMethod
        paymentMethods.push(paymentMethod)
      })

      return paymentMethods
    } catch (error) {
      console.error("Error fetching payment methods:", error)
      throw error
    }
  },

  async addPaymentMethod(
    userId: string,
    type: PaymentMethod["type"],
    details: PaymentMethod["details"],
    setAsDefault = false,
  ): Promise<PaymentMethod> {
    try {
      const paymentMethodsRef = ref(database, `paymentMethods/${userId}`)
      const newPaymentMethodRef = push(paymentMethodsRef)

      // If this is the first payment method or setAsDefault is true, make it default
      let isDefault = setAsDefault

      if (!isDefault) {
        const existingMethods = await this.getPaymentMethods(userId)
        isDefault = existingMethods.length === 0
      }

      // If setting as default, update all other payment methods to not be default
      if (isDefault) {
        const existingMethods = await this.getPaymentMethods(userId)
        for (const method of existingMethods) {
          if (method.isDefault) {
            const methodRef = ref(database, `paymentMethods/${userId}/${method.id}`)
            await update(methodRef, { isDefault: false })
          }
        }
      }

      const paymentMethod: Omit<PaymentMethod, "id"> = {
        userId,
        type,
        details,
        isDefault,
        createdAt: Date.now(),
      }

      await set(newPaymentMethodRef, paymentMethod)

      return { id: newPaymentMethodRef.key!, ...paymentMethod }
    } catch (error) {
      console.error("Error adding payment method:", error)
      throw error
    }
  },

  async setDefaultPaymentMethod(userId: string, paymentMethodId: string): Promise<void> {
    try {
      // Update all payment methods to not be default
      const existingMethods = await this.getPaymentMethods(userId)
      for (const method of existingMethods) {
        const methodRef = ref(database, `paymentMethods/${userId}/${method.id}`)
        await update(methodRef, { isDefault: method.id === paymentMethodId })
      }
    } catch (error) {
      console.error("Error setting default payment method:", error)
      throw error
    }
  },

  async removePaymentMethod(userId: string, paymentMethodId: string): Promise<void> {
    try {
      const paymentMethodRef = ref(database, `paymentMethods/${userId}/${paymentMethodId}`)

      // Check if this is the default payment method
      const snapshot = await get(paymentMethodRef)
      if (snapshot.exists() && snapshot.val().isDefault) {
        // If removing the default method, make another one default if available
        const existingMethods = await this.getPaymentMethods(userId)
        const otherMethods = existingMethods.filter((method) => method.id !== paymentMethodId)

        if (otherMethods.length > 0) {
          const newDefaultMethodRef = ref(database, `paymentMethods/${userId}/${otherMethods[0].id}`)
          await update(newDefaultMethodRef, { isDefault: true })
        }
      }

      // Remove the payment method
      await set(paymentMethodRef, null)
    } catch (error) {
      console.error("Error removing payment method:", error)
      throw error
    }
  },

  async processPayment(
    orderId: string,
    userId: string,
    amount: number,
    currency: string,
    paymentMethod: string,
  ): Promise<Payment> {
    try {
      // In a real app, this would integrate with a payment gateway
      // For this example, we'll simulate a successful payment

      const paymentsRef = ref(database, "payments")
      const newPaymentRef = push(paymentsRef)

      const now = Date.now()
      const payment: Omit<Payment, "id"> = {
        orderId,
        userId,
        amount,
        currency,
        status: "completed", // Simulating successful payment
        paymentMethod,
        transactionId: `TX-${Math.floor(Math.random() * 1000000)}`,
        createdAt: now,
        updatedAt: now,
      }

      await set(newPaymentRef, payment)

      // Update order status to processing
      const orderRef = ref(database, `orders/${orderId}`)
      await update(orderRef, {
        status: "processing",
        updatedAt: now,
      })

      return { id: newPaymentRef.key!, ...payment }
    } catch (error) {
      console.error("Error processing payment:", error)
      throw error
    }
  },

  async getPaymentsByUser(userId: string): Promise<Payment[]> {
    try {
      const paymentsRef = ref(database, "payments")
      const snapshot = await get(paymentsRef)

      if (!snapshot.exists()) {
        return []
      }

      const payments: Payment[] = []
      snapshot.forEach((childSnapshot) => {
        const payment = childSnapshot.val()
        if (payment.userId === userId) {
          payments.push({ id: childSnapshot.key, ...payment } as Payment)
        }
      })

      // Sort by creation date, newest first
      return payments.sort((a, b) => b.createdAt - a.createdAt)
    } catch (error) {
      console.error("Error fetching payments:", error)
      throw error
    }
  },

  async getPaymentByOrderId(orderId: string): Promise<Payment | null> {
    try {
      const paymentsRef = ref(database, "payments")
      const snapshot = await get(paymentsRef)

      if (!snapshot.exists()) {
        return null
      }

      let payment: Payment | null = null
      snapshot.forEach((childSnapshot) => {
        const paymentData = childSnapshot.val()
        if (paymentData.orderId === orderId) {
          payment = { id: childSnapshot.key, ...paymentData } as Payment
          return true // Break the forEach loop
        }
      })

      return payment
    } catch (error) {
      console.error("Error fetching payment by order ID:", error)
      throw error
    }
  },
}

