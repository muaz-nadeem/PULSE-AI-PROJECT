/**
 * Task Logic
 * 
 * Pure functions for task-related operations including sorting, filtering,
 * and task analytics.
 */

import type { Task, TaskPriority } from "./types"

/**
 * Priority order mapping for sorting.
 */
const PRIORITY_ORDER: Record<TaskPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
}

/**
 * Sorts tasks by priority (high -> medium -> low).
 * 
 * @param tasks - Array of tasks to sort
 * @returns New sorted array
 */
export function sortTasksByPriority(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => 
    PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
  )
}

/**
 * Sorts tasks by due date (earliest first, tasks without due date last).
 * 
 * @param tasks - Array of tasks to sort
 * @returns New sorted array
 */
export function sortTasksByDueDate(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0
    if (!a.dueDate) return 1
    if (!b.dueDate) return -1
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  })
}

/**
 * Sorts tasks by creation date (newest first).
 * 
 * @param tasks - Array of tasks to sort
 * @returns New sorted array
 */
export function sortTasksByCreatedDate(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

/**
 * Filters tasks for a specific date.
 * Tasks without a due date are included if includeNoDueDate is true.
 * 
 * @param tasks - Array of tasks
 * @param date - Date string (YYYY-MM-DD) to filter by
 * @param includeNoDueDate - Include tasks without due date (default: true)
 * @returns Filtered array of tasks
 */
export function filterTasksForDate(
  tasks: Task[],
  date: string,
  includeNoDueDate: boolean = true
): Task[] {
  return tasks.filter((task) => {
    if (!task.dueDate) return includeNoDueDate
    return normalizeDate(task.dueDate) === date
  })
}

/**
 * Normalizes a date to YYYY-MM-DD format.
 * 
 * @param date - Date string or Date object
 * @returns Normalized date string or undefined if invalid
 */
export function normalizeDate(date: string | Date | undefined): string | undefined {
  if (!date) return undefined
  
  if (typeof date === "string") {
    // If it's already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date
    // Otherwise, try to parse it
    const parsed = new Date(date)
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split("T")[0]
    }
  }
  
  if (date instanceof Date && !isNaN(date.getTime())) {
    return date.toISOString().split("T")[0]
  }
  
  return undefined
}

/**
 * Filters tasks by priority.
 * 
 * @param tasks - Array of tasks
 * @param priority - Priority to filter by
 * @returns Filtered array of tasks
 */
export function filterTasksByPriority(tasks: Task[], priority: TaskPriority): Task[] {
  return tasks.filter((task) => task.priority === priority)
}

/**
 * Filters tasks by completion status.
 * 
 * @param tasks - Array of tasks
 * @param completed - Completion status to filter by
 * @returns Filtered array of tasks
 */
export function filterTasksByCompletion(tasks: Task[], completed: boolean): Task[] {
  return tasks.filter((task) => task.completed === completed)
}

/**
 * Gets incomplete tasks.
 * 
 * @param tasks - Array of tasks
 * @returns Array of incomplete tasks
 */
export function getIncompleteTasks(tasks: Task[]): Task[] {
  return filterTasksByCompletion(tasks, false)
}

/**
 * Gets completed tasks.
 * 
 * @param tasks - Array of tasks
 * @returns Array of completed tasks
 */
export function getCompletedTasks(tasks: Task[]): Task[] {
  return filterTasksByCompletion(tasks, true)
}

/**
 * Gets tasks that require focus mode.
 * 
 * @param tasks - Array of tasks
 * @returns Array of tasks with focusMode enabled
 */
export function getFocusModeTasks(tasks: Task[]): Task[] {
  return tasks.filter((task) => task.focusMode === true)
}

/**
 * Computes the task completion rate.
 * 
 * @param tasks - Array of tasks
 * @returns Completion rate as a decimal (0-1)
 */
export function computeTaskCompletionRate(tasks: Task[]): number {
  if (tasks.length === 0) return 0
  const completed = tasks.filter((t) => t.completed).length
  return completed / tasks.length
}

/**
 * Gets high priority incomplete tasks.
 * 
 * @param tasks - Array of tasks
 * @returns Array of high priority incomplete tasks
 */
export function getHighPriorityIncompleteTasks(tasks: Task[]): Task[] {
  return tasks.filter((task) => task.priority === "high" && !task.completed)
}

/**
 * Gets tasks created within a date range.
 * 
 * @param tasks - Array of tasks
 * @param startDate - Start of range
 * @param endDate - End of range
 * @returns Filtered array of tasks
 */
export function getTasksInDateRange(
  tasks: Task[],
  startDate: Date,
  endDate: Date
): Task[] {
  const start = new Date(startDate)
  start.setHours(0, 0, 0, 0)
  
  const end = new Date(endDate)
  end.setHours(23, 59, 59, 999)

  return tasks.filter((task) => {
    const taskDate = new Date(task.createdAt)
    return taskDate >= start && taskDate <= end
  })
}

/**
 * Gets tasks for the current week.
 * 
 * @param tasks - Array of tasks
 * @param referenceDate - Reference date (defaults to today)
 * @returns Array of tasks from the current week
 */
export function getTasksThisWeek(tasks: Task[], referenceDate: Date = new Date()): Task[] {
  const today = new Date(referenceDate)
  today.setHours(0, 0, 0, 0)
  
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay())

  return getTasksInDateRange(tasks, weekStart, today)
}

/**
 * Gets tasks for today.
 * 
 * @param tasks - Array of tasks
 * @param referenceDate - Reference date (defaults to today)
 * @returns Array of tasks from today
 */
export function getTasksToday(tasks: Task[], referenceDate: Date = new Date()): Task[] {
  const today = new Date(referenceDate)
  return getTasksInDateRange(tasks, today, today)
}

/**
 * Calculates total time estimate for an array of tasks.
 * 
 * @param tasks - Array of tasks
 * @returns Total time estimate in minutes
 */
export function calculateTotalTimeEstimate(tasks: Task[]): number {
  return tasks.reduce((sum, task) => sum + (task.timeEstimate || 0), 0)
}

/**
 * Groups tasks by category.
 * 
 * @param tasks - Array of tasks
 * @returns Map of category to tasks
 */
export function groupTasksByCategory(tasks: Task[]): Map<string, Task[]> {
  const grouped = new Map<string, Task[]>()
  
  for (const task of tasks) {
    const category = task.category || "Uncategorized"
    const existing = grouped.get(category) || []
    grouped.set(category, [...existing, task])
  }
  
  return grouped
}

/**
 * Gets overdue tasks (past due date and not completed).
 * 
 * @param tasks - Array of tasks
 * @param referenceDate - Reference date (defaults to today)
 * @returns Array of overdue tasks
 */
export function getOverdueTasks(tasks: Task[], referenceDate: Date = new Date()): Task[] {
  const today = new Date(referenceDate)
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString().split("T")[0]

  return tasks.filter((task) => {
    if (task.completed || !task.dueDate) return false
    const normalizedDueDate = normalizeDate(task.dueDate)
    return normalizedDueDate && normalizedDueDate < todayStr
  })
}
