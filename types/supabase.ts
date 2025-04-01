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
          phone: string | null
          avatar_url: string | null
          user_type: "dropshipper" | "wholesaler" | "customer" | "admin"
          bio: string | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          full_name: string
          phone?: string | null
          avatar_url?: string | null
          user_type: "dropshipper" | "wholesaler" | "customer" | "admin"
          bio?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          full_name?: string
          phone?: string | null
          avatar_url?: string | null
          user_type?: "dropshipper" | "wholesaler" | "customer" | "admin"
          bio?: string | null
        }
      }
      products: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          description: string
          long_description: string | null
          price: number
          category: string
          supplier_id: string
          stock: number
          features: string[] | null
          specifications: Json | null
          is_active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          description: string
          long_description?: string | null
          price: number
          category: string
          supplier_id: string
          stock: number
          features?: string[] | null
          specifications?: Json | null
          is_active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          description?: string
          long_description?: string | null
          price?: number
          category?: string
          supplier_id?: string
          stock?: number
          features?: string[] | null
          specifications?: Json | null
          is_active?: boolean
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
          url_slug: string
          is_verified: boolean
          logo_url: string | null
          banner_url: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          description?: string | null
          owner_id: string
          url_slug: string
          is_verified?: boolean
          logo_url?: string | null
          banner_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          description?: string | null
          owner_id?: string
          url_slug?: string
          is_verified?: boolean
          logo_url?: string | null
          banner_url?: string | null
        }
      }
      partnerships: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          dropshipper_id: string
          wholesaler_id: string
          status: "pending" | "active" | "rejected"
          commission_rate: number
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          dropshipper_id: string
          wholesaler_id: string
          status?: "pending" | "active" | "rejected"
          commission_rate: number
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
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
        }
      }
      cart_items: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          cart_id: string
          product_id: string
          store_id: string
          quantity: number
          price: number
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          cart_id: string
          product_id: string
          store_id: string
          quantity: number
          price: number
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          cart_id?: string
          product_id?: string
          store_id?: string
          quantity?: number
          price?: number
        }
      }
      orders: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
          shipping_address: Json
          payment_method: string
          payment_status: "pending" | "paid" | "failed"
          subtotal: number
          shipping_fee: number
          total: number
          tracking_number: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          status?: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
          shipping_address: Json
          payment_method: string
          payment_status?: "pending" | "paid" | "failed"
          subtotal: number
          shipping_fee: number
          total: number
          tracking_number?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          status?: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
          shipping_address?: Json
          payment_method?: string
          payment_status?: "pending" | "paid" | "failed"
          subtotal?: number
          shipping_fee?: number
          total?: number
          tracking_number?: string | null
        }
      }
      order_items: {
        Row: {
          id: string
          created_at: string
          order_id: string
          product_id: string
          store_id: string
          quantity: number
          price: number
        }
        Insert: {
          id?: string
          created_at?: string
          order_id: string
          product_id: string
          store_id: string
          quantity: number
          price: number
        }
        Update: {
          id?: string
          created_at?: string
          order_id?: string
          product_id?: string
          store_id?: string
          quantity?: number
          price?: number
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

