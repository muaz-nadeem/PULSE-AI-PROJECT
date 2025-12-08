"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Zap, BarChart3, Settings, MessageSquare, CheckSquare, Heart, LogOut, Menu, X, Shield, Target, Flag, AlertTriangle, Trophy, Calendar, Music, FileText, Users, Bell, Mic } from "lucide-react"

interface NavigationProps {
  isMobileOpen?: boolean
  onMobileClose?: () => void
}

export default function Navigation({ isMobileOpen = false, onMobileClose }: NavigationProps) {
  const { currentPage, setCurrentPage, logout, setMobileMenuOpen } = useStore()

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "tasks", label: "Task Manager", icon: CheckSquare },
    { id: "habits", label: "Habit Tracker", icon: Target },
    { id: "goals", label: "Goals & Milestones", icon: Flag },
    { id: "mood", label: "Mood Check-in", icon: Heart },
    { id: "planner", label: "Day Planner", icon: Zap },
    { id: "timeblocks", label: "Time Blocks", icon: Calendar },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "distractions", label: "Distraction Log", icon: AlertTriangle },
    { id: "challenges", label: "Challenges", icon: Trophy },
    { id: "sounds", label: "Focus Sounds", icon: Music },
    { id: "reports", label: "Reports", icon: FileText },
    { id: "team", label: "Team", icon: Users },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "voice", label: "Voice Commands", icon: Mic },
    { id: "coach", label: "AI Coach", icon: MessageSquare },
    { id: "blocking", label: "Blocking Settings", icon: Shield },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => {
            onMobileClose?.()
            setMobileMenuOpen(false)
          }}
        />
      )}

      {/* Navigation Sidebar */}
      <nav
        className={`
          fixed lg:sticky top-0 left-0 h-screen w-64 bg-card border-r border-border p-6 flex flex-col gap-6 overflow-y-auto z-50
          transform transition-transform duration-300 ease-in-out
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Mobile Close Button */}
        <div className="flex items-center justify-between mb-2 lg:mb-0">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Pulse</h1>
              <p className="text-xs text-muted-foreground">Productivity Coach</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              onMobileClose?.()
              setMobileMenuOpen(false)
            }}
            className="lg:hidden"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

      <div className="flex-1">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Menu</p>
        <div className="space-y-2">
          {navItems.map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              onClick={() => {
                setCurrentPage(id)
                onMobileClose?.()
                setMobileMenuOpen(false)
              }}
              variant={currentPage === id ? "default" : "ghost"}
              className={`w-full justify-start gap-3 ${
                currentPage === id 
                  ? "bg-primary text-white hover:bg-primary/90" 
                  : "text-foreground hover:bg-primary/10 hover:text-primary"
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Button>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-border space-y-4">
        <Button
          onClick={() => {
            logout()
            onMobileClose?.()
            setMobileMenuOpen(false)
          }}
          variant="ghost"
          className="w-full justify-start gap-3 text-red-500 hover:bg-red-500/10"
        >
          <LogOut className="w-5 h-5" />
          Log Out
        </Button>
        <p className="text-xs text-muted-foreground text-center">Pulse v1.0</p>
      </div>
    </nav>
    </>
  )
}
