import { supabase } from "./client"

// Get active partnerships for a dropshipper
export async function getActivePartnerships(dropshipperId: string) {
  try {
    const { data, error } = await supabase
      .from("partnerships")
      .select("*, wholesaler:wholesaler_id(*)")
      .eq("dropshipper_id", dropshipperId)
      .eq("status", "active")

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error("Error getting active partnerships:", error)
    return { data: null, error }
  }
}

// Get products from suppliers (wholesalers) that have active partnerships with the dropshipper
export async function getProductsFromSuppliers(wholesalerIds: string[]) {
  try {
    if (!wholesalerIds.length) return { data: [], error: null }

    const { data, error } = await supabase
      .from("products")
      .select("*, supplier:profiles(*), images:product_images(*)")
      .in("supplier_id", wholesalerIds)
      .eq("is_active", true)

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error("Error getting products from suppliers:", error)
    return { data: null, error }
  }
}

