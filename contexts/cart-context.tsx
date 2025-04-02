"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "./auth-context"
import { addToCart, getCartItems, removeFromCart, updateCartItem, clearCart } from "@/lib/supabase/cart"

type CartContextType = {
  cartItems: any[]
  loading: boolean
  addItem: (productId: string, quantity: number, price: number) => Promise<void>
  updateItem: (id: string, quantity: number) => Promise<void>
  removeItem: (id: string) => Promise<void>
  clearCart: () => Promise<void>
  totalItems: number
  subtotal: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [cartItems, setCartItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadCartItems() {
      if (user) {
        setLoading(true)
        try {
          const { data } = await getCartItems(user.id)
          setCartItems(data || [])
        } catch (error) {
          console.error("Error loading cart items:", error)
        } finally {
          setLoading(false)
        }
      } else {
        setCartItems([])
        setLoading(false)
      }
    }

    loadCartItems()
  }, [user])

  async function handleAddItem(productId: string, quantity: number, price: number) {
    if (!user) return

    try {
      const { data } = await addToCart({
        user_id: user.id,
        product_id: productId,
        quantity,
        price_at_addition: price,
      })

      if (data) {
        // Refresh cart items
        const { data: updatedCart } = await getCartItems(user.id)
        setCartItems(updatedCart || [])
      }
    } catch (error) {
      console.error("Error adding item to cart:", error)
    }
  }

  async function handleUpdateItem(id: string, quantity: number) {
    if (!user) return

    try {
      await updateCartItem(id, { quantity })

      // Update local state
      setCartItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity } : item)))
    } catch (error) {
      console.error("Error updating cart item:", error)
    }
  }

  async function handleRemoveItem(id: string) {
    if (!user) return

    try {
      await removeFromCart(id)

      // Update local state
      setCartItems((prev) => prev.filter((item) => item.id !== id))
    } catch (error) {
      console.error("Error removing item from cart:", error)
    }
  }

  async function handleClearCart() {
    if (!user) return

    try {
      await clearCart(user.id)
      setCartItems([])
    } catch (error) {
      console.error("Error clearing cart:", error)
    }
  }

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  const subtotal = cartItems.reduce((sum, item) => sum + item.quantity * item.price_at_addition, 0)

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        addItem: handleAddItem,
        updateItem: handleUpdateItem,
        removeItem: handleRemoveItem,
        clearCart: handleClearCart,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

