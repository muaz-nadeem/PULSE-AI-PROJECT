"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/ui/glass-card"
import { EnergyIndicator, AnimatedCounter } from "@/components/ui/animated-counter"
import { AIProcessing, Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import {
  Battery,
  BatteryLow,
  BatteryMedium,
  BatteryFull,
  BatteryWarning,
  Zap,
  TrendingUp,
  Clock,
  Sparkles,
  RefreshCw,
  ChevronRight,
  Info,
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts"

interface EnergyEntry {
  id: string
  energy_level: number
  recorded_at: string
  hour_of_day: number
  notes?: string
}

interface EnergyPatterns {
  peakHours: number[]
  moderateHours: number[]
  lowHours: number[]
  hourlyAverages: { hour: number; average: number }[]
  insights: string[]
  recommendations: {
    focusStart: number
    focusEnd: number
    breakFrequency: number
    taskScheduling: string[]
  }
}

const energyLevels = [
  { level: 1, label: "Very Low", icon: BatteryWarning, color: "var(--energy-1)", description: "Feeling drained" },
  { level: 2, label: "Low", icon: BatteryLow, color: "var(--energy-2)", description: "Below average" },
  { level: 3, label: "Medium", icon: BatteryMedium, color: "var(--energy-3)", description: "Normal energy" },
  { level: 4, label: "High", icon: Battery, color: "var(--energy-4)", description: "Feeling good" },
  { level: 5, label: "Peak", icon: BatteryFull, color: "var(--energy-5)", description: "Maximum energy" },
]

export default function EnergyTracker() {
  const [currentEnergy, setCurrentEnergy] = useState<number | null>(null)
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [entries, setEntries] = useState<EnergyEntry[]>([])
  const [todayEntries, setTodayEntries] = useState<EnergyEntry[]>([])
  const [patterns, setPatterns] = useState<EnergyPatterns | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showSuccess, setShowSuccess] = useState(false)

  // Fetch initial data
  useEffect(() => {
    fetchEnergyData()
  }, [])

  const fetchEnergyData = async (analyze = false) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/ai/energy-optimizer?analyze=${analyze}&days=14`)
      const data = await response.json()
      
      if (data.entries) setEntries(data.entries)
      if (data.todayEntries) setTodayEntries(data.todayEntries)
      if (data.patterns || data.analysis) {
        setPatterns(data.patterns || data.analysis)
      }
    } catch (error) {
      console.error("Failed to fetch energy data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!currentEnergy) return
    
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/ai/energy-optimizer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          energyLevel: currentEnergy,
          notes: notes.trim() || undefined,
        }),
      })
      
      if (response.ok) {
        setShowSuccess(true)
        setCurrentEnergy(null)
        setNotes("")
        setTimeout(() => setShowSuccess(false), 2000)
        fetchEnergyData()
      }
    } catch (error) {
      console.error("Failed to submit energy:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    await fetchEnergyData(true)
    setIsAnalyzing(false)
  }

  // Format hour for display
  const formatHour = (hour: number) => {
    if (hour === 0) return "12am"
    if (hour === 12) return "12pm"
    return hour < 12 ? `${hour}am` : `${hour - 12}pm`
  }

  // Get chart data
  const chartData = patterns?.hourlyAverages.map(h => ({
    hour: formatHour(h.hour),
    energy: h.average,
    isPeak: patterns.peakHours.includes(h.hour),
  })) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Energy Tracker</h2>
          <p className="text-muted-foreground">Track your energy to optimize productivity</p>
        </div>
        <Button
          onClick={handleAnalyze}
          disabled={isAnalyzing || entries.length < 3}
          className="gap-2"
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Analyze Patterns
            </>
          )}
        </Button>
      </div>

      {/* Quick Log Section */}
      <GlassCard variant="vibrant">
        <GlassCardHeader>
          <GlassCardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            How's your energy right now?
          </GlassCardTitle>
        </GlassCardHeader>
        <GlassCardContent className="space-y-4">
          {/* Energy Level Selector */}
          <div className="grid grid-cols-5 gap-2">
            {energyLevels.map(({ level, label, icon: Icon, color, description }) => (
              <button
                key={level}
                onClick={() => setCurrentEnergy(level)}
                className={`
                  flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200
                  ${currentEnergy === level 
                    ? "border-primary bg-primary/10 shadow-lg scale-105" 
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                  }
                `}
              >
                <Icon 
                  className="w-8 h-8 transition-colors" 
                  style={{ color: currentEnergy === level ? color : undefined }}
                />
                <span className="text-sm font-medium">{label}</span>
                <span className="text-xs text-muted-foreground text-center">{description}</span>
              </button>
            ))}
          </div>

          {/* Notes */}
          <Textarea
            placeholder="Add notes (optional) - What are you doing? How do you feel?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[60px] resize-none"
          />

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={!currentEnergy || isSubmitting}
            className="w-full gradient-bg text-white"
          >
            {showSuccess ? "✓ Logged!" : isSubmitting ? "Saving..." : "Log Energy Level"}
          </Button>

          {/* Today's Entries */}
          {todayEntries.length > 0 && (
            <div className="pt-4 border-t border-border/50">
              <p className="text-sm text-muted-foreground mb-2">Today's entries</p>
              <div className="flex gap-2 flex-wrap">
                {todayEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-sm"
                  >
                    <EnergyIndicator level={entry.energy_level} size="sm" showLabel={false} />
                    <span>{formatHour(entry.hour_of_day)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </GlassCardContent>
      </GlassCard>

      {/* Analysis Section */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <Skeleton className="h-6 w-48 mb-4" />
            <Skeleton className="h-64 w-full" />
          </Card>
          <Card className="p-6">
            <Skeleton className="h-6 w-48 mb-4" />
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </Card>
        </div>
      ) : isAnalyzing ? (
        <AIProcessing title="Analyzing" description="Analyzing your energy patterns..." />
      ) : patterns ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Energy Curve Chart */}
          <Card variant="elevated" className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Your Energy Curve
              </h3>
            </div>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis 
                    dataKey="hour" 
                    stroke="var(--muted-foreground)" 
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis 
                    domain={[1, 5]} 
                    ticks={[1, 2, 3, 4, 5]}
                    stroke="var(--muted-foreground)" 
                    fontSize={12}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [value.toFixed(1), "Energy"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="energy"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    fill="url(#energyGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Peak Hours */}
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-2">Peak Energy Hours</p>
              <div className="flex gap-2 flex-wrap">
                {patterns.peakHours.map((hour) => (
                  <span
                    key={hour}
                    className="px-3 py-1 rounded-full bg-success/10 text-success text-sm font-medium"
                  >
                    {formatHour(hour)}
                  </span>
                ))}
              </div>
            </div>
          </Card>

          {/* AI Insights */}
          <Card variant="elevated" className="p-6">
            <h3 className="font-semibold flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-accent" />
              AI Insights & Recommendations
            </h3>
            
            <div className="space-y-4">
              {/* Insights */}
              {patterns.insights.map((insight, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{insight}</p>
                </div>
              ))}

              {/* Scheduling Recommendations */}
              <div className="pt-4 border-t border-border">
                <p className="text-sm font-medium mb-3">Optimal Focus Window</p>
                <div className="flex items-center gap-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <Clock className="w-8 h-8 text-primary" />
                  <div>
                    <p className="font-semibold text-lg">
                      {formatHour(patterns.recommendations.focusStart)} - {formatHour(patterns.recommendations.focusEnd)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Take breaks every {patterns.recommendations.breakFrequency} minutes
                    </p>
                  </div>
                </div>
              </div>

              {/* Task Scheduling Tips */}
              <div className="pt-4 border-t border-border">
                <p className="text-sm font-medium mb-3">Task Scheduling Tips</p>
                <div className="space-y-2">
                  {patterns.recommendations.taskScheduling.map((tip, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <ChevronRight className="w-4 h-4 text-primary" />
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      ) : entries.length < 3 ? (
        <Card className="p-8 text-center">
          <Battery className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-2">Start Tracking Your Energy</h3>
          <p className="text-muted-foreground mb-4">
            Log at least 3 energy entries to unlock AI-powered analysis and recommendations.
          </p>
          <p className="text-sm text-muted-foreground">
            Current entries: <span className="font-mono font-medium">{entries.length}/3</span>
          </p>
        </Card>
      ) : (
        <Card className="p-8 text-center">
          <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
          <h3 className="font-semibold mb-2">Ready to Analyze</h3>
          <p className="text-muted-foreground mb-4">
            You have {entries.length} energy entries. Click "Analyze Patterns" to get AI insights.
          </p>
          <Button onClick={handleAnalyze} className="gradient-bg text-white">
            Analyze Now
          </Button>
        </Card>
      )}
    </div>
  )
}

