import { database } from "@/lib/firebase"
import { ref, get, set } from "firebase/database"
import { productService } from "./product-service"

export interface CartItem {
  productId: string
  quantity: number
  price: number
  options?: {
    color?: string
    size?: string
  }
  addedAt: number
}

export interface Cart {
  items: Record<string, CartItem>
  subtotal: number
  itemCount: number
  updatedAt: number
}

export const cartService = {
  async getCart(userId: string): Promise<Cart> {
    try {
      const cartRef = ref(database, `carts/${userId}`)
      const snapshot = await get(cartRef)

      if (!snapshot.exists()) {
        // Return empty cart
        return {
          items: {},
          subtotal: 0,
          itemCount: 0,
          updatedAt: Date.now(),
        }
      }

      return snapshot.val() as Cart
    } catch (error) {
      console.error(`Error fetching cart for user ${userId}:`, error)
      throw error
    }
  },

  async addToCart(
    userId: string,
    productId: string,
    quantity = 1,
    options?: { color?: string; size?: string },
  ): Promise<void> {
    try {
      // Get product details
      const product = await productService.getProductById(productId)
      if (!product) {
        throw new Error(`Product with ID ${productId} not found`)
      }

      if (product.status === "out_of_stock" || product.stock < quantity) {
        throw new Error("Product is out of stock or has insufficient stock")
      }

      // Get current cart
      const cart = await this.getCart(userId)

      // Check if product already exists in cart
      const cartItemKey = `${productId}${options?.color ? `-${options.color}` : ""}${options?.size ? `-${options.size}` : ""}`

      if (cart.items[cartItemKey]) {
        // Update quantity
        cart.items[cartItemKey].quantity += quantity
      } else {
        // Add new item
        cart.items[cartItemKey] = {
          productId,
          quantity,
          price: product.salePrice || product.price,
          options,
          addedAt: Date.now(),
        }
      }

      // Recalculate subtotal and item count
      let subtotal = 0
      let itemCount = 0

      Object.values(cart.items).forEach((item) => {
        subtotal += item.price * item.quantity
        itemCount += item.quantity
      })

      cart.subtotal = subtotal
      cart.itemCount = itemCount
      cart.updatedAt = Date.now()

      // Save cart
      const cartRef = ref(database, `carts/${userId}`)
      await set(cartRef, cart)
    } catch (error) {
      console.error(`Error adding product ${productId} to cart for user ${userId}:`, error)
      throw error
    }
  },

  async updateCartItemQuantity(userId: string, cartItemKey: string, quantity: number): Promise<void> {
    try {
      // Get current cart
      const cart = await this.getCart(userId)

      if (!cart.items[cartItemKey]) {
        throw new Error(`Cart item with key ${cartItemKey} not found`)
      }

      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        delete cart.items[cartItemKey]
      } else {
        // Check stock
        const product = await productService.getProductById(cart.items[cartItemKey].productId)
        if (!product) {
          throw new Error(`Product not found`)
        }

        if (product.stock < quantity) {
          throw new Error("Insufficient stock")
        }

        // Update quantity
        cart.items[cartItemKey].quantity = quantity
      }

      // Recalculate subtotal and item count
      let subtotal = 0
      let itemCount = 0

      Object.values(cart.items).forEach((item) => {
        subtotal += item.price * item.quantity
        itemCount += item.quantity
      })

      cart.subtotal = subtotal
      cart.itemCount = itemCount
      cart.updatedAt = Date.now()

      // Save cart
      const cartRef = ref(database, `carts/${userId}`)
      await set(cartRef, cart)
    } catch (error) {
      console.error(`Error updating quantity for cart item ${cartItemKey} for user ${userId}:`, error)
      throw error
    }
  },

  async removeFromCart(userId: string, cartItemKey: string): Promise<void> {
    try {
      // Get current cart
      const cart = await this.getCart(userId)

      if (!cart.items[cartItemKey]) {
        throw new Error(`Cart item with key ${cartItemKey} not found`)
      }

      // Remove item
      delete cart.items[cartItemKey]

      // Recalculate subtotal and item count
      let subtotal = 0
      let itemCount = 0

      Object.values(cart.items).forEach((item) => {
        subtotal += item.price * item.quantity
        itemCount += item.quantity
      })

      cart.subtotal = subtotal
      cart.itemCount = itemCount
      cart.updatedAt = Date.now()

      // Save cart
      const cartRef = ref(database, `carts/${userId}`)
      await set(cartRef, cart)
    } catch (error) {
      console.error(`Error removing cart item ${cartItemKey} for user ${userId}:`, error)
      throw error
    }
  },

  async clearCart(userId: string): Promise<void> {
    try {
      const cart: Cart = {
        items: {},
        subtotal: 0,
        itemCount: 0,
        updatedAt: Date.now(),
      }

      const cartRef = ref(database, `carts/${userId}`)
      await set(cartRef, cart)
    } catch (error) {
      console.error(`Error clearing cart for user ${userId}:`, error)
      throw error
    }
  },

  async getCartWithProducts(userId: string): Promise<any> {
    try {
      const cart = await this.getCart(userId)

      // Get product details for each cart item
      const cartWithProducts = {
        ...cart,
        items: {} as Record<string, any>,
      }

      for (const [key, item] of Object.entries(cart.items)) {
        const product = await productService.getProductById(item.productId)

        if (product) {
          cartWithProducts.items[key] = {
            ...item,
            product: {
              id: product.id,
              name: product.name,
              description: product.description,
              price: product.price,
              salePrice: product.salePrice,
              images: product.images,
              supplier: product.supplier,
              stock: product.stock,
            },
          }
        }
      }

      return cartWithProducts
    } catch (error) {
      console.error(`Error fetching cart with products for user ${userId}:`, error)
      throw error
    }
  },
}

