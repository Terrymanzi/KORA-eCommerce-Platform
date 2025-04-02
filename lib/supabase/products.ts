import { supabase } from "./client"
import type { Product, ProductImage } from "@/types/supabase"

export async function createProduct(productData: Omit<Product, "id" | "created_at" | "updated_at">) {
  try {
    const { data, error } = await supabase.from("products").insert(productData).select().single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error("Error creating product:", error)
    return { data: null, error }
  }
}

export async function updateProduct(id: string, updates: Partial<Product>) {
  try {
    const { data, error } = await supabase.from("products").update(updates).eq("id", id).select().single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error("Error updating product:", error)
    return { data: null, error }
  }
}

export async function deleteProduct(id: string) {
  try {
    const { error } = await supabase.from("products").delete().eq("id", id)

    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error("Error deleting product:", error)
    return { error }
  }
}

export async function getProductById(id: string) {
  try {
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("*, supplier:profiles(*)")
      .eq("id", id)
      .single()

    if (productError) throw productError

    const { data: images, error: imagesError } = await supabase.from("product_images").select("*").eq("product_id", id)

    if (imagesError) throw imagesError

    return {
      data: {
        ...product,
        images: images || [],
      },
      error: null,
    }
  } catch (error) {
    console.error("Error getting product:", error)
    return { data: null, error }
  }
}

export async function getProducts(options?: {
  category?: string
  supplierId?: string
  search?: string
  limit?: number
  offset?: number
  featured?: boolean
}) {
  try {
    let query = supabase.from("products").select("*, supplier:profiles(*), images:product_images(*)")

    if (options?.category) {
      query = query.eq("category", options.category)
    }

    if (options?.supplierId) {
      query = query.eq("supplier_id", options.supplierId)
    }

    if (options?.search) {
      query = query.ilike("name", `%${options.search}%`)
    }

    if (options?.featured) {
      query = query.eq("is_featured", true)
    }

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
    }

    const { data, error } = await query

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error("Error getting products:", error)
    return { data: null, error }
  }
}

export async function addProductImage(imageData: Omit<ProductImage, "id" | "created_at">) {
  try {
    const { data, error } = await supabase.from("product_images").insert(imageData).select().single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error("Error adding product image:", error)
    return { data: null, error }
  }
}

export async function deleteProductImage(id: string) {
  try {
    const { error } = await supabase.from("product_images").delete().eq("id", id)

    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error("Error deleting product image:", error)
    return { error }
  }
}

export async function uploadProductImage(file: File, path: string) {
  try {
    const { data, error } = await supabase.storage.from("product-images").upload(path, file)

    if (error) throw error

    // Get public URL
    const { data: publicUrlData } = supabase.storage.from("product-images").getPublicUrl(path)

    return { data: publicUrlData.publicUrl, error: null }
  } catch (error) {
    console.error("Error uploading product image:", error)
    return { data: null, error }
  }
}

export async function getCategories() {
  try {
    const { data, error } = await supabase.from("products").select("category").distinct()

    if (error) throw error
    return { data: data.map((item) => item.category), error: null }
  } catch (error) {
    console.error("Error getting categories:", error)
    return { data: null, error }
  }
}

