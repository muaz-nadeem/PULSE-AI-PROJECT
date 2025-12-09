/**
 * Achievement Logic
 * 
 * Pure functions for checking achievements, computing challenge progress,
 * and generating leaderboard data.
 */

import type {
  Achievement,
  Challenge,
  ChallengeMetric,
  FocusSession,
  Task,
  Habit,
  Goal,
} from "./types"

/**
 * Context needed for checking achievements.
 */
export interface AchievementContext {
  focusSessions: FocusSession[]
  tasks: Task[]
  habits: Habit[]
  goals: Goal[]
  streakDays: number
}

/**
 * Context needed for computing challenge progress.
 */
export interface ChallengeContext {
  focusSessions: FocusSession[]
  tasks: Task[]
  habits: Habit[]
  goals: Goal[]
}

/**
 * Default achievement definitions.
 */
export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_focus",
    title: "First Focus",
    description: "Complete your first focus session",
    icon: "🎯",
    category: "focus",
  },
  {
    id: "focus_master",
    title: "Focus Master",
    description: "Complete 10 focus sessions",
    icon: "🔥",
    category: "focus",
  },
  {
    id: "task_warrior",
    title: "Task Warrior",
    description: "Complete 50 tasks",
    icon: "⚔️",
    category: "tasks",
  },
  {
    id: "habit_hero",
    title: "Habit Hero",
    description: "Maintain a 7-day streak on any habit",
    icon: "💪",
    category: "habits",
  },
  {
    id: "goal_getter",
    title: "Goal Getter",
    description: "Complete your first goal",
    icon: "🏆",
    category: "goals",
  },
  {
    id: "streak_king",
    title: "Streak King",
    description: "Maintain a 30-day focus streak",
    icon: "👑",
    category: "streaks",
  },
  {
    id: "milestone_master",
    title: "Milestone Master",
    description: "Complete 10 milestones",
    icon: "⭐",
    category: "milestones",
  },
]

/**
 * Checks which achievements should be unlocked based on current context.
 * Returns only newly unlocked achievements (those that weren't already unlocked).
 * 
 * @param achievements - Current achievements (with their unlocked status)
 * @param context - Current application state context
 * @returns Array of achievements that should be newly unlocked
 */
export function checkUnlockedAchievements(
  achievements: Achievement[],
  context: AchievementContext
): Achievement[] {
  const unlocked: Achievement[] = []
  const now = new Date()

  // Check focus achievements
  if (context.focusSessions.length >= 1) {
    const achievement = achievements.find((a) => a.id === "first_focus" && !a.unlockedAt)
    if (achievement) {
      unlocked.push({ ...achievement, unlockedAt: now })
    }
  }

  if (context.focusSessions.length >= 10) {
    const achievement = achievements.find((a) => a.id === "focus_master" && !a.unlockedAt)
    if (achievement) {
      unlocked.push({ ...achievement, unlockedAt: now })
    }
  }

  // Check task achievements
  const completedTasks = context.tasks.filter((t) => t.completed).length
  if (completedTasks >= 50) {
    const achievement = achievements.find((a) => a.id === "task_warrior" && !a.unlockedAt)
    if (achievement) {
      unlocked.push({ ...achievement, unlockedAt: now })
    }
  }

  // Check habit achievements
  const maxHabitStreak = Math.max(...context.habits.map((h) => h.currentStreak), 0)
  if (maxHabitStreak >= 7) {
    const achievement = achievements.find((a) => a.id === "habit_hero" && !a.unlockedAt)
    if (achievement) {
      unlocked.push({ ...achievement, unlockedAt: now })
    }
  }

  // Check goal achievements
  const completedGoals = context.goals.filter((g) => g.status === "completed").length
  if (completedGoals >= 1) {
    const achievement = achievements.find((a) => a.id === "goal_getter" && !a.unlockedAt)
    if (achievement) {
      unlocked.push({ ...achievement, unlockedAt: now })
    }
  }

  // Check streak achievements
  if (context.streakDays >= 30) {
    const achievement = achievements.find((a) => a.id === "streak_king" && !a.unlockedAt)
    if (achievement) {
      unlocked.push({ ...achievement, unlockedAt: now })
    }
  }

  // Check milestone achievements
  const totalMilestones = context.goals.reduce((sum, g) => {
    return sum + g.milestones.filter((m) => m.completed).length
  }, 0)
  if (totalMilestones >= 10) {
    const achievement = achievements.find((a) => a.id === "milestone_master" && !a.unlockedAt)
    if (achievement) {
      unlocked.push({ ...achievement, unlockedAt: now })
    }
  }

  return unlocked
}

/**
 * Merges newly unlocked achievements into the achievements array.
 * 
 * @param achievements - Current achievements
 * @param unlocked - Newly unlocked achievements
 * @returns Updated achievements array
 */
export function mergeUnlockedAchievements(
  achievements: Achievement[],
  unlocked: Achievement[]
): Achievement[] {
  return achievements.map((a) => {
    const unlockedAchievement = unlocked.find((u) => u.id === a.id)
    return unlockedAchievement || a
  })
}

/**
 * Gets all unlocked achievements.
 * 
 * @param achievements - Array of achievements
 * @returns Array of unlocked achievements
 */
export function getUnlockedAchievements(achievements: Achievement[]): Achievement[] {
  return achievements.filter((a) => a.unlockedAt !== undefined)
}

/**
 * Gets all locked achievements.
 * 
 * @param achievements - Array of achievements
 * @returns Array of locked achievements
 */
export function getLockedAchievements(achievements: Achievement[]): Achievement[] {
  return achievements.filter((a) => a.unlockedAt === undefined)
}

// =============================================================================
// Challenge Progress
// =============================================================================

/**
 * Computes the current progress for a challenge.
 * 
 * @param challenge - The challenge to compute progress for
 * @param context - Current application state context
 * @returns Current progress value
 */
export function computeChallengeProgress(
  challenge: Challenge,
  context: ChallengeContext
): number {
  switch (challenge.metric) {
    case "focus_sessions":
      return countFocusSessionsInPeriod(
        context.focusSessions,
        challenge.startDate,
        challenge.endDate
      )

    case "tasks_completed":
      return countCompletedTasksInPeriod(
        context.tasks,
        challenge.startDate,
        challenge.endDate
      )

    case "habits_streak":
      return Math.max(...context.habits.map((h) => h.currentStreak), 0)

    case "goals_progress":
      return computeAverageGoalProgress(context.goals)

    default:
      return 0
  }
}

/**
 * Counts focus sessions within a date range.
 */
function countFocusSessionsInPeriod(
  sessions: FocusSession[],
  startDate: Date,
  endDate: Date
): number {
  return sessions.filter((s) => {
    const sessionDate = new Date(s.date)
    sessionDate.setHours(0, 0, 0, 0)
    return sessionDate >= startDate && sessionDate <= endDate
  }).length
}

/**
 * Counts completed tasks within a date range.
 */
function countCompletedTasksInPeriod(
  tasks: Task[],
  startDate: Date,
  endDate: Date
): number {
  return tasks.filter((t) => {
    if (!t.completed) return false
    const taskDate = new Date(t.createdAt)
    taskDate.setHours(0, 0, 0, 0)
    return taskDate >= startDate && taskDate <= endDate
  }).length
}

/**
 * Computes average goal progress.
 */
function computeAverageGoalProgress(goals: Goal[]): number {
  if (goals.length === 0) return 0
  const totalProgress = goals.reduce((sum, g) => sum + g.progress, 0)
  return Math.round(totalProgress / goals.length)
}

/**
 * Updates a challenge with new progress and completion status.
 * 
 * @param challenge - Challenge to update
 * @param context - Current context
 * @returns Updated challenge object
 */
export function updateChallengeWithProgress(
  challenge: Challenge,
  context: ChallengeContext
): Challenge {
  const current = computeChallengeProgress(challenge, context)
  const completed = current >= challenge.target

  return {
    ...challenge,
    current,
    completed,
  }
}

// =============================================================================
// Leaderboard
// =============================================================================

/**
 * Computes a user score for leaderboard ranking.
 * 
 * @param context - User's context data
 * @returns Computed score
 */
export function computeUserScore(context: ChallengeContext): number {
  const focusPoints = context.focusSessions.length * 10
  const taskPoints = context.tasks.filter((t) => t.completed).length * 5
  const habitPoints = context.habits.reduce((sum, h) => sum + h.currentStreak, 0) * 3
  const goalPoints = context.goals.filter((g) => g.status === "completed").length * 50

  return focusPoints + taskPoints + habitPoints + goalPoints
}

/**
 * Generates a simulated leaderboard (for demo purposes).
 * In production, this would fetch from the server.
 * 
 * @param userScore - Current user's score
 * @returns Array of leaderboard entries
 */
export function generateLeaderboard(
  userScore: number
): { userId: string; score: number; rank: number }[] {
  return [
    { userId: "you", score: userScore, rank: 1 },
    { userId: "user2", score: Math.max(0, userScore - 50), rank: 2 },
    { userId: "user3", score: Math.max(0, userScore - 100), rank: 3 },
  ]
}
