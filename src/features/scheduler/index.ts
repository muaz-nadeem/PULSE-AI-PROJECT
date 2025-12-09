/**
 * Scheduler Feature
 * 
 * Handles day planning and AI-powered schedule generation.
 * 
 * Public API exports UI components and re-exports hooks from lib/
 */

// UI Components (MOVED to this feature)
export { default as DayPlanner } from './ui/DayPlanner'
export { default as CoachPanel } from './ui/CoachPanel'

// Hooks (re-exported from lib/hooks for convenience, will be moved later)
export { useAIPlan } from './model/useAIPlan'
export { useAICoach, type ConversationMessage } from './model/useAICoach'
export { useAIProfile } from './model/useAIProfile'
