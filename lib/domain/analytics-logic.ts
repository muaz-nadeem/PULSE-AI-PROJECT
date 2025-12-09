/**
 * Analytics Logic
 * 
 * Pure functions for computing analytics, insights, and report data
 * from tasks, focus sessions, habits, and distractions.
 */

import type {
  Task,
  FocusSession,
  Distraction,
  Habit,
  Goal,
  DistractionInsights,
  AnalyticsData,
  WeeklyReportData,
  MonthlyReportData,
} from "./types"

// =============================================================================
// Distraction Analytics
// =============================================================================

/**
 * Computes insights from distractions including top sources, patterns, and time lost.
 * 
 * @param distractions - Array of distractions to analyze
 * @returns Distraction insights object
 */
export function computeDistractionInsights(distractions: Distraction[]): DistractionInsights {
  // Get top sources by frequency
  const sourceCounts: Record<string, number> = {}
  distractions.forEach((d) => {
    sourceCounts[d.source] = (sourceCounts[d.source] || 0) + 1
  })

  const topSources = Object.entries(sourceCounts)
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // Calculate total time lost
  const totalTime = distractions.reduce((sum, d) => sum + d.duration, 0)

  // Generate patterns/insights
  const patterns: string[] = []

  // Most common type
  const typeCounts: Record<string, number> = {}
  distractions.forEach((d) => {
    typeCounts[d.type] = (typeCounts[d.type] || 0) + 1
  })

  const sortedTypes = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])
  if (sortedTypes.length > 0) {
    patterns.push(
      `Most common distraction type: ${sortedTypes[0][0]} (${sortedTypes[0][1]} times)`
    )
  }

  // Average duration insight
  const avgDuration = distractions.length > 0 ? totalTime / distractions.length : 0
  if (avgDuration > 10) {
    patterns.push(
      `Average distraction duration is ${Math.round(avgDuration)} minutes - consider shorter breaks`
    )
  }

  // Top source insight
  if (topSources.length > 0) {
    patterns.push(
      `Top distraction source: ${topSources[0].source} (${topSources[0].count} times)`
    )
  }

  return { topSources, totalTime, patterns }
}

/**
 * Gets distractions for a specific date.
 * 
 * @param distractions - Array of distractions
 * @param date - Date to filter by
 * @returns Filtered array of distractions
 */
export function getDistractionsForDate(
  distractions: Distraction[],
  date: Date
): Distraction[] {
  const targetDate = new Date(date)
  targetDate.setHours(0, 0, 0, 0)

  return distractions.filter((d) => {
    const distDate = new Date(d.date)
    distDate.setHours(0, 0, 0, 0)
    return distDate.getTime() === targetDate.getTime()
  })
}

// =============================================================================
// Focus Session Analytics
// =============================================================================

/**
 * Computes total focus time from sessions.
 * 
 * @param sessions - Array of focus sessions
 * @returns Total time in minutes
 */
export function computeTotalFocusTime(sessions: FocusSession[]): number {
  return sessions.reduce((sum, s) => sum + s.duration, 0)
}

/**
 * Computes average focus session duration.
 * 
 * @param sessions - Array of focus sessions
 * @returns Average duration in minutes
 */
export function computeAverageFocusDuration(sessions: FocusSession[]): number {
  if (sessions.length === 0) return 0
  return computeTotalFocusTime(sessions) / sessions.length
}

/**
 * Gets focus sessions for a date range.
 * 
 * @param sessions - Array of focus sessions
 * @param startDate - Start of range
 * @param endDate - End of range
 * @returns Filtered array of sessions
 */
export function getFocusSessionsInRange(
  sessions: FocusSession[],
  startDate: Date,
  endDate: Date
): FocusSession[] {
  const start = new Date(startDate)
  start.setHours(0, 0, 0, 0)

  const end = new Date(endDate)
  end.setHours(23, 59, 59, 999)

  return sessions.filter((s) => {
    const sessionDate = new Date(s.date)
    return sessionDate >= start && sessionDate <= end
  })
}

/**
 * Gets focus sessions for today.
 * 
 * @param sessions - Array of focus sessions
 * @param referenceDate - Reference date (defaults to today)
 * @returns Sessions from today
 */
export function getTodayFocusSessions(
  sessions: FocusSession[],
  referenceDate: Date = new Date()
): FocusSession[] {
  return getFocusSessionsInRange(sessions, referenceDate, referenceDate)
}

// =============================================================================
// Analytics Data Computation
// =============================================================================

/**
 * Computes comprehensive analytics data from all user data.
 * 
 * @param tasks - All tasks
 * @param focusSessions - All focus sessions
 * @param referenceDate - Reference date for calculations
 * @returns Analytics data object
 */
export function computeAnalyticsData(
  tasks: Task[],
  focusSessions: FocusSession[],
  referenceDate: Date = new Date()
): AnalyticsData {
  const today = new Date(referenceDate)
  today.setHours(0, 0, 0, 0)

  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay())

  // Today's completed tasks
  const todayTasks = tasks.filter((t) => {
    const taskDate = new Date(t.createdAt)
    taskDate.setHours(0, 0, 0, 0)
    return taskDate.getTime() === today.getTime() && t.completed
  })

  // This week's completed tasks
  const weekTasks = tasks.filter((t) => {
    const taskDate = new Date(t.createdAt)
    taskDate.setHours(0, 0, 0, 0)
    return taskDate >= weekStart && taskDate <= today && t.completed
  })

  // Focus metrics
  const totalFocusMinutes = computeTotalFocusTime(focusSessions)
  const totalFocusHours = Math.round((totalFocusMinutes / 60) * 10) / 10
  const averageFocusTime = computeAverageFocusDuration(focusSessions)

  // Calculate streak (consecutive days with at least one focus session)
  const streakDays = calculateFocusStreak(focusSessions, referenceDate)

  return {
    totalFocusHours,
    totalFocusTime: totalFocusHours,
    tasksCompletedToday: todayTasks.length,
    tasksCompletedThisWeek: weekTasks.length,
    averageFocusTime: Math.round(averageFocusTime * 10) / 10,
    streakDays,
    tasksCompleted: tasks.filter((t) => t.completed).length,
    focusSessions,
  }
}

/**
 * Calculates the current focus session streak (consecutive days).
 * 
 * @param sessions - Array of focus sessions
 * @param referenceDate - Reference date
 * @returns Number of consecutive days with focus sessions
 */
export function calculateFocusStreak(
  sessions: FocusSession[],
  referenceDate: Date = new Date()
): number {
  if (sessions.length === 0) return 0

  // Get unique dates with sessions (using local date string)
  const sessionDates = new Set<string>()
  sessions.forEach((s) => {
    const date = new Date(s.date)
    sessionDates.add(formatDateToYYYYMMDD(date))
  })

  let streak = 0
  let checkDateStr = formatDateToYYYYMMDD(referenceDate)

  while (sessionDates.has(checkDateStr)) {
    streak++
    checkDateStr = getPreviousDateStr(checkDateStr)
  }

  return streak
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

// =============================================================================
// Report Generation
// =============================================================================

/**
 * Generates weekly report data.
 * 
 * @param tasks - All tasks
 * @param sessions - All focus sessions
 * @param habits - All habits
 * @param goals - All goals
 * @param distractions - All distractions
 * @param referenceDate - Reference date
 * @returns Weekly report data
 */
export function generateWeeklyReportData(
  tasks: Task[],
  sessions: FocusSession[],
  habits: Habit[],
  goals: Goal[],
  distractions: Distraction[],
  referenceDate: Date = new Date()
): WeeklyReportData {
  const today = new Date(referenceDate)
  today.setHours(0, 0, 0, 0)

  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay())

  // Filter data for this week
  const weekTasks = tasks.filter((t) => {
    const taskDate = new Date(t.createdAt)
    taskDate.setHours(0, 0, 0, 0)
    return taskDate >= weekStart && taskDate <= today
  })

  const weekSessions = getFocusSessionsInRange(sessions, weekStart, today)

  const weekDistractions = distractions.filter((d) => {
    const distDate = new Date(d.date)
    distDate.setHours(0, 0, 0, 0)
    return distDate >= weekStart && distDate <= today
  })

  return {
    focusSessions: weekSessions.length,
    focusTime: computeTotalFocusTime(weekSessions),
    tasksCompleted: weekTasks.filter((t) => t.completed).length,
    tasksTotal: weekTasks.length,
    habitsActive: habits.filter((h) => h.currentStreak > 0).length,
    goalsActive: goals.filter((g) => g.status === "active").length,
    distractions: weekDistractions.length,
  }
}

/**
 * Generates monthly report data.
 * 
 * @param tasks - All tasks
 * @param sessions - All focus sessions
 * @param habits - All habits
 * @param goals - All goals
 * @param achievements - All achievements (with unlockedAt dates)
 * @param challenges - All challenges
 * @param referenceDate - Reference date
 * @returns Monthly report data
 */
export function generateMonthlyReportData(
  tasks: Task[],
  sessions: FocusSession[],
  habits: Habit[],
  goals: Goal[],
  achievements: { unlockedAt?: Date }[],
  challenges: { completed: boolean }[],
  referenceDate: Date = new Date()
): MonthlyReportData {
  const today = new Date(referenceDate)
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

  // Filter data for this month
  const monthTasks = tasks.filter((t) => {
    const taskDate = new Date(t.createdAt)
    return taskDate >= monthStart && taskDate <= today
  })

  const monthSessions = getFocusSessionsInRange(sessions, monthStart, today)

  const focusTime = computeTotalFocusTime(monthSessions)

  return {
    focusSessions: monthSessions.length,
    focusTime: Math.round(focusTime / 60), // Convert to hours
    tasksCompleted: monthTasks.filter((t) => t.completed).length,
    tasksTotal: monthTasks.length,
    habitsActive: habits.filter((h) => h.currentStreak > 0).length,
    goalsCompleted: goals.filter((g) => g.status === "completed").length,
    achievements: achievements.filter((a) => a.unlockedAt).length,
    challengesCompleted: challenges.filter((c) => c.completed).length,
  }
}

/**
 * Generates a weekly report summary string.
 * 
 * @param data - Weekly report data
 * @param weekStart - Start date of the week
 * @param weekEnd - End date of the week
 * @returns Formatted summary string
 */
export function formatWeeklyReportSummary(
  data: WeeklyReportData,
  weekStart: Date,
  weekEnd: Date
): string {
  return `Weekly Report (${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()})
    
Focus Sessions: ${data.focusSessions}
Total Focus Time: ${data.focusTime} minutes
Tasks Completed: ${data.tasksCompleted} / ${data.tasksTotal}
Habits Maintained: ${data.habitsActive}
Goals Progress: ${data.goalsActive} active goals
Distractions: ${data.distractions}`
}

/**
 * Generates a monthly report summary string.
 * 
 * @param data - Monthly report data
 * @param monthStart - Start date of the month
 * @param monthEnd - End date of the month
 * @returns Formatted summary string
 */
export function formatMonthlyReportSummary(
  data: MonthlyReportData,
  monthStart: Date,
  monthEnd: Date
): string {
  return `Monthly Report (${monthStart.toLocaleDateString()} - ${monthEnd.toLocaleDateString()})
    
Focus Sessions: ${data.focusSessions}
Total Focus Time: ${data.focusTime} hours
Tasks Completed: ${data.tasksCompleted} / ${data.tasksTotal}
Habits Maintained: ${data.habitsActive}
Goals Completed: ${data.goalsCompleted}
Achievements Unlocked: ${data.achievements}
Challenges Completed: ${data.challengesCompleted}`
}

/**
 * Generates CSV export data from tasks and sessions.
 * 
 * @param tasks - All tasks
 * @param sessions - All focus sessions
 * @returns CSV string
 */
export function generateCSVExport(tasks: Task[], sessions: FocusSession[]): string {
  const headers = ["Date", "Focus Sessions", "Tasks Completed", "Habits Streak", "Goals Progress"]
  const rows: string[] = []

  // Group by date
  const dateMap: Record<string, { focusSessions: number; tasks: number }> = {}

  sessions.forEach((s) => {
    const date = new Date(s.date).toISOString().split("T")[0]
    if (!dateMap[date]) dateMap[date] = { focusSessions: 0, tasks: 0 }
    dateMap[date].focusSessions++
  })

  tasks.filter((t) => t.completed).forEach((t) => {
    const date = new Date(t.createdAt).toISOString().split("T")[0]
    if (!dateMap[date]) dateMap[date] = { focusSessions: 0, tasks: 0 }
    dateMap[date].tasks++
  })

  Object.entries(dateMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([date, data]) => {
      rows.push(`${date},${data.focusSessions},${data.tasks},0,0`)
    })

  return [headers.join(","), ...rows].join("\n")
}
