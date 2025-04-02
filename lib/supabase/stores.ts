import { supabase } from "./client"
import type { Store } from "@/types/supabase"

export async function createStore(storeData: Omit<Store, "id" | "created_at" | "updated_at">) {
  try {
    // Ensure store_type is either "wholesale" or "dropshipping"
    // This fixes the constraint violation error
    const validatedStoreData = {
      ...storeData,
      store_type:
        storeData.store_type === "wholesaler"
          ? "wholesale"
          : storeData.store_type === "dropshipper"
            ? "dropshipping"
            : storeData.store_type,
    }

    const { data, error } = await supabase.from("stores").insert(validatedStoreData).select().single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error("Error creating store:", error)
    return { data: null, error }
  }
}

export async function updateStore(id: string, updates: Partial<Store>) {
  try {
    // Ensure store_type is either "wholesale" or "dropshipping" if it's being updated
    const validatedUpdates = { ...updates }
    if (updates.store_type) {
      validatedUpdates.store_type =
        updates.store_type === "wholesaler"
          ? "wholesale"
          : updates.store_type === "dropshipper"
            ? "dropshipping"
            : updates.store_type
    }

    const { data, error } = await supabase.from("stores").update(validatedUpdates).eq("id", id).select().single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error("Error updating store:", error)
    return { data: null, error }
  }
}

// Add delete store function
export async function deleteStore(id: string) {
  try {
    const { error } = await supabase.from("stores").delete().eq("id", id)

    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error("Error deleting store:", error)
    return { error }
  }
}

// Rest of the file remains the same
export async function getStoreById(id: string) {
  try {
    const { data, error } = await supabase.from("stores").select("*, owner:profiles(*)").eq("id", id).single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error("Error getting store:", error)
    return { data: null, error }
  }
}

export async function getStoreByOwnerId(ownerId: string) {
  try {
    const { data, error } = await supabase.from("stores").select("*").eq("owner_id", ownerId).single()

    if (error && error.code !== "PGRST116") throw error // PGRST116 is "No rows returned" error
    return { data, error: null }
  } catch (error) {
    console.error("Error getting store by owner:", error)
    return { data: null, error }
  }
}

export async function getStores(options?: {
  storeType?: "wholesale" | "dropshipping"
  isVerified?: boolean
  search?: string
  limit?: number
  offset?: number
}) {
  try {
    let query = supabase.from("stores").select("*, owner:profiles(*)")

    if (options?.storeType) {
      query = query.eq("store_type", options.storeType)
    }

    if (options?.isVerified !== undefined) {
      query = query.eq("is_verified", options.isVerified)
    }

    if (options?.search) {
      query = query.ilike("name", `%${options.search}%`)
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
    console.error("Error getting stores:", error)
    return { data: null, error }
  }
}

export async function uploadStoreLogo(file: File, path: string) {
  try {
    const { data, error } = await supabase.storage.from("store-logos").upload(path, file)

    if (error) throw error

    // Get public URL
    const { data: publicUrlData } = supabase.storage.from("store-logos").getPublicUrl(path)

    return { data: publicUrlData.publicUrl, error: null }
  } catch (error) {
    console.error("Error uploading store logo:", error)
    return { data: null, error }
  }
}

