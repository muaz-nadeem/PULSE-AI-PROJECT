"use client"

import { useState, useEffect } from "react"
import { useStore } from "@/lib/store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, FileText, Share2, Calendar, TrendingUp, Target, Award, Monitor, Clock } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"

interface TabAnalytics {
  domain: string
  totalTime: number
  visitCount: number
  daysActive: number
}

export default function Reports() {
  const { generateWeeklyReport, generateMonthlyReport, exportToCSV, exportToPDF, analytics, tasks, focusSessions, habits, goals, achievements } = useStore()
  const [reportType, setReportType] = useState<"weekly" | "monthly">("weekly")
  const [tabAnalytics, setTabAnalytics] = useState<TabAnalytics[]>([])
  const [loadingTabs, setLoadingTabs] = useState(true)

  const weeklyReport = generateWeeklyReport()
  const monthlyReport = generateMonthlyReport()

  const currentReport = reportType === "weekly" ? weeklyReport : monthlyReport

  // Fetch tab analytics
  useEffect(() => {
    const fetchTabAnalytics = async () => {
      setLoadingTabs(true)
      try {
        const today = new Date()
        let startDate: string
        let endDate = today.toISOString().split("T")[0]

        if (reportType === "weekly") {
          const weekStart = new Date(today)
          weekStart.setDate(today.getDate() - today.getDay())
          startDate = weekStart.toISOString().split("T")[0]
        } else {
          const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
          startDate = monthStart.toISOString().split("T")[0]
        }

        const response = await fetch(
          `/api/extension/tabs/analytics?startDate=${startDate}&endDate=${endDate}&limit=15`
        )

        if (response.ok) {
          const result = await response.json()
          setTabAnalytics(result.data || [])
        }
      } catch (error) {
        console.error("Error fetching tab analytics:", error)
      } finally {
        setLoadingTabs(false)
      }
    }

    fetchTabAnalytics()
  }, [reportType])

  const handleExportCSV = () => {
    const csv = exportToCSV()
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `pulse-${reportType}-report-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleShare = () => {
    const shareText = `Check out my ${reportType} productivity report from Pulse!\n\n${currentReport.summary}`
    
    if (navigator.share) {
      navigator.share({
        title: `Pulse ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`,
        text: shareText,
      }).catch(() => {
        // Fallback to clipboard
        navigator.clipboard.writeText(shareText)
        alert("Report summary copied to clipboard!")
      })
    } else {
      navigator.clipboard.writeText(shareText)
      alert("Report summary copied to clipboard!")
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  // Prepare chart data for tab analytics
  const chartData = tabAnalytics.slice(0, 10).map((item) => ({
    name: item.domain.length > 20 ? item.domain.substring(0, 20) + "..." : item.domain,
    fullName: item.domain,
    time: Math.round(item.totalTime / 60), // Convert to minutes
    visits: item.visitCount,
  }))

  const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#ef4444", "#6366f1", "#14b8a6", "#f97316", "#a855f7"]

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Reports & Export</h1>
            <p className="text-muted-foreground mt-2">Generate and share your productivity reports</p>
          </div>
          <div className="flex gap-2">
            <Select value={reportType} onValueChange={(value) => setReportType(value as "weekly" | "monthly")}>
              <SelectTrigger className="w-40 bg-secondary/50 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly Report</SelectItem>
                <SelectItem value="monthly">Monthly Report</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Report Summary */}
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {reportType === "weekly" ? "Weekly" : "Monthly"} Report
              </h2>
              <p className="text-muted-foreground mt-1">
                {reportType === "weekly"
                  ? `Week of ${new Date(new Date().setDate(new Date().getDate() - new Date().getDay())).toLocaleDateString()}`
                  : new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleShare} variant="outline" className="gap-2">
                <Share2 className="w-4 h-4" />
                Share
              </Button>
              <Button onClick={handleExportCSV} variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
              <Button onClick={exportToPDF} className="gap-2 bg-primary hover:bg-primary/90">
                <FileText className="w-4 h-4" />
                Export PDF
              </Button>
            </div>
          </div>

          {/* Report Content */}
          <div className="space-y-6">
            {/* Summary Text */}
            <div className="p-4 bg-secondary/30 rounded-lg border border-border/50">
              <pre className="text-sm text-foreground whitespace-pre-wrap font-mono">{currentReport.summary}</pre>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <div className="flex items-center gap-3">
                  <Target className="w-6 h-6 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Focus Sessions</p>
                    <p className="text-2xl font-bold text-primary">{currentReport.data.focusSessions}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
                <div className="flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-accent" />
                  <div>
                    <p className="text-xs text-muted-foreground">Focus Time</p>
                    <p className="text-2xl font-bold text-accent">
                      {reportType === "weekly" ? `${currentReport.data.focusTime} min` : `${currentReport.data.focusTime} hrs`}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-card border-border">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Tasks Completed</p>
                    <p className="text-2xl font-bold text-foreground">
                      {currentReport.data.tasksCompleted} / {currentReport.data.tasksTotal}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-card border-border">
                <div className="flex items-center gap-3">
                  <Award className="w-6 h-6 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {reportType === "weekly" ? "Active Habits" : "Goals Completed"}
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {reportType === "weekly" ? currentReport.data.habitsActive : currentReport.data.goalsCompleted}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Detailed Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Focus Sessions Breakdown */}
              <Card className="p-6 bg-card border-border">
                <h3 className="text-lg font-bold text-foreground mb-4">Focus Sessions</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Sessions</span>
                    <span className="font-semibold text-foreground">{currentReport.data.focusSessions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Time</span>
                    <span className="font-semibold text-foreground">
                      {reportType === "weekly" ? `${currentReport.data.focusTime} minutes` : `${currentReport.data.focusTime} hours`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Average per Day</span>
                    <span className="font-semibold text-foreground">
                      {reportType === "weekly"
                        ? `${Math.round(currentReport.data.focusSessions / 7)} sessions`
                        : `${Math.round(currentReport.data.focusSessions / 30)} sessions`}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Tasks Breakdown */}
              <Card className="p-6 bg-card border-border">
                <h3 className="text-lg font-bold text-foreground mb-4">Tasks</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Completed</span>
                    <span className="font-semibold text-foreground">{currentReport.data.tasksCompleted}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Created</span>
                    <span className="font-semibold text-foreground">{currentReport.data.tasksTotal}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Completion Rate</span>
                    <span className="font-semibold text-foreground">
                      {currentReport.data.tasksTotal > 0
                        ? Math.round((currentReport.data.tasksCompleted / currentReport.data.tasksTotal) * 100)
                        : 0}
                      %
                    </span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Monthly-specific metrics */}
            {reportType === "monthly" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-6 bg-card border-border">
                  <h3 className="text-lg font-bold text-foreground mb-4">Achievements</h3>
                  <div className="flex items-center gap-2">
                    <Award className="w-8 h-8 text-yellow-500" />
                    <div>
                      <p className="text-2xl font-bold text-foreground">{currentReport.data.achievements}</p>
                      <p className="text-sm text-muted-foreground">Achievements unlocked this month</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-card border-border">
                  <h3 className="text-lg font-bold text-foreground mb-4">Challenges</h3>
                  <div className="flex items-center gap-2">
                    <Target className="w-8 h-8 text-primary" />
                    <div>
                      <p className="text-2xl font-bold text-foreground">{currentReport.data.challengesCompleted}</p>
                      <p className="text-sm text-muted-foreground">Challenges completed this month</p>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </Card>

        {/* Tab/App Usage Analytics */}
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Monitor className="w-6 h-6 text-primary" />
              <div>
                <h2 className="text-2xl font-bold text-foreground">Browser Usage Analytics</h2>
                <p className="text-sm text-muted-foreground">
                  Track which websites and apps you spend time on
                </p>
              </div>
            </div>
          </div>

          {loadingTabs ? (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-2 opacity-50 animate-spin" />
              <p>Loading usage data...</p>
            </div>
          ) : tabAnalytics.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Monitor className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No usage data available yet.</p>
              <p className="text-sm mt-1">Install the Chrome extension to start tracking your browsing.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
                  <div className="flex items-center gap-3">
                    <Clock className="w-6 h-6 text-blue-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Total Time Tracked</p>
                      <p className="text-2xl font-bold text-blue-500">
                        {formatTime(tabAnalytics.reduce((sum, item) => sum + item.totalTime, 0))}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
                  <div className="flex items-center gap-3">
                    <Monitor className="w-6 h-6 text-purple-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Sites Tracked</p>
                      <p className="text-2xl font-bold text-purple-500">{tabAnalytics.length}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 bg-card border-border">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-6 h-6 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Total Visits</p>
                      <p className="text-2xl font-bold text-foreground">
                        {tabAnalytics.reduce((sum, item) => sum + item.visitCount, 0)}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Chart */}
              {chartData.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-bold text-foreground mb-4">Top Sites by Time Spent</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="name"
                        stroke="#6b7280"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        fontSize={12}
                      />
                      <YAxis stroke="#6b7280" label={{ value: "Minutes", angle: -90, position: "insideLeft" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1f2937",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                        }}
                        labelStyle={{ color: "#f3f4f6" }}
                        formatter={(value: any, name: string, props: any) => {
                          if (name === "time") {
                            return [`${value} minutes`, "Time Spent"]
                          }
                          return [value, "Visits"]
                        }}
                        labelFormatter={(label) => `Site: ${label}`}
                      />
                      <Bar dataKey="time" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Detailed Table */}
              <div className="mt-6">
                <h3 className="text-lg font-bold text-foreground mb-4">Detailed Usage Breakdown</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Website/App</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">Time Spent</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">Visits</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">Days Active</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tabAnalytics.map((item, index) => (
                        <tr key={item.domain} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              />
                              <span className="font-medium text-foreground">{item.domain}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right font-semibold text-foreground">
                            {formatTime(item.totalTime)}
                          </td>
                          <td className="py-3 px-4 text-right text-muted-foreground">{item.visitCount}</td>
                          <td className="py-3 px-4 text-right text-muted-foreground">{item.daysActive}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Focus Hours</p>
                <p className="text-2xl font-bold text-foreground">{analytics.totalFocusHours}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-accent" />
              <div>
                <p className="text-sm text-muted-foreground">All-Time Tasks</p>
                <p className="text-2xl font-bold text-foreground">
                  {tasks.filter((t) => t.completed).length} / {tasks.length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Achievements</p>
                <p className="text-2xl font-bold text-foreground">
                  {achievements.filter((a) => a.unlockedAt).length} / {achievements.length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Share Options */}
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            Share Your Progress
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Share your productivity report with accountability partners, mentors, or friends to stay motivated and
            track your progress together.
          </p>
          <div className="flex gap-2">
            <Button onClick={handleShare} variant="outline" className="gap-2">
              <Share2 className="w-4 h-4" />
              Share Report
            </Button>
            <Button onClick={handleExportCSV} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Download CSV
            </Button>
            <Button onClick={exportToPDF} variant="outline" className="gap-2">
              <FileText className="w-4 h-4" />
              Download PDF
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}


