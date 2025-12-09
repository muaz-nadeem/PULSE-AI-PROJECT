/**
 * Domain Layer
 * 
 * This module exports all domain types and pure business logic functions.
 * The domain layer is independent of persistence, UI, and external services.
 * 
 * Usage:
 * ```typescript
 * import { Task, calculateStreak, sortTasksByPriority } from '@/lib/domain'
 * ```
 */

// =============================================================================
// Types
// =============================================================================
export * from "./types"

// =============================================================================
// Habit Logic
// =============================================================================
export {
  calculateStreak,
  isHabitCompletedOnDate,
  toggleHabitCompletionForDate,
  getHabitCompletionRate,
  getHabitsByTimePreference,
  getIncompleteHabitsForDate,
  getSchedulableHabits,
  sortHabitsByStreak,
  getTopStreakHabit,
  type StreakResult,
} from "./habit-logic"

// =============================================================================
// Goal Logic
// =============================================================================
export {
  calculateGoalProgress,
  shouldAutoCompleteGoal,
  generateGoalSuggestions,
  findRelatedTasks,
  addMilestoneToGoal,
  toggleMilestoneCompletion,
  removeMilestone,
  getGoalsByStatus,
  sortGoalsByProgress,
  getUpcomingGoals,
} from "./goal-logic"

// =============================================================================
// Task Logic
// =============================================================================
export {
  sortTasksByPriority,
  sortTasksByDueDate,
  sortTasksByCreatedDate,
  filterTasksForDate,
  normalizeDate,
  filterTasksByPriority,
  filterTasksByCompletion,
  getIncompleteTasks,
  getCompletedTasks,
  getFocusModeTasks,
  computeTaskCompletionRate,
  getHighPriorityIncompleteTasks,
  getTasksInDateRange,
  getTasksThisWeek,
  getTasksToday,
  calculateTotalTimeEstimate,
  groupTasksByCategory,
  getOverdueTasks,
} from "./task-logic"

// =============================================================================
// Analytics Logic
// =============================================================================
export {
  computeDistractionInsights,
  getDistractionsForDate,
  computeTotalFocusTime,
  computeAverageFocusDuration,
  getFocusSessionsInRange,
  getTodayFocusSessions,
  computeAnalyticsData,
  calculateFocusStreak,
  generateWeeklyReportData,
  generateMonthlyReportData,
  formatWeeklyReportSummary,
  formatMonthlyReportSummary,
  generateCSVExport,
} from "./analytics-logic"

// =============================================================================
// Achievement Logic
// =============================================================================
export {
  DEFAULT_ACHIEVEMENTS,
  checkUnlockedAchievements,
  mergeUnlockedAchievements,
  getUnlockedAchievements,
  getLockedAchievements,
  computeChallengeProgress,
  updateChallengeWithProgress,
  computeUserScore,
  generateLeaderboard,
  type AchievementContext,
  type ChallengeContext,
} from "./achievement-logic"

// =============================================================================
// Notification Logic
// =============================================================================
export {
  checkSmartNotificationsLogic,
  type SmartNotificationCheck,
  type SmartNotificationInput,
} from "./notification-logic"

// =============================================================================
// Voice Command Logic
// =============================================================================
export {
  parseVoiceCommand,
  isKnownVoiceCommand,
  type VoiceCommandIntent,
  type MoodType,
  type TaskPriority,
} from "./voice-command-logic"
