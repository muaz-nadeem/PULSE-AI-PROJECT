"use client"

import { create } from "zustand"

export interface Task {
  id: string
  title: string
  description?: string
  priority: "high" | "medium" | "low"
  timeEstimate: number
  completed: boolean
  createdAt: Date
  category?: string
  dueDate?: string
  focusMode?: boolean
}

export interface FocusSession {
  id: string
  duration: number
  date: Date
  completed: boolean
}

export interface Distraction {
  id: string
  type: "app" | "website" | "notification" | "phone" | "person" | "thought" | "other"
  source: string
  duration: number // minutes
  date: Date
  focusSessionId?: string
  notes?: string
}

export interface Challenge {
  id: string
  title: string
  description: string
  type: "weekly" | "monthly"
  startDate: Date
  endDate: Date
  target: number
  current: number
  metric: "focus_sessions" | "tasks_completed" | "habits_streak" | "goals_progress"
  reward: string
  completed: boolean
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlockedAt?: Date
  category: "focus" | "tasks" | "habits" | "goals" | "streaks" | "milestones"
}

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

export interface UserSettings {
  focusDuration: number
  breakDuration: number
  dailyGoal: number
  theme: "light" | "dark"
  soundEnabled: boolean
}

export interface BlockingSettings {
  blockingMode: "strict" | "standard" | "relaxed"
  blockedApps: string[]
}

export interface MoodEntry {
  id: string
  mood: "excellent" | "good" | "neutral" | "sad" | "very-sad"
  notes: string
  date: Date
}

export interface Habit {
  id: string
  name: string
  description?: string
  frequency: "daily" | "weekly"
  color: string
  createdAt: Date
  completedDates: string[] // ISO date strings
  currentStreak: number
  longestStreak: number
}

export interface ScheduleItem {
  time: string
  duration: number
  task: string
  priority: "high" | "medium" | "low"
  taskId?: string
  type?: "work" | "break" | "meeting"
}

// AI Plan types
export interface AIPlan {
  id: string
  plan_date: string
  schedule: ScheduleItem[]
  explanation: string | null
  reasoning: Record<string, unknown> | null
  status: "pending" | "accepted" | "rejected" | "edited" | "expired"
  generated_at: string
}

export interface UserAIProfile {
  optimal_focus_duration: number
  preferred_work_start_hour: number
  preferred_work_end_hour: number
  most_productive_hours: number[]
  avg_plan_acceptance_rate: number
}

export interface AcceptedSchedule {
  date: string // YYYY-MM-DD format
  schedule: ScheduleItem[]
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

export interface WeeklyClassSchedule {
  // Format: { [dayOfWeek]: { [timeSlot]: string } }
  // dayOfWeek: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"
  // timeSlot: "08:00-08:50" | "09:00-09:50" | etc.
  // value: class name or empty string
  schedule: Record<string, Record<string, string>>
  imageUrl?: string // If uploaded as image
}

export interface SoundPreset {
  id: string
  name: string
  type: "white_noise" | "ambient" | "nature" | "focus" | "custom"
  url?: string
  icon: string
}

export interface Playlist {
  id: string
  name: string
  sounds: string[] // Sound preset IDs
  createdAt: Date
}

export interface TeamMember {
  id: string
  name: string
  email: string
  role: "partner" | "mentor" | "teammate"
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
  metric: "focus_sessions" | "tasks_completed" | "habits_streak" | "goals_progress"
  leaderboard: { userId: string; score: number }[]
}

export interface Notification {
  id: string
  type: "reminder" | "break" | "celebration" | "suggestion" | "milestone"
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionUrl?: string
}

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
  status: "active" | "completed" | "paused"
  color: string
}

export interface AuthState {
  isAuthenticated: boolean
  userEmail: string
}

interface StoreState {
  // User data
  userName: string
  userGoals: string[]
  userData?: { name?: string; role?: string }
  userPreferences: UserSettings

  // Navigation
  currentPage: string
  isMobileMenuOpen: boolean
  setMobileMenuOpen: (isOpen: boolean) => void

  // Tasks
  tasks: Task[]
  addTask: (task: Omit<Task, "id" | "completed" | "createdAt">) => void
  deleteTask: (id: string) => void
  toggleTask: (id: string) => void
  updateTask: (id: string, updates: Partial<Task>) => void

  // Focus sessions
  focusSessions: FocusSession[]
  addFocusSession: (duration: number) => void

  // Distractions
  distractions: Distraction[]
  addDistraction: (distraction: Omit<Distraction, "id" | "date">) => void
  deleteDistraction: (id: string) => void
  getDistractionInsights: () => { topSources: { source: string; count: number }[]; totalTime: number; patterns: string[] }

  // Challenges
  challenges: Challenge[]
  achievements: Achievement[]
  addChallenge: (challenge: Omit<Challenge, "id" | "current" | "completed">) => void
  updateChallengeProgress: (challengeId: string) => void
  checkAchievements: () => void
  getUnlockedAchievements: () => Achievement[]
  getLeaderboard: () => { userId: string; score: number; rank: number }[]

  // Analytics
  analytics: AnalyticsData
  getAnalytics: () => AnalyticsData

  // Settings
  setSettings: (settings: Partial<UserSettings>) => void
  setUserData: (name: string, goals: string[], role?: string) => void

  // Blocking Settings
  blockingSettings: BlockingSettings
  setBlockingMode: (mode: "strict" | "standard" | "relaxed") => void
  addBlockedApp: (appName: string) => void
  removeBlockedApp: (appName: string) => void

  // Page navigation
  setCurrentPage: (page: string) => void

  // Mood tracking
  moodEntries: MoodEntry[]
  addMoodEntry: (mood: "excellent" | "good" | "neutral" | "sad" | "very-sad", notes: string) => void
  getMoodHistory: () => MoodEntry[]

  // Habits
  habits: Habit[]
  addHabit: (habit: Omit<Habit, "id" | "createdAt" | "completedDates" | "currentStreak" | "longestStreak">) => void
  deleteHabit: (id: string) => void
  toggleHabitCompletion: (habitId: string, date: string) => void
  getHabitStreak: (habitId: string) => number

  // Goals
  goals: Goal[]
  addGoal: (goal: Omit<Goal, "id" | "createdAt" | "progress" | "status">) => void
  deleteGoal: (id: string) => void
  updateGoal: (id: string, updates: Partial<Goal>) => void
  addMilestone: (goalId: string, milestone: Omit<Milestone, "id" | "order">) => void
  updateMilestone: (goalId: string, milestoneId: string, updates: Partial<Milestone>) => void
  deleteMilestone: (goalId: string, milestoneId: string) => void
  toggleMilestone: (goalId: string, milestoneId: string) => void
  getGoalProgress: (goalId: string) => number
  getAISuggestions: (goalId: string) => string[]

  // Schedule
  currentSchedule: ScheduleItem[]
  acceptedSchedules: AcceptedSchedule[]
  setCurrentSchedule: (schedule: ScheduleItem[]) => void
  acceptSchedule: (date?: string) => void
  getAcceptedSchedules: () => AcceptedSchedule[]
  getTodayAcceptedSchedule: () => ScheduleItem[] | null

  // Time Blocks
  timeBlocks: TimeBlock[]
  addTimeBlock: (block: Omit<TimeBlock, "id">) => void
  updateTimeBlock: (id: string, updates: Partial<TimeBlock>) => void
  deleteTimeBlock: (id: string) => void
  getTimeBlocksForDate: (date: string) => TimeBlock[]
  moveTimeBlock: (id: string, newDate: string, newStartTime: string) => void

  // Weekly Class Schedule
  weeklyClassSchedule: WeeklyClassSchedule | null
  setWeeklyClassSchedule: (schedule: WeeklyClassSchedule) => void
  getTodayClasses: () => Array<{ time: string; className: string }>

  // Focus Sounds
  soundPresets: SoundPreset[]
  playlists: Playlist[]
  currentPlaylist?: string
  addSoundPreset: (preset: Omit<SoundPreset, "id">) => void
  addPlaylist: (playlist: Omit<Playlist, "id" | "createdAt">) => void
  deletePlaylist: (id: string) => void
  setCurrentPlaylist: (id?: string) => void

  // Reports
  generateWeeklyReport: () => { summary: string; data: any }
  generateMonthlyReport: () => { summary: string; data: any }
  exportToCSV: () => string
  exportToPDF: () => void

  // Team/Collaboration
  teamMembers: TeamMember[]
  sharedGoals: SharedGoal[]
  groupChallenges: GroupChallenge[]
  addTeamMember: (member: Omit<TeamMember, "id" | "joinedAt">) => void
  shareGoal: (goalId: string, memberIds: string[]) => void
  createGroupChallenge: (challenge: Omit<GroupChallenge, "id" | "leaderboard">) => void
  getTeamProductivityInsights: () => { totalFocusTime: number; totalTasks: number; averageProgress: number }

  // Notifications
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void
  markNotificationRead: (id: string) => void
  clearNotifications: () => void
  getUnreadNotifications: () => Notification[]
  checkSmartNotifications: () => void

  // Voice Commands
  isVoiceActive: boolean
  setVoiceActive: (active: boolean) => void
  processVoiceCommand: (command: string) => void

  auth: AuthState
  setAuth: (isAuthenticated: boolean, userEmail?: string) => void
  logout: () => void

  // AI Features
  currentAIPlan: AIPlan | null
  userAIProfile: UserAIProfile | null
  aiPlanLoading: boolean
  aiPlanError: string | null
  setCurrentAIPlan: (plan: AIPlan | null) => void
  setUserAIProfile: (profile: UserAIProfile | null) => void
  setAIPlanLoading: (loading: boolean) => void
  setAIPlanError: (error: string | null) => void
  acceptAIPlan: () => void
  rejectAIPlan: () => void
}

export const useStore = create<StoreState>((set, get) => ({
  userName: "",
  userGoals: [],
  userData: undefined,
  userPreferences: {
    focusDuration: 25,
    breakDuration: 5,
    dailyGoal: 8,
    theme: "dark",
    soundEnabled: true,
  },

  currentPage: "dashboard",
  isMobileMenuOpen: false,
  setMobileMenuOpen: (isOpen) => set({ isMobileMenuOpen: isOpen }),
  blockingSettings: {
    blockingMode: "standard",
    blockedApps: ["Instagram", "TikTok", "YouTube"],
  },
  setBlockingMode: (mode) =>
    set((state) => ({
      blockingSettings: { ...state.blockingSettings, blockingMode: mode },
    })),
  addBlockedApp: (appName) =>
    set((state) => ({
      blockingSettings: {
        ...state.blockingSettings,
        blockedApps: [...state.blockingSettings.blockedApps, appName],
      },
    })),
  removeBlockedApp: (appName) =>
    set((state) => ({
      blockingSettings: {
        ...state.blockingSettings,
        blockedApps: state.blockingSettings.blockedApps.filter((app) => app !== appName),
      },
    })),
  tasks: [],
  focusSessions: [],
  distractions: [],
  challenges: [],
  achievements: [
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
  ],
  analytics: {
    totalFocusHours: 0,
    totalFocusTime: 0,
    tasksCompletedToday: 0,
    tasksCompletedThisWeek: 0,
    averageFocusTime: 0,
    streakDays: 0,
    tasksCompleted: 0,
    focusSessions: [],
  },
  moodEntries: [],
  habits: [],
  goals: [],
  currentSchedule: [],
  acceptedSchedules: [] as AcceptedSchedule[],
  timeBlocks: [],
  weeklyClassSchedule: null,
  soundPresets: [
    {
      id: "white_noise_1",
      name: "White Noise",
      type: "white_noise",
      icon: "🌊",
    },
    {
      id: "rain_1",
      name: "Rain",
      type: "nature",
      icon: "🌧️",
    },
    {
      id: "forest_1",
      name: "Forest",
      type: "nature",
      icon: "🌲",
    },
    {
      id: "coffee_1",
      name: "Coffee Shop",
      type: "ambient",
      icon: "☕",
    },
    {
      id: "ocean_1",
      name: "Ocean Waves",
      type: "nature",
      icon: "🌊",
    },
    {
      id: "focus_1",
      name: "Deep Focus",
      type: "focus",
      icon: "🎵",
    },
  ],
  playlists: [],
  currentPlaylist: undefined,
  teamMembers: [],
  sharedGoals: [],
  groupChallenges: [],
  notifications: [],
  isVoiceActive: false,

  auth: {
    isAuthenticated: false,
    userEmail: "",
  },

  // AI Features - Initial State
  currentAIPlan: null,
  userAIProfile: null,
  aiPlanLoading: false,
  aiPlanError: null,

  addTask: async (task) => {
    try {
      const api = await import("./api")
      // Prepare data for API - only send snake_case fields
      const apiData: any = {
        title: task.title,
        description: task.description || "",
        priority: task.priority,
        time_estimate: task.timeEstimate,
        category: task.category,
        focus_mode: task.focusMode || false,
      }

      // Convert dueDate to ISO string if provided
      if (task.dueDate) {
        // If it's already a string in YYYY-MM-DD format, convert to ISO datetime
        const dueDate = new Date(task.dueDate)
        if (!isNaN(dueDate.getTime())) {
          apiData.due_date = dueDate.toISOString()
        }
      }

      const created = (await api.tasksAPI.create(apiData)) as any

      // Add to store with proper field mapping
      set((state) => ({
        tasks: [
          ...state.tasks,
          {
            id: created.id,
            title: created.title,
            description: created.description || "",
            priority: created.priority,
            timeEstimate: created.time_estimate || 30,
            completed: created.completed || false,
            createdAt: new Date(created.created_at),
            category: created.category,
            dueDate: created.due_date ? new Date(created.due_date).toISOString().split("T")[0] : undefined,
            focusMode: created.focus_mode || false,
          },
        ],
      }))
    } catch (error) {
      console.error("Failed to create task in API:", error)
      // Still add to local state as fallback, but log the error
      set((state) => {
        const newTask = {
          ...task,
          id: Math.random().toString(36).substring(7),
          completed: false,
          createdAt: new Date(),
        }
        return {
          tasks: [...state.tasks, newTask],
        }
      })
    }
  },

  deleteTask: async (id) => {
    try {
      const api = await import("./api")
      await api.tasksAPI.delete(id)
    } catch (error) {
      console.error("Failed to delete task from API:", error)
    }
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    }))
  },

  toggleTask: async (id) => {
    const state = get()
    const task = state.tasks.find((t) => t.id === id)
    if (task) {
      try {
        const api = await import("./api")
        await api.tasksAPI.update(id, { completed: !task.completed })
      } catch (error) {
        console.error("Failed to update task in API:", error)
      }
    }
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    }))
  },

  updateTask: async (id, updates) => {
    try {
      const api = await import("./api")
      const apiUpdates: any = {}
      if (updates.timeEstimate !== undefined) apiUpdates.time_estimate = updates.timeEstimate
      if (updates.dueDate !== undefined) apiUpdates.due_date = updates.dueDate
      if (updates.focusMode !== undefined) apiUpdates.focus_mode = updates.focusMode
      if (updates.completed !== undefined) apiUpdates.completed = updates.completed
      if (updates.title !== undefined) apiUpdates.title = updates.title
      if (updates.description !== undefined) apiUpdates.description = updates.description
      if (updates.priority !== undefined) apiUpdates.priority = updates.priority
      if (updates.category !== undefined) apiUpdates.category = updates.category

      await api.tasksAPI.update(id, apiUpdates)
    } catch (error) {
      console.error("Failed to update task in API:", error)
    }
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }))
  },

  addFocusSession: async (duration) => {
    try {
      const api = await import("./api")
      await api.focusSessionsAPI.create({ duration, completed: true })
    } catch (error) {
      console.error("Failed to create focus session in API:", error)
    }

    set((state) => {
      const newSession: FocusSession = {
        id: Math.random().toString(36).substring(7),
        duration,
        date: new Date(),
        completed: true,
      }

      const updatedSessions = [...state.focusSessions, newSession]

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const todaySessions = updatedSessions.filter((s) => {
        const sessionDate = new Date(s.date)
        sessionDate.setHours(0, 0, 0, 0)
        return sessionDate.getTime() === today.getTime()
      })

      const thisWeekStart = new Date(today)
      thisWeekStart.setDate(today.getDate() - today.getDay())

      const weekTasks = state.tasks.filter((t) => {
        const taskDate = new Date(t.createdAt)
        taskDate.setHours(0, 0, 0, 0)
        return taskDate >= thisWeekStart && t.completed
      })

      const totalFocusMinutes = updatedSessions.reduce((sum, s) => sum + s.duration, 0)
      const totalFocusHours = Math.round((totalFocusMinutes / 60) * 10) / 10
      const averageFocusTime =
        updatedSessions.length > 0 ? Math.round((totalFocusMinutes / updatedSessions.length) * 10) / 10 : 0

      const todayCompleted = state.tasks.filter((t) => {
        const taskDate = new Date(t.createdAt)
        taskDate.setHours(0, 0, 0, 0)
        return taskDate.getTime() === today.getTime() && t.completed
      }).length

      return {
        focusSessions: updatedSessions,
        analytics: {
          totalFocusHours,
          totalFocusTime: totalFocusHours,
          tasksCompletedToday: todayCompleted,
          tasksCompletedThisWeek: weekTasks.length,
          averageFocusTime,
          streakDays: updatedSessions.length > 0 ? Math.min(updatedSessions.length, 30) : 0,
          tasksCompleted: state.tasks.filter((t) => t.completed).length,
          focusSessions: updatedSessions,
        },
      }
    })
  },

  getAnalytics: () => {
    const state = get()
    return state.analytics
  },

  setSettings: (settings) =>
    set((state) => ({
      userPreferences: { ...state.userPreferences, ...settings },
    })),

  setUserData: (name, goals, role) =>
    set({
      userName: name,
      userGoals: goals,
      userData: { name, role },
    }),

  setCurrentPage: (page) => set({ currentPage: page }),

  addMoodEntry: (mood, notes) =>
    set((state) => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Check if mood already exists for today
      const todayMoodExists = state.moodEntries.some((entry) => {
        const entryDate = new Date(entry.date)
        entryDate.setHours(0, 0, 0, 0)
        return entryDate.getTime() === today.getTime()
      })

      if (todayMoodExists) {
        // Update existing mood entry for today
        return {
          moodEntries: state.moodEntries.map((entry) => {
            const entryDate = new Date(entry.date)
            entryDate.setHours(0, 0, 0, 0)
            if (entryDate.getTime() === today.getTime()) {
              return {
                ...entry,
                mood,
                notes,
                date: new Date(), // Update timestamp
              }
            }
            return entry
          }),
        }
      }

      // Create new entry if none exists for today
      const newEntry: MoodEntry = {
        id: Math.random().toString(36).substring(7),
        mood,
        notes,
        date: new Date(),
      }
      return {
        moodEntries: [...state.moodEntries, newEntry],
      }
    }),

  getMoodHistory: () => {
    const state = get()
    return state.moodEntries
  },

  addHabit: (habit) =>
    set((state) => {
      const newHabit: Habit = {
        ...habit,
        id: Math.random().toString(36).substring(7),
        createdAt: new Date(),
        completedDates: [],
        currentStreak: 0,
        longestStreak: 0,
      }
      return {
        habits: [...state.habits, newHabit],
      }
    }),

  deleteHabit: (id) =>
    set((state) => ({
      habits: state.habits.filter((h) => h.id !== id),
    })),

  toggleHabitCompletion: (habitId, date) =>
    set((state) => {
      const habit = state.habits.find((h) => h.id === habitId)
      if (!habit) return state

      const dateStr = date
      const isCompleted = habit.completedDates.includes(dateStr)
      const newCompletedDates = isCompleted
        ? habit.completedDates.filter((d) => d !== dateStr)
        : [...habit.completedDates, dateStr].sort()

      // Calculate streaks
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayStr = today.toISOString().split("T")[0]

      let currentStreak = 0
      let longestStreak = habit.longestStreak

      if (newCompletedDates.length > 0) {
        // Calculate current streak
        const sortedDates = [...newCompletedDates].sort().reverse()
        let checkDate = new Date(today)

        for (const dateStr of sortedDates) {
          const checkDateStr = checkDate.toISOString().split("T")[0]
          if (dateStr === checkDateStr) {
            currentStreak++
            checkDate.setDate(checkDate.getDate() - 1)
          } else {
            break
          }
        }

        // Calculate longest streak
        let tempStreak = 0
        let prevDate: Date | null = null
        for (const dateStr of sortedDates) {
          const currentDate = new Date(dateStr)
          if (prevDate === null) {
            tempStreak = 1
          } else {
            const diffDays = Math.floor((prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))
            if (diffDays === 1) {
              tempStreak++
            } else {
              longestStreak = Math.max(longestStreak, tempStreak)
              tempStreak = 1
            }
          }
          prevDate = currentDate
        }
        longestStreak = Math.max(longestStreak, tempStreak)
      }

      return {
        habits: state.habits.map((h) =>
          h.id === habitId
            ? {
              ...h,
              completedDates: newCompletedDates,
              currentStreak,
              longestStreak,
            }
            : h
        ),
      }
    }),

  getHabitStreak: (habitId) => {
    const state = get()
    const habit = state.habits.find((h) => h.id === habitId)
    return habit?.currentStreak || 0
  },

  addGoal: (goal) =>
    set((state) => {
      const newGoal: Goal = {
        ...goal,
        id: Math.random().toString(36).substring(7),
        createdAt: new Date(),
        progress: 0,
        status: "active",
        milestones: goal.milestones || [],
      }
      return {
        goals: [...state.goals, newGoal],
      }
    }),

  deleteGoal: (id) =>
    set((state) => ({
      goals: state.goals.filter((g) => g.id !== id),
    })),

  updateGoal: (id, updates) =>
    set((state) => {
      const goal = state.goals.find((g) => g.id === id)
      if (!goal) return state

      const updatedGoal = { ...goal, ...updates }

      // Recalculate progress if milestones changed
      if (updates.milestones !== undefined) {
        const completedMilestones = updatedGoal.milestones.filter((m) => m.completed).length
        updatedGoal.progress =
          updatedGoal.milestones.length > 0
            ? Math.round((completedMilestones / updatedGoal.milestones.length) * 100)
            : 0

        // Auto-update status if all milestones completed
        if (updatedGoal.progress === 100 && updatedGoal.status === "active") {
          updatedGoal.status = "completed"
        }
      }

      return {
        goals: state.goals.map((g) => (g.id === id ? updatedGoal : g)),
      }
    }),

  addMilestone: (goalId, milestone) =>
    set((state) => {
      const goal = state.goals.find((g) => g.id === goalId)
      if (!goal) return state

      const maxOrder = goal.milestones.length > 0 ? Math.max(...goal.milestones.map((m) => m.order)) : -1
      const newMilestone: Milestone = {
        ...milestone,
        id: Math.random().toString(36).substring(7),
        order: maxOrder + 1,
      }

      const updatedMilestones = [...goal.milestones, newMilestone].sort((a, b) => a.order - b.order)
      const completedMilestones = updatedMilestones.filter((m) => m.completed).length
      const progress = updatedMilestones.length > 0 ? Math.round((completedMilestones / updatedMilestones.length) * 100) : 0

      return {
        goals: state.goals.map((g) =>
          g.id === goalId
            ? {
              ...g,
              milestones: updatedMilestones,
              progress,
              status: progress === 100 && g.status === "active" ? "completed" : g.status,
            }
            : g
        ),
      }
    }),

  updateMilestone: (goalId, milestoneId, updates) =>
    set((state) => {
      const goal = state.goals.find((g) => g.id === goalId)
      if (!goal) return state

      const updatedMilestones = goal.milestones.map((m) =>
        m.id === milestoneId ? { ...m, ...updates } : m
      )
      const completedMilestones = updatedMilestones.filter((m) => m.completed).length
      const progress = updatedMilestones.length > 0 ? Math.round((completedMilestones / updatedMilestones.length) * 100) : 0

      return {
        goals: state.goals.map((g) =>
          g.id === goalId
            ? {
              ...g,
              milestones: updatedMilestones,
              progress,
              status: progress === 100 && g.status === "active" ? "completed" : g.status,
            }
            : g
        ),
      }
    }),

  deleteMilestone: (goalId, milestoneId) =>
    set((state) => {
      const goal = state.goals.find((g) => g.id === goalId)
      if (!goal) return state

      const updatedMilestones = goal.milestones.filter((m) => m.id !== milestoneId)
      const completedMilestones = updatedMilestones.filter((m) => m.completed).length
      const progress = updatedMilestones.length > 0 ? Math.round((completedMilestones / updatedMilestones.length) * 100) : 0

      return {
        goals: state.goals.map((g) =>
          g.id === goalId
            ? {
              ...g,
              milestones: updatedMilestones,
              progress,
            }
            : g
        ),
      }
    }),

  toggleMilestone: (goalId, milestoneId) =>
    set((state) => {
      const goal = state.goals.find((g) => g.id === goalId)
      if (!goal) return state

      const updatedMilestones = goal.milestones.map((m) => {
        if (m.id === milestoneId) {
          const today = new Date().toISOString().split("T")[0]
          return {
            ...m,
            completed: !m.completed,
            completedDate: !m.completed ? today : undefined,
          }
        }
        return m
      })

      const completedMilestones = updatedMilestones.filter((m) => m.completed).length
      const progress = updatedMilestones.length > 0 ? Math.round((completedMilestones / updatedMilestones.length) * 100) : 0

      return {
        goals: state.goals.map((g) =>
          g.id === goalId
            ? {
              ...g,
              milestones: updatedMilestones,
              progress,
              status: progress === 100 && g.status === "active" ? "completed" : g.status,
            }
            : g
        ),
      }
    }),

  getGoalProgress: (goalId) => {
    const state = get()
    const goal = state.goals.find((g) => g.id === goalId)
    return goal?.progress || 0
  },

  getAISuggestions: (goalId) => {
    const state = get()
    const goal = state.goals.find((g) => g.id === goalId)
    if (!goal) return []

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
    const relatedTasks = state.tasks.filter((t) =>
      t.title.toLowerCase().includes(goal.title.toLowerCase().split(" ")[0].toLowerCase()) ||
      goal.title.toLowerCase().includes(t.title.toLowerCase().split(" ")[0].toLowerCase())
    )
    if (relatedTasks.length === 0) {
      suggestions.push("Create tasks related to this goal to track daily progress.")
    } else {
      const incompleteTasks = relatedTasks.filter((t) => !t.completed)
      if (incompleteTasks.length > 0) {
        suggestions.push(`You have ${incompleteTasks.length} related tasks. Complete them to advance your goal.`)
      }
    }

    // Time-based suggestions
    if (goal.targetDate) {
      const targetDate = new Date(goal.targetDate)
      const today = new Date()
      const daysRemaining = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      const milestonesRemaining = totalMilestones - completedMilestones

      if (daysRemaining > 0 && milestonesRemaining > 0) {
        const dailyMilestoneRate = milestonesRemaining / daysRemaining
        if (dailyMilestoneRate > 0.5) {
          suggestions.push(`You have ${daysRemaining} days left. Complete ${Math.ceil(dailyMilestoneRate)} milestone(s) per day to stay on track.`)
        }
      }
    }

    return suggestions.slice(0, 3) // Return top 3 suggestions
  },

  addDistraction: (distraction) =>
    set((state) => {
      const newDistraction: Distraction = {
        ...distraction,
        id: Math.random().toString(36).substring(7),
        date: new Date(),
      }
      return {
        distractions: [...state.distractions, newDistraction],
      }
    }),

  deleteDistraction: (id) =>
    set((state) => ({
      distractions: state.distractions.filter((d) => d.id !== id),
    })),

  getDistractionInsights: () => {
    const state = get()
    const distractions = state.distractions

    // Get top sources
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
    const typeCounts: Record<string, number> = {}
    distractions.forEach((d) => {
      typeCounts[d.type] = (typeCounts[d.type] || 0) + 1
    })

    const mostCommonType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]
    if (mostCommonType) {
      patterns.push(`Most common distraction type: ${mostCommonType[0]} (${mostCommonType[1]} times)`)
    }

    const avgDuration = distractions.length > 0 ? totalTime / distractions.length : 0
    if (avgDuration > 10) {
      patterns.push(`Average distraction duration is ${Math.round(avgDuration)} minutes - consider shorter breaks`)
    }

    if (topSources.length > 0) {
      patterns.push(`Top distraction source: ${topSources[0].source} (${topSources[0].count} times)`)
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayDistractions = distractions.filter((d) => {
      const dDate = new Date(d.date)
      dDate.setHours(0, 0, 0, 0)
      return dDate.getTime() === today.getTime()
    })
    if (todayDistractions.length > 5) {
      patterns.push(`You've had ${todayDistractions.length} distractions today - consider using blocking mode`)
    }

    return { topSources, totalTime, patterns }
  },

  addChallenge: (challenge) =>
    set((state) => {
      const newChallenge: Challenge = {
        ...challenge,
        id: Math.random().toString(36).substring(7),
        current: 0,
        completed: false,
      }
      return {
        challenges: [...state.challenges, newChallenge],
      }
    }),

  updateChallengeProgress: (challengeId) =>
    set((state) => {
      const challenge = state.challenges.find((c) => c.id === challengeId)
      if (!challenge) return state

      let current = 0
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      switch (challenge.metric) {
        case "focus_sessions":
          const sessionsInPeriod = state.focusSessions.filter((s) => {
            const sessionDate = new Date(s.date)
            sessionDate.setHours(0, 0, 0, 0)
            return sessionDate >= challenge.startDate && sessionDate <= challenge.endDate
          })
          current = sessionsInPeriod.length
          break
        case "tasks_completed":
          const tasksInPeriod = state.tasks.filter((t) => {
            if (!t.completed) return false
            const taskDate = new Date(t.createdAt)
            taskDate.setHours(0, 0, 0, 0)
            return taskDate >= challenge.startDate && taskDate <= challenge.endDate
          })
          current = tasksInPeriod.length
          break
        case "habits_streak":
          const maxStreak = Math.max(...state.habits.map((h) => h.currentStreak), 0)
          current = maxStreak
          break
        case "goals_progress":
          const totalProgress = state.goals.reduce((sum, g) => sum + g.progress, 0)
          current = Math.round(totalProgress / (state.goals.length || 1))
          break
      }

      const completed = current >= challenge.target

      return {
        challenges: state.challenges.map((c) =>
          c.id === challengeId
            ? {
              ...c,
              current,
              completed,
            }
            : c
        ),
      }
    }),

  checkAchievements: () =>
    set((state) => {
      const unlocked: Achievement[] = []

      // Check focus achievements
      if (state.focusSessions.length >= 1) {
        const achievement = state.achievements.find((a) => a.id === "first_focus" && !a.unlockedAt)
        if (achievement) {
          unlocked.push({ ...achievement, unlockedAt: new Date() })
        }
      }
      if (state.focusSessions.length >= 10) {
        const achievement = state.achievements.find((a) => a.id === "focus_master" && !a.unlockedAt)
        if (achievement) {
          unlocked.push({ ...achievement, unlockedAt: new Date() })
        }
      }

      // Check task achievements
      const completedTasks = state.tasks.filter((t) => t.completed).length
      if (completedTasks >= 50) {
        const achievement = state.achievements.find((a) => a.id === "task_warrior" && !a.unlockedAt)
        if (achievement) {
          unlocked.push({ ...achievement, unlockedAt: new Date() })
        }
      }

      // Check habit achievements
      const maxStreak = Math.max(...state.habits.map((h) => h.currentStreak), 0)
      if (maxStreak >= 7) {
        const achievement = state.achievements.find((a) => a.id === "habit_hero" && !a.unlockedAt)
        if (achievement) {
          unlocked.push({ ...achievement, unlockedAt: new Date() })
        }
      }

      // Check goal achievements
      const completedGoals = state.goals.filter((g) => g.status === "completed").length
      if (completedGoals >= 1) {
        const achievement = state.achievements.find((a) => a.id === "goal_getter" && !a.unlockedAt)
        if (achievement) {
          unlocked.push({ ...achievement, unlockedAt: new Date() })
        }
      }

      // Check streak achievements
      if (state.analytics.streakDays >= 30) {
        const achievement = state.achievements.find((a) => a.id === "streak_king" && !a.unlockedAt)
        if (achievement) {
          unlocked.push({ ...achievement, unlockedAt: new Date() })
        }
      }

      // Check milestone achievements
      const totalMilestones = state.goals.reduce((sum, g) => {
        return sum + g.milestones.filter((m) => m.completed).length
      }, 0)
      if (totalMilestones >= 10) {
        const achievement = state.achievements.find((a) => a.id === "milestone_master" && !a.unlockedAt)
        if (achievement) {
          unlocked.push({ ...achievement, unlockedAt: new Date() })
        }
      }

      if (unlocked.length > 0) {
        return {
          achievements: state.achievements.map((a) => {
            const unlockedAchievement = unlocked.find((u) => u.id === a.id)
            return unlockedAchievement || a
          }),
        }
      }

      return state
    }),

  getUnlockedAchievements: () => {
    const state = get()
    return state.achievements.filter((a) => a.unlockedAt !== undefined)
  },

  getLeaderboard: () => {
    const state = get()
    // Simulated leaderboard - in real app, this would come from backend
    const score =
      state.focusSessions.length * 10 +
      state.tasks.filter((t) => t.completed).length * 5 +
      state.habits.reduce((sum, h) => sum + h.currentStreak, 0) * 3 +
      state.goals.filter((g) => g.status === "completed").length * 50

    return [
      { userId: "you", score, rank: 1 },
      { userId: "user2", score: score - 50, rank: 2 },
      { userId: "user3", score: score - 100, rank: 3 },
    ]
  },

  setCurrentSchedule: (schedule) =>
    set({
      currentSchedule: schedule,
    }),

  acceptSchedule: (date?: string) => {
    const today = date || new Date().toISOString().split("T")[0]
    const state = get()

    // Remove any existing schedule for this date
    const filteredSchedules = state.acceptedSchedules.filter((s) => s.date !== today)

    // Add the new schedule
    const newAcceptedSchedule: AcceptedSchedule = {
      date: today,
      schedule: state.currentSchedule,
    }

    set({
      acceptedSchedules: [...filteredSchedules, newAcceptedSchedule],
      // Clear existing time blocks for this day to avoid duplicates when overwriting schedule
      timeBlocks: state.timeBlocks.filter(b => b.date !== today)
    })

    // Re-fetch state after update to ensure we have clean slate (though we just set it)
    const updatedState = get()

    // Convert schedule items to time blocks
    state.currentSchedule.forEach((item) => {
      const [startH, startM] = item.time.split(":").map(Number)
      const startMinutes = startH * 60 + startM
      const endMinutes = startMinutes + item.duration
      const endH = Math.floor(endMinutes / 60)
      const endM = endMinutes % 60
      const endTime = `${endH.toString().padStart(2, "0")}:${endM.toString().padStart(2, "0")}`

      // Determine color based on priority
      const colorMap = {
        high: "bg-red-500",
        medium: "bg-yellow-500",
        low: "bg-green-500",
      }

      // Use the action to add blocks
      updatedState.addTimeBlock({
        title: item.task,
        startTime: item.time,
        endTime: endTime,
        date: today,
        color: colorMap[item.priority as keyof typeof colorMap] || "bg-blue-500",
        notes: `Priority: ${item.priority}`,
      })
    })
  },

  getAcceptedSchedules: () => {
    const state = get()
    return state.acceptedSchedules
  },

  getTodayAcceptedSchedule: () => {
    const state = get()
    const today = new Date().toISOString().split("T")[0]
    const todaySchedule = state.acceptedSchedules.find((s) => s.date === today)
    return todaySchedule ? todaySchedule.schedule : null
  },

  addTimeBlock: (block) =>
    set((state) => {
      const newBlock: TimeBlock = {
        ...block,
        id: Math.random().toString(36).substring(7),
      }
      return {
        timeBlocks: [...state.timeBlocks, newBlock],
      }
    }),

  updateTimeBlock: (id, updates) =>
    set((state) => ({
      timeBlocks: state.timeBlocks.map((b) => (b.id === id ? { ...b, ...updates } : b)),
    })),

  deleteTimeBlock: (id) =>
    set((state) => ({
      timeBlocks: state.timeBlocks.filter((b) => b.id !== id),
    })),

  getTimeBlocksForDate: (date) => {
    const state = get()
    return state.timeBlocks.filter((b) => b.date === date).sort((a, b) => a.startTime.localeCompare(b.startTime))
  },

  moveTimeBlock: (id, newDate, newStartTime) =>
    set((state) => {
      const block = state.timeBlocks.find((b) => b.id === id)
      if (!block) return state

      const startMinutes = parseInt(newStartTime.split(":")[0]) * 60 + parseInt(newStartTime.split(":")[1])
      const endMinutes = parseInt(block.endTime.split(":")[0]) * 60 + parseInt(block.endTime.split(":")[1])
      const duration = endMinutes - (parseInt(block.startTime.split(":")[0]) * 60 + parseInt(block.startTime.split(":")[1]))
      const newEndMinutes = startMinutes + duration
      const newEndTime = `${Math.floor(newEndMinutes / 60).toString().padStart(2, "0")}:${(newEndMinutes % 60).toString().padStart(2, "0")}`

      return {
        timeBlocks: state.timeBlocks.map((b) =>
          b.id === id
            ? {
              ...b,
              date: newDate,
              startTime: newStartTime,
              endTime: newEndTime,
            }
            : b
        ),
      }
    }),

  setWeeklyClassSchedule: (schedule) => {
    set({ weeklyClassSchedule: schedule })
    // Persist to localStorage
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("weeklyClassSchedule", JSON.stringify(schedule))
      } catch (error) {
        console.error("Failed to save weekly schedule to localStorage:", error)
      }
    }
  },

  getTodayClasses: () => {
    const state = get()
    if (!state.weeklyClassSchedule) {
      // Try to load from localStorage
      if (typeof window !== "undefined") {
        try {
          const stored = localStorage.getItem("weeklyClassSchedule")
          if (stored) {
            const parsed = JSON.parse(stored)
            set({ weeklyClassSchedule: parsed })
            // Recursively call to process the loaded schedule
            const updatedState = get()
            if (updatedState.weeklyClassSchedule) {
              const today = new Date()
              const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
              const todayName = dayNames[today.getDay()].toLowerCase()
              const todaySchedule = updatedState.weeklyClassSchedule.schedule[todayName] || {}
              const classes: Array<{ time: string; className: string }> = []

              Object.entries(todaySchedule).forEach(([timeSlot, className]) => {
                if (className && (className as string).trim()) {
                  classes.push({ time: timeSlot, className: (className as string).trim() })
                }
              })

              classes.sort((a, b) => {
                const aStart = a.time.split("-")[0]
                const bStart = b.time.split("-")[0]
                return aStart.localeCompare(bStart)
              })

              return classes
            }
          }
        } catch (error) {
          console.error("Failed to load weekly schedule from localStorage:", error)
        }
      }
      return []
    }

    const today = new Date()
    const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
    const todayName = dayNames[today.getDay()].toLowerCase()

    const todaySchedule = state.weeklyClassSchedule.schedule[todayName] || {}
    const classes: Array<{ time: string; className: string }> = []

    Object.entries(todaySchedule).forEach(([timeSlot, className]) => {
      if (className && (className as string).trim()) {
        classes.push({ time: timeSlot, className: (className as string).trim() })
      }
    })

    // Sort by time
    classes.sort((a, b) => {
      const aStart = a.time.split("-")[0]
      const bStart = b.time.split("-")[0]
      return aStart.localeCompare(bStart)
    })

    return classes
  },

  addSoundPreset: (preset) =>
    set((state) => {
      const newPreset: SoundPreset = {
        ...preset,
        id: Math.random().toString(36).substring(7),
      }
      return {
        soundPresets: [...state.soundPresets, newPreset],
      }
    }),

  addPlaylist: (playlist) =>
    set((state) => {
      const newPlaylist: Playlist = {
        ...playlist,
        id: Math.random().toString(36).substring(7),
        createdAt: new Date(),
      }
      return {
        playlists: [...state.playlists, newPlaylist],
      }
    }),

  deletePlaylist: (id) =>
    set((state) => ({
      playlists: state.playlists.filter((p) => p.id !== id),
      currentPlaylist: state.currentPlaylist === id ? undefined : state.currentPlaylist,
    })),

  setCurrentPlaylist: (id) =>
    set({
      currentPlaylist: id,
    }),

  generateWeeklyReport: () => {
    const state = get()
    const today = new Date()
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay())

    const weekTasks = state.tasks.filter((t) => {
      const taskDate = new Date(t.createdAt)
      return taskDate >= weekStart && taskDate <= today
    })

    const weekSessions = state.focusSessions.filter((s) => {
      const sessionDate = new Date(s.date)
      return sessionDate >= weekStart && sessionDate <= today
    })

    const summary = `Weekly Report (${weekStart.toLocaleDateString()} - ${today.toLocaleDateString()})
    
Focus Sessions: ${weekSessions.length}
Total Focus Time: ${weekSessions.reduce((sum, s) => sum + s.duration, 0)} minutes
Tasks Completed: ${weekTasks.filter((t) => t.completed).length} / ${weekTasks.length}
Habits Maintained: ${state.habits.filter((h) => h.currentStreak > 0).length}
Goals Progress: ${state.goals.filter((g) => g.status === "active").length} active goals
Distractions: ${state.distractions.filter((d) => {
      const dDate = new Date(d.date)
      return dDate >= weekStart && dDate <= today
    }).length}`

    return {
      summary,
      data: {
        focusSessions: weekSessions.length,
        focusTime: weekSessions.reduce((sum, s) => sum + s.duration, 0),
        tasksCompleted: weekTasks.filter((t) => t.completed).length,
        tasksTotal: weekTasks.length,
        habitsActive: state.habits.filter((h) => h.currentStreak > 0).length,
        goalsActive: state.goals.filter((g) => g.status === "active").length,
        distractions: state.distractions.filter((d) => {
          const dDate = new Date(d.date)
          return dDate >= weekStart && dDate <= today
        }).length,
      },
    }
  },

  generateMonthlyReport: () => {
    const state = get()
    const today = new Date()
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

    const monthTasks = state.tasks.filter((t) => {
      const taskDate = new Date(t.createdAt)
      return taskDate >= monthStart && taskDate <= today
    })

    const monthSessions = state.focusSessions.filter((s) => {
      const sessionDate = new Date(s.date)
      return sessionDate >= monthStart && sessionDate <= today
    })

    const summary = `Monthly Report (${monthStart.toLocaleDateString()} - ${today.toLocaleDateString()})
    
Focus Sessions: ${monthSessions.length}
Total Focus Time: ${Math.round(monthSessions.reduce((sum, s) => sum + s.duration, 0) / 60)} hours
Tasks Completed: ${monthTasks.filter((t) => t.completed).length} / ${monthTasks.length}
Habits Maintained: ${state.habits.filter((h) => h.currentStreak > 0).length}
Goals Completed: ${state.goals.filter((g) => g.status === "completed").length}
Achievements Unlocked: ${state.achievements.filter((a) => a.unlockedAt).length}
Challenges Completed: ${state.challenges.filter((c) => c.completed).length}`

    return {
      summary,
      data: {
        focusSessions: monthSessions.length,
        focusTime: Math.round(monthSessions.reduce((sum, s) => sum + s.duration, 0) / 60),
        tasksCompleted: monthTasks.filter((t) => t.completed).length,
        tasksTotal: monthTasks.length,
        habitsActive: state.habits.filter((h) => h.currentStreak > 0).length,
        goalsCompleted: state.goals.filter((g) => g.status === "completed").length,
        achievements: state.achievements.filter((a) => a.unlockedAt).length,
        challengesCompleted: state.challenges.filter((c) => c.completed).length,
      },
    }
  },

  exportToCSV: () => {
    const state = get()
    const headers = ["Date", "Focus Sessions", "Tasks Completed", "Habits Streak", "Goals Progress"]
    const rows: string[] = []

    // Group by date
    const dateMap: Record<string, any> = {}
    state.focusSessions.forEach((s) => {
      const date = new Date(s.date).toISOString().split("T")[0]
      if (!dateMap[date]) dateMap[date] = { date, focusSessions: 0, tasks: 0, habits: 0, goals: 0 }
      dateMap[date].focusSessions++
    })

    state.tasks.filter((t) => t.completed).forEach((t) => {
      const date = new Date(t.createdAt).toISOString().split("T")[0]
      if (!dateMap[date]) dateMap[date] = { date, focusSessions: 0, tasks: 0, habits: 0, goals: 0 }
      dateMap[date].tasks++
    })

    Object.values(dateMap).forEach((row) => {
      rows.push(`${row.date},${row.focusSessions},${row.tasks},${row.habits},${row.goals}`)
    })

    return [headers.join(","), ...rows].join("\n")
  },

  exportToPDF: () => {
    // In a real app, this would use a PDF library like jsPDF
    // For now, we'll create a downloadable text file
    const state = get()
    const weeklyReport = state.generateWeeklyReport()
    const monthlyReport = state.generateMonthlyReport()

    const content = `PULSE PRODUCTIVITY REPORT
Generated: ${new Date().toLocaleDateString()}

${weeklyReport.summary}

${monthlyReport.summary}

---
For detailed analytics, visit the Analytics dashboard.
`

    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `pulse-report-${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  },

  addTeamMember: (member) =>
    set((state) => {
      const newMember: TeamMember = {
        ...member,
        id: Math.random().toString(36).substring(7),
        joinedAt: new Date(),
      }
      return {
        teamMembers: [...state.teamMembers, newMember],
      }
    }),

  shareGoal: (goalId, memberIds) =>
    set((state) => {
      const existingShare = state.sharedGoals.find((sg) => sg.goalId === goalId)
      if (existingShare) {
        return {
          sharedGoals: state.sharedGoals.map((sg) =>
            sg.goalId === goalId
              ? {
                ...sg,
                sharedWith: [...new Set([...sg.sharedWith, ...memberIds])],
              }
              : sg
          ),
        }
      }
      const newShare: SharedGoal = {
        id: Math.random().toString(36).substring(7),
        goalId,
        sharedWith: memberIds,
        sharedAt: new Date(),
      }
      return {
        sharedGoals: [...state.sharedGoals, newShare],
      }
    }),

  createGroupChallenge: (challenge) =>
    set((state) => {
      const newChallenge: GroupChallenge = {
        ...challenge,
        id: Math.random().toString(36).substring(7),
        leaderboard: challenge.participants.map((userId) => ({ userId, score: 0 })),
      }
      return {
        groupChallenges: [...state.groupChallenges, newChallenge],
      }
    }),

  getTeamProductivityInsights: () => {
    const state = get()
    // Simulated team data - in real app, this would aggregate from all team members
    const totalFocusTime = state.focusSessions.reduce((sum, s) => sum + s.duration, 0)
    const totalTasks = state.tasks.length
    const averageProgress = state.goals.length > 0 ? state.goals.reduce((sum, g) => sum + g.progress, 0) / state.goals.length : 0

    return {
      totalFocusTime,
      totalTasks,
      averageProgress: Math.round(averageProgress),
    }
  },

  addNotification: (notification) =>
    set((state) => {
      const newNotification: Notification = {
        ...notification,
        id: Math.random().toString(36).substring(7),
        timestamp: new Date(),
        read: false,
      }
      return {
        notifications: [newNotification, ...state.notifications],
      }
    }),

  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),

  clearNotifications: () =>
    set({
      notifications: [],
    }),

  getUnreadNotifications: () => {
    const state = get()
    return state.notifications.filter((n) => !n.read)
  },

  checkSmartNotifications: () => {
    const state = get()
    const now = new Date()
    const lastSession = state.focusSessions[state.focusSessions.length - 1]

    // Break suggestion - if last session was more than 25 minutes ago and no break taken
    if (lastSession) {
      const sessionTime = new Date(lastSession.date).getTime()
      const timeSinceSession = (now.getTime() - sessionTime) / (1000 * 60) // minutes
      if (timeSinceSession >= 25 && timeSinceSession < 30) {
        const hasRecentBreak = state.distractions.some((d) => {
          const distTime = new Date(d.date).getTime()
          return distTime > sessionTime && d.type === "other" && d.source.toLowerCase().includes("break")
        })
        if (!hasRecentBreak) {
          state.addNotification({
            type: "suggestion",
            title: "Time for a Break!",
            message: "You've been focusing for a while. Take a 5-minute break to recharge.",
            actionUrl: "/dashboard",
          })
        }
      }
    }

    // Goal milestone celebration
    state.goals.forEach((goal) => {
      const recentMilestones = goal.milestones.filter((m) => {
        if (!m.completedDate) return false
        const completedTime = new Date(m.completedDate).getTime()
        return now.getTime() - completedTime < 60000 // Within last minute
      })
      if (recentMilestones.length > 0) {
        state.addNotification({
          type: "celebration",
          title: "Milestone Achieved! 🎉",
          message: `You completed "${recentMilestones[0].title}" for "${goal.title}"`,
          actionUrl: "/goals",
        })
      }
    })

    // Context-aware reminders
    const todayTasks = state.tasks.filter((t) => {
      if (t.completed) return false
      const taskDate = new Date(t.createdAt)
      return taskDate.toDateString() === now.toDateString()
    })
    if (todayTasks.length > 0 && now.getHours() === 9 && now.getMinutes() < 5) {
      state.addNotification({
        type: "reminder",
        title: "Good Morning!",
        message: `You have ${todayTasks.length} task${todayTasks.length > 1 ? "s" : ""} to complete today.`,
        actionUrl: "/tasks",
      })
    }
  },

  setVoiceActive: (active) =>
    set({
      isVoiceActive: active,
    }),

  processVoiceCommand: (command) => {
    const state = get()
    const lowerCommand = command.toLowerCase().trim()

    // Task capture
    if (lowerCommand.includes("add task") || lowerCommand.includes("create task") || lowerCommand.includes("new task")) {
      const taskText = command.replace(/add task|create task|new task/gi, "").trim()
      if (taskText) {
        state.addTask({
          title: taskText,
          priority: "medium",
          timeEstimate: 30,
        })
        state.addNotification({
          type: "reminder",
          title: "Task Added",
          message: `"${taskText}" has been added to your tasks.`,
        })
      }
    }

    // Start focus session
    if (lowerCommand.includes("start focus") || lowerCommand.includes("begin focus") || lowerCommand.includes("focus session")) {
      const duration = 25 // Default
      state.addFocusSession(duration)
      state.addNotification({
        type: "reminder",
        title: "Focus Session Started",
        message: `Started a ${duration}-minute focus session.`,
      })
    }

    // Log mood
    if (lowerCommand.includes("mood") || lowerCommand.includes("feeling")) {
      let mood: "excellent" | "good" | "neutral" | "sad" | "very-sad" = "neutral"
      if (lowerCommand.includes("excellent") || lowerCommand.includes("great") || lowerCommand.includes("amazing")) {
        mood = "excellent"
      } else if (lowerCommand.includes("good") || lowerCommand.includes("fine") || lowerCommand.includes("okay")) {
        mood = "good"
      } else if (lowerCommand.includes("sad") || lowerCommand.includes("bad") || lowerCommand.includes("terrible")) {
        mood = "sad"
      } else if (lowerCommand.includes("very sad") || lowerCommand.includes("awful")) {
        mood = "very-sad"
      }
      const notes = command.replace(/mood|feeling/gi, "").trim()
      state.addMoodEntry(mood, notes || "")
      state.addNotification({
        type: "reminder",
        title: "Mood Logged",
        message: `Your mood has been recorded as "${mood}".`,
      })
    }
  },

  // Add auth actions
  setAuth: (isAuthenticated, userEmail = "") =>
    set({
      auth: {
        isAuthenticated,
        userEmail,
      },
    }),

  logout: async () => {
    try {
      const api = await import("./api")
      api.authAPI.logout()
    } catch (error) {
      console.error("Error during logout:", error)
    }
    set({
      auth: {
        isAuthenticated: false,
        userEmail: "",
      },
      tasks: [],
      habits: [],
      goals: [],
      focusSessions: [],
      distractions: [],
      challenges: [],
      timeBlocks: [],
      weeklyClassSchedule: null,
      notifications: [],
      currentAIPlan: null,
      userAIProfile: null,
      aiPlanLoading: false,
      aiPlanError: null,
    })
  },

  // AI Features - Actions
  setCurrentAIPlan: (plan) => set({ currentAIPlan: plan }),

  setUserAIProfile: (profile) => set({ userAIProfile: profile }),

  setAIPlanLoading: (loading) => set({ aiPlanLoading: loading }),

  setAIPlanError: (error) => set({ aiPlanError: error }),

  acceptAIPlan: async () => {
    const state = get()
    if (!state.currentAIPlan) return

    try {
      const api = await import("./api")
      await api.aiAPI.acceptPlan(state.currentAIPlan.id)

      set({
        currentAIPlan: {
          ...state.currentAIPlan,
          status: "accepted",
        },
      })

      // Also accept schedule to history
      state.acceptSchedule()
    } catch (error) {
      console.error("Failed to accept AI plan:", error)
      set({ aiPlanError: "Failed to accept plan" })
    }
  },

  rejectAIPlan: async () => {
    const state = get()
    if (!state.currentAIPlan) return

    try {
      const api = await import("./api")
      await api.aiAPI.rejectPlan(state.currentAIPlan.id)

      set({
        currentAIPlan: {
          ...state.currentAIPlan,
          status: "rejected",
        },
      })
    } catch (error) {
      console.error("Failed to reject AI plan:", error)
      set({ aiPlanError: "Failed to reject plan" })
    }
  },
}))
