"use client"

/**
 * useHabits Hook
 * 
 * Abstracts habit-related store access for components.
 */

import { useStore } from "../store"
import type { Habit } from "../domain"

export interface UseHabitsReturn {
    habits: Habit[]
    addHabit: (habit: Omit<Habit, "id" | "createdAt" | "completedDates" | "currentStreak" | "longestStreak">) => void
    deleteHabit: (id: string) => void
    toggleHabitCompletion: (habitId: string, date: string) => void
    getHabitStreak: (habitId: string) => number
}

/**
 * Hook for accessing and managing habits
 */
export function useHabits(): UseHabitsReturn {
    const habits = useStore((state) => state.habits)
    const addHabit = useStore((state) => state.addHabit)
    const deleteHabit = useStore((state) => state.deleteHabit)
    const toggleHabitCompletion = useStore((state) => state.toggleHabitCompletion)
    const getHabitStreak = useStore((state) => state.getHabitStreak)

    return {
        habits,
        addHabit,
        deleteHabit,
        toggleHabitCompletion,
        getHabitStreak,
    }
}
