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
    const { type, source, duration, notes } = body

    if (!type || !source) {
      return NextResponse.json(
        { error: "Type and source are required" },
        { status: 400 }
      )
    }

    // Insert distraction into database
    const { data, error } = await supabase
      .from("distractions")
      .insert({
        user_id: user.id,
        type,
        source,
        duration: duration || 0,
        notes: notes || null,
        date: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error("Error inserting distraction:", error)
      return NextResponse.json(
        { error: "Failed to log distraction" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("Error in distraction endpoint:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
