"use client"

import { useStore } from "@/lib/store"
import { Card } from "@/components/ui/card"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { TrendingUp, Zap, Calendar, Award } from "lucide-react"

export default function AnalyticsDashboard() {
  const { analytics, tasks } = useStore()

  const completedCount = tasks.filter((t) => t.completed).length
  const completionRate = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0

  const weeklyData = [
    { day: "Mon", focus: 45, tasks: 5 },
    { day: "Tue", focus: 60, tasks: 7 },
    { day: "Wed", focus: 50, tasks: 6 },
    { day: "Thu", focus: 75, tasks: 8 },
    { day: "Fri", focus: 55, tasks: 6 },
    { day: "Sat", focus: 30, tasks: 3 },
    { day: "Sun", focus: 25, tasks: 2 },
  ]

  const focusData = analytics.focusSessions.slice(-7).map((session) => ({
    date: new Date(session.date).toLocaleDateString("en-US", { weekday: "short" }),
    duration: session.duration,
  }))

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-foreground">Productivity Analytics</h1>
          <p className="text-muted-foreground mt-2">Track your progress and identify patterns</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Focus Time</p>
                <p className="text-3xl font-bold text-primary">{analytics.totalFocusTime}h</p>
              </div>
              <Zap className="w-8 h-8 text-primary" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Completion Rate</p>
                <p className="text-3xl font-bold text-accent">{completionRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-accent" />
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Current Streak</p>
                <p className="text-3xl font-bold text-foreground">{analytics.streakDays} days</p>
              </div>
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Tasks Completed</p>
                <p className="text-3xl font-bold text-foreground">{analytics.tasksCompleted}</p>
              </div>
              <Award className="w-8 h-8 text-muted-foreground" />
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Overview */}
          <Card className="p-6 bg-card border-border">
            <h2 className="text-lg font-bold text-foreground mb-6">Weekly Overview</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#f3f4f6" }}
                />
                <Legend />
                <Bar dataKey="focus" fill="#3b82f6" name="Focus (min)" />
                <Bar dataKey="tasks" fill="#8b5cf6" name="Tasks Completed" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Focus Sessions Trend */}
          <Card className="p-6 bg-card border-border">
            <h2 className="text-lg font-bold text-foreground mb-6">Focus Sessions (7 Days)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={focusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#f3f4f6" }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="duration"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6", r: 4 }}
                  name="Duration (min)"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Insights */}
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <h3 className="text-lg font-bold text-foreground mb-4">AI Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-card/50 rounded-lg border border-border/50">
              <p className="text-sm text-muted-foreground mb-2">Best Productivity Time</p>
              <p className="text-lg font-semibold text-foreground">9:00 AM - 11:00 AM</p>
              <p className="text-xs text-muted-foreground mt-2">Schedule high-priority tasks during this window</p>
            </div>
            <div className="p-4 bg-card/50 rounded-lg border border-border/50">
              <p className="text-sm text-muted-foreground mb-2">Ideal Focus Duration</p>
              <p className="text-lg font-semibold text-foreground">90 minutes</p>
              <p className="text-xs text-muted-foreground mt-2">Your data shows 90-min sessions work best</p>
            </div>
            <div className="p-4 bg-card/50 rounded-lg border border-border/50">
              <p className="text-sm text-muted-foreground mb-2">Recommended Break Length</p>
              <p className="text-lg font-semibold text-foreground">15 minutes</p>
              <p className="text-xs text-muted-foreground mt-2">Matches your natural break patterns</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
