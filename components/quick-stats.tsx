"use client"

import { Card } from "@/components/ui/card"
import { AnimatedCounter, AnimatedProgressRing } from "@/components/ui/animated-counter"
import { CheckCircle, Clock, Zap, TrendingUp, Flame, Target } from "lucide-react"

interface QuickStatsProps {
  tasksCompleted: number
  totalTasks: number
  totalTime: number
  remainingTime: number
  streak?: number
  focusMinutes?: number
}

export default function QuickStats({ 
  tasksCompleted, 
  totalTasks, 
  totalTime, 
  remainingTime,
  streak = 0,
  focusMinutes = 0,
}: QuickStatsProps) {
  const completionRate = totalTasks > 0 ? Math.round((tasksCompleted / totalTasks) * 100) : 0

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Tasks Completed - Primary stat */}
      <Card 
        variant="gradient" 
        hover 
        className="p-5 relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-50" />
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 rounded-xl bg-primary/20 text-primary">
              <CheckCircle className="w-5 h-5" />
            </div>
            <TrendingUp className="w-4 h-4 text-success opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className="text-sm text-muted-foreground mb-1">Completed Today</p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold font-mono">
              <AnimatedCounter value={tasksCompleted} />
            </span>
            <span className="text-lg text-muted-foreground">/{totalTasks}</span>
          </div>
        </div>
      </Card>

      {/* Completion Rate - With progress ring */}
      <Card 
        variant="gradient" 
        hover 
        className="p-5 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent opacity-50" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Completion Rate</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono gradient-text">
                <AnimatedCounter value={completionRate} suffix="%" />
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {completionRate >= 80 ? "Great progress!" : completionRate >= 50 ? "Keep going!" : "You got this!"}
            </p>
          </div>
          <AnimatedProgressRing 
            value={completionRate} 
            size={60} 
            strokeWidth={5}
            showValue={false}
          />
        </div>
      </Card>

      {/* Focus Time */}
      <Card 
        variant="elevated" 
        hover 
        className="p-5 relative overflow-hidden group"
      >
        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <Zap className="w-24 h-24" />
        </div>
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 rounded-xl bg-warning/20 text-warning">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Focus Time</p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold font-mono">
              <AnimatedCounter value={focusMinutes} />
            </span>
            <span className="text-lg text-muted-foreground">min</span>
          </div>
        </div>
      </Card>

      {/* Streak */}
      <Card 
        variant="elevated" 
        hover 
        className="p-5 relative overflow-hidden group"
      >
        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <Flame className="w-24 h-24" />
        </div>
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 rounded-xl bg-error/20 text-error">
              <Flame className="w-5 h-5" />
            </div>
            {streak >= 7 && (
              <span className="px-2 py-0.5 text-xs font-medium bg-gradient-to-r from-primary to-accent text-white rounded-full animate-pulse">
                🔥 On Fire!
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-1">Day Streak</p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold font-mono">
              <AnimatedCounter value={streak} />
            </span>
            <span className="text-lg text-muted-foreground">days</span>
          </div>
        </div>
      </Card>
    </div>
  )
}

// Floating stat pill for compact display
export function StatPill({ 
  icon: Icon, 
  value, 
  label,
  color = "primary",
}: { 
  icon: React.ComponentType<{ className?: string }>
  value: number | string
  label: string
  color?: "primary" | "accent" | "success" | "warning" | "error"
}) {
  const colors = {
    primary: "bg-primary/10 text-primary border-primary/20",
    accent: "bg-accent/10 text-accent border-accent/20",
    success: "bg-success/10 text-success border-success/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    error: "bg-error/10 text-error border-error/20",
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${colors[color]}`}>
      <Icon className="w-4 h-4" />
      <span className="font-mono font-medium">{value}</span>
      <span className="text-xs opacity-70">{label}</span>
    </div>
  )
}
