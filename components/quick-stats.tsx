"use client"

import { Card } from "@/components/ui/card"
import { CheckCircle, Clock, Zap } from "lucide-react"

interface QuickStatsProps {
  tasksCompleted: number
  totalTasks: number
  totalTime: number
  remainingTime: number
}

export default function QuickStats({ tasksCompleted, totalTasks, totalTime, remainingTime }: QuickStatsProps) {
  const completionRate = Math.round((tasksCompleted / totalTasks) * 100)

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Completed Today</p>
            <p className="text-3xl font-bold text-primary">
              {tasksCompleted}/{totalTasks}
            </p>
          </div>
          <CheckCircle className="w-8 h-8 text-primary" />
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Completion Rate</p>
            <p className="text-3xl font-bold text-accent">{completionRate}%</p>
          </div>
          <Zap className="w-8 h-8 text-accent" />
        </div>
      </Card>

      <Card className="p-6 bg-card border-border">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Time Remaining</p>
            <p className="text-3xl font-bold text-foreground">{remainingTime}h</p>
          </div>
          <Clock className="w-8 h-8 text-muted-foreground" />
        </div>
      </Card>

      <Card className="p-6 bg-card border-border">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Time</p>
            <p className="text-3xl font-bold text-foreground">{totalTime}h</p>
          </div>
          <Clock className="w-8 h-8 text-muted-foreground" />
        </div>
      </Card>
    </div>
  )
}
