import { database } from "@/lib/firebase"
import { ref, get, set, push, remove, update, query, orderByChild, equalTo } from "firebase/database"

export interface Product {
  id: string
  name: string
  price: number
  description: string
  longDescription?: string
  category: string
  supplier: string
  supplierId: string
  rating?: number
  reviews?: number
  stock: number
  colors?: string[]
  images: string[]
  specifications?: { name: string; value: string }[]
  features?: string[]
  createdAt: number
  updatedAt: number
}

export interface ProductInput {
  name: string
  price: number
  description: string
  longDescription?: string
  category: string
  supplierId: string
  stock: number
  colors?: string[]
  images: string[]
  specifications?: { name: string; value: string }[]
  features?: string[]
}

export const productService = {
  async getAllProducts(): Promise<Product[]> {
    try {
      const productsRef = ref(database, "products")
      const snapshot = await get(productsRef)

      if (!snapshot.exists()) {
        return []
      }

      const products: Product[] = []
      snapshot.forEach((childSnapshot) => {
        const product = { id: childSnapshot.key, ...childSnapshot.val() } as Product
        products.push(product)
      })

      return products
    } catch (error) {
      console.error("Error fetching products:", error)
      throw error
    }
  },

  async getProductById(id: string): Promise<Product | null> {
    try {
      const productRef = ref(database, `products/${id}`)
      const snapshot = await get(productRef)

      if (!snapshot.exists()) {
        return null
      }

      return { id: snapshot.key, ...snapshot.val() } as Product
    } catch (error) {
      console.error(`Error fetching product with ID ${id}:`, error)
      throw error
    }
  },

  async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const productsRef = ref(database, "products")
      const productsQuery = query(productsRef, orderByChild("category"), equalTo(category))
      const snapshot = await get(productsQuery)

      if (!snapshot.exists()) {
        return []
      }

      const products: Product[] = []
      snapshot.forEach((childSnapshot) => {
        const product = { id: childSnapshot.key, ...childSnapshot.val() } as Product
        products.push(product)
      })

      return products
    } catch (error) {
      console.error(`Error fetching products in category ${category}:`, error)
      throw error
    }
  },

  async getProductsBySupplier(supplierId: string): Promise<Product[]> {
    try {
      const productsRef = ref(database, "products")
      const productsQuery = query(productsRef, orderByChild("supplierId"), equalTo(supplierId))
      const snapshot = await get(productsQuery)

      if (!snapshot.exists()) {
        return []
      }

      const products: Product[] = []
      snapshot.forEach((childSnapshot) => {
        const product = { id: childSnapshot.key, ...childSnapshot.val() } as Product
        products.push(product)
      })

      return products
    } catch (error) {
      console.error(`Error fetching products for supplier ${supplierId}:`, error)
      throw error
    }
  },

  async createProduct(productData: ProductInput, supplierName: string): Promise<Product> {
    try {
      const productsRef = ref(database, "products")
      const newProductRef = push(productsRef)

      const now = Date.now()
      const product: Omit<Product, "id"> = {
        ...productData,
        supplier: supplierName,
        rating: 0,
        reviews: 0,
        createdAt: now,
        updatedAt: now,
      }

      await set(newProductRef, product)

      return { id: newProductRef.key!, ...product }
    } catch (error) {
      console.error("Error creating product:", error)
      throw error
    }
  },

  async updateProduct(id: string, productData: Partial<ProductInput>): Promise<void> {
    try {
      const productRef = ref(database, `products/${id}`)

      // Get current product data
      const snapshot = await get(productRef)
      if (!snapshot.exists()) {
        throw new Error(`Product with ID ${id} not found`)
      }

      const updates = {
        ...productData,
        updatedAt: Date.now(),
      }

      await update(productRef, updates)
    } catch (error) {
      console.error(`Error updating product with ID ${id}:`, error)
      throw error
    }
  },

  async deleteProduct(id: string): Promise<void> {
    try {
      const productRef = ref(database, `products/${id}`)
      await remove(productRef)
    } catch (error) {
      console.error(`Error deleting product with ID ${id}:`, error)
      throw error
    }
  },

  async updateProductStock(id: string, newStock: number): Promise<void> {
    try {
      const productRef = ref(database, `products/${id}`)
      await update(productRef, {
        stock: newStock,
        updatedAt: Date.now(),
      })
    } catch (error) {
      console.error(`Error updating stock for product with ID ${id}:`, error)
      throw error
    }
  },

  async addProductReview(id: string, rating: number): Promise<void> {
    try {
      const productRef = ref(database, `products/${id}`)

      // Get current product data
      const snapshot = await get(productRef)
      if (!snapshot.exists()) {
        throw new Error(`Product with ID ${id} not found`)
      }

      const product = snapshot.val()
      const currentRating = product.rating || 0
      const currentReviews = product.reviews || 0

      // Calculate new average rating
      const newReviews = currentReviews + 1
      const newRating = (currentRating * currentReviews + rating) / newReviews

      await update(productRef, {
        rating: Number.parseFloat(newRating.toFixed(1)),
        reviews: newReviews,
        updatedAt: Date.now(),
      })
    } catch (error) {
      console.error(`Error adding review for product with ID ${id}:`, error)
      throw error
    }
  },
}

