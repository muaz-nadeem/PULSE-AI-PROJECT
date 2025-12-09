/**
 * Goal Logic
 * 
 * Pure functions for goal-related calculations including progress computation,
 * milestone management, and AI suggestions generation.
 */

import type { Goal, Milestone, Task } from "./types"

/**
 * Calculates the progress percentage for a goal based on its milestones.
 * 
 * @param milestones - Array of milestones
 * @returns Progress as a percentage (0-100)
 */
export function calculateGoalProgress(milestones: Milestone[]): number {
  if (milestones.length === 0) return 0
  
  const completedCount = milestones.filter((m) => m.completed).length
  return Math.round((completedCount / milestones.length) * 100)
}

/**
 * Determines if a goal should be automatically marked as completed.
 * 
 * @param goal - The goal to check
 * @returns True if all milestones are completed and goal is active
 */
export function shouldAutoCompleteGoal(goal: Goal): boolean {
  if (goal.status !== "active") return false
  if (goal.milestones.length === 0) return false
  return goal.milestones.every((m) => m.completed)
}

/**
 * Generates AI suggestions for a goal based on its progress and related tasks.
 * 
 * @param goal - The goal to generate suggestions for
 * @param allTasks - All tasks in the system (for finding related tasks)
 * @returns Array of suggestion strings
 */
export function generateGoalSuggestions(goal: Goal, allTasks: Task[]): string[] {
  const suggestions: string[] = []
  const completedMilestones = goal.milestones.filter((m) => m.completed).length
  const totalMilestones = goal.milestones.length
  const progress = goal.progress

  // Progress-based suggestions
  if (progress === 0) {
    suggestions.push("Start by completing your first milestone to build momentum!")
    suggestions.push("Break down your first milestone into smaller daily tasks.")
  } else if (progress < 30) {
    suggestions.push("You're just getting started! Focus on completing 1-2 milestones this week.")
    suggestions.push("Consider scheduling specific times for goal-related tasks.")
  } else if (progress < 50) {
    suggestions.push("Great progress! You're almost halfway there. Keep the momentum going!")
    suggestions.push("Review your upcoming milestones and plan ahead.")
  } else if (progress < 80) {
    suggestions.push("You're making excellent progress! Focus on the remaining milestones.")
    suggestions.push("Consider celebrating your progress so far to stay motivated.")
  } else if (progress < 100) {
    suggestions.push("You're so close! Push through the final milestones to achieve your goal.")
    suggestions.push("Review what's worked well and apply it to the remaining tasks.")
  }

  // Task integration suggestions
  const relatedTasks = findRelatedTasks(goal, allTasks)
  
  if (relatedTasks.length === 0) {
    suggestions.push("Create tasks related to this goal to track daily progress.")
  } else {
    const incompleteTasks = relatedTasks.filter((t) => !t.completed)
    if (incompleteTasks.length > 0) {
      suggestions.push(
        `You have ${incompleteTasks.length} related tasks. Complete them to advance your goal.`
      )
    }
  }

  // Time-based suggestions
  if (goal.targetDate) {
    const targetDate = new Date(goal.targetDate)
    const today = new Date()
    const daysRemaining = Math.ceil(
      (targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    )
    const milestonesRemaining = totalMilestones - completedMilestones

    if (daysRemaining > 0 && milestonesRemaining > 0) {
      const dailyMilestoneRate = milestonesRemaining / daysRemaining
      if (dailyMilestoneRate > 0.5) {
        suggestions.push(
          `You have ${daysRemaining} days left. Complete ${Math.ceil(dailyMilestoneRate)} milestone(s) per day to stay on track.`
        )
      }
    }
  }

  return suggestions.slice(0, 3) // Return top 3 suggestions
}

/**
 * Finds tasks that are related to a goal based on title matching.
 * 
 * @param goal - The goal to find related tasks for
 * @param tasks - All tasks to search through
 * @returns Array of related tasks
 */
export function findRelatedTasks(goal: Goal, tasks: Task[]): Task[] {
  const goalWords = goal.title.toLowerCase().split(" ")
  
  return tasks.filter((task) => {
    const taskWords = task.title.toLowerCase().split(" ")
    
    // Check if any significant word from goal title appears in task title
    return goalWords.some((goalWord) => {
      if (goalWord.length < 3) return false // Skip short words
      return taskWords.some((taskWord) => 
        taskWord.includes(goalWord) || goalWord.includes(taskWord)
      )
    })
  })
}

/**
 * Adds a milestone to a goal and returns updated milestones with recalculated progress.
 * 
 * @param currentMilestones - Current array of milestones
 * @param newMilestone - New milestone data (without id and order)
 * @returns Object with new milestone, updated milestones array, and new progress
 */
export function addMilestoneToGoal(
  currentMilestones: Milestone[],
  newMilestone: Omit<Milestone, "id" | "order">
): {
  milestone: Milestone
  milestones: Milestone[]
  progress: number
} {
  const maxOrder = currentMilestones.length > 0
    ? Math.max(...currentMilestones.map((m) => m.order))
    : -1

  const milestone: Milestone = {
    ...newMilestone,
    id: generateId(),
    order: maxOrder + 1,
  }

  const milestones = [...currentMilestones, milestone].sort((a, b) => a.order - b.order)
  const progress = calculateGoalProgress(milestones)

  return { milestone, milestones, progress }
}

/**
 * Toggles a milestone's completion status and returns updated data.
 * 
 * @param milestones - Current milestones array
 * @param milestoneId - ID of milestone to toggle
 * @returns Object with updated milestones and progress, or null if milestone not found
 */
export function toggleMilestoneCompletion(
  milestones: Milestone[],
  milestoneId: string
): {
  milestones: Milestone[]
  progress: number
} | null {
  const milestoneIndex = milestones.findIndex((m) => m.id === milestoneId)
  if (milestoneIndex === -1) return null

  const today = new Date().toISOString().split("T")[0]
  const milestone = milestones[milestoneIndex]
  
  const updatedMilestones = milestones.map((m) => {
    if (m.id === milestoneId) {
      return {
        ...m,
        completed: !m.completed,
        completedDate: !m.completed ? today : undefined,
      }
    }
    return m
  })

  const progress = calculateGoalProgress(updatedMilestones)

  return { milestones: updatedMilestones, progress }
}

/**
 * Removes a milestone from a goal and returns updated data.
 * 
 * @param milestones - Current milestones array
 * @param milestoneId - ID of milestone to remove
 * @returns Object with updated milestones and progress
 */
export function removeMilestone(
  milestones: Milestone[],
  milestoneId: string
): {
  milestones: Milestone[]
  progress: number
} {
  const updatedMilestones = milestones.filter((m) => m.id !== milestoneId)
  const progress = calculateGoalProgress(updatedMilestones)

  return { milestones: updatedMilestones, progress }
}

/**
 * Gets goals filtered by status.
 * 
 * @param goals - Array of goals
 * @param status - Status to filter by
 * @returns Filtered array of goals
 */
export function getGoalsByStatus(
  goals: Goal[],
  status: "active" | "completed" | "paused"
): Goal[] {
  return goals.filter((goal) => goal.status === status)
}

/**
 * Gets goals sorted by progress (ascending or descending).
 * 
 * @param goals - Array of goals
 * @param ascending - If true, sort lowest progress first
 * @returns Sorted array of goals
 */
export function sortGoalsByProgress(goals: Goal[], ascending: boolean = false): Goal[] {
  return [...goals].sort((a, b) => 
    ascending ? a.progress - b.progress : b.progress - a.progress
  )
}

/**
 * Gets goals that are near their target date.
 * 
 * @param goals - Array of goals
 * @param daysThreshold - Number of days to consider as "near" (default: 7)
 * @returns Goals that are due within the threshold
 */
export function getUpcomingGoals(goals: Goal[], daysThreshold: number = 7): Goal[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const thresholdDate = new Date(today)
  thresholdDate.setDate(thresholdDate.getDate() + daysThreshold)

  return goals.filter((goal) => {
    if (!goal.targetDate || goal.status !== "active") return false
    const targetDate = new Date(goal.targetDate)
    return targetDate >= today && targetDate <= thresholdDate
  })
}

/**
 * Simple ID generator for milestones.
 * In production, consider using a UUID library.
 */
function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}
