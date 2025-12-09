/**
 * Goal Service
 * 
 * Handles goal and milestone operations with Supabase.
 */

import { supabase } from "../supabase/client"
import type { Goal, Milestone } from "../domain"
import { calculateGoalProgress } from "../domain"
import type {
  IGoalService,
  CreateGoalInput,
  UpdateGoalInput,
  CreateMilestoneInput,
  UpdateMilestoneInput,
  ServiceResult,
} from "./types"

/**
 * Maps database milestone row to domain Milestone type
 */
function mapToMilestone(row: any): Milestone {
  return {
    id: row.id,
    title: row.title,
    description: row.description || undefined,
    completed: row.completed,
    dueDate: row.due_date || undefined,
    completedDate: row.completed_date || undefined,
    order: row.order,
  }
}

/**
 * Maps database row to domain Goal type
 */
function mapToGoal(row: any, milestones: Milestone[] = []): Goal {
  return {
    id: row.id,
    title: row.title,
    description: row.description || undefined,
    category: row.category,
    targetDate: row.target_date || undefined,
    progress: row.progress,
    status: row.status,
    color: row.color,
    milestones,
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

export const goalService: IGoalService = {
  async getAll(): Promise<ServiceResult<Goal[]>> {
    try {
      const userId = await getCurrentUserId()
      if (!userId) {
        return errorResult("Not authenticated")
      }

      // Fetch goals
      const { data: goals, error: goalsError } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (goalsError) {
        return errorResult(goalsError.message)
      }

      if (!goals || goals.length === 0) {
        return successResult([])
      }

      // Fetch milestones for all goals
      const goalIds = goals.map((g) => g.id)
      const { data: milestones, error: milestonesError } = await supabase
        .from("milestones")
        .select("*")
        .in("goal_id", goalIds)
        .order("order", { ascending: true })

      if (milestonesError) {
        return errorResult(milestonesError.message)
      }

      // Group milestones by goal
      const milestonesByGoal = new Map<string, Milestone[]>()
      for (const m of milestones || []) {
        const goalId = m.goal_id
        if (!milestonesByGoal.has(goalId)) {
          milestonesByGoal.set(goalId, [])
        }
        milestonesByGoal.get(goalId)!.push(mapToMilestone(m))
      }

      // Map goals with their milestones
      const result = goals.map((g) =>
        mapToGoal(g, milestonesByGoal.get(g.id) || [])
      )

      return successResult(result)
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : "Failed to fetch goals")
    }
  },

  async getById(id: string): Promise<ServiceResult<Goal>> {
    try {
      const userId = await getCurrentUserId()
      if (!userId) {
        return errorResult("Not authenticated")
      }

      const { data: goal, error: goalError } = await supabase
        .from("goals")
        .select("*")
        .eq("id", id)
        .eq("user_id", userId)
        .single()

      if (goalError) {
        return errorResult(goalError.message)
      }

      const { data: milestones, error: milestonesError } = await supabase
        .from("milestones")
        .select("*")
        .eq("goal_id", id)
        .order("order", { ascending: true })

      if (milestonesError) {
        return errorResult(milestonesError.message)
      }

      return successResult(
        mapToGoal(goal, (milestones || []).map(mapToMilestone))
      )
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : "Failed to fetch goal")
    }
  },

  async create(input: CreateGoalInput): Promise<ServiceResult<Goal>> {
    try {
      const userId = await getCurrentUserId()
      if (!userId) {
        return errorResult("Not authenticated")
      }

      // Create goal
      const { data: goal, error: goalError } = await supabase
        .from("goals")
        .insert({
          user_id: userId,
          title: input.title,
          description: input.description || null,
          category: input.category,
          target_date: input.targetDate || null,
          color: input.color,
          progress: 0,
          status: "active",
        })
        .select()
        .single()

      if (goalError) {
        return errorResult(goalError.message)
      }

      // Create milestones if provided
      let milestones: Milestone[] = []
      if (input.milestones && input.milestones.length > 0) {
        const milestoneInserts = input.milestones.map((m, index) => ({
          goal_id: goal.id,
          title: m.title,
          description: m.description || null,
          due_date: m.dueDate || null,
          order: m.order ?? index,
          completed: false,
        }))

        const { data: insertedMilestones, error: milestonesError } = await supabase
          .from("milestones")
          .insert(milestoneInserts)
          .select()

        if (milestonesError) {
          console.error("Failed to create milestones:", milestonesError)
        } else {
          milestones = (insertedMilestones || []).map(mapToMilestone)
        }
      }

      return successResult(mapToGoal(goal, milestones))
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : "Failed to create goal")
    }
  },

  async update(id: string, input: UpdateGoalInput): Promise<ServiceResult<Goal>> {
    try {
      const userId = await getCurrentUserId()
      if (!userId) {
        return errorResult("Not authenticated")
      }

      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
      if (input.title !== undefined) updates.title = input.title
      if (input.description !== undefined) updates.description = input.description
      if (input.category !== undefined) updates.category = input.category
      if (input.targetDate !== undefined) updates.target_date = input.targetDate
      if (input.color !== undefined) updates.color = input.color
      if (input.progress !== undefined) updates.progress = input.progress
      if (input.status !== undefined) updates.status = input.status

      const { data: goal, error: goalError } = await supabase
        .from("goals")
        .update(updates)
        .eq("id", id)
        .eq("user_id", userId)
        .select()
        .single()

      if (goalError) {
        return errorResult(goalError.message)
      }

      // Fetch milestones
      const { data: milestones } = await supabase
        .from("milestones")
        .select("*")
        .eq("goal_id", id)
        .order("order", { ascending: true })

      return successResult(
        mapToGoal(goal, (milestones || []).map(mapToMilestone))
      )
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : "Failed to update goal")
    }
  },

  async delete(id: string): Promise<ServiceResult<void>> {
    try {
      const userId = await getCurrentUserId()
      if (!userId) {
        return errorResult("Not authenticated")
      }

      // Milestones will be deleted by CASCADE
      const { error } = await supabase
        .from("goals")
        .delete()
        .eq("id", id)
        .eq("user_id", userId)

      if (error) {
        return errorResult(error.message)
      }

      return successResult(undefined)
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : "Failed to delete goal")
    }
  },

  async addMilestone(goalId: string, input: CreateMilestoneInput): Promise<ServiceResult<Goal>> {
    try {
      const userId = await getCurrentUserId()
      if (!userId) {
        return errorResult("Not authenticated")
      }

      // Verify goal ownership
      const { data: goal, error: goalError } = await supabase
        .from("goals")
        .select("id")
        .eq("id", goalId)
        .eq("user_id", userId)
        .single()

      if (goalError || !goal) {
        return errorResult("Goal not found")
      }

      // Add milestone
      const { error: insertError } = await supabase.from("milestones").insert({
        goal_id: goalId,
        title: input.title,
        description: input.description || null,
        due_date: input.dueDate || null,
        order: input.order,
        completed: false,
      })

      if (insertError) {
        return errorResult(insertError.message)
      }

      // Fetch updated goal with milestones
      return this.getById(goalId)
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : "Failed to add milestone")
    }
  },

  async updateMilestone(
    goalId: string,
    milestoneId: string,
    input: UpdateMilestoneInput
  ): Promise<ServiceResult<Goal>> {
    try {
      const userId = await getCurrentUserId()
      if (!userId) {
        return errorResult("Not authenticated")
      }

      // Verify goal ownership
      const { data: goal, error: goalError } = await supabase
        .from("goals")
        .select("id")
        .eq("id", goalId)
        .eq("user_id", userId)
        .single()

      if (goalError || !goal) {
        return errorResult("Goal not found")
      }

      const updates: Record<string, unknown> = {}
      if (input.title !== undefined) updates.title = input.title
      if (input.description !== undefined) updates.description = input.description
      if (input.dueDate !== undefined) updates.due_date = input.dueDate
      if (input.completed !== undefined) updates.completed = input.completed
      if (input.completedDate !== undefined) updates.completed_date = input.completedDate
      if (input.order !== undefined) updates.order = input.order

      const { error: updateError } = await supabase
        .from("milestones")
        .update(updates)
        .eq("id", milestoneId)
        .eq("goal_id", goalId)

      if (updateError) {
        return errorResult(updateError.message)
      }

      // Recalculate goal progress
      const { data: milestones } = await supabase
        .from("milestones")
        .select("completed")
        .eq("goal_id", goalId)

      if (milestones) {
        const mappedMilestones = milestones.map((m) => ({ completed: m.completed })) as Milestone[]
        const progress = calculateGoalProgress(mappedMilestones)

        await supabase
          .from("goals")
          .update({
            progress,
            status: progress === 100 ? "completed" : "active",
            updated_at: new Date().toISOString(),
          })
          .eq("id", goalId)
      }

      return this.getById(goalId)
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : "Failed to update milestone")
    }
  },

  async deleteMilestone(goalId: string, milestoneId: string): Promise<ServiceResult<Goal>> {
    try {
      const userId = await getCurrentUserId()
      if (!userId) {
        return errorResult("Not authenticated")
      }

      // Verify goal ownership
      const { data: goal, error: goalError } = await supabase
        .from("goals")
        .select("id")
        .eq("id", goalId)
        .eq("user_id", userId)
        .single()

      if (goalError || !goal) {
        return errorResult("Goal not found")
      }

      const { error: deleteError } = await supabase
        .from("milestones")
        .delete()
        .eq("id", milestoneId)
        .eq("goal_id", goalId)

      if (deleteError) {
        return errorResult(deleteError.message)
      }

      // Recalculate goal progress
      const { data: milestones } = await supabase
        .from("milestones")
        .select("completed")
        .eq("goal_id", goalId)

      if (milestones) {
        const mappedMilestones = milestones.map((m) => ({ completed: m.completed })) as Milestone[]
        const progress = calculateGoalProgress(mappedMilestones)

        await supabase
          .from("goals")
          .update({
            progress,
            updated_at: new Date().toISOString(),
          })
          .eq("id", goalId)
      }

      return this.getById(goalId)
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : "Failed to delete milestone")
    }
  },

  async toggleMilestone(goalId: string, milestoneId: string): Promise<ServiceResult<Goal>> {
    try {
      const userId = await getCurrentUserId()
      if (!userId) {
        return errorResult("Not authenticated")
      }

      // Verify goal ownership
      const { data: goal, error: goalError } = await supabase
        .from("goals")
        .select("id")
        .eq("id", goalId)
        .eq("user_id", userId)
        .single()

      if (goalError || !goal) {
        return errorResult("Goal not found")
      }

      // Get current milestone state
      const { data: milestone, error: fetchError } = await supabase
        .from("milestones")
        .select("completed")
        .eq("id", milestoneId)
        .eq("goal_id", goalId)
        .single()

      if (fetchError) {
        return errorResult(fetchError.message)
      }

      const newCompleted = !milestone.completed
      const completedDate = newCompleted ? new Date().toISOString().split("T")[0] : null

      const { error: updateError } = await supabase
        .from("milestones")
        .update({
          completed: newCompleted,
          completed_date: completedDate,
        })
        .eq("id", milestoneId)
        .eq("goal_id", goalId)

      if (updateError) {
        return errorResult(updateError.message)
      }

      // Recalculate goal progress
      const { data: milestones } = await supabase
        .from("milestones")
        .select("completed")
        .eq("goal_id", goalId)

      if (milestones) {
        const mappedMilestones = milestones.map((m) => ({ completed: m.completed })) as Milestone[]
        const progress = calculateGoalProgress(mappedMilestones)

        await supabase
          .from("goals")
          .update({
            progress,
            status: progress === 100 ? "completed" : "active",
            updated_at: new Date().toISOString(),
          })
          .eq("id", goalId)
      }

      return this.getById(goalId)
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : "Failed to toggle milestone")
    }
  },
}

