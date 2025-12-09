"use client"

/**
 * useGoals Hook
 * 
 * Abstracts goal-related store access for components.
 */

import { useStore } from "../store"
import type { Goal, Milestone } from "../domain"

export interface UseGoalsReturn {
    goals: Goal[]
    addGoal: (goal: Omit<Goal, "id" | "createdAt" | "progress" | "status">) => void
    deleteGoal: (id: string) => void
    updateGoal: (id: string, updates: Partial<Goal>) => void
    addMilestone: (goalId: string, milestone: Omit<Milestone, "id" | "order">) => void
    updateMilestone: (goalId: string, milestoneId: string, updates: Partial<Milestone>) => void
    deleteMilestone: (goalId: string, milestoneId: string) => void
    toggleMilestone: (goalId: string, milestoneId: string) => void
    getGoalProgress: (goalId: string) => number
    getAISuggestions: (goalId: string) => string[]
}

/**
 * Hook for accessing and managing goals
 */
export function useGoals(): UseGoalsReturn {
    const goals = useStore((state) => state.goals)
    const addGoal = useStore((state) => state.addGoal)
    const deleteGoal = useStore((state) => state.deleteGoal)
    const updateGoal = useStore((state) => state.updateGoal)
    const addMilestone = useStore((state) => state.addMilestone)
    const updateMilestone = useStore((state) => state.updateMilestone)
    const deleteMilestone = useStore((state) => state.deleteMilestone)
    const toggleMilestone = useStore((state) => state.toggleMilestone)
    const getGoalProgress = useStore((state) => state.getGoalProgress)
    const getAISuggestions = useStore((state) => state.getAISuggestions)

    return {
        goals,
        addGoal,
        deleteGoal,
        updateGoal,
        addMilestone,
        updateMilestone,
        deleteMilestone,
        toggleMilestone,
        getGoalProgress,
        getAISuggestions,
    }
}
