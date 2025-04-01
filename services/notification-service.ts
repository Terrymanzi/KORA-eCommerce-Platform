import { database } from "@/lib/firebase"
import { ref, get, set, update, push, remove, query, orderByChild, equalTo } from "firebase/database"

export type NotificationType = "order" | "partnership" | "system" | "product"

export interface NotificationData {
  orderId?: string
  partnershipId?: string
  productId?: string
  storeId?: string
  [key: string]: any
}

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  data?: NotificationData
  createdAt: number
}

export interface NotificationInput {
  userId: string
  type: NotificationType
  title: string
  message: string
  data?: NotificationData
}

export const notificationService = {
  async createNotification(input: NotificationInput): Promise<string> {
    try {
      const notificationsRef = ref(database, `notifications/${input.userId}`)
      const newNotificationRef = push(notificationsRef)
      const notificationId = newNotificationRef.key!

      const notification: Notification = {
        id: notificationId,
        type: input.type,
        title: input.title,
        message: input.message,
        read: false,
        data: input.data,
        createdAt: Date.now(),
      }

      await set(newNotificationRef, notification)

      // TODO: Send push notification using Firebase Cloud Messaging (FCM)
      // This would require additional setup with FCM

      return notificationId
    } catch (error) {
      console.error("Error creating notification:", error)
      throw error
    }
  },

  async getUserNotifications(userId: string): Promise<Notification[]> {
    try {
      const notificationsRef = ref(database, `notifications/${userId}`)
      const snapshot = await get(notificationsRef)

      if (!snapshot.exists()) {
        return []
      }

      const notifications: Notification[] = []
      snapshot.forEach((childSnapshot) => {
        notifications.push(childSnapshot.val() as Notification)
      })

      // Sort by creation date (newest first)
      return notifications.sort((a, b) => b.createdAt - a.createdAt)
    } catch (error) {
      console.error(`Error fetching notifications for user ${userId}:`, error)
      throw error
    }
  },

  async getUnreadNotificationsCount(userId: string): Promise<number> {
    try {
      const notificationsRef = ref(database, `notifications/${userId}`)
      const notificationsQuery = query(notificationsRef, orderByChild("read"), equalTo(false))
      const snapshot = await get(notificationsQuery)

      if (!snapshot.exists()) {
        return 0
      }

      let count = 0
      snapshot.forEach(() => {
        count++
      })

      return count
    } catch (error) {
      console.error(`Error counting unread notifications for user ${userId}:`, error)
      throw error
    }
  },

  async markNotificationAsRead(userId: string, notificationId: string): Promise<void> {
    try {
      const notificationRef = ref(database, `notifications/${userId}/${notificationId}`)
      await update(notificationRef, {
        read: true,
      })
    } catch (error) {
      console.error(`Error marking notification ${notificationId} as read:`, error)
      throw error
    }
  },

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    try {
      const notificationsRef = ref(database, `notifications/${userId}`)
      const snapshot = await get(notificationsRef)

      if (!snapshot.exists()) {
        return
      }

      const updates: Record<string, any> = {}

      snapshot.forEach((childSnapshot) => {
        const notification = childSnapshot.val() as Notification
        if (!notification.read) {
          updates[`${childSnapshot.key}/read`] = true
        }
      })

      if (Object.keys(updates).length > 0) {
        await update(notificationsRef, updates)
      }
    } catch (error) {
      console.error(`Error marking all notifications as read for user ${userId}:`, error)
      throw error
    }
  },

  async deleteNotification(userId: string, notificationId: string): Promise<void> {
    try {
      const notificationRef = ref(database, `notifications/${userId}/${notificationId}`)
      await remove(notificationRef)
    } catch (error) {
      console.error(`Error deleting notification ${notificationId}:`, error)
      throw error
    }
  },

  async deleteAllNotifications(userId: string): Promise<void> {
    try {
      const notificationsRef = ref(database, `notifications/${userId}`)
      await remove(notificationsRef)
    } catch (error) {
      console.error(`Error deleting all notifications for user ${userId}:`, error)
      throw error
    }
  },
}

