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

export async function GET(request: NextRequest) {
  try {
    const { user, supabase } = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get blocking settings
    const { data: blockingData, error: blockingError } = await supabase
      .from("blocking_settings")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (blockingError && blockingError.code !== "PGRST116") {
      console.error("Error fetching blocking settings:", blockingError)
    }

    // Get current schedule from accepted_schedules or current_schedule
    const today = new Date().toISOString().split("T")[0]

    // Try to get accepted schedule for today
    // Note: accepted_schedules table may not exist yet, so we'll handle the error gracefully
    let acceptedSchedule = null
    try {
      const { data } = await supabase
        .from("accepted_schedules")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", today)
        .single()
      acceptedSchedule = data
    } catch (error) {
      // Table might not exist, that's okay
      console.log("accepted_schedules table not found, using empty schedule")
    }

    let currentSchedule: any[] = []
    if (acceptedSchedule?.schedule) {
      currentSchedule = acceptedSchedule.schedule
    }

    // Check if current time is within scheduled study block
    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes() // minutes since midnight
    let isScheduledTime = false

    if (currentSchedule.length > 0) {
      isScheduledTime = currentSchedule.some((item: any) => {
        if (!item.time) return false
        const [h, m] = item.time.split(":").map(Number)
        const start = h * 60 + m
        const end = start + (item.duration || 0)
        return currentTime >= start && currentTime < end
      })
    }

    // Format blocking settings
    const blockingSettings = {
      blockingMode: blockingData?.blocking_mode || "standard",
      blockedApps: blockingData?.blocked_apps || []
    }

    return NextResponse.json({
      blockingSettings,
      currentSchedule,
      isScheduledTime
    })
  } catch (error: any) {
    console.error("Error in settings endpoint:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
