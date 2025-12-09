"use client"

/**
 * useAIPlan Hook
 * 
 * React hook for managing AI-generated daily plans.
 * Provides loading states, error handling, and actions for plan management.
 */

import { useState, useEffect, useCallback } from "react"
import { aiPlanService } from "@/lib/services/ai-service"
import type { AIPlan, ScheduleItem } from "@/lib/ai/types"

export interface UseAIPlanOptions {
  /** Auto-fetch plan on mount */
  autoFetch?: boolean
  /** Date to fetch plan for (YYYY-MM-DD format) */
  date?: string
}

export interface UseAIPlanReturn {
  /** Current plan data */
  plan: AIPlan | null
  /** Loading state */
  isLoading: boolean
  /** Error message if any */
  error: string | null
  /** Fetch plan for a specific date */
  fetchPlan: (date: string) => Promise<void>
  /** Accept the current plan */
  acceptPlan: () => Promise<void>
  /** Reject the current plan */
  rejectPlan: () => Promise<void>
  /** Update the plan schedule */
  updateSchedule: (schedule: ScheduleItem[]) => Promise<void>
  /** Log task completion within the plan */
  logTaskCompletion: (taskId: string) => Promise<void>
  /** Refresh the current plan */
  refresh: () => Promise<void>
}

/**
 * Hook for managing AI daily plans
 */
export function useAIPlan(options: UseAIPlanOptions = {}): UseAIPlanReturn {
  const { autoFetch = true, date: initialDate } = options

  const [plan, setPlan] = useState<AIPlan | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentDate, setCurrentDate] = useState(
    initialDate || new Date().toISOString().split("T")[0]
  )

  const fetchPlan = useCallback(async (date: string) => {
    setIsLoading(true)
    setError(null)
    setCurrentDate(date)

    const result = await aiPlanService.getDailyPlan(date)

    if (result.error) {
      setError(result.error)
      setPlan(null)
    } else {
      setPlan(result.data)
    }

    setIsLoading(false)
  }, [])

  const acceptPlan = useCallback(async () => {
    if (!plan?.id) {
      setError("No plan to accept")
      return
    }

    setIsLoading(true)
    const result = await aiPlanService.acceptPlan(plan.id)

    if (result.error) {
      setError(result.error)
    } else {
      setPlan((prev) =>
        prev ? { ...prev, status: "accepted", accepted_at: new Date().toISOString() } : null
      )
    }

    setIsLoading(false)
  }, [plan?.id])

  const rejectPlan = useCallback(async () => {
    if (!plan?.id) {
      setError("No plan to reject")
      return
    }

    setIsLoading(true)
    const result = await aiPlanService.rejectPlan(plan.id)

    if (result.error) {
      setError(result.error)
    } else {
      setPlan((prev) =>
        prev ? { ...prev, status: "rejected", rejected_at: new Date().toISOString() } : null
      )
    }

    setIsLoading(false)
  }, [plan?.id])

  const updateSchedule = useCallback(
    async (schedule: ScheduleItem[]) => {
      if (!plan?.id) {
        setError("No plan to update")
        return
      }

      setIsLoading(true)
      const result = await aiPlanService.updatePlanSchedule(plan.id, schedule)

      if (result.error) {
        setError(result.error)
      } else if (result.data) {
        setPlan(result.data)
      }

      setIsLoading(false)
    },
    [plan?.id]
  )

  const logTaskCompletion = useCallback(
    async (taskId: string) => {
      if (!plan?.id) return

      const result = await aiPlanService.logTaskCompletion(plan.id, taskId)

      if (result.error) {
        console.error("Failed to log task completion:", result.error)
      }
    },
    [plan?.id]
  )

  const refresh = useCallback(async () => {
    await fetchPlan(currentDate)
  }, [fetchPlan, currentDate])

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchPlan(currentDate)
    }
  }, [autoFetch, currentDate, fetchPlan])

  return {
    plan,
    isLoading,
    error,
    fetchPlan,
    acceptPlan,
    rejectPlan,
    updateSchedule,
    logTaskCompletion,
    refresh,
  }
}

