import { supabase } from "./client"
import type { Order, OrderItem } from "@/types/supabase"
import { clearCart } from "./cart"

export async function createOrder(
  orderData: Omit<Order, "id" | "created_at" | "updated_at">,
  orderItems: Omit<OrderItem, "id" | "created_at" | "order_id">[],
) {
  try {
    // Start a transaction by using a single call
    const { data: order, error: orderError } = await supabase.from("orders").insert(orderData).select().single()

    if (orderError) throw orderError

    // Insert order items
    const orderItemsWithOrderId = orderItems.map((item) => ({
      ...item,
      order_id: order.id,
    }))

    const { error: itemsError } = await supabase.from("order_items").insert(orderItemsWithOrderId)

    if (itemsError) throw itemsError

    // Clear the user's cart
    await clearCart(orderData.user_id)

    return { data: order, error: null }
  } catch (error) {
    console.error("Error creating order:", error)
    return { data: null, error }
  }
}

export async function updateOrder(id: string, updates: Partial<Order>) {
  try {
    const { data, error } = await supabase.from("orders").update(updates).eq("id", id).select().single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error("Error updating order:", error)
    return { data: null, error }
  }
}

export async function getOrderById(id: string) {
  try {
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*, user:profiles(*)")
      .eq("id", id)
      .single()

    if (orderError) throw orderError

    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select("*, product:products(*), supplier:profiles(*)")
      .eq("order_id", id)

    if (itemsError) throw itemsError

    return {
      data: {
        ...order,
        items: items || [],
      },
      error: null,
    }
  } catch (error) {
    console.error("Error getting order:", error)
    return { data: null, error }
  }
}

export async function getOrdersByUserId(userId: string, status?: string) {
  try {
    let query = supabase.from("orders").select("*").eq("user_id", userId)

    if (status) {
      query = query.eq("status", status)
    }

    query = query.order("created_at", { ascending: false })

    const { data, error } = await query

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error("Error getting orders by user:", error)
    return { data: null, error }
  }
}

export async function getOrdersByDropshipperId(dropshipperId: string, status?: string) {
  try {
    let query = supabase.from("orders").select("*").eq("dropshipper_id", dropshipperId)

    if (status) {
      query = query.eq("status", status)
    }

    query = query.order("created_at", { ascending: false })

    const { data, error } = await query

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error("Error getting orders by dropshipper:", error)
    return { data: null, error }
  }
}

export async function getOrderItemsBySupplier(supplierId: string) {
  try {
    const { data, error } = await supabase
      .from("order_items")
      .select("*, order:orders(*), product:products(*)")
      .eq("supplier_id", supplierId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error("Error getting order items by supplier:", error)
    return { data: null, error }
  }
}

export async function getOrderStats(userId: string, role: "customer" | "wholesaler" | "dropshipper") {
  try {
    let totalOrdersQuery

    if (role === "customer") {
      totalOrdersQuery = supabase.from("orders").select("count", { count: "exact" }).eq("user_id", userId)
    } else if (role === "dropshipper") {
      totalOrdersQuery = supabase.from("orders").select("count", { count: "exact" }).eq("dropshipper_id", userId)
    } else if (role === "wholesaler") {
      totalOrdersQuery = supabase.from("order_items").select("count", { count: "exact" }).eq("supplier_id", userId)
    }

    const { count: totalOrders, error: totalOrdersError } = await totalOrdersQuery

    if (totalOrdersError) throw totalOrdersError

    // Get pending orders count
    let pendingOrdersQuery

    if (role === "customer") {
      pendingOrdersQuery = supabase
        .from("orders")
        .select("count", { count: "exact" })
        .eq("user_id", userId)
        .eq("status", "pending")
    } else if (role === "dropshipper") {
      pendingOrdersQuery = supabase
        .from("orders")
        .select("count", { count: "exact" })
        .eq("dropshipper_id", userId)
        .eq("status", "pending")
    } else if (role === "wholesaler") {
      pendingOrdersQuery = supabase.from("order_items").select("order_id").eq("supplier_id", userId)
    }

    let pendingOrders = 0

    if (role === "wholesaler") {
      const { data: orderItems, error: pendingOrdersError } = await pendingOrdersQuery

      if (pendingOrdersError) throw pendingOrdersError

      if (orderItems && orderItems.length > 0) {
        const orderIds = [...new Set(orderItems.map((item) => item.order_id))]

        const { count, error: countError } = await supabase
          .from("orders")
          .select("count", { count: "exact" })
          .in("id", orderIds)
          .eq("status", "pending")

        if (countError) throw countError

        pendingOrders = count || 0
      }
    } else {
      const { count, error: pendingOrdersError } = await pendingOrdersQuery

      if (pendingOrdersError) throw pendingOrdersError

      pendingOrders = count || 0
    }

    // Get total revenue
    let totalRevenue = 0

    if (role === "customer") {
      const { data: orders, error: revenueError } = await supabase.from("orders").select("total").eq("user_id", userId)

      if (revenueError) throw revenueError

      totalRevenue = orders?.reduce((sum, order) => sum + order.total, 0) || 0
    } else if (role === "dropshipper") {
      const { data: orders, error: revenueError } = await supabase
        .from("orders")
        .select("total")
        .eq("dropshipper_id", userId)

      if (revenueError) throw revenueError

      totalRevenue = orders?.reduce((sum, order) => sum + order.total, 0) || 0
    } else if (role === "wholesaler") {
      const { data: orderItems, error: revenueError } = await supabase
        .from("order_items")
        .select("price, quantity")
        .eq("supplier_id", userId)

      if (revenueError) throw revenueError

      totalRevenue = orderItems?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0
    }

    return {
      data: {
        totalOrders: totalOrders || 0,
        pendingOrders,
        totalRevenue,
      },
      error: null,
    }
  } catch (error) {
    console.error("Error getting order stats:", error)
    return {
      data: {
        totalOrders: 0,
        pendingOrders: 0,
        totalRevenue: 0,
      },
      error,
    }
  }
}

