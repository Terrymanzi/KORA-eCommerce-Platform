import { supabase } from "./client"
import { v4 as uuidv4 } from "uuid"

export async function getStores(
  options: {
    limit?: number
    offset?: number
    ownerId?: string
  } = {},
) {
  let query = supabase.from("stores").select(`
      *,
      profiles!owner_id (
        id,
        full_name,
        user_type
      )
    `)

  if (options.ownerId) {
    query = query.eq("owner_id", options.ownerId)
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

export async function getStoreById(id: string) {
  const { data, error } = await supabase
    .from("stores")
    .select(`
      *,
      profiles!owner_id (
        id,
        full_name,
        user_type
      )
    `)
    .eq("id", id)
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function getStoreBySlug(slug: string) {
  const { data, error } = await supabase
    .from("stores")
    .select(`
      *,
      profiles!owner_id (
        id,
        full_name,
        user_type
      )
    `)
    .eq("url_slug", slug)
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function createStore(storeData: any, logo?: File, banner?: File) {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session) {
    throw new Error("Not authenticated")
  }

  // Check if user is a dropshipper
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("user_type")
    .eq("id", session.user.id)
    .single()

  if (profileError) {
    throw profileError
  }

  if (profile.user_type !== "dropshipper") {
    throw new Error("Only dropshippers can create stores")
  }

  // Check if slug is available
  const { count, error: slugError } = await supabase
    .from("stores")
    .select("id", { count: "exact" })
    .eq("url_slug", storeData.url_slug)

  if (slugError) {
    throw slugError
  }

  if (count > 0) {
    throw new Error("Store URL is already taken")
  }

  let logoUrl = null
  let bannerUrl = null

  // Upload logo if provided
  if (logo) {
    const fileExt = logo.name.split(".").pop()
    const fileName = `${uuidv4()}.${fileExt}`
    const filePath = `stores/logos/${fileName}`

    const { error: uploadError } = await supabase.storage.from("store-assets").upload(filePath, logo)

    if (uploadError) {
      throw uploadError
    }

    const { data: publicUrl } = supabase.storage.from("store-assets").getPublicUrl(filePath)

    logoUrl = publicUrl.publicUrl
  }

  // Upload banner if provided
  if (banner) {
    const fileExt = banner.name.split(".").pop()
    const fileName = `${uuidv4()}.${fileExt}`
    const filePath = `stores/banners/${fileName}`

    const { error: uploadError } = await supabase.storage.from("store-assets").upload(filePath, banner)

    if (uploadError) {
      throw uploadError
    }

    const { data: publicUrl } = supabase.storage.from("store-assets").getPublicUrl(filePath)

    bannerUrl = publicUrl.publicUrl
  }

  // Create store
  const { data: store, error: storeError } = await supabase
    .from("stores")
    .insert({
      ...storeData,
      owner_id: session.user.id,
      is_verified: false,
      logo_url: logoUrl,
      banner_url: bannerUrl,
    })
    .select()
    .single()

  if (storeError) {
    throw storeError
  }

  return store
}

export async function updateStore(id: string, storeData: any, logo?: File, banner?: File) {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  
  if (sessionError || !session) {
    throw new Error('Not authenticated')
  }
  
  // Check if user owns the store
  const { data: store, error: storeCheckError } = await supabase
    .from('stores')
    .select('owner_id, logo_url, banner_url')
    .eq('id', id)
    .single()
  
  if (storeCheckError) {
    throw storeCheckError
  }
  
  if (store.owner_id !== session.user.id) {
    throw new Error('Unauthorized')
  }
  
  // Check if new slug is available (if changed)
  if (storeData.url_slug) {
    const { count, error: slugError } = await supabase
      .from('stores')
      .select('id', { count: 'exact' })
      .eq('url_slug', storeData.url_slug)
      .neq('id', id)
  
  if (slugError) {
    throw slugError
  }
  
  if (count > 0) {
    throw new Error('Store URL is already taken')
  }
  
  const updateData = { ...storeData }
  
  // Upload logo if provided
  if (logo) {
    const fileExt = logo.name.split('.').pop()
    const fileName = `${uuidv4()}.${fileExt}`
    const filePath = `stores/logos/${fileName}`
    
    const { error: uploadError } = await supabase.storage
      .from('store-assets')
      .upload(filePath, logo)
    
    if (uploadError) {
      throw uploadError
    }
    
    const { data: publicUrl } = supabase.storage
      .from('store-assets')
      .getPublicUrl(filePath)
    
    updateData.logo_url = publicUrl.publicUrl
    
    // Delete old logo if exists
    if (store.logo_url) {
      const urlParts = store.logo_url.split('/')
      const oldFilePath = urlParts.slice(urlParts.indexOf('store-assets') + 1).join('/')
      
      await supabase.storage
        .from('store-assets')
        .remove([oldFilePath])
    }
  }
  
  // Upload banner if provided
  if (banner) {
    const fileExt = banner.name.split('.').pop()
    const fileName = `${uuidv4()}.${fileExt}`
    const filePath = `stores/banners/${fileName}`
    
    const { error: uploadError } = await supabase.storage
      .from('store-assets')
      .upload(filePath, banner)
    
    if (uploadError) {
      throw uploadError
    }
    
    const { data: publicUrl } = supabase.storage
      .from('store-assets')
      .getPublicUrl(filePath)
    
    updateData.banner_url = publicUrl.publicUrl
    
    // Delete old banner if exists
    if (store.banner_url) {
      const urlParts = store.banner_url.split('/')
      const oldFilePath = urlParts.slice(urlParts.indexOf('store-assets') + 1).join('/')
      
      await supabase.storage
        .from('store-assets')
        .remove([oldFilePath])
    }
  }
  
  // Update store
  const { data: updatedStore, error: updateError } = await supabase
    .from('stores')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()
  
  if (updateError) {
    throw updateError
  }
  
  return updatedStore
}

export async function verifyStore(id: string, isVerified: boolean) {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  
  if (sessionError || !session) {
    throw new Error('Not authenticated')
  }
  
  // Check if user is admin
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('user_type')
    .eq('id', session.user.id)
    .single()
  
  if (profileError) {
    throw profileError
  }
  
  if (profile.user_type !== 'admin') {
    throw new Error('Only admins can verify stores')
  }
  
  // Update store verification status
  const { data: store, error: updateError } = await supabase
    .from('stores')
    .update({ is_verified: isVerified })
    .eq('id', id)
    .select()
    .single()
  
  if (updateError) {
    throw updateError
  }
  
  return store
}

export async function getStoreProducts(storeId: string, options: {
  limit?: number,
  offset?: number,
  category?: string,
  search?: string
} = {}) {
  let query = supabase
    .from('store_products')
    .select(`
      *,
      products (
        id,
        name,
        description,
        category,
        stock,
        product_images (
          id,
          url,
          is_primary
        )
      )
    `)
    .eq('store_id', storeId)
    .eq('is_active', true)
  
  if (options.category && options.category !== 'all') {
    query = query.eq('products.category', options.category)
  }
  
  if (options.search) {
    query = query.ilike('products.name', `%${options.search}%`)
  }
  
  query = query.order('created_at', { ascending: false })
  
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

export async function addProductToStore(storeId: string, productId: string, price: number) {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  
  if (sessionError || !session) {
    throw new Error('Not authenticated')
  }
  
  // Check if user owns the store
  const { data: store, error: storeCheckError } = await supabase
    .from('stores')
    .select('owner_id')
    .eq('id', storeId)
    .single()
  
  if (storeCheckError) {
    throw storeCheckError
  }
  
  if (store.owner_id !== session.user.id) {
    throw new Error('Unauthorized')
  }
  
  // Check if product exists
  const { data: product, error: productCheckError } = await supabase
    .from('products')
    .select('id')
    .eq('id', productId)
    .single()
  
  if (productCheckError) {
    throw productCheckError
  }
  
  // Check if product is already in store
  const { count, error: countError } = await supabase
    .from('store_products')
    .select('id', { count: 'exact' })
    .eq('store_id', storeId)
    .eq('product_id', productId)
  
  if (countError) {
    throw countError
  }
  
  if (count > 0) {
    throw new Error('Product is already in store')
  }
  
  // Add product to store
  const { data: storeProduct, error: insertError } = await supabase
    .from('store_products')
    .insert({
      store_id: storeId,
      product_id: productId,
      price,
      is_active: true
    })
    .select()
    .single()
  
  if (insertError) {
    throw insertError
  }
  
  return storeProduct
}

export async function removeProductFromStore(storeId: string, productId: string) {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  
  if (sessionError || !session) {
    throw new Error('Not authenticated')
  }
  
  // Check if user owns the store
  const { data: store, error: storeCheckError } = await supabase
    .from('stores')
    .select('owner_id')
    .eq('id', storeId)
    .single()
  
  if (storeCheckError) {
    throw storeCheckError
  }
  
  if (store.owner_id !== session.user.id) {
    throw new Error('Unauthorized')
  }
  
  // Soft delete by setting is_active to false
  const { error: updateError } = await supabase
    .from('store_products')
    .update({ is_active: false })
    .eq('store_id', storeId)
    .eq('product_id', productId)
  
  if (updateError) {
    throw updateError
  }
  
  return true
}

export async function updateStoreProductPrice(storeId: string, productId: string, price: number) {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  
  if (sessionError || !session) {
    throw new Error('Not authenticated')
  }
  
  // Check if user owns the store
  const { data: store, error: storeCheckError } = await supabase
    .from('stores')
    .select('owner_id')
    .eq('id', storeId)
    .single()
  
  if (storeCheckError) {
    throw storeCheckError
  }
  
  if (store.owner_id !== session.user.id) {
    throw new Error('Unauthorized')
  }
  
  // Update price
  const { data: storeProduct, error: updateError } = await supabase
    .from('store_products')
    .update({ price })
    .eq('store_id', storeId)
    .eq('product_id', productId)
    .select()
    .single()
  
  if (updateError) {
    throw updateError
  }
  
  return storeProduct
}

