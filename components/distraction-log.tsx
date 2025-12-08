"use client"

import { useState } from "react"
import { useStore, type Distraction } from "@/lib/store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, X, AlertTriangle, TrendingUp, Clock, Sparkles, BarChart3 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

const DISTRACTION_TYPES = [
  { value: "app", label: "App" },
  { value: "website", label: "Website" },
  { value: "notification", label: "Notification" },
  { value: "phone", label: "Phone Call" },
  { value: "person", label: "Person" },
  { value: "thought", label: "Thought/Worry" },
  { value: "other", label: "Other" },
]

const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#ef4444", "#6366f1"]

export default function DistractionLog() {
  const { distractions, addDistraction, deleteDistraction, getDistractionInsights, focusSessions } = useStore()
  const [showAddForm, setShowAddForm] = useState(false)
  const [newDistraction, setNewDistraction] = useState({
    type: "app" as Distraction["type"],
    source: "",
    duration: 5,
    focusSessionId: "",
    notes: "",
  })

  const insights = getDistractionInsights()
  const recentDistractions = [...distractions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10)

  const handleAddDistraction = () => {
    if (newDistraction.source.trim()) {
      addDistraction({
        type: newDistraction.type,
        source: newDistraction.source.trim(),
        duration: newDistraction.duration,
        focusSessionId: newDistraction.focusSessionId || undefined,
        notes: newDistraction.notes.trim() || undefined,
      })
      setNewDistraction({
        type: "app",
        source: "",
        duration: 5,
        focusSessionId: "",
        notes: "",
      })
      setShowAddForm(false)
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
  }

  // Chart data
  const typeData = DISTRACTION_TYPES.map((type) => {
    const count = distractions.filter((d) => d.type === type.value).length
    return { name: type.label, value: count }
  }).filter((d) => d.value > 0)

  const sourceData = insights.topSources.map((source, idx) => ({
    name: source.source,
    count: source.count,
    color: COLORS[idx % COLORS.length],
  }))

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayDistractions = distractions.filter((d) => {
    const dDate = new Date(d.date)
    dDate.setHours(0, 0, 0, 0)
    return dDate.getTime() === today.getTime()
  })

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Distraction Log</h1>
            <p className="text-muted-foreground mt-2">Track interruptions and improve your focus</p>
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)} className="gap-2 bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4" />
            Log Distraction
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Distractions</p>
                <p className="text-3xl font-bold text-red-500">{distractions.length}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Time Lost</p>
                <p className="text-3xl font-bold text-orange-500">{insights.totalTime} min</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Today</p>
                <p className="text-3xl font-bold text-foreground">{todayDistractions.length}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-muted-foreground" />
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Top Source</p>
                <p className="text-lg font-bold text-foreground truncate">
                  {insights.topSources[0]?.source || "None"}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-muted-foreground" />
            </div>
          </Card>
        </div>

        {/* Add Distraction Form */}
        {showAddForm && (
          <Card className="p-6 bg-card border-border">
            <h2 className="text-xl font-bold text-foreground mb-4">Log New Distraction</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Distraction Type</label>
                  <Select
                    value={newDistraction.type}
                    onValueChange={(value) => setNewDistraction({ ...newDistraction, type: value as Distraction["type"] })}
                  >
                    <SelectTrigger className="bg-secondary/50 border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DISTRACTION_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Source</label>
                  <Input
                    placeholder="e.g., Instagram, Email, Colleague"
                    value={newDistraction.source}
                    onChange={(e) => setNewDistraction({ ...newDistraction, source: e.target.value })}
                    className="bg-secondary/50 border-border"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Duration (minutes)</label>
                  <Input
                    type="number"
                    min="1"
                    value={newDistraction.duration}
                    onChange={(e) => setNewDistraction({ ...newDistraction, duration: Number.parseInt(e.target.value) || 0 })}
                    className="bg-secondary/50 border-border"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Focus Session (optional)</label>
                  <Select
                    value={newDistraction.focusSessionId}
                    onValueChange={(value) => setNewDistraction({ ...newDistraction, focusSessionId: value })}
                  >
                    <SelectTrigger className="bg-secondary/50 border-border">
                      <SelectValue placeholder="Select session" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {focusSessions.slice(-5).map((session) => (
                        <SelectItem key={session.id} value={session.id}>
                          {new Date(session.date).toLocaleDateString()} - {session.duration} min
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Notes (optional)</label>
                <Input
                  placeholder="Add any additional context"
                  value={newDistraction.notes}
                  onChange={(e) => setNewDistraction({ ...newDistraction, notes: e.target.value })}
                  className="bg-secondary/50 border-border"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddDistraction} className="flex-1 bg-primary hover:bg-primary/90">
                  Log Distraction
                </Button>
                <Button onClick={() => setShowAddForm(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Distraction Types Chart */}
          {typeData.length > 0 && (
            <Card className="p-6 bg-card border-border">
              <h3 className="text-lg font-bold text-foreground mb-4">Distraction Types</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={typeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {typeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* Top Sources Chart */}
          {sourceData.length > 0 && (
            <Card className="p-6 bg-card border-border">
              <h3 className="text-lg font-bold text-foreground mb-4">Top Distraction Sources</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sourceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#f3f4f6" }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}
        </div>

        {/* AI Insights */}
        {insights.patterns.length > 0 && (
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold text-foreground">AI Insights</h3>
            </div>
            <ul className="space-y-2">
              {insights.patterns.map((pattern, idx) => (
                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>{pattern}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Recent Distractions */}
        <Card className="p-6 bg-card border-border">
          <h3 className="text-lg font-bold text-foreground mb-4">Recent Distractions</h3>
          {recentDistractions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No distractions logged yet. Keep track to improve your focus!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentDistractions.map((distraction) => (
                <div
                  key={distraction.id}
                  className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg border border-border/50"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${COLORS[DISTRACTION_TYPES.findIndex((t) => t.value === distraction.type)] || COLORS[0]}`} />
                    <div>
                      <p className="font-medium text-foreground">{distraction.source}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="capitalize">{distraction.type}</span>
                        <span>•</span>
                        <span>{distraction.duration} min</span>
                        <span>•</span>
                        <span>{formatDate(distraction.date)}</span>
                      </div>
                      {distraction.notes && <p className="text-xs text-muted-foreground mt-1">{distraction.notes}</p>}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteDistraction(distraction.id)}
                    className="h-6 w-6 text-muted-foreground hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

