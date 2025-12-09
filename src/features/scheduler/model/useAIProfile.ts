"use client"

/**
 * useAIProfile Hook
 * 
 * React hook for managing the user's AI profile (personalization data).
 * Provides loading states and update functionality.
 */

import { useState, useEffect, useCallback } from "react"
import { aiProfileService } from "@/lib/services/ai-service"
import { getDefaultProfile } from "@/lib/ai/types"
import type { UserAIProfile } from "@/lib/ai/types"

export interface UseAIProfileOptions {
  /** Auto-fetch profile on mount */
  autoFetch?: boolean
}

export interface UseAIProfileReturn {
  /** User's AI profile */
  profile: UserAIProfile | null
  /** Loading state */
  isLoading: boolean
  /** Error message if any */
  error: string | null
  /** Update profile settings */
  updateProfile: (updates: Partial<UserAIProfile>) => Promise<void>
  /** Refresh profile from server */
  refresh: () => Promise<void>
  /** Get optimal focus duration (with fallback) */
  optimalFocusDuration: number
  /** Get preferred work hours */
  workHours: { start: number; end: number }
  /** Get most productive hours */
  productiveHours: number[]
}

/**
 * Hook for managing AI profile
 */
export function useAIProfile(options: UseAIProfileOptions = {}): UseAIProfileReturn {
  const { autoFetch = true } = options

  const [profile, setProfile] = useState<UserAIProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    const result = await aiProfileService.getProfile()

    if (result.error) {
      setError(result.error)
    } else {
      setProfile(result.data)
    }

    setIsLoading(false)
  }, [])

  const updateProfile = useCallback(async (updates: Partial<UserAIProfile>) => {
    setIsLoading(true)
    setError(null)

    const result = await aiProfileService.updateProfile(updates)

    if (result.error) {
      setError(result.error)
    } else if (result.data) {
      setProfile(result.data)
    }

    setIsLoading(false)
  }, [])

  // Computed values with fallbacks
  const defaults = getDefaultProfile()

  const optimalFocusDuration = profile?.optimal_focus_duration ?? defaults.optimal_focus_duration

  const workHours = {
    start: profile?.preferred_work_start_hour ?? defaults.preferred_work_start_hour,
    end: profile?.preferred_work_end_hour ?? defaults.preferred_work_end_hour,
  }

  const productiveHours = profile?.most_productive_hours ?? defaults.most_productive_hours

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchProfile()
    }
  }, [autoFetch, fetchProfile])

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    refresh: fetchProfile,
    optimalFocusDuration,
    workHours,
    productiveHours,
  }
}

