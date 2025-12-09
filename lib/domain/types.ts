/**
 * Domain Types
 * 
 * This file contains all core domain model interfaces for the PULSE-AI application.
 * These types represent the business entities and are independent of any
 * persistence or UI concerns.
 */

// =============================================================================
// Core Task Types
// =============================================================================

export type TaskPriority = "high" | "medium" | "low"

export interface Task {
  id: string
  title: string
  description?: string
  priority: TaskPriority
  timeEstimate: number
  completed: boolean
  createdAt: Date
  category?: string
  dueDate?: string
  focusMode?: boolean
}

// =============================================================================
// Goal and Milestone Types
// =============================================================================

export type GoalStatus = "active" | "completed" | "paused"

export interface Milestone {
  id: string
  title: string
  description?: string
  completed: boolean
  dueDate?: string
  completedDate?: string
  order: number
}

export interface Goal {
  id: string
  title: string
  description?: string
  category: string
  targetDate?: string
  createdAt: Date
  milestones: Milestone[]
  progress: number // 0-100
  status: GoalStatus
  color: string
}

// =============================================================================
// Habit Types
// =============================================================================

export type HabitFrequency = "daily" | "weekly"
export type HabitTimePreference = "morning" | "afternoon" | "evening"
export type HabitCategory = "health" | "learning" | "mindfulness" | "productivity" | "social" | "other"

export interface Habit {
  id: string
  name: string
  description?: string
  frequency: HabitFrequency
  color: string
  createdAt: Date
  completedDates: string[] // ISO date strings (YYYY-MM-DD)
  currentStreak: number
  longestStreak: number
  // AI Scheduling fields
  preferredTime?: HabitTimePreference | string // "morning", "afternoon", "evening" or specific "HH:MM"
  duration?: number // estimated minutes (default 15)
  autoSchedule?: boolean // include in AI schedule (default true)
  category?: HabitCategory
  linkedGoalId?: string // optional link to a goal
  scheduledTime?: string // today's scheduled time from AI (HH:MM format)
}

// =============================================================================
// Focus Session Types
// =============================================================================

export interface FocusSession {
  id: string
  duration: number
  date: Date
  completed: boolean
}

// =============================================================================
// Distraction Types
// =============================================================================

export type DistractionType = "app" | "website" | "notification" | "phone" | "person" | "thought" | "other"

export interface Distraction {
  id: string
  type: DistractionType
  source: string
  duration: number // minutes
  date: Date
  focusSessionId?: string
  notes?: string
}

export interface DistractionInsights {
  topSources: { source: string; count: number }[]
  totalTime: number
  patterns: string[]
}

// =============================================================================
// Challenge and Achievement Types
// =============================================================================

export type ChallengeType = "weekly" | "monthly"
export type ChallengeMetric = "focus_sessions" | "tasks_completed" | "habits_streak" | "goals_progress"
export type AchievementCategory = "focus" | "tasks" | "habits" | "goals" | "streaks" | "milestones"

export interface Challenge {
  id: string
  title: string
  description: string
  type: ChallengeType
  startDate: Date
  endDate: Date
  target: number
  current: number
  metric: ChallengeMetric
  reward: string
  completed: boolean
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlockedAt?: Date
  category: AchievementCategory
}

// =============================================================================
// Analytics Types
// =============================================================================

export interface AnalyticsData {
  totalFocusHours: number
  totalFocusTime: number
  tasksCompletedToday: number
  tasksCompletedThisWeek: number
  averageFocusTime: number
  streakDays: number
  tasksCompleted: number
  focusSessions: FocusSession[]
}

export interface WeeklyReportData {
  focusSessions: number
  focusTime: number
  tasksCompleted: number
  tasksTotal: number
  habitsActive: number
  goalsActive: number
  distractions: number
}

export interface MonthlyReportData {
  focusSessions: number
  focusTime: number
  tasksCompleted: number
  tasksTotal: number
  habitsActive: number
  goalsCompleted: number
  achievements: number
  challengesCompleted: number
}

// =============================================================================
// User Settings Types
// =============================================================================

export type ThemeMode = "light" | "dark"
export type BlockingMode = "strict" | "standard" | "relaxed"

export interface UserSettings {
  focusDuration: number
  breakDuration: number
  dailyGoal: number
  theme: ThemeMode
  soundEnabled: boolean
}

export interface BlockingSettings {
  blockingMode: BlockingMode
  blockedApps: string[]
}

// =============================================================================
// Mood Types
// =============================================================================

export type MoodLevel = "excellent" | "good" | "neutral" | "sad" | "very-sad"

export interface MoodEntry {
  id: string
  mood: MoodLevel
  notes: string
  date: Date
}

// =============================================================================
// Schedule Types
// =============================================================================

export type ScheduleItemType = "work" | "break" | "meeting" | "habit"

export interface ScheduleItem {
  time: string // HH:MM format
  duration: number // minutes
  task: string
  priority: TaskPriority
  taskId?: string
  habitId?: string // reference to habit if type is 'habit'
  type?: ScheduleItemType
}

export interface TimeBlock {
  id: string
  title: string
  startTime: string // HH:mm format
  endTime: string // HH:mm format
  date: string // YYYY-MM-DD format
  taskId?: string
  color: string
  notes?: string
}

// =============================================================================
// AI Plan Types
// =============================================================================

export type AIPlanStatus = "pending" | "accepted" | "rejected" | "edited" | "expired"

export interface AIPlan {
  id: string
  plan_date: string
  schedule: ScheduleItem[]
  explanation: string | null
  reasoning: Record<string, unknown> | null
  status: AIPlanStatus
  generated_at: string
}

export interface UserAIProfile {
  optimal_focus_duration: number
  preferred_work_start_hour: number
  preferred_work_end_hour: number
  most_productive_hours: number[]
  avg_plan_acceptance_rate: number
}

// =============================================================================
// Sound/Playlist Types
// =============================================================================

export type SoundType = "white_noise" | "ambient" | "nature" | "focus" | "custom"

export interface SoundPreset {
  id: string
  name: string
  type: SoundType
  url?: string
  icon: string
}

export interface Playlist {
  id: string
  name: string
  sounds: string[] // Sound preset IDs
  createdAt: Date
}

// =============================================================================
// Team/Collaboration Types
// =============================================================================

export type TeamRole = "partner" | "mentor" | "teammate"

export interface TeamMember {
  id: string
  name: string
  email: string
  role: TeamRole
  joinedAt: Date
}

export interface SharedGoal {
  id: string
  goalId: string
  sharedWith: string[] // Team member IDs
  sharedAt: Date
  lastViewed?: Date
}

export interface GroupChallenge {
  id: string
  title: string
  description: string
  createdBy: string
  participants: string[]
  startDate: Date
  endDate: Date
  target: number
  metric: ChallengeMetric
  leaderboard: { userId: string; score: number }[]
}

// =============================================================================
// Notification Types
// =============================================================================

export type NotificationType = "reminder" | "break" | "celebration" | "suggestion" | "milestone"

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionUrl?: string
}

// =============================================================================
// Auth Types
// =============================================================================

export interface AuthState {
  isAuthenticated: boolean
  userEmail: string
}
