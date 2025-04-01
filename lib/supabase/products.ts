import { supabase } from "./client"
import { v4 as uuidv4 } from "uuid"

export async function getProducts(
  options: {
    category?: string
    search?: string
    limit?: number
    offset?: number
    sortBy?: string
    sortOrder?: "asc" | "desc"
  } = {},
) {
  let query = supabase
    .from("products")
    .select(`
      *,
      product_images (
        id,
        url,
        is_primary
      ),
      profiles!supplier_id (
        id,
        full_name
      )
    `)
    .eq("is_active", true)

  if (options.category && options.category !== "all") {
    query = query.eq("category", options.category)
  }

  if (options.search) {
    query = query.ilike("name", `%${options.search}%`)
  }

  if (options.sortBy) {
    query = query.order(options.sortBy, { ascending: options.sortOrder === "asc" })
  } else {
    query = query.order("created_at", { ascending: false })
  }

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

export async function getProductById(id: string) {
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      product_images (
        id,
        url,
        is_primary
      ),
      profiles!supplier_id (
        id,
        full_name
      )
    `)
    .eq("id", id)
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function getProductCategories() {
  const { data, error } = await supabase.from("products").select("category").eq("is_active", true)

  if (error) {
    throw error
  }

  // Extract unique categories
  const categories = [...new Set(data.map((item) => item.category))]
  return categories
}

export async function createProduct(productData: any, images: File[]) {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session) {
    throw new Error("Not authenticated")
  }

  // Create product
  const { data: product, error: productError } = await supabase
    .from("products")
    .insert({
      ...productData,
      supplier_id: session.user.id,
      is_active: true,
    })
    .select()
    .single()

  if (productError) {
    throw productError
  }

  // Upload images
  const imagePromises = images.map(async (image, index) => {
    const fileExt = image.name.split(".").pop()
    const fileName = `${uuidv4()}.${fileExt}`
    const filePath = `products/${product.id}/${fileName}`

    const { error: uploadError } = await supabase.storage.from("product-images").upload(filePath, image)

    if (uploadError) {
      throw uploadError
    }

    const { data: publicUrl } = supabase.storage.from("product-images").getPublicUrl(filePath)

    // Create product image record
    const { error: imageError } = await supabase.from("product_images").insert({
      product_id: product.id,
      url: publicUrl.publicUrl,
      is_primary: index === 0, // First image is primary
    })

    if (imageError) {
      throw imageError
    }

    return publicUrl.publicUrl
  })

  await Promise.all(imagePromises)

  return product
}

export async function updateProduct(id: string, productData: any, newImages?: File[]) {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session) {
    throw new Error("Not authenticated")
  }

  // Check if user owns the product
  const { data: product, error: productCheckError } = await supabase
    .from("products")
    .select("supplier_id")
    .eq("id", id)
    .single()

  if (productCheckError) {
    throw productCheckError
  }

  if (product.supplier_id !== session.user.id) {
    throw new Error("Unauthorized")
  }

  // Update product
  const { data: updatedProduct, error: updateError } = await supabase
    .from("products")
    .update(productData)
    .eq("id", id)
    .select()
    .single()

  if (updateError) {
    throw updateError
  }

  // Upload new images if provided
  if (newImages && newImages.length > 0) {
    const imagePromises = newImages.map(async (image, index) => {
      const fileExt = image.name.split(".").pop()
      const fileName = `${uuidv4()}.${fileExt}`
      const filePath = `products/${id}/${fileName}`

      const { error: uploadError } = await supabase.storage.from("product-images").upload(filePath, image)

      if (uploadError) {
        throw uploadError
      }

      const { data: publicUrl } = supabase.storage.from("product-images").getPublicUrl(filePath)

      // Create product image record
      const { error: imageError } = await supabase.from("product_images").insert({
        product_id: id,
        url: publicUrl.publicUrl,
        is_primary: false, // New images are not primary by default
      })

      if (imageError) {
        throw imageError
      }

      return publicUrl.publicUrl
    })

    await Promise.all(imagePromises)
  }

  return updatedProduct
}

export async function deleteProduct(id: string) {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session) {
    throw new Error("Not authenticated")
  }

  // Check if user owns the product
  const { data: product, error: productCheckError } = await supabase
    .from("products")
    .select("supplier_id")
    .eq("id", id)
    .single()

  if (productCheckError) {
    throw productCheckError
  }

  if (product.supplier_id !== session.user.id) {
    throw new Error("Unauthorized")
  }

  // Soft delete by setting is_active to false
  const { error: deleteError } = await supabase.from("products").update({ is_active: false }).eq("id", id)

  if (deleteError) {
    throw deleteError
  }

  return true
}

export async function setProductImageAsPrimary(productId: string, imageId: string) {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session) {
    throw new Error("Not authenticated")
  }

  // First, set all images for this product as not primary
  const { error: updateAllError } = await supabase
    .from("product_images")
    .update({ is_primary: false })
    .eq("product_id", productId)

  if (updateAllError) {
    throw updateAllError
  }

  // Then set the selected image as primary
  const { error: updateError } = await supabase
    .from("product_images")
    .update({ is_primary: true })
    .eq("id", imageId)
    .eq("product_id", productId)

  if (updateError) {
    throw updateError
  }

  return true
}

export async function deleteProductImage(imageId: string) {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session) {
    throw new Error("Not authenticated")
  }

  // Get image details
  const { data: image, error: imageError } = await supabase
    .from("product_images")
    .select("product_id, url, is_primary")
    .eq("id", imageId)
    .single()

  if (imageError) {
    throw imageError
  }

  // Check if user owns the product
  const { data: product, error: productCheckError } = await supabase
    .from("products")
    .select("supplier_id")
    .eq("id", image.product_id)
    .single()

  if (productCheckError) {
    throw productCheckError
  }

  if (product.supplier_id !== session.user.id) {
    throw new Error("Unauthorized")
  }

  // Don't allow deletion if it's the only image or if it's the primary image
  const { count, error: countError } = await supabase
    .from("product_images")
    .select("id", { count: "exact" })
    .eq("product_id", image.product_id)

  if (countError) {
    throw countError
  }

  if (count === 1) {
    throw new Error("Cannot delete the only image")
  }

  if (image.is_primary) {
    throw new Error("Cannot delete the primary image")
  }

  // Delete the image record
  const { error: deleteError } = await supabase.from("product_images").delete().eq("id", imageId)

  if (deleteError) {
    throw deleteError
  }

  // Extract file path from URL to delete from storage
  const urlParts = image.url.split("/")
  const filePath = urlParts.slice(urlParts.indexOf("product-images") + 1).join("/")

  const { error: storageError } = await supabase.storage.from("product-images").remove([filePath])

  if (storageError) {
    console.error("Failed to delete image from storage:", storageError)
    // Continue anyway as the database record is deleted
  }

  return true
}

