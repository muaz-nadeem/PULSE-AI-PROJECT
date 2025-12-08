"use client"

import { Card } from "@/components/ui/card"
import { Calendar, Clock } from "lucide-react"

export default function TodayPlan() {
  const schedule = [
    { time: "09:00 - 10:30", task: "Design mockups", category: "Design" },
    { time: "10:30 - 11:00", task: "Team standup", category: "Meeting" },
    { time: "11:00 - 13:00", task: "Deep work session", category: "Focus" },
    { time: "13:00 - 14:00", task: "Lunch break", category: "Break" },
    { time: "14:00 - 15:30", task: "Code review", category: "Development" },
  ]

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold text-foreground">Today's Schedule</h2>
      </div>

      <div className="space-y-3">
        {schedule.map((item, index) => (
          <div key={index} className="flex items-start gap-4 p-3 bg-secondary/30 rounded-lg border border-border/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-fit">
              <Clock className="w-4 h-4" />
              {item.time}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{item.task}</p>
              <span className="text-xs text-muted-foreground">{item.category}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
