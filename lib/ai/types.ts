// AI System TypeScript Types

// Import shared types from domain layer
import type {
  Task,
  Goal,
  Milestone,
  ScheduleItem as DomainScheduleItem,
} from '../domain'

// Re-export domain types for convenience
export type { Task, Goal, Milestone }

// =============================================================================
// Gemini API Types
// =============================================================================

export interface GeminiMessage {
  role: 'user' | 'model';
  parts: string;
}

export interface GeminiResponse {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
  };
}

// =============================================================================
// Schedule Types (AI-specific extensions)
// =============================================================================

/**
 * Extended ScheduleItem with required type field for AI scheduling.
 * The base domain ScheduleItem has optional type, but AI-generated schedules
 * always specify the type.
 */
export interface ScheduleItem extends Omit<DomainScheduleItem, 'type'> {
  habitId?: string; // reference to habit if type is 'habit'
  type: 'work' | 'break' | 'meeting' | 'habit';
}

export interface AISchedule {
  userId: string;
  schedule: ScheduleItem[];
  explanation: string;
  reasoning: {
    focusHours?: string[];
    breakStrategy?: string;
    prioritization?: string;
  };
  modelVersion: string;
  generatedAt: Date;
}

// =============================================================================
// Daily Aggregates (for AI analysis)
// =============================================================================

export interface DailyAggregate {
  id: string;
  user_id: string;
  date: string;
  total_focus_minutes: number;
  focus_session_count: number;
  avg_focus_duration: number;
  longest_focus_session: number;
  tasks_completed: number;
  tasks_created: number;
  high_priority_completed: number;
  completion_rate: number;
  distraction_count: number;
  total_distraction_minutes: number;
  hourly_activity: number[];
  mood_score: number | null;
  daily_rating: number | null;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// User AI Profile (persisted profile for personalization)
// =============================================================================

export interface UserAIProfile {
  id: string;
  user_id: string;
  optimal_focus_duration: number;
  preferred_work_start_hour: number;
  preferred_work_end_hour: number;
  preferred_break_duration: number;
  hourly_performance_scores: number[];
  most_productive_hours: number[];
  common_distraction_times: number[];
  total_plans_generated: number;
  total_plans_accepted: number;
  total_plans_rejected: number;
  avg_plan_acceptance_rate: number;
  last_analyzed_date: string | null;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// AI Plan (persisted plan)
// =============================================================================

export interface AIPlan {
  id: string;
  user_id: string;
  plan_date: string;
  schedule: ScheduleItem[];
  explanation: string;
  reasoning: Record<string, unknown>;
  generated_at: string;
  model_version: string;
  status: 'pending' | 'accepted' | 'rejected' | 'edited' | 'expired';
  accepted_at: string | null;
  rejected_at: string | null;
  original_schedule: ScheduleItem[] | null;
  edit_count: number;
  last_edited_at: string | null;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// Plan Feedback
// =============================================================================

export interface PlanFeedbackEvent {
  id: string;
  plan_id: string;
  user_id: string;
  event_type: 'accepted' | 'rejected' | 'edited' | 'task_completed' | 'task_skipped';
  event_data: Record<string, unknown> | null;
  created_at: string;
}

// =============================================================================
// Chat Types
// =============================================================================

export interface ChatMessage {
  id: string;
  user_id: string;
  role: 'user' | 'assistant';
  message: string;
  context_snapshot: Record<string, unknown> | null;
  created_at: string;
}

// =============================================================================
// Schedule Context (for AI plan generation)
// =============================================================================

export interface ScheduleContext {
  user: {
    name: string;
    timezone: string;
  };
  profile: UserAIProfile;
  recentAggregates: DailyAggregate[];
  todaysTasks: Task[];
  activeGoals: Goal[];
  activeHabits: ScheduledHabit[]; // habits that should be scheduled today
  currentTime: string;
}

/**
 * Habit type for AI scheduling.
 * Subset of full Habit with only fields needed for schedule generation.
 */
export interface ScheduledHabit {
  id: string;
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly';
  preferredTime?: 'morning' | 'afternoon' | 'evening' | string;
  duration?: number; // minutes
  autoSchedule?: boolean;
  category?: 'health' | 'learning' | 'mindfulness' | 'productivity' | 'social' | 'other';
  currentStreak: number;
}

// =============================================================================
// AI Config
// =============================================================================

export interface AIConfig {
  featuresEnabled: boolean;
  dailyBrainEnabled: boolean;
  coachEnabled: boolean;
}

export const aiConfig: AIConfig = {
  featuresEnabled: process.env.NEXT_PUBLIC_AI_FEATURES_ENABLED === 'true',
  dailyBrainEnabled: process.env.AI_DAILY_BRAIN_ENABLED === 'true',
  coachEnabled: process.env.AI_COACH_ENABLED === 'true',
};

// =============================================================================
// Default Profile
// =============================================================================

/**
 * Returns default AI profile settings for new users.
 */
export function getDefaultProfile(): Omit<UserAIProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'> {
  return {
    optimal_focus_duration: 25,
    preferred_work_start_hour: 9,
    preferred_work_end_hour: 17,
    preferred_break_duration: 5,
    most_productive_hours: [9, 10, 11],
    common_distraction_times: [],
    hourly_performance_scores: new Array(24).fill(0.5),
    total_plans_generated: 0,
    total_plans_accepted: 0,
    total_plans_rejected: 0,
    avg_plan_acceptance_rate: 0,
    last_analyzed_date: null,
  };
}
