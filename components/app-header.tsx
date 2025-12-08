"use client"

import { Button } from "@/components/ui/button"
import { Menu, Settings, Bell } from "lucide-react"
import { useStore } from "@/lib/store"

export default function AppHeader() {
  const { setMobileMenuOpen, setCurrentPage } = useStore()
  
  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">P</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Pulse</h1>
            <p className="text-xs text-muted-foreground">AI Productivity Coach</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-foreground hover:bg-secondary">
            <Bell className="w-5 h-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-foreground hover:bg-secondary"
            onClick={() => setCurrentPage("settings")}
          >
            <Settings className="w-5 h-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-foreground hover:bg-secondary lg:hidden"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}


