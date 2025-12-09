"use client"

/**
 * useDailyAggregates Hook
 * 
 * React hook for accessing daily productivity aggregates.
 * Useful for analytics and AI context.
 */

import { useState, useEffect, useCallback, useMemo } from "react"
import { aiAggregatesService } from "../services/ai-service"
import type { DailyAggregate } from "../ai/types"

export interface UseDailyAggregatesOptions {
  /** Number of days to fetch */
  days?: number
  /** Auto-fetch on mount */
  autoFetch?: boolean
}

export interface DailyStats {
  totalFocusMinutes: number
  avgFocusMinutes: number
  totalTasksCompleted: number
  avgTasksCompleted: number
  avgCompletionRate: number
  bestDay: DailyAggregate | null
  worstDay: DailyAggregate | null
}

export interface UseDailyAggregatesReturn {
  /** Daily aggregates data */
  aggregates: DailyAggregate[]
  /** Loading state */
  isLoading: boolean
  /** Error message if any */
  error: string | null
  /** Computed statistics */
  stats: DailyStats
  /** Update daily rating for a date */
  updateRating: (date: string, rating: number) => Promise<void>
  /** Refresh aggregates from server */
  refresh: () => Promise<void>
  /** Get aggregate for a specific date */
  getByDate: (date: string) => DailyAggregate | undefined
}

/**
 * Hook for daily productivity aggregates
 */
export function useDailyAggregates(
  options: UseDailyAggregatesOptions = {}
): UseDailyAggregatesReturn {
  const { days = 14, autoFetch = true } = options

  const [aggregates, setAggregates] = useState<DailyAggregate[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAggregates = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    const result = await aiAggregatesService.getRecentAggregates(days)

    if (result.error) {
      setError(result.error)
    } else {
      setAggregates(result.data || [])
    }

    setIsLoading(false)
  }, [days])

  const updateRating = useCallback(async (date: string, rating: number) => {
    const result = await aiAggregatesService.updateDailyRating(date, rating)

    if (result.error) {
      setError(result.error)
      return
    }

    // Update local state
    setAggregates((prev) =>
      prev.map((agg) => (agg.date === date ? { ...agg, daily_rating: rating } : agg))
    )
  }, [])

  const getByDate = useCallback(
    (date: string) => {
      return aggregates.find((agg) => agg.date === date)
    },
    [aggregates]
  )

  // Compute statistics
  const stats = useMemo<DailyStats>(() => {
    if (aggregates.length === 0) {
      return {
        totalFocusMinutes: 0,
        avgFocusMinutes: 0,
        totalTasksCompleted: 0,
        avgTasksCompleted: 0,
        avgCompletionRate: 0,
        bestDay: null,
        worstDay: null,
      }
    }

    const totalFocusMinutes = aggregates.reduce(
      (sum, agg) => sum + agg.total_focus_minutes,
      0
    )
    const totalTasksCompleted = aggregates.reduce(
      (sum, agg) => sum + agg.tasks_completed,
      0
    )
    const totalCompletionRate = aggregates.reduce(
      (sum, agg) => sum + (agg.completion_rate || 0),
      0
    )

    // Find best and worst days by focus minutes
    const sortedByFocus = [...aggregates].sort(
      (a, b) => b.total_focus_minutes - a.total_focus_minutes
    )

    return {
      totalFocusMinutes,
      avgFocusMinutes: Math.round(totalFocusMinutes / aggregates.length),
      totalTasksCompleted,
      avgTasksCompleted: Math.round(totalTasksCompleted / aggregates.length),
      avgCompletionRate: Math.round((totalCompletionRate / aggregates.length) * 100) / 100,
      bestDay: sortedByFocus[0] || null,
      worstDay: sortedByFocus[sortedByFocus.length - 1] || null,
    }
  }, [aggregates])

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchAggregates()
    }
  }, [autoFetch, fetchAggregates])

  return {
    aggregates,
    isLoading,
    error,
    stats,
    updateRating,
    refresh: fetchAggregates,
    getByDate,
  }
}

