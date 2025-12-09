import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Helper function to get user from Bearer token or session
async function getUserFromRequest(request: NextRequest) {
  const supabase = await createClient()

  // First, try to get user from Authorization header (for extension)
  const authHeader = request.headers.get('Authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (!error && user) {
      return { user, supabase }
    }
  }

  // Fallback to session-based auth (for web app)
  const { data: { user }, error } = await supabase.auth.getUser()
  if (!error && user) {
    return { user, supabase }
  }

  return { user: null, supabase }
}

export async function POST(request: NextRequest) {
  try {
    const { user, supabase } = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { domain, url, title, timeSpent } = body

    if (!domain || !timeSpent) {
      return NextResponse.json(
        { error: "Domain and timeSpent are required" },
        { status: 400 }
      )
    }

    const today = new Date().toISOString().split("T")[0]

    // Check if record exists for today
    const { data: existing } = await supabase
      .from("tab_analytics")
      .select("*")
      .eq("user_id", user.id)
      .eq("domain", domain)
      .eq("date", today)
      .single()

    if (existing) {
      // Update existing record
      const { error } = await supabase
        .from("tab_analytics")
        .update({
          time_spent: existing.time_spent + timeSpent,
          visit_count: existing.visit_count + 1,
          url: url || existing.url,
          title: title || existing.title
        })
        .eq("id", existing.id)

      if (error) {
        console.error("Error updating tab analytics:", error)
        return NextResponse.json(
          { error: "Failed to update tab analytics" },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true, updated: true })
    } else {
      // Insert new record
      const { data, error } = await supabase
        .from("tab_analytics")
        .insert({
          user_id: user.id,
          domain,
          url: url || null,
          title: title || null,
          time_spent: timeSpent,
          visit_count: 1,
          date: today
        })
        .select()
        .single()

      if (error) {
        console.error("Error inserting tab analytics:", error)
        return NextResponse.json(
          { error: "Failed to save tab analytics" },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true, data })
    }
  } catch (error: any) {
    console.error("Error in tabs endpoint:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
