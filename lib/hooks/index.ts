/**
 * Hooks Module Exports
 * 
 * Central export point for all custom React hooks.
 */

// AI-related hooks (now in scheduler feature)
export { useAIPlan } from "@/src/features/scheduler/model/useAIPlan"
export type { UseAIPlanOptions, UseAIPlanReturn } from "@/src/features/scheduler/model/useAIPlan"

export { useAICoach } from "@/src/features/scheduler/model/useAICoach"
export type { UseAICoachOptions, UseAICoachReturn, ConversationMessage } from "@/src/features/scheduler/model/useAICoach"

export { useAIProfile } from "@/src/features/scheduler/model/useAIProfile"
export type { UseAIProfileOptions, UseAIProfileReturn } from "@/src/features/scheduler/model/useAIProfile"

export { useDailyAggregates } from "./use-daily-aggregates"
export type { UseDailyAggregatesOptions, UseDailyAggregatesReturn, DailyStats } from "./use-daily-aggregates"

// Domain hooks (abstract store access)
export { useTasks } from "./use-tasks"
export type { UseTasksReturn } from "./use-tasks"

export { useHabits } from "./use-habits"
export type { UseHabitsReturn } from "./use-habits"

export { useGoals } from "./use-goals"
export type { UseGoalsReturn } from "./use-goals"

export { useFocus } from "./use-focus"
export type { UseFocusReturn } from "./use-focus"

export { useAuth } from "./use-auth"
export type { UseAuthReturn } from "./use-auth"
