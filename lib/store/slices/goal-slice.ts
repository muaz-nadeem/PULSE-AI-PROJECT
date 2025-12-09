"use client"

/**
 * Goal Store Slice
 * 
 * Standalone Zustand store for goal and milestone management.
 */

import { create } from "zustand"
import { goalService } from "@/lib/services"
import {
    calculateGoalProgress,
    addMilestoneToGoal,
    toggleMilestoneCompletion
} from "@/lib/domain"
import type { Goal, Milestone } from "@/lib/domain"

export interface GoalSlice {
    goals: Goal[]
    addGoal: (goal: Omit<Goal, "id" | "createdAt" | "progress" | "status">) => Promise<void>
    deleteGoal: (id: string) => Promise<void>
    updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>
    addMilestone: (goalId: string, milestone: Omit<Milestone, "id" | "order">) => void
    updateMilestone: (goalId: string, milestoneId: string, updates: Partial<Milestone>) => void
    deleteMilestone: (goalId: string, milestoneId: string) => void
    toggleMilestone: (goalId: string, milestoneId: string) => void
    getGoalProgress: (goalId: string) => number
    setGoals: (goals: Goal[]) => void
    loadGoals: () => Promise<void>
}

export const useGoalStore = create<GoalSlice>((set, get) => ({
    goals: [],

    addGoal: async (goal) => {
        try {
            const result = await goalService.create({
                title: goal.title,
                description: goal.description,
                category: goal.category,
                targetDate: goal.targetDate,
                color: goal.color,
                milestones: goal.milestones,
            })
            if (result.error) throw new Error(result.error)
            if (result.data) {
                set((state) => ({
                    goals: [...state.goals, result.data!],
                }))
                return
            }
        } catch (error) {
            console.error("Failed to create goal:", error)
        }
        // Fallback: optimistic update
        set((state) => {
            const newGoal: Goal = {
                ...goal,
                id: Math.random().toString(36).substring(7),
                createdAt: new Date(),
                progress: 0,
                status: "active",
                milestones: goal.milestones || [],
            }
            return {
                goals: [...state.goals, newGoal],
            }
        })
    },

    deleteGoal: async (id) => {
        try {
            await goalService.delete(id)
        } catch (error) {
            console.error("Failed to delete goal:", error)
        }
        set((state) => ({
            goals: state.goals.filter((g) => g.id !== id),
        }))
    },

    updateGoal: async (id, updates) => {
        try {
            const result = await goalService.update(id, updates)
            if (result.error) throw new Error(result.error)
            if (result.data) {
                set((state) => ({
                    goals: state.goals.map((g) => (g.id === id ? result.data! : g)),
                }))
                return
            }
        } catch (error) {
            console.error("Failed to update goal:", error)
        }
        // Fallback: use domain logic for local state update
        set((state) => {
            const goal = state.goals.find((g) => g.id === id)
            if (!goal) return state

            let updatedGoal = { ...goal, ...updates }

            if (updates.milestones !== undefined) {
                const progress = calculateGoalProgress(updates.milestones)
                updatedGoal = {
                    ...updatedGoal,
                    progress,
                    status: progress === 100 && goal.status === "active" ? "completed" : updatedGoal.status,
                }
            }

            return {
                goals: state.goals.map((g) => (g.id === id ? updatedGoal : g)),
            }
        })
    },

    addMilestone: (goalId, milestone) =>
        set((state) => {
            const goal = state.goals.find((g) => g.id === goalId)
            if (!goal) return state

            const result = addMilestoneToGoal(goal.milestones, milestone)

            return {
                goals: state.goals.map((g) =>
                    g.id === goalId
                        ? {
                            ...g,
                            milestones: result.milestones,
                            progress: result.progress,
                            status: result.progress === 100 && g.status === "active" ? "completed" : g.status,
                        }
                        : g
                ),
            }
        }),

    updateMilestone: (goalId, milestoneId, updates) =>
        set((state) => {
            const goal = state.goals.find((g) => g.id === goalId)
            if (!goal) return state

            const updatedMilestones = goal.milestones.map((m) =>
                m.id === milestoneId ? { ...m, ...updates } : m
            )
            const progress = calculateGoalProgress(updatedMilestones)

            return {
                goals: state.goals.map((g) =>
                    g.id === goalId
                        ? {
                            ...g,
                            milestones: updatedMilestones,
                            progress,
                            status: progress === 100 && g.status === "active" ? "completed" : g.status,
                        }
                        : g
                ),
            }
        }),

    deleteMilestone: (goalId, milestoneId) =>
        set((state) => {
            const goal = state.goals.find((g) => g.id === goalId)
            if (!goal) return state

            const updatedMilestones = goal.milestones.filter((m) => m.id !== milestoneId)
            const progress = calculateGoalProgress(updatedMilestones)

            return {
                goals: state.goals.map((g) =>
                    g.id === goalId
                        ? { ...g, milestones: updatedMilestones, progress }
                        : g
                ),
            }
        }),

    toggleMilestone: (goalId, milestoneId) =>
        set((state) => {
            const goal = state.goals.find((g) => g.id === goalId)
            if (!goal) return state

            const result = toggleMilestoneCompletion(goal.milestones, milestoneId)
            if (!result) return state

            return {
                goals: state.goals.map((g) =>
                    g.id === goalId
                        ? {
                            ...g,
                            milestones: result.milestones,
                            progress: result.progress,
                            status: result.progress === 100 && g.status === "active" ? "completed" : g.status,
                        }
                        : g
                ),
            }
        }),

    getGoalProgress: (goalId) => {
        const state = get()
        const goal = state.goals.find((g) => g.id === goalId)
        return goal?.progress || 0
    },

    setGoals: (goals) => set({ goals }),

    loadGoals: async () => {
        try {
            const result = await goalService.getAll()
            if (result.data) {
                set({ goals: result.data })
            }
        } catch (error) {
            console.error("Failed to load goals:", error)
        }
    },
}))
