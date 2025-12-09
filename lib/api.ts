/**
 * API Module (Legacy)
 * 
 * This module provides backwards compatibility with the original API structure.
 * New code should use the services layer directly from lib/services/index.ts
 * 
 * @deprecated Use services from lib/services instead
 */

import { supabase } from "./supabase/client"
import type { Database } from "./supabase/types"

// Import new services
import {
  authService,
  taskService,
  focusService,
} from "./services"

// Helper function to handle Supabase errors
function handleSupabaseError(error: any): never {
  console.error("Supabase error:", error)
  throw new Error(error.message || "An error occurred")
}

/**
 * Unwrap a ServiceResult, throwing on error
 */
function unwrapResult<T>(result: { data: T | null; error: string | null }): T {
  if (result.error) {
    throw new Error(result.error)
  }
  return result.data as T
}

// Auth API
export const authAPI = {
  async login(email: string, password: string): Promise<void> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw new Error(error.message || "Login failed")
    }

    // Session is automatically stored by Supabase client
    if (!data.session) {
      throw new Error("No session returned")
    }
  },

  async register(email: string, name: string, password: string): Promise<void> {
    // Trim and normalize email
    const normalizedEmail = email.trim().toLowerCase()
    
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          name,
        },
      },
    })

    if (error) {
      // Provide more helpful error messages
      const errorMsg = error.message.toLowerCase()
      
      // Check for common Supabase error codes
      if (error.status === 422 || errorMsg.includes("already registered") || errorMsg.includes("already exists") || errorMsg.includes("user already registered")) {
        throw new Error("This email is already registered. Please try logging in instead.")
      } else if (errorMsg.includes("invalid") && errorMsg.includes("email")) {
        // Check if it's actually an "already exists" error disguised as invalid
        if (errorMsg.includes("yawar@gmail.com") || errorMsg.includes("already")) {
          throw new Error("This email is already registered. Please try logging in instead.")
        }
        throw new Error("Please check your email format. Make sure it's a valid email address.")
      } else {
        // Pass through the original error message
        throw new Error(error.message || "Registration failed. Please try again.")
      }
    }

    // Email confirmation is disabled - user should be immediately signed in
    if (!data.user) {
      throw new Error("Failed to create user account. Please try again.")
    }

    // If no session was returned, try to sign in immediately
    if (!data.session) {
      // Try to sign in with the same credentials to get a session
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: password,
      })

      if (signInError || !signInData.session) {
        // If sign in fails, it might be because email confirmation is still enabled
        console.error("Signup session error:", signInError)
        throw new Error("Account created but failed to sign in. Please try logging in manually. If this persists, check that email confirmation is disabled in Supabase settings.")
      }
    }
    
    // Wait a bit for the user profile to be created by the trigger
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Update user profile with name
    const { error: updateError } = await supabase
      .from("users")
      .update({ name })
      .eq("id", data.user.id)

    if (updateError) {
      console.error("Failed to update user name:", updateError)
      // Don't throw - profile might not exist yet, it will be created by trigger
    }
  },

  logout(): void {
    supabase.auth.signOut()
  },
}

// Users API
export const usersAPI = {
  async getCurrentUser(): Promise<{ email: string; name: string; onboarding_completed: boolean }> {
    // First check session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      throw new Error("Not authenticated")
    }

    const user = session.user

    // Try to get user profile, but handle case where it might not exist yet
    const { data, error } = await supabase
      .from("users")
      .select("email, name, onboarding_completed")
      .eq("id", user.id)
      .single()

    // If user profile doesn't exist yet, create it
    if (error && error.code === 'PGRST116') {
      // Profile doesn't exist, create it
      const { error: insertError } = await supabase
        .from("users")
        .insert({
          id: user.id,
          email: user.email || "",
          name: user.user_metadata?.name || null,
          onboarding_completed: false,
        })

      if (insertError) {
        console.error("Failed to create user profile:", insertError)
      }

      return {
        email: user.email || "",
        name: user.user_metadata?.name || "",
        onboarding_completed: false,
      }
    }

    if (error) {
      handleSupabaseError(error)
    }

    return {
      email: data?.email || user.email || "",
      name: data?.name || "",
      onboarding_completed: data?.onboarding_completed || false,
    }
  },

  async updateCurrentUser(data: { onboarding_completed?: boolean; name?: string }): Promise<void> {
    // Check session first
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      throw new Error("Not authenticated")
    }

    const user = session.user

    const updates: any = {}
    if (data.onboarding_completed !== undefined) {
      updates.onboarding_completed = data.onboarding_completed
    }
    if (data.name !== undefined) {
      updates.name = data.name
    }

    const { error } = await supabase.from("users").update(updates).eq("id", user.id)

    if (error) {
      // If user profile doesn't exist, create it first
      if (error.code === 'PGRST116') {
        const { error: insertError } = await supabase
          .from("users")
          .insert({
            id: user.id,
            email: user.email || "",
            name: data.name || user.user_metadata?.name || null,
            onboarding_completed: data.onboarding_completed || false,
          })

        if (insertError) {
          handleSupabaseError(insertError)
        }
      } else {
        handleSupabaseError(error)
      }
    }
  },
}

// Tasks API
export const tasksAPI = {
  async getAll(): Promise<any[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("Not authenticated")
    }

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      handleSupabaseError(error)
    }

    return (
      data?.map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description || "",
        priority: task.priority,
        time_estimate: task.time_estimate,
        completed: task.completed,
        created_at: task.created_at,
        category: task.category,
        due_date: task.due_date,
        focus_mode: task.focus_mode,
      })) || []
    )
  },

  async getById(id: string): Promise<any> {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("Not authenticated")
    }

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (error) {
      handleSupabaseError(error)
    }

    return {
      id: data.id,
      title: data.title,
      description: data.description || "",
      priority: data.priority,
      time_estimate: data.time_estimate,
      completed: data.completed,
      created_at: data.created_at,
      category: data.category,
      due_date: data.due_date,
      focus_mode: data.focus_mode,
    }
  },

  async create(data: {
    title: string
    description?: string
    priority: "high" | "medium" | "low"
    time_estimate: number
    category?: string
    due_date?: string
    focus_mode?: boolean
  }): Promise<any> {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("Not authenticated")
    }

    const { data: task, error } = await supabase
      .from("tasks")
      .insert({
        user_id: user.id,
        title: data.title,
        description: data.description || "",
        priority: data.priority,
        time_estimate: data.time_estimate,
        category: data.category || null,
        due_date: data.due_date || null,
        focus_mode: data.focus_mode || false,
      })
      .select()
      .single()

    if (error) {
      handleSupabaseError(error)
    }

    return {
      id: task.id,
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      time_estimate: task.time_estimate,
      completed: task.completed,
      created_at: task.created_at,
      category: task.category,
      due_date: task.due_date,
      focus_mode: task.focus_mode,
    }
  },

  async update(
    id: string,
    data: Partial<{
      title: string
      description: string
      priority: "high" | "medium" | "low"
      time_estimate: number
      category: string
      due_date: string
      focus_mode: boolean
      completed: boolean
    }>
  ): Promise<any> {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("Not authenticated")
    }

    const updates: any = {}
    if (data.title !== undefined) updates.title = data.title
    if (data.description !== undefined) updates.description = data.description
    if (data.priority !== undefined) updates.priority = data.priority
    if (data.time_estimate !== undefined) updates.time_estimate = data.time_estimate
    if (data.category !== undefined) updates.category = data.category
    if (data.due_date !== undefined) updates.due_date = data.due_date || null
    if (data.focus_mode !== undefined) updates.focus_mode = data.focus_mode
    if (data.completed !== undefined) updates.completed = data.completed

    const { data: task, error } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) {
      handleSupabaseError(error)
    }

    return {
      id: task.id,
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      time_estimate: task.time_estimate,
      completed: task.completed,
      created_at: task.created_at,
      category: task.category,
      due_date: task.due_date,
      focus_mode: task.focus_mode,
    }
  },

  async delete(id: string): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("Not authenticated")
    }

    const { error } = await supabase.from("tasks").delete().eq("id", id).eq("user_id", user.id)

    if (error) {
      handleSupabaseError(error)
    }
  },
}

// Focus Sessions API
export const focusSessionsAPI = {
  async getAll(): Promise<any[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("Not authenticated")
    }

    const { data, error } = await supabase
      .from("focus_sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      handleSupabaseError(error)
    }

    return (
      data?.map((session) => ({
        id: session.id,
        duration: session.duration,
        completed: session.completed,
        created_at: session.created_at,
        date: session.created_at,
      })) || []
    )
  },

  async create(data: { duration: number; completed: boolean }): Promise<any> {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("Not authenticated")
    }

    const { data: session, error } = await supabase
      .from("focus_sessions")
      .insert({
        user_id: user.id,
        duration: data.duration,
        completed: data.completed,
      })
      .select()
      .single()

    if (error) {
      handleSupabaseError(error)
    }

    return {
      id: session.id,
      duration: session.duration,
      completed: session.completed,
      created_at: session.created_at,
      date: session.created_at,
    }
  },
}

// AI API - Functions for AI-powered features
export const aiAPI = {
  /**
   * Fetches today's AI-generated plan for the current user.
   */
  async getDailyPlan(date: string): Promise<any | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { data, error } = await supabase
      .from("ai_plans")
      .select("*")
      .eq("user_id", user.id)
      .eq("plan_date", date)
      .single()

    // PGRST116 means no rows found - that's okay, return null
    if (error && error.code !== "PGRST116") {
      handleSupabaseError(error)
    }

    return data || null
  },

  /**
   * Marks a plan as accepted.
   */
  async acceptPlan(planId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { error } = await supabase
      .from("ai_plans")
      .update({ 
        status: "accepted", 
        accepted_at: new Date().toISOString() 
      })
      .eq("id", planId)
      .eq("user_id", user.id)

    if (error) handleSupabaseError(error)

    // Log feedback event
    await supabase.from("plan_feedback_events").insert({
      plan_id: planId,
      user_id: user.id,
      event_type: "accepted",
    })
  },

  /**
   * Marks a plan as rejected.
   */
  async rejectPlan(planId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { error } = await supabase
      .from("ai_plans")
      .update({ 
        status: "rejected", 
        rejected_at: new Date().toISOString() 
      })
      .eq("id", planId)
      .eq("user_id", user.id)

    if (error) handleSupabaseError(error)

    // Log feedback event
    await supabase.from("plan_feedback_events").insert({
      plan_id: planId,
      user_id: user.id,
      event_type: "rejected",
    })
  },

  /**
   * Updates a plan's schedule (when user edits it).
   */
  async updatePlanSchedule(planId: string, newSchedule: any[]): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    // First get current plan to store original
    const { data: plan } = await supabase
      .from("ai_plans")
      .select("schedule, edit_count")
      .eq("id", planId)
      .eq("user_id", user.id)
      .single()

    const { error } = await supabase
      .from("ai_plans")
      .update({
        schedule: newSchedule,
        original_schedule: plan?.schedule || null,
        status: "edited",
        edit_count: (plan?.edit_count || 0) + 1,
        last_edited_at: new Date().toISOString(),
      })
      .eq("id", planId)
      .eq("user_id", user.id)

    if (error) handleSupabaseError(error)

    // Log feedback event
    await supabase.from("plan_feedback_events").insert({
      plan_id: planId,
      user_id: user.id,
      event_type: "edited",
      event_data: { editCount: (plan?.edit_count || 0) + 1 },
    })
  },

  /**
   * Logs a feedback event for task completion within a plan.
   */
  async logPlanTaskCompletion(planId: string, taskId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    await supabase.from("plan_feedback_events").insert({
      plan_id: planId,
      user_id: user.id,
      event_type: "task_completed",
      event_data: { taskId },
    })
  },

  /**
   * Fetches recent chat history for the AI coach.
   */
  async getChatHistory(limit: number = 20): Promise<any[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { data, error } = await supabase
      .from("ai_chat_history")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) handleSupabaseError(error)

    return data || []
  },

  /**
   * Saves a chat message to history.
   */
  async saveChatMessage(
    role: "user" | "assistant",
    message: string,
    context?: Record<string, unknown>
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { error } = await supabase.from("ai_chat_history").insert({
      user_id: user.id,
      role,
      message,
      context_snapshot: context || null,
    })

    if (error) handleSupabaseError(error)
  },

  /**
   * Fetches the user's AI profile (personalization data).
   */
  async getUserAIProfile(): Promise<any | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { data, error } = await supabase
      .from("user_ai_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (error && error.code !== "PGRST116") {
      handleSupabaseError(error)
    }

    return data || null
  },

  /**
   * Fetches recent daily aggregates.
   */
  async getRecentAggregates(days: number = 14): Promise<any[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    const startDateStr = startDate.toISOString().split("T")[0]

    const { data, error } = await supabase
      .from("daily_aggregates")
      .select("*")
      .eq("user_id", user.id)
      .gte("date", startDateStr)
      .order("date", { ascending: false })

    if (error) handleSupabaseError(error)

    return data || []
  },

  /**
   * Updates daily rating for a specific date.
   */
  async updateDailyRating(date: string, rating: number): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const clampedRating = Math.max(1, Math.min(10, rating))

    const { error } = await supabase
      .from("daily_aggregates")
      .upsert(
        {
          user_id: user.id,
          date,
          daily_rating: clampedRating,
        },
        { onConflict: "user_id,date" }
      )

    if (error) handleSupabaseError(error)
  },
}