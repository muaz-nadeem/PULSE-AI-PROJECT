"use client"

import { create } from "zustand"

// Import types from domain layer
import type {
  Task,
  FocusSession,
  Distraction,
  Challenge,
  Achievement,
  AnalyticsData,
  UserSettings,
  BlockingSettings,
  MoodEntry,
  Habit,
  ScheduleItem,
  AIPlan,
  UserAIProfile,
  TimeBlock,
  SoundPreset,
  Playlist,
  TeamMember,
  SharedGoal,
  GroupChallenge,
  Notification,
  Milestone,
  Goal,
  AuthState,
  DistractionInsights,
} from "./domain"

// Import pure domain functions
import {
  // Habit logic
  calculateStreak,
  toggleHabitCompletionForDate,
  // Goal logic
  calculateGoalProgress,
  generateGoalSuggestions,
  addMilestoneToGoal,
  toggleMilestoneCompletion,
  removeMilestone,
  // Analytics logic
  computeDistractionInsights,
  generateWeeklyReportData,
  generateMonthlyReportData,
  formatWeeklyReportSummary,
  formatMonthlyReportSummary,
  generateCSVExport,
  // Achievement logic
  checkUnlockedAchievements,
  mergeUnlockedAchievements,
  computeChallengeProgress,
  computeUserScore,
  generateLeaderboard,
  DEFAULT_ACHIEVEMENTS,
  type AchievementContext,
  type ChallengeContext,
} from "./domain"

// Import services
import {
  taskService,
  focusService,
  habitService,
  goalService,
  authService,
  aiServices,
} from "./services"

// Re-export types for backward compatibility
export type {
  Task,
  FocusSession,
  Distraction,
  Challenge,
  Achievement,
  AnalyticsData,
  UserSettings,
  BlockingSettings,
  MoodEntry,
  Habit,
  ScheduleItem,
  AIPlan,
  UserAIProfile,
  TimeBlock,
  SoundPreset,
  Playlist,
  TeamMember,
  SharedGoal,
  GroupChallenge,
  Notification,
  Milestone,
  Goal,
  AuthState,
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
  acceptedSchedules: ScheduleItem[][]
  scheduleSyncedFromTimeBlocks: boolean
  setCurrentSchedule: (schedule: ScheduleItem[], fromTimeBlocks?: boolean) => void
  clearTimeBlockSync: () => void
  acceptSchedule: () => void
  getAcceptedSchedules: () => ScheduleItem[][]

  // Time Blocks
  timeBlocks: TimeBlock[]
  addTimeBlock: (block: Omit<TimeBlock, "id">) => void
  updateTimeBlock: (id: string, updates: Partial<TimeBlock>) => void
  deleteTimeBlock: (id: string) => void
  getTimeBlocksForDate: (date: string) => TimeBlock[]
  moveTimeBlock: (id: string, newDate: string, newStartTime: string) => void

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
  achievements: [...DEFAULT_ACHIEVEMENTS],
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
  acceptedSchedules: [],
  scheduleSyncedFromTimeBlocks: false,
  timeBlocks: [],
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
      const result = await taskService.create({
        title: task.title,
        description: task.description,
        priority: task.priority,
        timeEstimate: task.timeEstimate,
        category: task.category,
        dueDate: task.dueDate,
        focusMode: task.focusMode,
      })
      
      if (result.error) throw new Error(result.error)
      const created = result.data!
      
      set((state) => ({
        tasks: [
          ...state.tasks,
          created,
        ],
      }))
    } catch (error) {
      console.error("Failed to create task:", error)
      // Optimistic update fallback
      set((state) => ({
        tasks: [
          ...state.tasks,
          {
            ...task,
            id: Math.random().toString(36).substring(7),
            completed: false,
            createdAt: new Date(),
          },
        ],
      }))
    }
  },

  deleteTask: async (id) => {
    try {
      await taskService.delete(id)
    } catch (error) {
      console.error("Failed to delete task:", error)
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
        await taskService.toggleComplete(id)
      } catch (error) {
        console.error("Failed to toggle task:", error)
      }
    }
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    }))
  },

  updateTask: async (id, updates) => {
    try {
      await taskService.update(id, updates)
    } catch (error) {
      console.error("Failed to update task:", error)
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

      // Use domain function for habit toggle logic
      const result = toggleHabitCompletionForDate(habit.completedDates, date)

      return {
        habits: state.habits.map((h) =>
          h.id === habitId
            ? {
                ...h,
                completedDates: result.completedDates,
                currentStreak: result.currentStreak,
                longestStreak: Math.max(h.longestStreak, result.longestStreak),
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

      let updatedGoal = { ...goal, ...updates }
      
      // Recalculate progress if milestones changed using domain function
      if (updates.milestones !== undefined) {
        const progress = calculateGoalProgress(updates.milestones)
        updatedGoal = {
          ...updatedGoal,
          progress,
          status: progress === 100 && goal.status === "active" ? "completed" : updatedGoal.status,
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

      // Use domain function to add milestone with progress recalculation
      const result = addMilestoneToGoal(goal.milestones, milestone)

      return {
        goals: state.goals.map((g) =>
          g.id === goalId
            ? {
                ...g,
                milestones: result.milestones,
                progress: result.progress,
                status: result.progress === 100 && g.status === "active" ? "completed" : g.status,
              }
            : g
        ),
      }
    }),

  updateMilestone: (goalId, milestoneId, updates) =>
    set((state) => {
      const goal = state.goals.find((g) => g.id === goalId)
      if (!goal) return state

      // Update milestone and recalculate progress
      const updatedMilestones = goal.milestones.map((m) =>
        m.id === milestoneId ? { ...m, ...updates } : m
      )
      const progress = calculateGoalProgress(updatedMilestones)

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

      // Use domain function to remove milestone with progress recalculation
      const result = removeMilestone(goal.milestones, milestoneId)

      return {
        goals: state.goals.map((g) =>
          g.id === goalId
            ? {
                ...g,
                milestones: result.milestones,
                progress: result.progress,
              }
            : g
        ),
      }
    }),

  toggleMilestone: (goalId, milestoneId) =>
    set((state) => {
      const goal = state.goals.find((g) => g.id === goalId)
      if (!goal) return state

      // Use domain function to toggle milestone with progress recalculation
      const result = toggleMilestoneCompletion(goal.milestones, milestoneId)
      if (!result) return state

      return {
        goals: state.goals.map((g) =>
          g.id === goalId
            ? {
                ...g,
                milestones: result.milestones,
                progress: result.progress,
                status: result.progress === 100 && g.status === "active" ? "completed" : g.status,
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

    // Use domain function for suggestion generation
    return generateGoalSuggestions(goal, state.tasks)
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

  getDistractionInsights: (): DistractionInsights => {
    const state = get()
    
    // Use domain function for distraction insights
    const insights = computeDistractionInsights(state.distractions)
    
    // Add today-specific pattern if applicable
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayDistractions = state.distractions.filter((d) => {
      const dDate = new Date(d.date)
      dDate.setHours(0, 0, 0, 0)
      return dDate.getTime() === today.getTime()
    })
    if (todayDistractions.length > 5) {
      insights.patterns.push(`You've had ${todayDistractions.length} distractions today - consider using blocking mode`)
    }

    return insights
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

      // Use domain function for challenge progress calculation
      const current = computeChallengeProgress(challenge, {
        focusSessions: state.focusSessions,
        tasks: state.tasks,
        habits: state.habits,
        goals: state.goals,
      })

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
      // Use domain function for achievement checking
      const context: AchievementContext = {
        focusSessions: state.focusSessions,
        tasks: state.tasks,
        habits: state.habits,
        goals: state.goals,
        streakDays: state.analytics.streakDays,
      }

      const newlyUnlocked = checkUnlockedAchievements(state.achievements, context)

      if (newlyUnlocked.length > 0) {
        return {
          achievements: mergeUnlockedAchievements(state.achievements, newlyUnlocked),
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
    
    // Use domain functions for leaderboard calculation
    const context: ChallengeContext = {
      focusSessions: state.focusSessions,
      tasks: state.tasks,
      habits: state.habits,
      goals: state.goals,
    }
    const score = computeUserScore(context)
    
    return generateLeaderboard(score)
  },

  setCurrentSchedule: (schedule, fromTimeBlocks = false) =>
    set({
      currentSchedule: schedule,
      scheduleSyncedFromTimeBlocks: fromTimeBlocks,
    }),

  clearTimeBlockSync: () =>
    set({
      scheduleSyncedFromTimeBlocks: false,
    }),

  acceptSchedule: () =>
    set((state) => ({
      acceptedSchedules: [...state.acceptedSchedules, state.currentSchedule],
    })),

  getAcceptedSchedules: () => {
    const state = get()
    return state.acceptedSchedules
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

    // Use domain function for weekly stats computation
    const data = generateWeeklyReportData(
      state.tasks,
      state.focusSessions,
      state.habits,
      state.goals,
      state.distractions,
      today
    )

    const summary = formatWeeklyReportSummary(data, weekStart, today)

    return {
      summary,
      data,
    }
  },

  generateMonthlyReport: () => {
    const state = get()
    const today = new Date()
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

    // Use domain function for monthly stats computation
    const data = generateMonthlyReportData(
      state.tasks,
      state.focusSessions,
      state.habits,
      state.goals,
      state.achievements,
      state.challenges,
      today
    )

    const summary = formatMonthlyReportSummary(data, monthStart, today)

    return {
      summary,
      data,
    }
  },

  exportToCSV: () => {
    const state = get()
    // Use domain function for CSV export generation
    return generateCSVExport(state.tasks, state.focusSessions)
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
    const todayStr = now.toISOString().split("T")[0]
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

    // Habit reminders - check for habits due soon or overdue
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    
    state.habits.forEach((habit) => {
      // Skip if not auto-scheduled or already completed today
      if (habit.autoSchedule === false) return
      if (habit.completedDates.includes(todayStr)) return
      
      // Determine if habit is due now based on preferred time
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
        const timeWindows = {
          morning: { start: 6, end: 11, label: "morning" },
          afternoon: { start: 12, end: 17, label: "afternoon" },
          evening: { start: 18, end: 22, label: "evening" },
        }
        
        const window = timeWindows[habit.preferredTime as keyof typeof timeWindows]
        if (window) {
          // Remind 5 minutes before window starts
          if (currentHour === window.start && currentMinute <= 5) {
            isDue = true
            timeWindowMessage = `${window.label} window starting`
          }
          // Overdue if past window end
          else if (currentHour >= window.end) {
            isOverdue = true
            timeWindowMessage = `${window.label} window passed`
          }
        }
      }
      
      // Check if we already sent a notification for this habit recently
      const recentHabitNotification = state.notifications.some((n) => {
        const notifTime = new Date(n.timestamp).getTime()
        return (
          n.title.includes(habit.name) &&
          now.getTime() - notifTime < 30 * 60 * 1000 // Within last 30 minutes
        )
      })
      
      if (isDue && !recentHabitNotification) {
        const categoryEmoji = habit.category === "health" ? "💪" 
          : habit.category === "learning" ? "📚"
          : habit.category === "mindfulness" ? "🧘"
          : habit.category === "productivity" ? "⚡"
          : habit.category === "social" ? "👥" : "✨"
          
        state.addNotification({
          type: "reminder",
          title: `${categoryEmoji} Time for ${habit.name}!`,
          message: habit.currentStreak > 0 
            ? `Keep your ${habit.currentStreak}-day streak going! (${timeWindowMessage})`
            : `${habit.duration || 15} minutes - ${timeWindowMessage}`,
          actionUrl: "/habits",
        })
      } else if (isOverdue && !recentHabitNotification) {
        state.addNotification({
          type: "suggestion",
          title: `Don't forget: ${habit.name}`,
          message: habit.currentStreak > 0
            ? `⚠️ Your ${habit.currentStreak}-day streak is at risk! (${timeWindowMessage})`
            : `You still have time to complete this habit. (${timeWindowMessage})`,
          actionUrl: "/habits",
        })
      }
    })

    // Celebrate habit completion streaks
    state.habits.forEach((habit) => {
      const justCompleted = habit.completedDates.includes(todayStr)
      const streakMilestones = [7, 14, 21, 30, 60, 90, 100, 365]
      
      if (justCompleted && streakMilestones.includes(habit.currentStreak)) {
        const recentStreakNotif = state.notifications.some((n) => {
          const notifTime = new Date(n.timestamp).getTime()
          return (
            n.title.includes("Streak") &&
            n.title.includes(habit.name) &&
            now.getTime() - notifTime < 24 * 60 * 60 * 1000 // Within last 24 hours
          )
        })
        
        if (!recentStreakNotif) {
          state.addNotification({
            type: "celebration",
            title: `🔥 ${habit.currentStreak}-Day Streak!`,
            message: `Amazing! You've maintained "${habit.name}" for ${habit.currentStreak} days in a row!`,
            actionUrl: "/habits",
          })
        }
      }
    })
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
