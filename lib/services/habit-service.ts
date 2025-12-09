/**
 * Habit Service
 * 
 * Handles habit-related operations with Supabase.
 */

import { supabase } from "../supabase/client"
import type { Habit } from "../domain"
import { toggleHabitCompletionForDate } from "../domain"
import type {
  IHabitService,
  CreateHabitInput,
  UpdateHabitInput,
  ServiceResult,
} from "./types"

/**
 * Maps database row to domain Habit type
 */
function mapToHabit(row: any): Habit {
  const completedDates = Array.isArray(row.completed_dates) ? row.completed_dates : []
  
  return {
    id: row.id,
    name: row.name,
    description: row.description || undefined,
    frequency: row.frequency,
    color: row.color,
    completedDates,
    currentStreak: row.current_streak || 0,
    longestStreak: row.longest_streak || 0,
    createdAt: new Date(row.created_at),
  }
}

/**
 * Creates a standardized error result
 */
function errorResult<T>(message: string): ServiceResult<T> {
  return { data: null, error: message }
}

/**
 * Creates a standardized success result
 */
function successResult<T>(data: T): ServiceResult<T> {
  return { data, error: null }
}

/**
 * Gets the current authenticated user ID
 */
async function getCurrentUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id || null
}

export const habitService: IHabitService = {
  async getAll(): Promise<ServiceResult<Habit[]>> {
    try {
      const userId = await getCurrentUserId()
      if (!userId) {
        return errorResult("Not authenticated")
      }

      const { data, error } = await supabase
        .from("habits")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) {
        return errorResult(error.message)
      }

      return successResult((data || []).map(mapToHabit))
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : "Failed to fetch habits")
    }
  },

  async getById(id: string): Promise<ServiceResult<Habit>> {
    try {
      const userId = await getCurrentUserId()
      if (!userId) {
        return errorResult("Not authenticated")
      }

      const { data, error } = await supabase
        .from("habits")
        .select("*")
        .eq("id", id)
        .eq("user_id", userId)
        .single()

      if (error) {
        return errorResult(error.message)
      }

      return successResult(mapToHabit(data))
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : "Failed to fetch habit")
    }
  },

  async create(input: CreateHabitInput): Promise<ServiceResult<Habit>> {
    try {
      const userId = await getCurrentUserId()
      if (!userId) {
        return errorResult("Not authenticated")
      }

      const { data, error } = await supabase
        .from("habits")
        .insert({
          user_id: userId,
          name: input.name,
          description: input.description || null,
          frequency: input.frequency,
          color: input.color,
          completed_dates: [],
          current_streak: 0,
          longest_streak: 0,
        })
        .select()
        .single()

      if (error) {
        return errorResult(error.message)
      }

      return successResult(mapToHabit(data))
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : "Failed to create habit")
    }
  },

  async update(id: string, input: UpdateHabitInput): Promise<ServiceResult<Habit>> {
    try {
      const userId = await getCurrentUserId()
      if (!userId) {
        return errorResult("Not authenticated")
      }

      const updates: Record<string, unknown> = {}
      if (input.name !== undefined) updates.name = input.name
      if (input.description !== undefined) updates.description = input.description
      if (input.frequency !== undefined) updates.frequency = input.frequency
      if (input.color !== undefined) updates.color = input.color
      if (input.completedDates !== undefined) updates.completed_dates = input.completedDates
      if (input.currentStreak !== undefined) updates.current_streak = input.currentStreak
      if (input.longestStreak !== undefined) updates.longest_streak = input.longestStreak

      const { data, error } = await supabase
        .from("habits")
        .update(updates)
        .eq("id", id)
        .eq("user_id", userId)
        .select()
        .single()

      if (error) {
        return errorResult(error.message)
      }

      return successResult(mapToHabit(data))
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : "Failed to update habit")
    }
  },

  async delete(id: string): Promise<ServiceResult<void>> {
    try {
      const userId = await getCurrentUserId()
      if (!userId) {
        return errorResult("Not authenticated")
      }

      const { error } = await supabase
        .from("habits")
        .delete()
        .eq("id", id)
        .eq("user_id", userId)

      if (error) {
        return errorResult(error.message)
      }

      return successResult(undefined)
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : "Failed to delete habit")
    }
  },

  async toggleCompletion(id: string, date: string): Promise<ServiceResult<Habit>> {
    try {
      const userId = await getCurrentUserId()
      if (!userId) {
        return errorResult("Not authenticated")
      }

      // Fetch current habit
      const { data: currentHabit, error: fetchError } = await supabase
        .from("habits")
        .select("*")
        .eq("id", id)
        .eq("user_id", userId)
        .single()

      if (fetchError) {
        return errorResult(fetchError.message)
      }

      const habit = mapToHabit(currentHabit)

      // Use domain function to toggle completion (returns updated dates and streaks)
      const result = toggleHabitCompletionForDate(habit.completedDates, date)

      // Update in database
      const { data, error } = await supabase
        .from("habits")
        .update({
          completed_dates: result.completedDates,
          current_streak: result.currentStreak,
          longest_streak: Math.max(result.longestStreak, habit.longestStreak),
        })
        .eq("id", id)
        .eq("user_id", userId)
        .select()
        .single()

      if (error) {
        return errorResult(error.message)
      }

      return successResult(mapToHabit(data))
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : "Failed to toggle habit")
    }
  },
}

