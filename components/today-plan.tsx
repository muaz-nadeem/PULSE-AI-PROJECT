"use client"

import { useStore } from "@/lib/store"
import { Card } from "@/components/ui/card"
import { Calendar, Clock } from "lucide-react"

export default function TodayPlan() {
  const { getTodayAcceptedSchedule } = useStore()
  const todaySchedule = getTodayAcceptedSchedule()

  const minutesToTime = (minutes: number) => {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
  }

  const timeToMinutes = (time: string) => {
    const [h, m] = time.split(":").map(Number)
    return h * 60 + m
  }

  const formatTimeRange = (time: string, duration: number) => {
    const startMinutes = timeToMinutes(time)
    const endMinutes = startMinutes + duration
    const startTime = minutesToTime(startMinutes)
    const endTime = minutesToTime(endMinutes)
    return `${startTime} - ${endTime}`
  }

  if (!todaySchedule || todaySchedule.length === 0) {
    return (
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Today's Schedule</h2>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">No schedule for today</p>
          <p className="text-xs mt-1">Go to Day Planner to generate your schedule</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold text-foreground">Today's Schedule</h2>
      </div>

      <div className="space-y-3">
        {todaySchedule.map((item, index) => {
          const priorityColors = {
            high: "bg-red-500/20 text-red-600",
            medium: "bg-yellow-500/20 text-yellow-600",
            low: "bg-green-500/20 text-green-600",
          }
          
          return (
            <div key={index} className="flex items-start gap-4 p-3 bg-secondary/30 rounded-lg border border-border/50">
              <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-fit">
                <Clock className="w-4 h-4" />
                {formatTimeRange(item.time, item.duration)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{item.task}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded ${priorityColors[item.priority]}`}>
                    {item.priority}
                  </span>
                  <span className="text-xs text-muted-foreground">{item.duration} min</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
