import { database } from "@/lib/firebase"
import { ref, get, set, update, push, remove } from "firebase/database"

export interface Category {
  id: string
  name: string
  description?: string
  image?: string
  parentId?: string
  order: number
  createdAt: number
  updatedAt: number
}

export interface CategoryInput {
  name: string
  description?: string
  image?: string
  parentId?: string
  order?: number
}

export const categoryService = {
  async createCategory(categoryData: CategoryInput): Promise<Category> {
    try {
      const categoriesRef = ref(database, "categories")
      const newCategoryRef = push(categoriesRef)
      const categoryId = newCategoryRef.key!

      const now = Date.now()
      const category: Category = {
        id: categoryId,
        name: categoryData.name,
        description: categoryData.description,
        image: categoryData.image,
        parentId: categoryData.parentId,
        order: categoryData.order || 0,
        createdAt: now,
        updatedAt: now,
      }

      await set(newCategoryRef, category)

      return category
    } catch (error) {
      console.error("Error creating category:", error)
      throw error
    }
  },

  async getCategoryById(categoryId: string): Promise<Category | null> {
    try {
      const categoryRef = ref(database, `categories/${categoryId}`)
      const snapshot = await get(categoryRef)

      if (!snapshot.exists()) {
        return null
      }

      return snapshot.val() as Category
    } catch (error) {
      console.error(`Error fetching category with ID ${categoryId}:`, error)
      throw error
    }
  },

  async getAllCategories(): Promise<Category[]> {
    try {
      const categoriesRef = ref(database, "categories")
      const snapshot = await get(categoriesRef)

      if (!snapshot.exists()) {
        return []
      }

      const categories: Category[] = []
      snapshot.forEach((childSnapshot) => {
        categories.push(childSnapshot.val() as Category)
      })

      // Sort by order
      return categories.sort((a, b) => a.order - b.order)
    } catch (error) {
      console.error("Error fetching all categories:", error)
      throw error
    }
  },

  async getMainCategories(): Promise<Category[]> {
    try {
      const categories = await this.getAllCategories()
      return categories.filter((category) => !category.parentId)
    } catch (error) {
      console.error("Error fetching main categories:", error)
      throw error
    }
  },

  async getSubcategories(parentId: string): Promise<Category[]> {
    try {
      const categories = await this.getAllCategories()
      return categories.filter((category) => category.parentId === parentId)
    } catch (error) {
      console.error(`Error fetching subcategories for parent ${parentId}:`, error)
      throw error
    }
  },

  async updateCategory(categoryId: string, categoryData: Partial<CategoryInput>): Promise<void> {
    try {
      const categoryRef = ref(database, `categories/${categoryId}`)

      // Get current category data
      const snapshot = await get(categoryRef)
      if (!snapshot.exists()) {
        throw new Error(`Category with ID ${categoryId} not found`)
      }

      const updates = {
        ...categoryData,
        updatedAt: Date.now(),
      }

      await update(categoryRef, updates)
    } catch (error) {
      console.error(`Error updating category with ID ${categoryId}:`, error)
      throw error
    }
  },

  async deleteCategory(categoryId: string): Promise<void> {
    try {
      // Check if category has subcategories
      const subcategories = await this.getSubcategories(categoryId)
      if (subcategories.length > 0) {
        throw new Error("Cannot delete category with subcategories")
      }

      // Check if category has products
      const categoryProductsRef = ref(database, `categoryProducts/${categoryId}`)
      const categoryProductsSnapshot = await get(categoryProductsRef)

      if (categoryProductsSnapshot.exists()) {
        throw new Error("Cannot delete category with products")
      }

      // Delete category
      const categoryRef = ref(database, `categories/${categoryId}`)
      await remove(categoryRef)
    } catch (error) {
      console.error(`Error deleting category ${categoryId}:`, error)
      throw error
    }
  },
}

