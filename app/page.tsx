"use client"

import { useState, useEffect } from "react"
import { useStore } from "@/lib/store"
import { syncStoreWithAPI } from "@/lib/store-sync"
import { authAPI, usersAPI } from "@/lib/api"
import { supabase } from "@/lib/supabase/client"
import AuthWelcome from "@/components/auth-welcome"
import OnboardingFlow from "@/components/onboarding-flow"
import Dashboard from "@/components/dashboard"
import { DayPlanner } from "@/src/features/scheduler"
import AnalyticsDashboard from "@/components/analytics-dashboard"
import SettingsPage from "@/components/settings-page"
import { CoachPanel } from "@/src/features/scheduler"
import Navigation from "@/components/navigation"
import TaskManager from "@/components/task-manager"
import MoodTracker from "@/components/mood-tracker"
import AppHeader from "@/components/app-header"
import BlockingSettings from "@/components/blocking-settings"

import Goals from "@/components/goals"
import DistractionLog from "@/components/distraction-log"


import FocusSounds from "@/components/focus-sounds"
import Reports from "@/components/reports"

import SmartNotifications from "@/components/smart-notifications"
import VoiceCommands from "@/components/voice-commands"
import EnergyTracker from "@/components/energy-tracker"

import TaskDecomposer from "@/components/task-decomposer"

export default function Home() {
  // ALL HOOKS MUST BE CALLED AT THE TOP - BEFORE ANY CONDITIONAL RETURNS
  const { auth, setAuth, currentPage, isMobileMenuOpen, setMobileMenuOpen } = useStore()
  const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null) // null = loading, false = not onboarded, true = onboarded
  const [isCheckingAuth, setIsCheckingAuth] = useState(true) // Track if we're still checking auth
  const [hasSetInitialPage, setHasSetInitialPage] = useState(false) // Track if we've set initial page

  // Check if user is authenticated on mount
  useEffect(() => {
    let isMounted = true

    const checkAuth = async () => {
      setIsCheckingAuth(true)

      try {
        // Check Supabase session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError || !session) {
          // No session - show login
          if (isMounted) {
            setAuth(false, "")
            setIsOnboarded(false)
            setIsCheckingAuth(false)
          }
          return
        }

        // We have a session - get user info
        try {
          const user = await usersAPI.getCurrentUser() as { email: string; name: string; onboarding_completed: boolean }
          if (isMounted) {
            if (user && user.email) {
              setAuth(true, user.email)
              // Set onboarding status - existing users should have this as true
              const onboardingStatus = user.onboarding_completed === true
              setIsOnboarded(onboardingStatus)
              setIsCheckingAuth(false)
              // Sync data from API (don't wait for it)
              syncStoreWithAPI().catch((syncError) => {
                console.error("Failed to sync store:", syncError)
              })
            } else {
              // User data not found
              setIsOnboarded(false)
              setIsCheckingAuth(false)
            }
          }
        } catch (error) {
          console.error("Failed to get user info:", error)
          if (isMounted) {
            setIsOnboarded(false)
            setIsCheckingAuth(false)
          }
        }
      } catch (error) {
        console.error("Auth check error:", error)
        if (isMounted) {
          // Not authenticated - show login
          setAuth(false, "")
          setIsOnboarded(false)
          setIsCheckingAuth(false)
        }
      }
    }

    checkAuth()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return

      if (event === 'SIGNED_OUT' || !session) {
        setAuth(false, "")
        setIsOnboarded(false)
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        checkAuth()
      }
    })

    // Cleanup function
    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [setAuth]) // Run only on mount

  // Set initial page to dashboard only once when user first becomes authenticated and onboarded
  useEffect(() => {
    if (auth.isAuthenticated && isOnboarded && !isCheckingAuth && !hasSetInitialPage) {
      const { setCurrentPage, currentPage: storeCurrentPage } = useStore.getState()
      // Only set to dashboard if currentPage is not already set to a valid page
      // This ensures we don't override user navigation
      if (!storeCurrentPage || storeCurrentPage === "dashboard") {
        setCurrentPage("dashboard")
      }
      setHasSetInitialPage(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.isAuthenticated, isOnboarded, isCheckingAuth]) // Only depend on auth state, not currentPage

  // NOW WE CAN DO CONDITIONAL RENDERING AFTER ALL HOOKS
  if (!auth.isAuthenticated) {
    return <AuthWelcome />
  }

  // Show loading state while checking auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isOnboarded) {
    return (
      <OnboardingFlow
        onComplete={async () => {
          try {
            // Wait a bit to ensure session is ready
            await new Promise(resolve => setTimeout(resolve, 300))
            await usersAPI.updateCurrentUser({ onboarding_completed: true })
            setIsOnboarded(true)
            // Ensure we're on dashboard after onboarding
            const { setCurrentPage } = useStore.getState()
            setCurrentPage("dashboard")
          } catch (error) {
            console.error("Failed to update onboarding status:", error)
            // Still proceed even if API call fails - user can complete onboarding later
            setIsOnboarded(true)
            const { setCurrentPage } = useStore.getState()
            setCurrentPage("dashboard")
          }
        }}
      />
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Navigation
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      <main className="flex-1 overflow-auto lg:ml-0 flex flex-col">
        <AppHeader />
        <div className="flex-1 overflow-auto">
          {currentPage === "dashboard" && <Dashboard />}
          {currentPage === "tasks" && <TaskManager />}

          {currentPage === "goals" && <Goals />}
          {currentPage === "mood" && <MoodTracker />}
          {currentPage === "planner" && <DayPlanner />}

          {currentPage === "analytics" && <AnalyticsDashboard />}
          {currentPage === "distractions" && <DistractionLog />}

          {currentPage === "sounds" && <FocusSounds />}
          {currentPage === "reports" && <Reports />}

          {currentPage === "notifications" && <SmartNotifications />}
          {currentPage === "voice" && <VoiceCommands />}
          {currentPage === "blocking" && <BlockingSettings />}
          {currentPage === "settings" && <SettingsPage />}
          {currentPage === "coach" && <CoachPanel />}
          {currentPage === "energy" && <EnergyTracker />}

          {currentPage === "decomposer" && <TaskDecomposer />}
        </div>
      </main>
    </div>
  )
}
