import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Create client with fallback values for build time
// Actual values will be validated at runtime
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
)

// Validate environment variables at runtime (client-side only)
if (typeof window !== "undefined") {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase environment variables. Please check your .env.local file.")
  }
}
