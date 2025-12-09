import { createBrowserClient } from '@supabase/ssr'

// Create browser client that stores session in cookies (required for SSR auth)
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
