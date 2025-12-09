/**
 * Focus Service
 * 
 * Handles focus sessions and distractions with Supabase.
 */

import { supabase } from "../supabase/client"
import type { FocusSession, Distraction } from "../domain"
import type {
  IFocusService,
  CreateFocusSessionInput,
  CreateDistractionInput,
  ServiceResult,
} from "./types"

/**
 * Maps database row to domain FocusSession type
 */
function mapToFocusSession(row: any): FocusSession {
  return {
    id: row.id,
    duration: row.duration,
    completed: row.completed,
    date: new Date(row.created_at),
  }
}

/**
 * Maps database row to domain Distraction type
 */
function mapToDistraction(row: any): Distraction {
  return {
    id: row.id,
    type: row.type,
    source: row.source,
    date: new Date(row.created_at),
    duration: row.duration,
    notes: row.notes || undefined,
    focusSessionId: row.focus_session_id || undefined,
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

export const focusService: IFocusService = {
  async getAllSessions(): Promise<ServiceResult<FocusSession[]>> {
    try {
      const userId = await getCurrentUserId()
      if (!userId) {
        return errorResult("Not authenticated")
      }

      const { data, error } = await supabase
        .from("focus_sessions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) {
        return errorResult(error.message)
      }

      return successResult((data || []).map(mapToFocusSession))
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : "Failed to fetch sessions")
    }
  },

  async createSession(input: CreateFocusSessionInput): Promise<ServiceResult<FocusSession>> {
    try {
      const userId = await getCurrentUserId()
      if (!userId) {
        return errorResult("Not authenticated")
      }

      const { data, error } = await supabase
        .from("focus_sessions")
        .insert({
          user_id: userId,
          duration: input.duration,
          completed: input.completed,
          task_id: input.taskId || null,
        })
        .select()
        .single()

      if (error) {
        return errorResult(error.message)
      }

      return successResult(mapToFocusSession(data))
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : "Failed to create session")
    }
  },

  async getDistractions(): Promise<ServiceResult<Distraction[]>> {
    try {
      const userId = await getCurrentUserId()
      if (!userId) {
        return errorResult("Not authenticated")
      }

      const { data, error } = await supabase
        .from("distractions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) {
        return errorResult(error.message)
      }

      return successResult((data || []).map(mapToDistraction))
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : "Failed to fetch distractions")
    }
  },

  async logDistraction(input: CreateDistractionInput): Promise<ServiceResult<Distraction>> {
    try {
      const userId = await getCurrentUserId()
      if (!userId) {
        return errorResult("Not authenticated")
      }

      const { data, error } = await supabase
        .from("distractions")
        .insert({
          user_id: userId,
          type: input.type,
          source: input.source,
          duration: input.duration,
          notes: input.notes || null,
          focus_session_id: input.focusSessionId || null,
        })
        .select()
        .single()

      if (error) {
        return errorResult(error.message)
      }

      return successResult(mapToDistraction(data))
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : "Failed to log distraction")
    }
  },
}

