/**
 * AI Service
 * 
 * Handles AI-related operations including:
 * - Daily plan generation and management
 * - AI coach interactions
 * - User AI profile management
 * - Chat history
 */

import { supabase } from "../supabase/client"
import type { ServiceResult } from "./types"
import type {
  AIPlan,
  UserAIProfile,
  DailyAggregate,
  ChatMessage,
  PlanFeedbackEvent,
  ScheduleItem,
} from "../ai/types"

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

// =============================================================================
// AI Plan Service
// =============================================================================

export interface IAIPlanService {
  getDailyPlan(date: string): Promise<ServiceResult<AIPlan | null>>
  savePlan(plan: Omit<AIPlan, "id" | "created_at" | "updated_at">): Promise<ServiceResult<AIPlan>>
  acceptPlan(planId: string): Promise<ServiceResult<void>>
  rejectPlan(planId: string): Promise<ServiceResult<void>>
  updatePlanSchedule(planId: string, schedule: ScheduleItem[]): Promise<ServiceResult<AIPlan>>
  logTaskCompletion(planId: string, taskId: string): Promise<ServiceResult<void>>
}

export const aiPlanService: IAIPlanService = {
  async getDailyPlan(date: string): Promise<ServiceResult<AIPlan | null>> {
    try {
      const userId = await getCurrentUserId()
      if (!userId) {
        return errorResult("Not authenticated")
      }

      const { data, error } = await supabase
        .from("ai_plans")
        .select("*")
        .eq("user_id", userId)
        .eq("plan_date", date)
        .single()

      // PGRST116 means no rows found - that's okay, return null
      if (error && error.code !== "PGRST116") {
        return errorResult(error.message)
      }

      return successResult(data as AIPlan | null)
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : "Failed to fetch plan")
    }
  },

  async savePlan(plan: Omit<AIPlan, "id" | "created_at" | "updated_at">): Promise<ServiceResult<AIPlan>> {
    try {
      const userId = await getCurrentUserId()
      if (!userId) {
        return errorResult("Not authenticated")
      }

      const { data, error } = await supabase
        .from("ai_plans")
        .upsert({
          user_id: userId,
          plan_date: plan.plan_date,
          schedule: plan.schedule,
          explanation: plan.explanation,
          reasoning: plan.reasoning,
          generated_at: plan.generated_at,
          model_version: plan.model_version,
          status: plan.status,
        }, { onConflict: "user_id,plan_date" })
        .select()
        .single()

      if (error) {
        return errorResult(error.message)
      }

      return successResult(data as AIPlan)
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : "Failed to save plan")
    }
  },

  async acceptPlan(planId: string): Promise<ServiceResult<void>> {
    try {
      const userId = await getCurrentUserId()
      if (!userId) {
        return errorResult("Not authenticated")
      }

      const { error } = await supabase
        .from("ai_plans")
        .update({
          status: "accepted",
          accepted_at: new Date().toISOString(),
        })
        .eq("id", planId)
        .eq("user_id", userId)

      if (error) {
        return errorResult(error.message)
      }

      // Log feedback event
      await supabase.from("plan_feedback_events").insert({
        plan_id: planId,
        user_id: userId,
        event_type: "accepted",
      })

      return successResult(undefined)
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : "Failed to accept plan")
    }
  },

  async rejectPlan(planId: string): Promise<ServiceResult<void>> {
    try {
      const userId = await getCurrentUserId()
      if (!userId) {
        return errorResult("Not authenticated")
      }

      const { error } = await supabase
        .from("ai_plans")
        .update({
          status: "rejected",
          rejected_at: new Date().toISOString(),
        })
        .eq("id", planId)
        .eq("user_id", userId)

      if (error) {
        return errorResult(error.message)
      }

      // Log feedback event
      await supabase.from("plan_feedback_events").insert({
        plan_id: planId,
        user_id: userId,
        event_type: "rejected",
      })

      return successResult(undefined)
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : "Failed to reject plan")
    }
  },

  async updatePlanSchedule(planId: string, schedule: ScheduleItem[]): Promise<ServiceResult<AIPlan>> {
    try {
      const userId = await getCurrentUserId()
      if (!userId) {
        return errorResult("Not authenticated")
      }

      // Get current plan to store original
      const { data: plan } = await supabase
        .from("ai_plans")
        .select("schedule, edit_count")
        .eq("id", planId)
        .eq("user_id", userId)
        .single()

      const { data, error } = await supabase
        .from("ai_plans")
        .update({
          schedule,
          original_schedule: plan?.schedule || null,
          status: "edited",
          edit_count: (plan?.edit_count || 0) + 1,
          last_edited_at: new Date().toISOString(),
        })
        .eq("id", planId)
        .eq("user_id", userId)
        .select()
        .single()

      if (error) {
        return errorResult(error.message)
      }

      // Log feedback event
      await supabase.from("plan_feedback_events").insert({
        plan_id: planId,
        user_id: userId,
        event_type: "edited",
        event_data: { editCount: (plan?.edit_count || 0) + 1 },
      })

      return successResult(data as AIPlan)
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : "Failed to update plan")
    }
  },

  async logTaskCompletion(planId: string, taskId: string): Promise<ServiceResult<void>> {
    try {
      const userId = await getCurrentUserId()
      if (!userId) {
        return errorResult("Not authenticated")
      }

      const { error } = await supabase.from("plan_feedback_events").insert({
        plan_id: planId,
        user_id: userId,
        event_type: "task_completed",
        event_data: { taskId },
      })

      if (error) {
        return errorResult(error.message)
      }

      return successResult(undefined)
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : "Failed to log task completion")
    }
  },
}

// =============================================================================
// AI Profile Service
// =============================================================================

export interface IAIProfileService {
  getProfile(): Promise<ServiceResult<UserAIProfile | null>>
  updateProfile(updates: Partial<UserAIProfile>): Promise<ServiceResult<UserAIProfile>>
}

export const aiProfileService: IAIProfileService = {
  async getProfile(): Promise<ServiceResult<UserAIProfile | null>> {
    try {
      const userId = await getCurrentUserId()
      if (!userId) {
        return errorResult("Not authenticated")
      }

      const { data, error } = await supabase
        .from("user_ai_profiles")
        .select("*")
        .eq("user_id", userId)
        .single()

      if (error && error.code !== "PGRST116") {
        return errorResult(error.message)
      }

      return successResult(data as UserAIProfile | null)
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : "Failed to fetch profile")
    }
  },

  async updateProfile(updates: Partial<UserAIProfile>): Promise<ServiceResult<UserAIProfile>> {
    try {
      const userId = await getCurrentUserId()
      if (!userId) {
        return errorResult("Not authenticated")
      }

      const { data, error } = await supabase
        .from("user_ai_profiles")
        .upsert({
          user_id: userId,
          ...updates,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" })
        .select()
        .single()

      if (error) {
        return errorResult(error.message)
      }

      return successResult(data as UserAIProfile)
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : "Failed to update profile")
    }
  },
}

// =============================================================================
// AI Chat Service
// =============================================================================

export interface IAIChatService {
  getHistory(limit?: number): Promise<ServiceResult<ChatMessage[]>>
  saveMessage(role: "user" | "assistant", message: string, context?: Record<string, unknown>): Promise<ServiceResult<ChatMessage>>
  clearHistory(): Promise<ServiceResult<void>>
}

export const aiChatService: IAIChatService = {
  async getHistory(limit: number = 20): Promise<ServiceResult<ChatMessage[]>> {
    try {
      const userId = await getCurrentUserId()
      if (!userId) {
        return errorResult("Not authenticated")
      }

      const { data, error } = await supabase
        .from("ai_chat_history")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit)

      if (error) {
        return errorResult(error.message)
      }

      return successResult((data || []) as ChatMessage[])
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : "Failed to fetch chat history")
    }
  },

  async saveMessage(
    role: "user" | "assistant",
    message: string,
    context?: Record<string, unknown>
  ): Promise<ServiceResult<ChatMessage>> {
    try {
      const userId = await getCurrentUserId()
      if (!userId) {
        return errorResult("Not authenticated")
      }

      const { data, error } = await supabase
        .from("ai_chat_history")
        .insert({
          user_id: userId,
          role,
          message,
          context_snapshot: context || null,
        })
        .select()
        .single()

      if (error) {
        return errorResult(error.message)
      }

      return successResult(data as ChatMessage)
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : "Failed to save message")
    }
  },

  async clearHistory(): Promise<ServiceResult<void>> {
    try {
      const userId = await getCurrentUserId()
      if (!userId) {
        return errorResult("Not authenticated")
      }

      const { error } = await supabase
        .from("ai_chat_history")
        .delete()
        .eq("user_id", userId)

      if (error) {
        return errorResult(error.message)
      }

      return successResult(undefined)
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : "Failed to clear history")
    }
  },
}

// =============================================================================
// AI Aggregates Service
// =============================================================================

export interface IAIAggregatesService {
  getRecentAggregates(days?: number): Promise<ServiceResult<DailyAggregate[]>>
  updateDailyRating(date: string, rating: number): Promise<ServiceResult<void>>
}

export const aiAggregatesService: IAIAggregatesService = {
  async getRecentAggregates(days: number = 14): Promise<ServiceResult<DailyAggregate[]>> {
    try {
      const userId = await getCurrentUserId()
      if (!userId) {
        return errorResult("Not authenticated")
      }

      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
      const startDateStr = startDate.toISOString().split("T")[0]

      const { data, error } = await supabase
        .from("daily_aggregates")
        .select("*")
        .eq("user_id", userId)
        .gte("date", startDateStr)
        .order("date", { ascending: false })

      if (error) {
        return errorResult(error.message)
      }

      return successResult((data || []) as DailyAggregate[])
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : "Failed to fetch aggregates")
    }
  },

  async updateDailyRating(date: string, rating: number): Promise<ServiceResult<void>> {
    try {
      const userId = await getCurrentUserId()
      if (!userId) {
        return errorResult("Not authenticated")
      }

      const clampedRating = Math.max(1, Math.min(10, rating))

      const { error } = await supabase
        .from("daily_aggregates")
        .upsert({
          user_id: userId,
          date,
          daily_rating: clampedRating,
        }, { onConflict: "user_id,date" })

      if (error) {
        return errorResult(error.message)
      }

      return successResult(undefined)
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : "Failed to update rating")
    }
  },
}

// =============================================================================
// Combined AI Services Export
// =============================================================================

export const aiServices = {
  plans: aiPlanService,
  profile: aiProfileService,
  chat: aiChatService,
  aggregates: aiAggregatesService,
}

