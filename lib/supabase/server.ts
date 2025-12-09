import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
  const cookieStore = await cookies()

  // DEBUG: Log available cookies
  const allCookies = cookieStore.getAll()
  console.log('[SERVER AUTH] Available cookies:', allCookies.map(c => c.name))

  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )

  // DEBUG: Check auth state
  const { data: { user }, error } = await client.auth.getUser()
  console.log('[SERVER AUTH] User:', user?.id ?? 'null', 'Error:', error?.message ?? 'none')

  return client
}
