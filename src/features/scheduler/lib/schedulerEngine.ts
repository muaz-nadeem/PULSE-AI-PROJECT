/**
 * Scheduler Engine
 * 
 * Greedy weighted interval scheduling algorithm.
 * Takes tasks and free time slots, outputs an optimized schedule.
 */

import type { Task, TaskPriority } from "@/lib/domain/types"
import {
    timeToMinutes,
    minutesToTime,
    computeTaskWeight,
    getSlotDuration,
    type TimeSlot,
    type MoodType,
} from "./schedulingMath"

// =============================================================================
// Types
// =============================================================================

export interface ScheduledTask {
    taskId: string
    task: Task
    startTime: string    // HH:MM format
    endTime: string      // HH:MM format
    duration: number     // minutes
}

export interface UnscheduledTask {
    task: Task
    reason: "no_fit" | "deferred" | "completed" | "low_priority"
}

export interface ScheduleResult {
    scheduledTasks: ScheduledTask[]
    unscheduledTasks: UnscheduledTask[]
    totalScheduledMinutes: number
    totalUnscheduledMinutes: number
    utilizationPercent: number
}

export interface SchedulerOptions {
    mood: MoodType
    maxTasksPerSlot?: number      // Limit tasks per time slot (default: unlimited)
    minSlotDuration?: number      // Minimum slot duration to consider (default: 15 min)
    breakBetweenTasks?: number    // Buffer time between tasks (default: 0)
    respectDeadlines?: boolean    // Prioritize tasks due today (default: true)
    loadFactor?: number           // Capacity multiplier from learning (default: 1.0)
}

const DEFAULT_OPTIONS: Required<SchedulerOptions> = {
    mood: "Okay",
    maxTasksPerSlot: Infinity,
    minSlotDuration: 15,
    breakBetweenTasks: 0,
    respectDeadlines: true,
    loadFactor: 1.0,
}

// =============================================================================
// Core Scheduler
// =============================================================================

/**
 * Filters tasks that should be scheduled.
 * Removes completed tasks and deferred tasks.
 */
function filterSchedulableTasks(tasks: Task[]): { schedulable: Task[]; excluded: UnscheduledTask[] } {
    const schedulable: Task[] = []
    const excluded: UnscheduledTask[] = []

    for (const task of tasks) {
        if (task.completed) {
            excluded.push({ task, reason: "completed" })
        } else {
            schedulable.push(task)
        }
    }

    return { schedulable, excluded }
}

/**
 * Sorts tasks by weight (descending) for greedy selection.
 */
function sortByWeight(tasks: Task[], mood: MoodType): Task[] {
    return [...tasks].sort((a, b) =>
        computeTaskWeight(b, mood) - computeTaskWeight(a, mood)
    )
}

/**
 * Finds the best task that fits within the given duration.
 * Uses greedy approach: pick highest-weighted task that fits.
 */
function findBestFittingTask(
    candidates: Task[],
    availableMinutes: number,
    breakBuffer: number
): Task | null {
    // Candidates are already sorted by weight
    for (const task of candidates) {
        const requiredTime = task.timeEstimate + breakBuffer
        if (requiredTime <= availableMinutes) {
            return task
        }
    }
    return null
}

/**
 * Schedules tasks into a single time slot using greedy approach.
 * Returns scheduled tasks and remaining unscheduled tasks.
 */
function scheduleSlot(
    slot: TimeSlot,
    tasks: Task[],
    options: Required<SchedulerOptions>
): { scheduled: ScheduledTask[]; remaining: Task[] } {
    const scheduled: ScheduledTask[] = []
    const remaining = [...tasks]

    let currentTime = timeToMinutes(slot.start)
    const slotEnd = timeToMinutes(slot.end)
    let tasksInSlot = 0

    while (currentTime < slotEnd && remaining.length > 0 && tasksInSlot < options.maxTasksPerSlot) {
        const availableMinutes = slotEnd - currentTime

        // Skip if remaining time is too small
        if (availableMinutes < options.minSlotDuration) {
            break
        }

        // Find best fitting task
        const bestTask = findBestFittingTask(remaining, availableMinutes, options.breakBetweenTasks)

        if (!bestTask) {
            // No task fits in remaining time
            break
        }

        // Schedule the task
        const startTime = minutesToTime(currentTime)
        const endTime = minutesToTime(currentTime + bestTask.timeEstimate)

        scheduled.push({
            taskId: bestTask.id,
            task: bestTask,
            startTime,
            endTime,
            duration: bestTask.timeEstimate,
        })

        // Update state
        currentTime += bestTask.timeEstimate + options.breakBetweenTasks
        tasksInSlot++

        // Remove scheduled task from remaining
        const taskIndex = remaining.findIndex(t => t.id === bestTask.id)
        if (taskIndex !== -1) {
            remaining.splice(taskIndex, 1)
        }
    }

    return { scheduled, remaining }
}

/**
 * Schedules tasks into a single time slot with a capacity limit.
 * Similar to scheduleSlot but stops when capacity is reached.
 */
function scheduleSlotWithCapacity(
    slot: TimeSlot,
    tasks: Task[],
    options: Required<SchedulerOptions>,
    capacityLimit: number
): { scheduled: ScheduledTask[]; remaining: Task[] } {
    const scheduled: ScheduledTask[] = []
    const remaining = [...tasks]

    let currentTime = timeToMinutes(slot.start)
    const slotEnd = timeToMinutes(slot.end)
    let tasksInSlot = 0
    let scheduledMinutes = 0

    while (
        currentTime < slotEnd &&
        remaining.length > 0 &&
        tasksInSlot < options.maxTasksPerSlot &&
        scheduledMinutes < capacityLimit
    ) {
        const availableMinutes = Math.min(
            slotEnd - currentTime,
            capacityLimit - scheduledMinutes
        )

        // Skip if remaining time is too small
        if (availableMinutes < options.minSlotDuration) {
            break
        }

        // Find best fitting task within capacity
        const bestTask = findBestFittingTask(remaining, availableMinutes, options.breakBetweenTasks)

        if (!bestTask) {
            break
        }

        // Schedule the task
        const startTime = minutesToTime(currentTime)
        const endTime = minutesToTime(currentTime + bestTask.timeEstimate)

        scheduled.push({
            taskId: bestTask.id,
            task: bestTask,
            startTime,
            endTime,
            duration: bestTask.timeEstimate,
        })

        // Update state
        currentTime += bestTask.timeEstimate + options.breakBetweenTasks
        tasksInSlot++
        scheduledMinutes += bestTask.timeEstimate

        // Remove scheduled task from remaining
        const taskIndex = remaining.findIndex(t => t.id === bestTask.id)
        if (taskIndex !== -1) {
            remaining.splice(taskIndex, 1)
        }
    }

    return { scheduled, remaining }
}

/**
 * Main scheduling function.
 * 
 * Implements a greedy weighted interval scheduling algorithm:
 * 1. Filter out completed/deferred tasks
 * 2. Sort remaining tasks by weight (priority + deadline + mood adjustment)
 * 3. For each free slot, greedily pack highest-weight tasks that fit
 * 4. Return scheduled tasks with assigned times, plus unscheduled tasks with reasons
 * 
 * @param tasks - Array of tasks to schedule
 * @param freeSlots - Array of available time slots
 * @param options - Scheduler configuration options
 * @returns ScheduleResult with scheduled and unscheduled tasks
 * 
 * @example
 * const result = generateSchedule(
 *   [{ id: "1", title: "Code review", priority: "high", timeEstimate: 60, ... }],
 *   [{ start: "09:00", end: "12:00" }, { start: "14:00", end: "17:00" }],
 *   { mood: "Great" }
 * )
 */
export function generateSchedule(
    tasks: Task[],
    freeSlots: TimeSlot[],
    options: Partial<SchedulerOptions> = {}
): ScheduleResult {
    const opts: Required<SchedulerOptions> = { ...DEFAULT_OPTIONS, ...options }

    // Step 1: Filter schedulable tasks
    const { schedulable, excluded } = filterSchedulableTasks(tasks)

    // Step 2: Sort by weight
    let sortedTasks = sortByWeight(schedulable, opts.mood)

    // Step 2.5: Calculate capacity limit based on loadFactor
    const totalAvailableMinutes = freeSlots.reduce((sum, slot) => sum + getSlotDuration(slot), 0)
    const capacityLimit = Math.round(totalAvailableMinutes * opts.loadFactor)

    // Step 3: Schedule into slots with capacity limit
    const allScheduled: ScheduledTask[] = []
    let scheduledMinutes = 0

    // Sort slots by start time
    const sortedSlots = [...freeSlots].sort((a, b) =>
        timeToMinutes(a.start) - timeToMinutes(b.start)
    )

    for (const slot of sortedSlots) {
        // Skip slots that are too small
        if (getSlotDuration(slot) < opts.minSlotDuration) {
            continue
        }

        // Stop if we've hit our capacity limit
        if (scheduledMinutes >= capacityLimit) {
            break
        }

        // Limit this slot's scheduling to remaining capacity
        const remainingCapacity = capacityLimit - scheduledMinutes
        const { scheduled, remaining } = scheduleSlotWithCapacity(
            slot,
            sortedTasks,
            opts,
            remainingCapacity
        )

        allScheduled.push(...scheduled)
        scheduledMinutes += scheduled.reduce((sum, st) => sum + st.duration, 0)
        sortedTasks = remaining
    }

    // Step 4: Categorize unscheduled tasks
    const unscheduledTasks: UnscheduledTask[] = [
        ...excluded,
        ...sortedTasks.map(task => ({ task, reason: "no_fit" as const })),
    ]

    // Calculate statistics (totalAvailableMinutes already calculated above)
    const totalScheduledMinutes = allScheduled.reduce((sum, st) => sum + st.duration, 0)
    const totalUnscheduledMinutes = unscheduledTasks
        .filter(ut => ut.reason !== "completed")
        .reduce((sum, ut) => sum + ut.task.timeEstimate, 0)

    const utilizationPercent = totalAvailableMinutes > 0
        ? Math.round((totalScheduledMinutes / totalAvailableMinutes) * 100)
        : 0

    return {
        scheduledTasks: allScheduled,
        unscheduledTasks,
        totalScheduledMinutes,
        totalUnscheduledMinutes,
        utilizationPercent,
    }
}

/**
 * Converts scheduled tasks to the ScheduleItem format used by the existing app.
 */
export function toScheduleItems(scheduledTasks: ScheduledTask[]): Array<{
    time: string
    duration: number
    task: string
    priority: TaskPriority
    taskId: string
    type: "work"
}> {
    return scheduledTasks.map(st => ({
        time: st.startTime,
        duration: st.duration,
        task: st.task.title,
        priority: st.task.priority,
        taskId: st.taskId,
        type: "work" as const,
    }))
}

/**
 * Adds break blocks between scheduled tasks.
 * Useful for inserting rest periods.
 */
export function insertBreaks(
    scheduledTasks: ScheduledTask[],
    breakDuration: number = 15,
    breakLabel: string = "Break"
): Array<{
    time: string
    duration: number
    task: string
    priority: TaskPriority
    taskId?: string
    type: "work" | "break"
}> {
    const result: Array<{
        time: string
        duration: number
        task: string
        priority: TaskPriority
        taskId?: string
        type: "work" | "break"
    }> = []

    for (let i = 0; i < scheduledTasks.length; i++) {
        const st = scheduledTasks[i]

        // Add the task
        result.push({
            time: st.startTime,
            duration: st.duration,
            task: st.task.title,
            priority: st.task.priority,
            taskId: st.taskId,
            type: "work",
        })

        // Check if we should add a break after this task
        if (i < scheduledTasks.length - 1) {
            const nextTask = scheduledTasks[i + 1]
            const currentEndMinutes = timeToMinutes(st.endTime)
            const nextStartMinutes = timeToMinutes(nextTask.startTime)
            const gap = nextStartMinutes - currentEndMinutes

            // Only add break if there's enough gap and it's not already a scheduled break
            if (gap >= breakDuration) {
                result.push({
                    time: st.endTime,
                    duration: Math.min(gap, breakDuration),
                    task: breakLabel,
                    priority: "low",
                    type: "break",
                })
            }
        }
    }

    return result
}
