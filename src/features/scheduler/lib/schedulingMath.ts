/**
 * Scheduling Math Utilities
 * 
 * Pure functions for computing time slots and task weights.
 * No side effects, no external dependencies - just math.
 */

import type { Task, TaskPriority } from "@/lib/domain/types"

// =============================================================================
// Types
// =============================================================================

export interface TimeSlot {
    start: string  // HH:MM format
    end: string    // HH:MM format
}

export type MoodType = "Great" | "Good" | "Okay" | "Low" | "Bad"

// Priority multipliers for weight calculation
const PRIORITY_WEIGHTS: Record<TaskPriority, number> = {
    high: 3,
    medium: 2,
    low: 1,
}

// =============================================================================
// Time Utilities
// =============================================================================

/**
 * Converts a time string (HH:MM) to minutes since midnight.
 */
export function timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(":").map(Number)
    return hours * 60 + minutes
}

/**
 * Converts minutes since midnight to time string (HH:MM).
 */
export function minutesToTime(minutes: number): string {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
}

/**
 * Calculates free time slots given a day range and fixed events.
 * 
 * @param dayStart - Start of available day (e.g., "08:00")
 * @param dayEnd - End of available day (e.g., "22:00")
 * @param fixedEvents - Array of busy time slots
 * @returns Array of free time slots (gaps between busy periods)
 * 
 * @example
 * calculateFreeSlots("08:00", "18:00", [
 *   { start: "10:00", end: "11:00" },
 *   { start: "14:00", end: "15:00" }
 * ])
 * // Returns: [
 * //   { start: "08:00", end: "10:00" },
 * //   { start: "11:00", end: "14:00" },
 * //   { start: "15:00", end: "18:00" }
 * // ]
 */
export function calculateFreeSlots(
    dayStart: string,
    dayEnd: string,
    fixedEvents: TimeSlot[]
): TimeSlot[] {
    const dayStartMinutes = timeToMinutes(dayStart)
    const dayEndMinutes = timeToMinutes(dayEnd)

    // Handle empty events case
    if (fixedEvents.length === 0) {
        return [{ start: dayStart, end: dayEnd }]
    }

    // Convert events to minutes and sort by start time
    const eventMinutes = fixedEvents
        .map(event => ({
            start: timeToMinutes(event.start),
            end: timeToMinutes(event.end),
        }))
        .filter(event => event.end > dayStartMinutes && event.start < dayEndMinutes) // Only events within day
        .sort((a, b) => a.start - b.start)

    // Handle case where all events are outside day bounds
    if (eventMinutes.length === 0) {
        return [{ start: dayStart, end: dayEnd }]
    }

    // Merge overlapping events
    const mergedEvents: { start: number; end: number }[] = []
    for (const event of eventMinutes) {
        if (mergedEvents.length === 0) {
            mergedEvents.push({ ...event })
        } else {
            const lastEvent = mergedEvents[mergedEvents.length - 1]
            if (event.start <= lastEvent.end) {
                // Overlapping or adjacent - merge
                lastEvent.end = Math.max(lastEvent.end, event.end)
            } else {
                mergedEvents.push({ ...event })
            }
        }
    }

    // Find gaps between merged events
    const freeSlots: TimeSlot[] = []
    let cursor = dayStartMinutes

    for (const event of mergedEvents) {
        // Clamp event to day bounds
        const eventStart = Math.max(event.start, dayStartMinutes)
        const eventEnd = Math.min(event.end, dayEndMinutes)

        // If there's a gap before this event, add it as free slot
        if (cursor < eventStart) {
            freeSlots.push({
                start: minutesToTime(cursor),
                end: minutesToTime(eventStart),
            })
        }

        // Move cursor past this event
        cursor = Math.max(cursor, eventEnd)
    }

    // Check for remaining time after last event
    if (cursor < dayEndMinutes) {
        freeSlots.push({
            start: minutesToTime(cursor),
            end: dayEnd,
        })
    }

    return freeSlots
}

// =============================================================================
// Task Weight Calculation
// =============================================================================

/**
 * Checks if a date string represents today.
 * Expects YYYY-MM-DD format.
 */
function isToday(dateString: string | undefined): boolean {
    if (!dateString) return false
    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
    return dateString === todayStr
}

/**
 * Gets difficulty from task time estimate (1-5 scale).
 * Tasks with longer estimates are considered more difficult.
 */
function getTaskDifficulty(task: Task): number {
    const estimateMinutes = task.timeEstimate || 30
    if (estimateMinutes <= 15) return 1
    if (estimateMinutes <= 30) return 2
    if (estimateMinutes <= 60) return 3
    if (estimateMinutes <= 120) return 4
    return 5
}

/**
 * Computes a weight/priority score for a task based on multiple factors.
 * Higher weight = should be scheduled earlier/with more importance.
 * 
 * Formula:
 * - Base: priority * 10 (low=10, medium=20, high=30)
 * - Deadline bonus: +24 if due today
 * - Mood adjustment: ±(difficulty * 2) based on mood
 * - Minimum weight is 1
 * 
 * @param task - The task to score
 * @param mood - Current user mood
 * @returns Weight score (minimum 1)
 * 
 * @example
 * computeTaskWeight({ priority: "high", dueDate: "2024-01-15" }, "Great")
 * // Returns: 30 (high priority) + 24 (due today) + 6 (difficulty bonus) = 60
 */
export function computeTaskWeight(task: Task, mood: MoodType): number {
    // Base weight from priority
    let weight = PRIORITY_WEIGHTS[task.priority] * 10

    // Deadline bonus if due today
    if (isToday(task.dueDate)) {
        weight += 24
    }

    // Get task difficulty
    const difficulty = getTaskDifficulty(task)

    // Mood adjustment
    switch (mood) {
        case "Great":
            // Feeling great - boost difficult tasks (tackle them now!)
            weight += difficulty * 2
            break
        case "Low":
        case "Bad":
            // Feeling low - reduce weight of difficult tasks (do easier stuff)
            weight -= difficulty * 2
            break
        // "Good" and "Okay" have no adjustment
    }

    // Ensure minimum weight of 1
    return Math.max(1, weight)
}

/**
 * Sorts tasks by weight (descending - highest weight first).
 */
export function sortTasksByWeight(tasks: Task[], mood: MoodType): Task[] {
    return [...tasks].sort((a, b) =>
        computeTaskWeight(b, mood) - computeTaskWeight(a, mood)
    )
}

/**
 * Gets the total duration of a free slot in minutes.
 */
export function getSlotDuration(slot: TimeSlot): number {
    return timeToMinutes(slot.end) - timeToMinutes(slot.start)
}
