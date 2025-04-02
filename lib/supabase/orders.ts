import { supabase } from "./client"
<<<<<<< HEAD
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
=======
import { v4 as uuidv4 } from "uuid"

export async function getOrders(
  options: {
    userId?: string
    status?: string
    limit?: number
    offset?: number
  } = {},
) {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session) {
    throw new Error("Not authenticated")
  }

  const userId = options.userId || session.user.id

  let query = supabase
    .from("orders")
    .select(`
      *,
      order_items (
        id,
        product_id,
        store_id,
        quantity,
        price,
        products (
          id,
          name,
          product_images (
            id,
            url,
            is_primary
          )
        ),
        stores (
          id,
          name,
          url_slug
        )
      )
    `)
    .eq("user_id", userId)

  if (options.status) {
    query = query.eq("status", options.status)
  }

  query = query.order("created_at", { ascending: false })

  if (options.limit) {
    query = query.limit(options.limit)
  }

  if (options.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
  }

  const { data, error, count } = await query

  if (error) {
    throw error
  }

  return { data, count }
}

export async function getOrderById(id: string) {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session) {
    throw new Error("Not authenticated")
  }

  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (
        id,
        product_id,
        store_id,
        quantity,
        price,
        products (
          id,
          name,
          product_images (
            id,
            url,
            is_primary
          )
        ),
        stores (
          id,
          name,
          url_slug
        )
      )
    `)
    .eq("id", id)
    .single()

  if (error) {
    throw error
  }

  // Check if user is the order owner or a store owner of any items in the order
  if (data.user_id !== session.user.id) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("id", session.user.id)
      .single()

    if (profileError) {
      throw profileError
    }

    if (profile.user_type === "admin") {
      // Admins can view all orders
      return data
    }

    // Check if user is a store owner of any items in the order
    const storeIds = data.order_items.map((item) => item.store_id)

    const { data: stores, error: storesError } = await supabase
      .from("stores")
      .select("id")
      .eq("owner_id", session.user.id)
      .in("id", storeIds)

    if (storesError) {
      throw storesError
    }

    if (stores.length === 0) {
      throw new Error("Unauthorized")
    }
  }

  return data
}

export async function createOrder(orderData: {
  shipping_address: any
  payment_method: string
  shipping_fee: number
}) {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session) {
    throw new Error("Not authenticated")
  }

  // Get cart
  const { data: cart, error: cartError } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", session.user.id)
    .single()

  if (cartError) {
    throw cartError
  }

  // Get cart items
  const { data: cartItems, error: itemsError } = await supabase
    .from("cart_items")
    .select(`
      id,
      product_id,
      store_id,
      quantity,
      price,
      products (
        stock
      )
    `)
    .eq("cart_id", cart.id)

  if (itemsError) {
    throw itemsError
  }

  if (cartItems.length === 0) {
    throw new Error("Cart is empty")
  }

  // Check stock availability
  for (const item of cartItems) {
    if (item.quantity > item.products.stock) {
      throw new Error(`Not enough stock for product ${item.product_id}`)
    }
  }

  // Calculate subtotal
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const total = subtotal + orderData.shipping_fee

  // Generate tracking number
  const trackingNumber = `KR-${Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, "0")}`

  // Create order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      id: uuidv4(),
      user_id: session.user.id,
      status: "pending",
      shipping_address: orderData.shipping_address,
      payment_method: orderData.payment_method,
      payment_status: "pending",
      subtotal,
      shipping_fee: orderData.shipping_fee,
      total,
      tracking_number: trackingNumber,
    })
    .select()
    .single()

  if (orderError) {
    throw orderError
  }

  // Create order items
  const orderItems = cartItems.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    store_id: item.store_id,
    quantity: item.quantity,
    price: item.price,
  }))

  const { error: itemsInsertError } = await supabase.from("order_items").insert(orderItems)

  if (itemsInsertError) {
    throw itemsInsertError
  }

  // Update product stock
  for (const item of cartItems) {
    const { error: stockError } = await supabase
      .from("products")
      .update({
        stock: item.products.stock - item.quantity,
      })
      .eq("id", item.product_id)

    if (stockError) {
      console.error(`Failed to update stock for product ${item.product_id}:`, stockError)
      // Continue anyway to avoid leaving the order in an inconsistent state
    }
  }

  // Clear cart
  await clearCart()

  return order
}

export async function updateOrderStatus(orderId: string, status: "processing" | "shipped" | "delivered" | "cancelled") {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session) {
    throw new Error("Not authenticated")
  }

  // Check if user is admin
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("user_type")
    .eq("id", session.user.id)
    .single()

  if (profileError) {
    throw profileError
  }

  if (profile.user_type !== "admin") {
    throw new Error("Only admins can update order status")
  }

  // Update order status
  const { data: order, error: updateError } = await supabase
    .from("orders")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .select()
    .single()

  if (updateError) {
    throw updateError
  }

  return order
}

export async function updatePaymentStatus(orderId: string, status: "paid" | "failed") {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session) {
    throw new Error("Not authenticated")
  }

  // Check if user is admin
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("user_type")
    .eq("id", session.user.id)
    .single()

  if (profileError) {
    throw profileError
  }

  if (profile.user_type !== "admin") {
    throw new Error("Only admins can update payment status")
  }

  // Update payment status
  const { data: order, error: updateError } = await supabase
    .from("orders")
    .update({
      payment_status: status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .select()
    .single()

  if (updateError) {
    throw updateError
  }

  return order
}

// Helper function to clear cart after order creation
async function clearCart() {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session) {
    throw new Error("Not authenticated")
  }

  // Get cart
  const { data: cart, error: cartError } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", session.user.id)
    .single()

  if (cartError) {
    throw cartError
  }

  // Delete all cart items
  const { error: deleteError } = await supabase.from("cart_items").delete().eq("cart_id", cart.id)

  if (deleteError) {
    throw deleteError
  }

  return true
>>>>>>> 6a74f7da2e64b207934e20c42703be7a59e35ddf
}

