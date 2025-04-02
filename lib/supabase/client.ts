import { createClient } from "@supabase/supabase-js"
<<<<<<< HEAD
import type { Database } from "@/types/supabase"
=======
>>>>>>> 6a74f7da2e64b207934e20c42703be7a59e35ddf

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

<<<<<<< HEAD
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
=======
// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
>>>>>>> 6a74f7da2e64b207934e20c42703be7a59e35ddf

