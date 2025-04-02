import { supabase } from "./client"
import type { CartItem } from "@/types/supabase"

export async function addToCart(cartItemData: Omit<CartItem, "id" | "created_at" | "updated_at">) {
  try {
    // Check if item already exists in cart
    const { data: existingItem, error: checkError } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", cartItemData.user_id)
      .eq("product_id", cartItemData.product_id)
      .single()

    if (checkError && checkError.code !== "PGRST116") throw checkError // PGRST116 is "No rows returned" error

    if (existingItem) {
      // Update quantity if item exists
      const { data, error } = await supabase
        .from("cart_items")
        .update({
          quantity: existingItem.quantity + cartItemData.quantity,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingItem.id)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } else {
      // Insert new item if it doesn't exist
      const { data, error } = await supabase.from("cart_items").insert(cartItemData).select().single()

      if (error) throw error
      return { data, error: null }
    }
  } catch (error) {
    console.error("Error adding to cart:", error)
    return { data: null, error }
  }
}

export async function updateCartItem(id: string, updates: Partial<CartItem>) {
  try {
    const { data, error } = await supabase
      .from("cart_items")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error("Error updating cart item:", error)
    return { data: null, error }
  }
}

export async function removeFromCart(id: string) {
  try {
    const { error } = await supabase.from("cart_items").delete().eq("id", id)

    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error("Error removing from cart:", error)
    return { error }
  }
}

export async function clearCart(userId: string) {
  try {
    const { error } = await supabase.from("cart_items").delete().eq("user_id", userId)

    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error("Error clearing cart:", error)
    return { error }
  }
}

export async function getCartItems(userId: string) {
  try {
    const { data, error } = await supabase
      .from("cart_items")
      .select("*, product:products(*), product_image:product_images(url)")
      .eq("user_id", userId)
      .eq("product_images.is_primary", true)

    if (error) throw error

    // Format the data to include the primary image
    const formattedData = data.map((item) => ({
      ...item,
      product: {
        ...item.product,
        primary_image: item.product_image?.[0]?.url || null,
      },
      product_image: undefined, // Remove the product_image array
    }))

    return { data: formattedData, error: null }
  } catch (error) {
    console.error("Error getting cart items:", error)
    return { data: null, error }
  }
}

export async function getCartTotal(userId: string) {
  try {
    const { data, error } = await supabase
      .from("cart_items")
      .select("quantity, price_at_addition")
      .eq("user_id", userId)

    if (error) throw error

    const total = data.reduce((sum, item) => sum + item.quantity * item.price_at_addition, 0)

    return { total, error: null }
  } catch (error) {
    console.error("Error getting cart total:", error)
    return { total: 0, error }
  }
}

