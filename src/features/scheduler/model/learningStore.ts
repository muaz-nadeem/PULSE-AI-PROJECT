/**
 * Learning Store
 * 
 * Zustand store that persists mood-based performance statistics.
 * Used by the scheduler to learn from past performance and adjust load accordingly.
 */

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { MoodType } from "../lib/schedulingMath"

// =============================================================================
// Types
// =============================================================================

export interface MoodStats {
    numDays: number
    totalCompletionRatio: number
    // Derived: averageCompletionRatio = totalCompletionRatio / numDays
}

export interface LearningState {
    moodStats: Record<MoodType, MoodStats>
}

export interface LearningActions {
    /**
     * Updates the mood statistics after a day's work.
     * Uses exponential moving average for smoother learning.
     * 
     * @param mood - The mood during the work session
     * @param planned - Number of tasks/minutes planned
     * @param completed - Number of tasks/minutes actually completed
     */
    updateMoodStats: (mood: MoodType, planned: number, completed: number) => void

    /**
     * Gets a load factor multiplier based on historical mood performance.
     * Returns a value between 0.5 and 1.2:
     * - < 1.0: User tends to overcommit at this mood, reduce load
     * - > 1.0: User tends to complete more than planned, can add more
     * 
     * @param mood - The current mood
     * @returns Load factor multiplier
     */
    getLoadFactor: (mood: MoodType) => number

    /**
     * Gets the average completion ratio for a mood.
     * Returns 1.0 if no data exists.
     */
    getAverageCompletionRatio: (mood: MoodType) => number

    /**
     * Resets all mood statistics.
     */
    resetStats: () => void
}

export type LearningStore = LearningState & LearningActions

// =============================================================================
// Default State
// =============================================================================

const DEFAULT_MOOD_STATS: MoodStats = {
    numDays: 0,
    totalCompletionRatio: 0,
}

const createDefaultMoodStats = (): Record<MoodType, MoodStats> => ({
    Great: { ...DEFAULT_MOOD_STATS },
    Good: { ...DEFAULT_MOOD_STATS },
    Okay: { ...DEFAULT_MOOD_STATS },
    Low: { ...DEFAULT_MOOD_STATS },
    Bad: { ...DEFAULT_MOOD_STATS },
})

// =============================================================================
// Store Implementation
// =============================================================================

/**
 * Learning Store
 * 
 * Persists mood-based performance data to localStorage so the scheduler
 * can learn from past behavior and adjust recommendations accordingly.
 */
export const useLearningStore = create<LearningStore>()(
    persist(
        (set, get) => ({
            // State
            moodStats: createDefaultMoodStats(),

            // Actions
            updateMoodStats: (mood: MoodType, planned: number, completed: number) => {
                if (planned <= 0) return // Avoid division by zero

                const ratio = Math.min(completed / planned, 2) // Cap at 200% to avoid outliers

                set((state) => {
                    const current = state.moodStats[mood]

                    // Use exponential moving average with alpha = 0.3
                    // This gives more weight to recent data while still considering history
                    const alpha = 0.3
                    const prevAvg = current.numDays > 0
                        ? current.totalCompletionRatio / current.numDays
                        : ratio
                    const newAvg = alpha * ratio + (1 - alpha) * prevAvg

                    return {
                        moodStats: {
                            ...state.moodStats,
                            [mood]: {
                                numDays: current.numDays + 1,
                                // Store cumulative so we can recalculate average
                                // But use the EMA approach for the actual average
                                totalCompletionRatio: newAvg * (current.numDays + 1),
                            },
                        },
                    }
                })
            },

            getAverageCompletionRatio: (mood: MoodType): number => {
                const stats = get().moodStats[mood]
                if (stats.numDays === 0) return 1.0
                return stats.totalCompletionRatio / stats.numDays
            },

            getLoadFactor: (mood: MoodType): number => {
                const avgRatio = get().getAverageCompletionRatio(mood)

                // Convert completion ratio to load factor
                // If user completes less than planned, reduce future load
                // If user completes more, allow slightly more
                if (avgRatio < 0.5) {
                    // Very low completion - significantly reduce load
                    return 0.6
                } else if (avgRatio < 0.7) {
                    // Low completion - reduce load
                    return 0.8
                } else if (avgRatio < 0.9) {
                    // Slightly below plan - small reduction
                    return 0.9
                } else if (avgRatio <= 1.1) {
                    // On target - no adjustment
                    return 1.0
                } else if (avgRatio <= 1.3) {
                    // Completing more than planned - slight increase
                    return 1.1
                } else {
                    // Significantly exceeding plan - can add more
                    return 1.2
                }
            },

            resetStats: () => {
                set({ moodStats: createDefaultMoodStats() })
            },
        }),
        {
            name: "pulse-learning-store",
            version: 1,
            // Only persist moodStats
            partialize: (state) => ({ moodStats: state.moodStats }),
        }
    )
)

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Calculates recommended daily load based on mood and learning data.
 * 
 * @param baseDuration - Base amount of work time in minutes
 * @param mood - Current mood
 * @returns Adjusted duration based on historical performance
 */
export function calculateAdjustedLoad(baseDuration: number, mood: MoodType): number {
    const loadFactor = useLearningStore.getState().getLoadFactor(mood)
    return Math.round(baseDuration * loadFactor)
}

/**
 * Records end-of-day stats for learning.
 * Call this when the user completes their day or at day end.
 */
export function recordDayStats(mood: MoodType, plannedMinutes: number, completedMinutes: number): void {
    useLearningStore.getState().updateMoodStats(mood, plannedMinutes, completedMinutes)
}
