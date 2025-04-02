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
<<<<<<< HEAD
          email: string
          phone: string | null
          avatar_url: string | null
          bio: string | null
          user_type: "admin" | "wholesaler" | "dropshipper" | "customer"
          address: string | null
          city: string | null
          country: string | null
          postal_code: string | null
=======
          phone: string | null
          avatar_url: string | null
          user_type: "dropshipper" | "wholesaler" | "customer" | "admin"
          bio: string | null
>>>>>>> 6a74f7da2e64b207934e20c42703be7a59e35ddf
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          full_name: string
<<<<<<< HEAD
          email: string
          phone?: string | null
          avatar_url?: string | null
          bio?: string | null
          user_type: "admin" | "wholesaler" | "dropshipper" | "customer"
          address?: string | null
          city?: string | null
          country?: string | null
          postal_code?: string | null
=======
          phone?: string | null
          avatar_url?: string | null
          user_type: "dropshipper" | "wholesaler" | "customer" | "admin"
          bio?: string | null
>>>>>>> 6a74f7da2e64b207934e20c42703be7a59e35ddf
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          full_name?: string
<<<<<<< HEAD
          email?: string
          phone?: string | null
          avatar_url?: string | null
          bio?: string | null
          user_type?: "admin" | "wholesaler" | "dropshipper" | "customer"
          address?: string | null
          city?: string | null
          country?: string | null
          postal_code?: string | null
=======
          phone?: string | null
          avatar_url?: string | null
          user_type?: "dropshipper" | "wholesaler" | "customer" | "admin"
          bio?: string | null
>>>>>>> 6a74f7da2e64b207934e20c42703be7a59e35ddf
        }
      }
      products: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          description: string
<<<<<<< HEAD
          price: number
          stock_quantity: number
          category: string
          supplier_id: string
          is_active: boolean
          sku: string | null
          weight: number | null
          dimensions: string | null
          is_featured: boolean
=======
          long_description: string | null
          price: number
          category: string
          supplier_id: string
          stock: number
          features: string[] | null
          specifications: Json | null
          is_active: boolean
>>>>>>> 6a74f7da2e64b207934e20c42703be7a59e35ddf
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          description: string
<<<<<<< HEAD
          price: number
          stock_quantity: number
          category: string
          supplier_id: string
          is_active?: boolean
          sku?: string | null
          weight?: number | null
          dimensions?: string | null
          is_featured?: boolean
=======
          long_description?: string | null
          price: number
          category: string
          supplier_id: string
          stock: number
          features?: string[] | null
          specifications?: Json | null
          is_active?: boolean
>>>>>>> 6a74f7da2e64b207934e20c42703be7a59e35ddf
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          description?: string
<<<<<<< HEAD
          price?: number
          stock_quantity?: number
          category?: string
          supplier_id?: string
          is_active?: boolean
          sku?: string | null
          weight?: number | null
          dimensions?: string | null
          is_featured?: boolean
=======
          long_description?: string | null
          price?: number
          category?: string
          supplier_id?: string
          stock?: number
          features?: string[] | null
          specifications?: Json | null
          is_active?: boolean
>>>>>>> 6a74f7da2e64b207934e20c42703be7a59e35ddf
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
<<<<<<< HEAD
          logo_url: string | null
          is_verified: boolean
          store_type: "wholesale" | "dropshipping"
          rating: number | null
=======
          url_slug: string
          is_verified: boolean
          logo_url: string | null
          banner_url: string | null
>>>>>>> 6a74f7da2e64b207934e20c42703be7a59e35ddf
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          description?: string | null
          owner_id: string
<<<<<<< HEAD
          logo_url?: string | null
          is_verified?: boolean
          store_type: "wholesale" | "dropshipping"
          rating?: number | null
=======
          url_slug: string
          is_verified?: boolean
          logo_url?: string | null
          banner_url?: string | null
>>>>>>> 6a74f7da2e64b207934e20c42703be7a59e35ddf
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          description?: string | null
          owner_id?: string
<<<<<<< HEAD
          logo_url?: string | null
          is_verified?: boolean
          store_type?: "wholesale" | "dropshipping"
          rating?: number | null
=======
          url_slug?: string
          is_verified?: boolean
          logo_url?: string | null
          banner_url?: string | null
>>>>>>> 6a74f7da2e64b207934e20c42703be7a59e35ddf
        }
      }
      partnerships: {
        Row: {
          id: string
          created_at: string
          updated_at: string
<<<<<<< HEAD
          wholesaler_id: string
          dropshipper_id: string
          status: "pending" | "active" | "rejected" | "terminated"
          terms: string | null
          commission_rate: number | null
=======
          dropshipper_id: string
          wholesaler_id: string
          status: "pending" | "active" | "rejected"
          commission_rate: number
>>>>>>> 6a74f7da2e64b207934e20c42703be7a59e35ddf
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
<<<<<<< HEAD
          wholesaler_id: string
          dropshipper_id: string
          status?: "pending" | "active" | "rejected" | "terminated"
          terms?: string | null
          commission_rate?: number | null
=======
          dropshipper_id: string
          wholesaler_id: string
          status?: "pending" | "active" | "rejected"
          commission_rate: number
>>>>>>> 6a74f7da2e64b207934e20c42703be7a59e35ddf
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
<<<<<<< HEAD
          wholesaler_id?: string
          dropshipper_id?: string
          status?: "pending" | "active" | "rejected" | "terminated"
          terms?: string | null
          commission_rate?: number | null
=======
          dropshipper_id?: string
          wholesaler_id?: string
          status?: "pending" | "active" | "rejected"
          commission_rate?: number
        }
      }
      store_products: {
        Row: {
          id: string
          created_at: string
          store_id: string
          product_id: string
          price: number
          is_active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          store_id: string
          product_id: string
          price: number
          is_active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          store_id?: string
          product_id?: string
          price?: number
          is_active?: boolean
        }
      }
      carts: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
>>>>>>> 6a74f7da2e64b207934e20c42703be7a59e35ddf
        }
      }
      cart_items: {
        Row: {
          id: string
          created_at: string
          updated_at: string
<<<<<<< HEAD
          user_id: string
          product_id: string
          quantity: number
          price_at_addition: number
=======
          cart_id: string
          product_id: string
          store_id: string
          quantity: number
          price: number
>>>>>>> 6a74f7da2e64b207934e20c42703be7a59e35ddf
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
<<<<<<< HEAD
          user_id: string
          product_id: string
          quantity: number
          price_at_addition: number
=======
          cart_id: string
          product_id: string
          store_id: string
          quantity: number
          price: number
>>>>>>> 6a74f7da2e64b207934e20c42703be7a59e35ddf
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
<<<<<<< HEAD
          user_id?: string
          product_id?: string
          quantity?: number
          price_at_addition?: number
=======
          cart_id?: string
          product_id?: string
          store_id?: string
          quantity?: number
          price?: number
>>>>>>> 6a74f7da2e64b207934e20c42703be7a59e35ddf
        }
      }
      orders: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
<<<<<<< HEAD
          total: number
          shipping_address: string
          payment_method: string
          payment_status: "pending" | "paid" | "failed"
          tracking_number: string | null
          notes: string | null
          dropshipper_id: string | null
=======
          shipping_address: Json
          payment_method: string
          payment_status: "pending" | "paid" | "failed"
          subtotal: number
          shipping_fee: number
          total: number
          tracking_number: string | null
>>>>>>> 6a74f7da2e64b207934e20c42703be7a59e35ddf
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          status?: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
<<<<<<< HEAD
          total: number
          shipping_address: string
          payment_method: string
          payment_status?: "pending" | "paid" | "failed"
          tracking_number?: string | null
          notes?: string | null
          dropshipper_id?: string | null
=======
          shipping_address: Json
          payment_method: string
          payment_status?: "pending" | "paid" | "failed"
          subtotal: number
          shipping_fee: number
          total: number
          tracking_number?: string | null
>>>>>>> 6a74f7da2e64b207934e20c42703be7a59e35ddf
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          status?: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
<<<<<<< HEAD
          total?: number
          shipping_address?: string
          payment_method?: string
          payment_status?: "pending" | "paid" | "failed"
          tracking_number?: string | null
          notes?: string | null
          dropshipper_id?: string | null
=======
          shipping_address?: Json
          payment_method?: string
          payment_status?: "pending" | "paid" | "failed"
          subtotal?: number
          shipping_fee?: number
          total?: number
          tracking_number?: string | null
>>>>>>> 6a74f7da2e64b207934e20c42703be7a59e35ddf
        }
      }
      order_items: {
        Row: {
          id: string
          created_at: string
          order_id: string
          product_id: string
<<<<<<< HEAD
          quantity: number
          price: number
          supplier_id: string
=======
          store_id: string
          quantity: number
          price: number
>>>>>>> 6a74f7da2e64b207934e20c42703be7a59e35ddf
        }
        Insert: {
          id?: string
          created_at?: string
          order_id: string
          product_id: string
<<<<<<< HEAD
          quantity: number
          price: number
          supplier_id: string
=======
          store_id: string
          quantity: number
          price: number
>>>>>>> 6a74f7da2e64b207934e20c42703be7a59e35ddf
        }
        Update: {
          id?: string
          created_at?: string
          order_id?: string
          product_id?: string
<<<<<<< HEAD
          quantity?: number
          price?: number
          supplier_id?: string
=======
          store_id?: string
          quantity?: number
          price?: number
>>>>>>> 6a74f7da2e64b207934e20c42703be7a59e35ddf
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

<<<<<<< HEAD
export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type Product = Database["public"]["Tables"]["products"]["Row"]
export type ProductImage = Database["public"]["Tables"]["product_images"]["Row"]
export type Store = Database["public"]["Tables"]["stores"]["Row"]
export type Partnership = Database["public"]["Tables"]["partnerships"]["Row"]
export type CartItem = Database["public"]["Tables"]["cart_items"]["Row"]
export type Order = Database["public"]["Tables"]["orders"]["Row"]
export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"]

=======
>>>>>>> 6a74f7da2e64b207934e20c42703be7a59e35ddf
