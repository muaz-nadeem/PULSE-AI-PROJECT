/**
 * Habit Logic
 * 
 * Pure functions for habit-related calculations including streak computation,
 * completion tracking, and habit analytics.
 */

import type { Habit } from "./types"

/**
 * Result of streak calculation
 */
export interface StreakResult {
  currentStreak: number
  longestStreak: number
}

/**
 * Calculates current and longest streaks from completed dates.
 * 
 * @param completedDates - Array of ISO date strings (YYYY-MM-DD) when habit was completed
 * @param referenceDate - The date to calculate streak from (defaults to today)
 * @returns Object containing current and longest streak values
 * 
 * @example
 * const result = calculateStreak(['2024-01-01', '2024-01-02', '2024-01-03'], new Date('2024-01-03'))
 * // result = { currentStreak: 3, longestStreak: 3 }
 */
export function calculateStreak(
  completedDates: string[],
  referenceDate: Date = new Date()
): StreakResult {
  if (completedDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 }
  }

  // Convert reference date to YYYY-MM-DD string to avoid timezone issues
  const todayStr = formatDateToYYYYMMDD(referenceDate)

  // Sort dates in descending order (most recent first)
  const sortedDates = [...completedDates].sort().reverse()

  // Calculate current streak - check consecutive days starting from today
  let currentStreak = 0
  let checkDateStr = todayStr

  for (const dateStr of sortedDates) {
    if (dateStr === checkDateStr) {
      currentStreak++
      checkDateStr = getPreviousDateStr(checkDateStr)
    } else {
      break
    }
  }

  // Calculate longest streak
  let longestStreak = 0
  let tempStreak = 0
  let prevDateStr: string | null = null

  // Sort ascending for longest streak calculation
  const ascendingDates = [...completedDates].sort()

  for (const dateStr of ascendingDates) {
    if (prevDateStr === null) {
      tempStreak = 1
    } else {
      const expectedNext = getNextDateStr(prevDateStr)
      if (dateStr === expectedNext) {
        tempStreak++
      } else {
        longestStreak = Math.max(longestStreak, tempStreak)
        tempStreak = 1
      }
    }
    prevDateStr = dateStr
  }
  longestStreak = Math.max(longestStreak, tempStreak)

  return { currentStreak, longestStreak }
}

/**
 * Formats a Date to YYYY-MM-DD string in local timezone.
 */
function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Gets the previous day's date string.
 */
function getPreviousDateStr(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day - 1)
  return formatDateToYYYYMMDD(date)
}

/**
 * Gets the next day's date string.
 */
function getNextDateStr(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day + 1)
  return formatDateToYYYYMMDD(date)
}

/**
 * Checks if a habit was completed on a specific date.
 * 
 * @param habit - The habit to check
 * @param date - ISO date string (YYYY-MM-DD) to check
 * @returns True if habit was completed on that date
 */
export function isHabitCompletedOnDate(habit: Habit, date: string): boolean {
  return habit.completedDates.includes(date)
}

/**
 * Toggles habit completion for a specific date and returns updated completion data.
 * 
 * @param completedDates - Current array of completed date strings
 * @param date - The date to toggle (YYYY-MM-DD format)
 * @param referenceDate - Reference date for streak calculation (defaults to today)
 * @returns Object with new completedDates array and updated streak values
 */
export function toggleHabitCompletionForDate(
  completedDates: string[],
  date: string,
  referenceDate: Date = new Date()
): {
  completedDates: string[]
  currentStreak: number
  longestStreak: number
} {
  const isCompleted = completedDates.includes(date)
  
  const newCompletedDates = isCompleted
    ? completedDates.filter((d) => d !== date)
    : [...completedDates, date].sort()

  const streakResult = calculateStreak(newCompletedDates, referenceDate)

  return {
    completedDates: newCompletedDates,
    ...streakResult,
  }
}

/**
 * Calculates the completion rate for a habit over a specified number of days.
 * 
 * @param habit - The habit to analyze
 * @param days - Number of days to look back (default: 30)
 * @param referenceDate - The date to calculate from (defaults to today)
 * @returns Completion rate as a decimal (0-1)
 */
export function getHabitCompletionRate(
  habit: Habit,
  days: number = 30,
  referenceDate: Date = new Date()
): number {
  const todayStr = formatDateToYYYYMMDD(referenceDate)
  const createdAtStr = formatDateToYYYYMMDD(habit.createdAt)

  let completedCount = 0
  let relevantDays = 0
  let checkDateStr = todayStr

  for (let i = 0; i < days; i++) {
    // Don't count days before the habit was created
    if (checkDateStr < createdAtStr) {
      break
    }

    relevantDays++

    if (habit.completedDates.includes(checkDateStr)) {
      completedCount++
    }

    checkDateStr = getPreviousDateStr(checkDateStr)
  }

  return relevantDays > 0 ? completedCount / relevantDays : 0
}

/**
 * Gets habits that are due for a specific time window.
 * 
 * @param habits - Array of habits to filter
 * @param timeWindow - Time preference to filter by
 * @returns Filtered array of habits
 */
export function getHabitsByTimePreference(
  habits: Habit[],
  timeWindow: "morning" | "afternoon" | "evening"
): Habit[] {
  return habits.filter((habit) => habit.preferredTime === timeWindow)
}

/**
 * Gets habits that are not yet completed for today.
 * 
 * @param habits - Array of habits
 * @param today - Today's date string (YYYY-MM-DD)
 * @returns Array of incomplete habits for today
 */
export function getIncompleteHabitsForDate(
  habits: Habit[],
  today: string
): Habit[] {
  return habits.filter((habit) => !habit.completedDates.includes(today))
}

/**
 * Gets habits that should be auto-scheduled.
 * 
 * @param habits - Array of habits
 * @returns Array of habits with autoSchedule enabled (or undefined, which defaults to true)
 */
export function getSchedulableHabits(habits: Habit[]): Habit[] {
  return habits.filter((habit) => habit.autoSchedule !== false)
}

/**
 * Sorts habits by streak (highest first).
 * 
 * @param habits - Array of habits to sort
 * @returns New sorted array
 */
export function sortHabitsByStreak(habits: Habit[]): Habit[] {
  return [...habits].sort((a, b) => b.currentStreak - a.currentStreak)
}

/**
 * Gets the habit with the longest current streak.
 * 
 * @param habits - Array of habits
 * @returns The habit with the highest streak, or null if no habits
 */
export function getTopStreakHabit(habits: Habit[]): Habit | null {
  if (habits.length === 0) return null
  return habits.reduce((top, habit) => 
    habit.currentStreak > top.currentStreak ? habit : top
  )
}
