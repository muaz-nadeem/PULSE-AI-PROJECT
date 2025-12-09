/**
 * Notification Logic
 * 
 * Pure functions for determining smart notifications based on user context.
 * These functions do not dispatch notifications - they return data about
 * which notifications should be created.
 */

import type {
    FocusSession,
    Distraction,
    Goal,
    Task,
    Habit,
    Notification,
    NotificationType,
} from "./types"

// =============================================================================
// Types
// =============================================================================

/**
 * Represents a notification that should be created.
 */
export interface SmartNotificationCheck {
    type: NotificationType
    title: string
    message: string
    actionUrl?: string
}

/**
 * Input data required for checking smart notifications.
 */
export interface SmartNotificationInput {
    now: Date
    focusSessions: FocusSession[]
    distractions: Distraction[]
    goals: Goal[]
    tasks: Task[]
    habits: Habit[]
    existingNotifications: Notification[]
}

// =============================================================================
// Smart Notification Logic
// =============================================================================

/**
 * Checks for break suggestions based on recent focus sessions.
 * Suggests a break if the last session was 25-30 minutes ago and no break was taken.
 */
function checkBreakSuggestion(
    now: Date,
    focusSessions: FocusSession[],
    distractions: Distraction[]
): SmartNotificationCheck | null {
    if (focusSessions.length === 0) return null

    const lastSession = focusSessions[focusSessions.length - 1]
    const sessionTime = new Date(lastSession.date).getTime()
    const timeSinceSession = (now.getTime() - sessionTime) / (1000 * 60) // minutes

    if (timeSinceSession >= 25 && timeSinceSession < 30) {
        const hasRecentBreak = distractions.some((d) => {
            const distTime = new Date(d.date).getTime()
            return distTime > sessionTime && d.type === "other" && d.source.toLowerCase().includes("break")
        })

        if (!hasRecentBreak) {
            return {
                type: "suggestion",
                title: "Time for a Break!",
                message: "You've been focusing for a while. Take a 5-minute break to recharge.",
                actionUrl: "/dashboard",
            }
        }
    }

    return null
}

/**
 * Checks for recently completed milestones that should be celebrated.
 */
function checkMilestoneCelebrations(
    now: Date,
    goals: Goal[]
): SmartNotificationCheck[] {
    const notifications: SmartNotificationCheck[] = []

    goals.forEach((goal) => {
        const recentMilestones = goal.milestones.filter((m) => {
            if (!m.completedDate) return false
            const completedTime = new Date(m.completedDate).getTime()
            return now.getTime() - completedTime < 60000 // Within last minute
        })

        if (recentMilestones.length > 0) {
            notifications.push({
                type: "celebration",
                title: "Milestone Achieved! 🎉",
                message: `You completed "${recentMilestones[0].title}" for "${goal.title}"`,
                actionUrl: "/goals",
            })
        }
    })

    return notifications
}

/**
 * Checks for morning task reminder (at 9:00 AM).
 */
function checkMorningTaskReminder(
    now: Date,
    tasks: Task[]
): SmartNotificationCheck | null {
    const todayTasks = tasks.filter((t) => {
        if (t.completed) return false
        const taskDate = new Date(t.createdAt)
        return taskDate.toDateString() === now.toDateString()
    })

    if (todayTasks.length > 0 && now.getHours() === 9 && now.getMinutes() < 5) {
        return {
            type: "reminder",
            title: "Good Morning!",
            message: `You have ${todayTasks.length} task${todayTasks.length > 1 ? "s" : ""} to complete today.`,
            actionUrl: "/tasks",
        }
    }

    return null
}

/**
 * Gets the emoji for a habit category.
 */
function getCategoryEmoji(category?: string): string {
    switch (category) {
        case "health": return "💪"
        case "learning": return "📚"
        case "mindfulness": return "🧘"
        case "productivity": return "⚡"
        case "social": return "👥"
        default: return "✨"
    }
}

/**
 * Checks for habit reminders based on scheduled or preferred times.
 */
function checkHabitReminders(
    now: Date,
    habits: Habit[],
    existingNotifications: Notification[]
): SmartNotificationCheck[] {
    const notifications: SmartNotificationCheck[] = []
    const todayStr = now.toISOString().split("T")[0]
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()

    habits.forEach((habit) => {
        // Skip if not auto-scheduled or already completed today
        if (habit.autoSchedule === false) return
        if (habit.completedDates.includes(todayStr)) return

        let isDue = false
        let isOverdue = false
        let timeWindowMessage = ""

        if (habit.scheduledTime) {
            // Use AI-scheduled time
            const [schedHour, schedMinute] = habit.scheduledTime.split(":").map(Number)
            const minutesUntil = (schedHour * 60 + schedMinute) - (currentHour * 60 + currentMinute)

            if (minutesUntil <= 5 && minutesUntil >= 0) {
                isDue = true
                timeWindowMessage = "starting now"
            } else if (minutesUntil < 0 && minutesUntil > -60) {
                isOverdue = true
                timeWindowMessage = `${Math.abs(minutesUntil)} min overdue`
            }
        } else if (habit.preferredTime) {
            // Use preferred time windows
            const timeWindows: Record<string, { start: number; end: number; label: string }> = {
                morning: { start: 6, end: 11, label: "morning" },
                afternoon: { start: 12, end: 17, label: "afternoon" },
                evening: { start: 18, end: 22, label: "evening" },
            }

            const window = timeWindows[habit.preferredTime]
            if (window) {
                if (currentHour === window.start && currentMinute <= 5) {
                    isDue = true
                    timeWindowMessage = `${window.label} window starting`
                } else if (currentHour >= window.end) {
                    isOverdue = true
                    timeWindowMessage = `${window.label} window passed`
                }
            }
        }

        // Check if we already sent a notification for this habit recently
        const recentHabitNotification = existingNotifications.some((n) => {
            const notifTime = new Date(n.timestamp).getTime()
            return (
                n.title.includes(habit.name) &&
                now.getTime() - notifTime < 30 * 60 * 1000 // Within last 30 minutes
            )
        })

        if (isDue && !recentHabitNotification) {
            const categoryEmoji = getCategoryEmoji(habit.category)
            notifications.push({
                type: "reminder",
                title: `${categoryEmoji} Time for ${habit.name}!`,
                message: habit.currentStreak > 0
                    ? `Keep your ${habit.currentStreak}-day streak going! (${timeWindowMessage})`
                    : `${habit.duration || 15} minutes - ${timeWindowMessage}`,
                actionUrl: "/habits",
            })
        } else if (isOverdue && !recentHabitNotification) {
            notifications.push({
                type: "suggestion",
                title: `Don't forget: ${habit.name}`,
                message: habit.currentStreak > 0
                    ? `⚠️ Your ${habit.currentStreak}-day streak is at risk! (${timeWindowMessage})`
                    : `You still have time to complete this habit. (${timeWindowMessage})`,
                actionUrl: "/habits",
            })
        }
    })

    return notifications
}

/**
 * Checks for streak milestone celebrations.
 */
function checkStreakCelebrations(
    now: Date,
    habits: Habit[],
    existingNotifications: Notification[]
): SmartNotificationCheck[] {
    const notifications: SmartNotificationCheck[] = []
    const todayStr = now.toISOString().split("T")[0]
    const streakMilestones = [7, 14, 21, 30, 60, 90, 100, 365]

    habits.forEach((habit) => {
        const justCompleted = habit.completedDates.includes(todayStr)

        if (justCompleted && streakMilestones.includes(habit.currentStreak)) {
            const recentStreakNotif = existingNotifications.some((n) => {
                const notifTime = new Date(n.timestamp).getTime()
                return (
                    n.title.includes("Streak") &&
                    n.title.includes(habit.name) &&
                    now.getTime() - notifTime < 24 * 60 * 60 * 1000 // Within last 24 hours
                )
            })

            if (!recentStreakNotif) {
                notifications.push({
                    type: "celebration",
                    title: `🔥 ${habit.currentStreak}-Day Streak!`,
                    message: `Amazing! You've maintained "${habit.name}" for ${habit.currentStreak} days in a row!`,
                    actionUrl: "/habits",
                })
            }
        }
    })

    return notifications
}

/**
 * Computes all smart notifications that should be created based on user context.
 * This is a pure function that returns notification data without side effects.
 * 
 * @param input - All data needed to determine notifications
 * @returns Array of notifications that should be created
 */
export function checkSmartNotificationsLogic(
    input: SmartNotificationInput
): SmartNotificationCheck[] {
    const { now, focusSessions, distractions, goals, tasks, habits, existingNotifications } = input
    const notifications: SmartNotificationCheck[] = []

    // Break suggestion
    const breakNotif = checkBreakSuggestion(now, focusSessions, distractions)
    if (breakNotif) {
        notifications.push(breakNotif)
    }

    // Milestone celebrations
    notifications.push(...checkMilestoneCelebrations(now, goals))

    // Morning task reminder
    const morningNotif = checkMorningTaskReminder(now, tasks)
    if (morningNotif) {
        notifications.push(morningNotif)
    }

    // Habit reminders
    notifications.push(...checkHabitReminders(now, habits, existingNotifications))

    // Streak celebrations
    notifications.push(...checkStreakCelebrations(now, habits, existingNotifications))

    return notifications
}
