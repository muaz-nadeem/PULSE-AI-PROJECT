"use client"

import { useState, useEffect } from "react"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Zap,
  BarChart3,
  Settings,
  MessageSquare,
  CheckSquare,
  Heart,
  LogOut,
  X,
  Shield,

  Flag,
  AlertTriangle,


  Music,
  FileText,

  Bell,
  Mic,
  ChevronLeft,
  ChevronRight,
  Battery,

} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface NavigationProps {
  isMobileOpen?: boolean
  onMobileClose?: () => void
}

interface NavItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  shortcut?: string
  badge?: number
  isNew?: boolean
}

export default function Navigation({ isMobileOpen = false, onMobileClose }: NavigationProps) {
  const { currentPage, setCurrentPage, logout, setMobileMenuOpen, notifications } = useStore()
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Calculate unread notifications count
  const unreadCount = notifications?.filter(n => !n.read).length || 0

  const navItems: NavItem[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, shortcut: "D" },
    { id: "tasks", label: "Task Manager", icon: CheckSquare, shortcut: "T" },

    { id: "goals", label: "Goals & Milestones", icon: Flag, shortcut: "G" },
    { id: "mood", label: "Mood Check-in", icon: Heart },
    { id: "energy", label: "Energy Tracker", icon: Battery, isNew: true },
    { id: "planner", label: "Day Planner", icon: Zap, shortcut: "P" },

    { id: "analytics", label: "Analytics", icon: BarChart3, shortcut: "A" },

    { id: "distractions", label: "Distraction Log", icon: AlertTriangle },

    { id: "sounds", label: "Focus Sounds", icon: Music },
    { id: "reports", label: "Reports", icon: FileText },

    { id: "notifications", label: "Notifications", icon: Bell, badge: unreadCount },
    { id: "voice", label: "Voice Commands", icon: Mic },
    { id: "coach", label: "AI Coach", icon: MessageSquare, shortcut: "C" },
    { id: "blocking", label: "Blocking Settings", icon: Shield },
    { id: "settings", label: "Settings", icon: Settings, shortcut: "S" },
  ]

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger if no input is focused and Ctrl/Cmd is held
      if (
        (e.target as HTMLElement).tagName === "INPUT" ||
        (e.target as HTMLElement).tagName === "TEXTAREA"
      ) {
        return
      }

      if (e.ctrlKey || e.metaKey) {
        const item = navItems.find(
          (item) => item.shortcut?.toLowerCase() === e.key.toLowerCase()
        )
        if (item) {
          e.preventDefault()
          setCurrentPage(item.id)
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [navItems, setCurrentPage])

  const handleNavClick = (id: string) => {
    setCurrentPage(id)
    onMobileClose?.()
    setMobileMenuOpen(false)
  }

  const NavButton = ({ item }: { item: NavItem }) => {
    const Icon = item.icon
    const isActive = currentPage === item.id

    const buttonContent = (
      <Button
        onClick={() => handleNavClick(item.id)}
        variant="ghost"
        className={`
          w-full justify-start gap-3 relative group transition-all duration-200
          ${isCollapsed ? "justify-center px-2" : ""}
          ${isActive
            ? "bg-primary/10 text-primary hover:bg-primary/20 shadow-[0_0_20px_rgba(102,126,234,0.15)]"
            : "text-muted-foreground hover:bg-primary/5 hover:text-foreground"
          }
        `}
      >
        {/* Active indicator glow */}
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full shadow-[0_0_10px_var(--primary)]" />
        )}

        <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-primary" : ""}`} />

        {!isCollapsed && (
          <>
            <span className="flex-1 text-left">{item.label}</span>

            {/* New badge */}
            {item.isNew && (
              <span className="px-1.5 py-0.5 text-[10px] font-medium bg-gradient-to-r from-primary to-accent text-white rounded-full">
                NEW
              </span>
            )}

            {/* Notification badge */}
            {item.badge && item.badge > 0 && (
              <span className="min-w-[20px] h-5 px-1.5 text-xs font-medium bg-error text-error-foreground rounded-full flex items-center justify-center">
                {item.badge > 99 ? "99+" : item.badge}
              </span>
            )}

            {/* Keyboard shortcut hint */}
            {item.shortcut && (
              <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity px-1 py-0.5 bg-muted rounded">
                ⌘{item.shortcut}
              </span>
            )}
          </>
        )}

        {/* Collapsed mode badges */}
        {isCollapsed && (item.badge || item.isNew) && (
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
        )}
      </Button>
    )

    if (isCollapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-2">
            {item.label}
            {item.shortcut && (
              <span className="text-xs text-muted-foreground">⌘{item.shortcut}</span>
            )}
          </TooltipContent>
        </Tooltip>
      )
    }

    return buttonContent
  }

  return (
    <TooltipProvider>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => {
            onMobileClose?.()
            setMobileMenuOpen(false)
          }}
        />
      )}

      {/* Navigation Sidebar */}
      <nav
        className={`
          fixed lg:sticky top-0 left-0 h-screen 
          ${isCollapsed ? "w-20" : "w-72"}
          glass-card rounded-none lg:rounded-r-2xl
          border-r border-[var(--glass-border)]
          p-4 flex flex-col gap-4 overflow-y-auto overflow-x-hidden z-50
          transform transition-all duration-300 ease-out
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          scrollbar-custom
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-3 ${isCollapsed ? "justify-center w-full" : ""}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-[var(--gradient-start)] to-[var(--gradient-end)] rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 flex-shrink-0">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            {!isCollapsed && (
              <div className="fade-slide-in">
                <h1 className="text-xl font-bold gradient-text">Pulse</h1>
                <p className="text-xs text-muted-foreground">AI Productivity</p>
              </div>
            )}
          </div>

          {/* Mobile close button */}
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

        {/* Collapse toggle - desktop only */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex self-end -mr-2 h-7 w-7 rounded-full hover:bg-primary/10"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>

        {/* Navigation items */}
        <div className="flex-1 space-y-1">
          {!isCollapsed && (
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
              Menu
            </p>
          )}

          <div className="space-y-1 stagger-children">
            {navItems.map((item) => (
              <NavButton key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-border/50 space-y-3">
          {isCollapsed ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => {
                    logout()
                    onMobileClose?.()
                    setMobileMenuOpen(false)
                  }}
                  variant="ghost"
                  size="icon"
                  className="w-full text-error hover:bg-error/10"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Log Out</TooltipContent>
            </Tooltip>
          ) : (
            <>
              <Button
                onClick={() => {
                  logout()
                  onMobileClose?.()
                  setMobileMenuOpen(false)
                }}
                variant="ghost"
                className="w-full justify-start gap-3 text-error hover:bg-error/10 hover:text-error"
              >
                <LogOut className="w-5 h-5" />
                Log Out
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Pulse v2.0 <span className="text-primary">• AI Enhanced</span>
              </p>
            </>
          )}
        </div>
      </nav>
    </TooltipProvider>
  )
}
