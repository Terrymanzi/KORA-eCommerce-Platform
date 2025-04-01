export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          full_name: string
          email: string
          phone: string | null
          avatar_url: string | null
          bio: string | null
          user_type: "admin" | "wholesaler" | "dropshipper" | "customer"
          address: string | null
          city: string | null
          country: string | null
          postal_code: string | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          full_name: string
          email: string
          phone?: string | null
          avatar_url?: string | null
          bio?: string | null
          user_type: "admin" | "wholesaler" | "dropshipper" | "customer"
          address?: string | null
          city?: string | null
          country?: string | null
          postal_code?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          full_name?: string
          email?: string
          phone?: string | null
          avatar_url?: string | null
          bio?: string | null
          user_type?: "admin" | "wholesaler" | "dropshipper" | "customer"
          address?: string | null
          city?: string | null
          country?: string | null
          postal_code?: string | null
        }
      }
      products: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          description: string
          price: number
          stock_quantity: number
          category: string
          supplier_id: string
          is_active: boolean
          sku: string | null
          weight: number | null
          dimensions: string | null
          is_featured: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          description: string
          price: number
          stock_quantity: number
          category: string
          supplier_id: string
          is_active?: boolean
          sku?: string | null
          weight?: number | null
          dimensions?: string | null
          is_featured?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          description?: string
          price?: number
          stock_quantity?: number
          category?: string
          supplier_id?: string
          is_active?: boolean
          sku?: string | null
          weight?: number | null
          dimensions?: string | null
          is_featured?: boolean
        }
      }
      product_images: {
        Row: {
          id: string
          created_at: string
          product_id: string
          url: string
          is_primary: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          product_id: string
          url: string
          is_primary?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          product_id?: string
          url?: string
          is_primary?: boolean
        }
      }
      stores: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          description: string | null
          owner_id: string
          logo_url: string | null
          is_verified: boolean
          store_type: "wholesale" | "dropshipping"
          rating: number | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          description?: string | null
          owner_id: string
          logo_url?: string | null
          is_verified?: boolean
          store_type: "wholesale" | "dropshipping"
          rating?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          description?: string | null
          owner_id?: string
          logo_url?: string | null
          is_verified?: boolean
          store_type?: "wholesale" | "dropshipping"
          rating?: number | null
        }
      }
      partnerships: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          wholesaler_id: string
          dropshipper_id: string
          status: "pending" | "active" | "rejected" | "terminated"
          terms: string | null
          commission_rate: number | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          wholesaler_id: string
          dropshipper_id: string
          status?: "pending" | "active" | "rejected" | "terminated"
          terms?: string | null
          commission_rate?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          wholesaler_id?: string
          dropshipper_id?: string
          status?: "pending" | "active" | "rejected" | "terminated"
          terms?: string | null
          commission_rate?: number | null
        }
      }
      cart_items: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          product_id: string
          quantity: number
          price_at_addition: number
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          product_id: string
          quantity: number
          price_at_addition: number
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          product_id?: string
          quantity?: number
          price_at_addition?: number
        }
      }
      orders: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
          total: number
          shipping_address: string
          payment_method: string
          payment_status: "pending" | "paid" | "failed"
          tracking_number: string | null
          notes: string | null
          dropshipper_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          status?: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
          total: number
          shipping_address: string
          payment_method: string
          payment_status?: "pending" | "paid" | "failed"
          tracking_number?: string | null
          notes?: string | null
          dropshipper_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          status?: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
          total?: number
          shipping_address?: string
          payment_method?: string
          payment_status?: "pending" | "paid" | "failed"
          tracking_number?: string | null
          notes?: string | null
          dropshipper_id?: string | null
        }
      }
      order_items: {
        Row: {
          id: string
          created_at: string
          order_id: string
          product_id: string
          quantity: number
          price: number
          supplier_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          order_id: string
          product_id: string
          quantity: number
          price: number
          supplier_id: string
        }
        Update: {
          id?: string
          created_at?: string
          order_id?: string
          product_id?: string
          quantity?: number
          price?: number
          supplier_id?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type Product = Database["public"]["Tables"]["products"]["Row"]
export type ProductImage = Database["public"]["Tables"]["product_images"]["Row"]
export type Store = Database["public"]["Tables"]["stores"]["Row"]
export type Partnership = Database["public"]["Tables"]["partnerships"]["Row"]
export type CartItem = Database["public"]["Tables"]["cart_items"]["Row"]
export type Order = Database["public"]["Tables"]["orders"]["Row"]
export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"]

