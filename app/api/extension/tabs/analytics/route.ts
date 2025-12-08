import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get date range from query params
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const limit = parseInt(searchParams.get("limit") || "20")

    let query = supabase
      .from("tab_analytics")
      .select("*")
      .eq("user_id", user.id)
      .order("time_spent", { ascending: false })
      .limit(limit)

    if (startDate) {
      query = query.gte("date", startDate)
    }

    if (endDate) {
      query = query.lte("date", endDate)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching tab analytics:", error)
      return NextResponse.json(
        { error: "Failed to fetch tab analytics" },
        { status: 500 }
      )
    }

    // Aggregate by domain if needed
    const aggregated = data?.reduce((acc: any, item: any) => {
      const domain = item.domain
      if (!acc[domain]) {
        acc[domain] = {
          domain,
          totalTime: 0,
          visitCount: 0,
          dates: new Set()
        }
      }
      acc[domain].totalTime += item.time_spent
      acc[domain].visitCount += item.visit_count || 1
      acc[domain].dates.add(item.date)
      return acc
    }, {})

    const result = Object.values(aggregated || {}).map((item: any) => ({
      domain: item.domain,
      totalTime: item.totalTime, // in seconds
      visitCount: item.visitCount,
      daysActive: item.dates.size
    })).sort((a: any, b: any) => b.totalTime - a.totalTime)

    return NextResponse.json({ data: result, raw: data })
  } catch (error: any) {
    console.error("Error in tab analytics endpoint:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

