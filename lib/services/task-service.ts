/**
 * Task Service
 * 
 * Handles all task-related operations with Supabase.
 */

import { supabase } from "../supabase/client"
import type { Task } from "../domain"
import type {
  ITaskService,
  CreateTaskInput,
  UpdateTaskInput,
  ServiceResult,
} from "./types"

/**
 * Maps database task row to domain Task type
 */
function mapToTask(row: any): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description || undefined,
    priority: row.priority,
    timeEstimate: row.time_estimate,
    completed: row.completed,
    createdAt: new Date(row.created_at),
    category: row.category || undefined,
    dueDate: row.due_date || undefined,
    focusMode: row.focus_mode || false,
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

export const taskService: ITaskService = {
  async getAll(): Promise<ServiceResult<Task[]>> {
    try {
      const userId = await getCurrentUserId()
      if (!userId) {
        return errorResult("Not authenticated")
      }

      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) {
        return errorResult(error.message)
      }

      return successResult((data || []).map(mapToTask))
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : "Failed to fetch tasks")
    }
  },

  async getById(id: string): Promise<ServiceResult<Task>> {
    try {
      const userId = await getCurrentUserId()
      if (!userId) {
        return errorResult("Not authenticated")
      }

      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", id)
        .eq("user_id", userId)
        .single()

      if (error) {
        return errorResult(error.message)
      }

      return successResult(mapToTask(data))
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : "Failed to fetch task")
    }
  },

  async create(input: CreateTaskInput): Promise<ServiceResult<Task>> {
    try {
      const userId = await getCurrentUserId()
      if (!userId) {
        return errorResult("Not authenticated")
      }

      const { data, error } = await supabase
        .from("tasks")
        .insert({
          user_id: userId,
          title: input.title,
          description: input.description || "",
          priority: input.priority,
          time_estimate: input.timeEstimate,
          category: input.category || null,
          due_date: input.dueDate || null,
          focus_mode: input.focusMode || false,
        })
        .select()
        .single()

      if (error) {
        return errorResult(error.message)
      }

      return successResult(mapToTask(data))
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : "Failed to create task")
    }
  },

  async update(id: string, input: UpdateTaskInput): Promise<ServiceResult<Task>> {
    try {
      const userId = await getCurrentUserId()
      if (!userId) {
        return errorResult("Not authenticated")
      }

      const updates: Record<string, unknown> = {}
      if (input.title !== undefined) updates.title = input.title
      if (input.description !== undefined) updates.description = input.description
      if (input.priority !== undefined) updates.priority = input.priority
      if (input.timeEstimate !== undefined) updates.time_estimate = input.timeEstimate
      if (input.category !== undefined) updates.category = input.category
      if (input.dueDate !== undefined) updates.due_date = input.dueDate
      if (input.focusMode !== undefined) updates.focus_mode = input.focusMode
      if (input.completed !== undefined) updates.completed = input.completed

      const { data, error } = await supabase
        .from("tasks")
        .update(updates)
        .eq("id", id)
        .eq("user_id", userId)
        .select()
        .single()

      if (error) {
        return errorResult(error.message)
      }

      return successResult(mapToTask(data))
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : "Failed to update task")
    }
  },

  async delete(id: string): Promise<ServiceResult<void>> {
    try {
      const userId = await getCurrentUserId()
      if (!userId) {
        return errorResult("Not authenticated")
      }

      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", id)
        .eq("user_id", userId)

      if (error) {
        return errorResult(error.message)
      }

      return successResult(undefined)
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : "Failed to delete task")
    }
  },

  async toggleComplete(id: string): Promise<ServiceResult<Task>> {
    try {
      const userId = await getCurrentUserId()
      if (!userId) {
        return errorResult("Not authenticated")
      }

      // First get the current task
      const { data: currentTask, error: fetchError } = await supabase
        .from("tasks")
        .select("completed")
        .eq("id", id)
        .eq("user_id", userId)
        .single()

      if (fetchError) {
        return errorResult(fetchError.message)
      }

      // Toggle the completion status
      const { data, error } = await supabase
        .from("tasks")
        .update({ completed: !currentTask.completed })
        .eq("id", id)
        .eq("user_id", userId)
        .select()
        .single()

      if (error) {
        return errorResult(error.message)
      }

      return successResult(mapToTask(data))
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : "Failed to toggle task")
    }
  },
}

