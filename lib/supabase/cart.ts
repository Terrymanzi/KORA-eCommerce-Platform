import { supabase } from "./client"

export async function getCart() {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session) {
    throw new Error("Not authenticated")
  }

  // Get or create cart
  let { data: cart, error: cartError } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", session.user.id)
    .single()

  if (cartError) {
    // Create new cart if not exists
    const { data: newCart, error: createError } = await supabase
      .from("carts")
      .insert({
        user_id: session.user.id,
      })
      .select("id")
      .single()

    if (createError) {
      throw createError
    }

    cart = newCart
  }

  // Get cart items
  const { data: cartItems, error: itemsError } = await supabase
    .from("cart_items")
    .select(`
      *,
      products (
        id,
        name,
        description,
        stock,
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
    `)
    .eq("cart_id", cart.id)

  if (itemsError) {
    throw itemsError
  }

  return {
    id: cart.id,
    items: cartItems,
    subtotal: cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
  }
}

export async function addToCart(productId: string, storeId: string, quantity: number) {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session) {
    throw new Error("Not authenticated")
  }

  // Get or create cart
  let { data: cart, error: cartError } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", session.user.id)
    .single()

  if (cartError) {
    // Create new cart if not exists
    const { data: newCart, error: createError } = await supabase
      .from("carts")
      .insert({
        user_id: session.user.id,
      })
      .select("id")
      .single()

    if (createError) {
      throw createError
    }

    cart = newCart
  }

  // Get product price from store
  const { data: storeProduct, error: priceError } = await supabase
    .from("store_products")
    .select("price")
    .eq("product_id", productId)
    .eq("store_id", storeId)
    .single()

  if (priceError) {
    throw priceError
  }

  // Check if product is already in cart
  const { data: existingItem, error: existingError } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("cart_id", cart.id)
    .eq("product_id", productId)
    .eq("store_id", storeId)
    .single()

  if (!existingError && existingItem) {
    // Update quantity if already in cart
    const { data: updatedItem, error: updateError } = await supabase
      .from("cart_items")
      .update({
        quantity: existingItem.quantity + quantity,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingItem.id)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    return updatedItem
  } else {
    // Add new item to cart
    const { data: newItem, error: addError } = await supabase
      .from("cart_items")
      .insert({
        cart_id: cart.id,
        product_id: productId,
        store_id: storeId,
        quantity,
        price: storeProduct.price,
      })
      .select()
      .single()

    if (addError) {
      throw addError
    }

    return newItem
  }
}

export async function updateCartItemQuantity(cartItemId: string, quantity: number) {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session) {
    throw new Error("Not authenticated")
  }

  // Check if cart item belongs to user
  const { data: cartItem, error: cartItemError } = await supabase
    .from("cart_items")
    .select("cart_id, carts!inner(user_id)")
    .eq("id", cartItemId)
    .single()

  if (cartItemError) {
    throw cartItemError
  }

  if (cartItem.carts.user_id !== session.user.id) {
    throw new Error("Unauthorized")
  }

  if (quantity <= 0) {
    // Remove item if quantity is 0 or less
    return removeCartItem(cartItemId)
  }

  // Update quantity
  const { data: updatedItem, error: updateError } = await supabase
    .from("cart_items")
    .update({
      quantity,
      updated_at: new Date().toISOString(),
    })
    .eq("id", cartItemId)
    .select()
    .single()

  if (updateError) {
    throw updateError
  }

  return updatedItem
}

export async function removeCartItem(cartItemId: string) {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session) {
    throw new Error("Not authenticated")
  }

  // Check if cart item belongs to user
  const { data: cartItem, error: cartItemError } = await supabase
    .from("cart_items")
    .select("cart_id, carts!inner(user_id)")
    .eq("id", cartItemId)
    .single()

  if (cartItemError) {
    throw cartItemError
  }

  if (cartItem.carts.user_id !== session.user.id) {
    throw new Error("Unauthorized")
  }

  // Delete cart item
  const { error: deleteError } = await supabase.from("cart_items").delete().eq("id", cartItemId)

  if (deleteError) {
    throw deleteError
  }

  return true
}

export async function clearCart() {
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
}

