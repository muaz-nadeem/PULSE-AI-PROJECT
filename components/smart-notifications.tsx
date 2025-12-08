"use client"

import { useState, useEffect } from "react"
import { useStore } from "@/lib/store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, CheckCircle2, Sparkles, Coffee, Trophy, Target, X } from "lucide-react"

export default function SmartNotifications() {
  const { notifications, markNotificationRead, clearNotifications, getUnreadNotifications, checkSmartNotifications } = useStore()
  const [isChecking, setIsChecking] = useState(false)

  const unreadNotifications = getUnreadNotifications()

  useEffect(() => {
    // Check for smart notifications every minute
    const interval = setInterval(() => {
      checkSmartNotifications()
    }, 60000)

    // Initial check
    checkSmartNotifications()

    return () => clearInterval(interval)
  }, [])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "celebration":
        return <Trophy className="w-5 h-5 text-yellow-500" />
      case "suggestion":
        return <Sparkles className="w-5 h-5 text-primary" />
      case "reminder":
        return <Bell className="w-5 h-5 text-blue-500" />
      case "break":
        return <Coffee className="w-5 h-5 text-orange-500" />
      case "milestone":
        return <Target className="w-5 h-5 text-green-500" />
      default:
        return <Bell className="w-5 h-5 text-muted-foreground" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "celebration":
        return "bg-yellow-500/10 border-yellow-500/50"
      case "suggestion":
        return "bg-primary/10 border-primary/50"
      case "reminder":
        return "bg-blue-500/10 border-blue-500/50"
      case "break":
        return "bg-orange-500/10 border-orange-500/50"
      case "milestone":
        return "bg-green-500/10 border-green-500/50"
      default:
        return "bg-card border-border"
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`
    return "Just now"
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Smart Notifications</h1>
            <p className="text-muted-foreground mt-2">Context-aware reminders and celebrations</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={checkSmartNotifications} variant="outline" className="gap-2" disabled={isChecking}>
              <Sparkles className="w-4 h-4" />
              Check Now
            </Button>
            {notifications.length > 0 && (
              <Button onClick={clearNotifications} variant="outline" className="gap-2">
                <X className="w-4 h-4" />
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Notifications</p>
                <p className="text-3xl font-bold text-primary">{notifications.length}</p>
              </div>
              <Bell className="w-8 h-8 text-primary" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Unread</p>
                <p className="text-3xl font-bold text-accent">{unreadNotifications.length}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-accent" />
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Smart Features</p>
                <p className="text-lg font-bold text-foreground">Active</p>
              </div>
              <Sparkles className="w-8 h-8 text-muted-foreground" />
            </div>
          </Card>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <Card className="p-12 bg-card border-border text-center">
              <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">No notifications yet</h3>
              <p className="text-muted-foreground mb-4">
                Smart notifications will appear here for reminders, break suggestions, and celebrations!
              </p>
              <Button onClick={checkSmartNotifications} className="gap-2 bg-primary hover:bg-primary/90">
                <Sparkles className="w-4 h-4" />
                Check for Notifications
              </Button>
            </Card>
          ) : (
            notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`p-6 border-2 ${getNotificationColor(notification.type)} ${
                  !notification.read ? "ring-2 ring-primary/50" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-foreground mb-1">{notification.title}</h3>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                      </div>
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => markNotificationRead(notification.id)}
                          className="h-6 w-6"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{formatTime(notification.timestamp)}</span>
                      {notification.actionUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // Navigate to action URL
                            window.location.href = notification.actionUrl || "#"
                          }}
                          className="text-xs"
                        >
                          View →
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Smart Features Info */}
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Smart Notification Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-card/50 rounded-lg border border-border/50">
              <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <Coffee className="w-4 h-4 text-orange-500" />
                Break Suggestions
              </h4>
              <p className="text-sm text-muted-foreground">
                Get notified when it's time for a break after long focus sessions. Optimized timing reduces fatigue.
              </p>
            </div>
            <div className="p-4 bg-card/50 rounded-lg border border-border/50">
              <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-500" />
                Milestone Celebrations
              </h4>
              <p className="text-sm text-muted-foreground">
                Celebrate your achievements! Get notified when you complete goals and milestones.
              </p>
            </div>
            <div className="p-4 bg-card/50 rounded-lg border border-border/50">
              <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-500" />
                Context-Aware Reminders
              </h4>
              <p className="text-sm text-muted-foreground">
                Smart reminders based on your activity patterns and optimal timing for maximum effectiveness.
              </p>
            </div>
            <div className="p-4 bg-card/50 rounded-lg border border-border/50">
              <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <Target className="w-4 h-4 text-green-500" />
                Goal Progress
              </h4>
              <p className="text-sm text-muted-foreground">
                Stay motivated with progress updates and suggestions to keep you on track.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}


