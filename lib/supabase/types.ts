// Database types - These will be auto-generated from Supabase CLI later
// For now, we'll define basic types that match our interfaces

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          priority: "high" | "medium" | "low"
          time_estimate: number
          completed: boolean
          category: string | null
          due_date: string | null
          focus_mode: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          priority: "high" | "medium" | "low"
          time_estimate: number
          completed?: boolean
          category?: string | null
          due_date?: string | null
          focus_mode?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          priority?: "high" | "medium" | "low"
          time_estimate?: number
          completed?: boolean
          category?: string | null
          due_date?: string | null
          focus_mode?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      focus_sessions: {
        Row: {
          id: string
          user_id: string
          duration: number
          completed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          duration: number
          completed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          duration?: number
          completed?: boolean
          created_at?: string
        }
      }
      distractions: {
        Row: {
          id: string
          user_id: string
          type: "app" | "website" | "notification" | "phone" | "person" | "thought" | "other"
          source: string
          duration: number
          notes: string | null
          focus_session_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: "app" | "website" | "notification" | "phone" | "person" | "thought" | "other"
          source: string
          duration: number
          notes?: string | null
          focus_session_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: "app" | "website" | "notification" | "phone" | "person" | "thought" | "other"
          source?: string
          duration?: number
          notes?: string | null
          focus_session_id?: string | null
          created_at?: string
        }
      }
      habits: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          frequency: "daily" | "weekly"
          color: string
          completed_dates: Json
          current_streak: number
          longest_streak: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          frequency: "daily" | "weekly"
          color: string
          completed_dates?: Json
          current_streak?: number
          longest_streak?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          frequency?: "daily" | "weekly"
          color?: string
          completed_dates?: Json
          current_streak?: number
          longest_streak?: number
          created_at?: string
        }
      }
      goals: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          category: string
          target_date: string | null
          progress: number
          status: "active" | "completed" | "paused"
          color: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          category: string
          target_date?: string | null
          progress?: number
          status?: "active" | "completed" | "paused"
          color: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          category?: string
          target_date?: string | null
          progress?: number
          status?: "active" | "completed" | "paused"
          color?: string
          created_at?: string
          updated_at?: string
        }
      }
      milestones: {
        Row: {
          id: string
          goal_id: string
          title: string
          description: string | null
          completed: boolean
          due_date: string | null
          completed_date: string | null
          order: number
          created_at: string
        }
        Insert: {
          id?: string
          goal_id: string
          title: string
          description?: string | null
          completed?: boolean
          due_date?: string | null
          completed_date?: string | null
          order: number
          created_at?: string
        }
        Update: {
          id?: string
          goal_id?: string
          title?: string
          description?: string | null
          completed?: boolean
          due_date?: string | null
          completed_date?: string | null
          order?: number
          created_at?: string
        }
      }
      mood_entries: {
        Row: {
          id: string
          user_id: string
          mood: "excellent" | "good" | "neutral" | "sad" | "very-sad"
          notes: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          mood: "excellent" | "good" | "neutral" | "sad" | "very-sad"
          notes: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          mood?: "excellent" | "good" | "neutral" | "sad" | "very-sad"
          notes?: string
          created_at?: string
        }
      }
      time_blocks: {
        Row: {
          id: string
          user_id: string
          title: string
          start_time: string
          end_time: string
          date: string
          task_id: string | null
          color: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          start_time: string
          end_time: string
          date: string
          task_id?: string | null
          color: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          start_time?: string
          end_time?: string
          date?: string
          task_id?: string | null
          color?: string
          notes?: string | null
          created_at?: string
        }
      }
      challenges: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          type: "weekly" | "monthly"
          start_date: string
          end_date: string
          target: number
          current: number
          metric: "focus_sessions" | "tasks_completed" | "habits_streak" | "goals_progress"
          reward: string
          completed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description: string
          type: "weekly" | "monthly"
          start_date: string
          end_date: string
          target: number
          current?: number
          metric: "focus_sessions" | "tasks_completed" | "habits_streak" | "goals_progress"
          reward: string
          completed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          type?: "weekly" | "monthly"
          start_date?: string
          end_date?: string
          target?: number
          current?: number
          metric?: "focus_sessions" | "tasks_completed" | "habits_streak" | "goals_progress"
          reward?: string
          completed?: boolean
          created_at?: string
        }
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          unlocked_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          unlocked_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: string
          unlocked_at?: string | null
          created_at?: string
        }
      }
      achievements: {
        Row: {
          id: string
          title: string
          description: string
          icon: string
          category: "focus" | "tasks" | "habits" | "goals" | "streaks" | "milestones"
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          icon: string
          category: "focus" | "tasks" | "habits" | "goals" | "streaks" | "milestones"
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          icon?: string
          category?: "focus" | "tasks" | "habits" | "goals" | "streaks" | "milestones"
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: "reminder" | "break" | "celebration" | "suggestion" | "milestone"
          title: string
          message: string
          read: boolean
          action_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: "reminder" | "break" | "celebration" | "suggestion" | "milestone"
          title: string
          message: string
          read?: boolean
          action_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: "reminder" | "break" | "celebration" | "suggestion" | "milestone"
          title?: string
          message?: string
          read?: boolean
          action_url?: string | null
          created_at?: string
        }
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          settings?: Json
          created_at?: string
          updated_at?: string
        }
      }
      blocking_settings: {
        Row: {
          id: string
          user_id: string
          blocking_mode: "strict" | "standard" | "relaxed"
          blocked_apps: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          blocking_mode?: "strict" | "standard" | "relaxed"
          blocked_apps?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          blocking_mode?: "strict" | "standard" | "relaxed"
          blocked_apps?: Json
          created_at?: string
          updated_at?: string
        }
      }
      team_members: {
        Row: {
          id: string
          user_id: string
          name: string
          email: string
          role: "partner" | "mentor" | "teammate"
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          email: string
          role: "partner" | "mentor" | "teammate"
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          email?: string
          role?: "partner" | "mentor" | "teammate"
          created_at?: string
        }
      }
      shared_goals: {
        Row: {
          id: string
          goal_id: string
          shared_with_user_id: string
          shared_at: string
          last_viewed: string | null
          created_at: string
        }
        Insert: {
          id?: string
          goal_id: string
          shared_with_user_id: string
          shared_at?: string
          last_viewed?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          goal_id?: string
          shared_with_user_id?: string
          shared_at?: string
          last_viewed?: string | null
          created_at?: string
        }
      }
      group_challenges: {
        Row: {
          id: string
          created_by_user_id: string
          title: string
          description: string
          start_date: string
          end_date: string
          target: number
          metric: "focus_sessions" | "tasks_completed" | "habits_streak" | "goals_progress"
          leaderboard: Json
          created_at: string
        }
        Insert: {
          id?: string
          created_by_user_id: string
          title: string
          description: string
          start_date: string
          end_date: string
          target: number
          metric: "focus_sessions" | "tasks_completed" | "habits_streak" | "goals_progress"
          leaderboard?: Json
          created_at?: string
        }
        Update: {
          id?: string
          created_by_user_id?: string
          title?: string
          description?: string
          start_date?: string
          end_date?: string
          target?: number
          metric?: "focus_sessions" | "tasks_completed" | "habits_streak" | "goals_progress"
          leaderboard?: Json
          created_at?: string
        }
      }
      group_challenge_participants: {
        Row: {
          id: string
          challenge_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          challenge_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          challenge_id?: string
          user_id?: string
          created_at?: string
        }
      }
      playlists: {
        Row: {
          id: string
          user_id: string
          name: string
          sound_ids: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          sound_ids?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          sound_ids?: Json
          created_at?: string
        }
      }
      // AI System Tables
      daily_aggregates: {
        Row: {
          id: string
          user_id: string
          date: string
          total_focus_minutes: number
          focus_session_count: number
          avg_focus_duration: number | null
          longest_focus_session: number
          tasks_completed: number
          tasks_created: number
          high_priority_completed: number
          completion_rate: number | null
          distraction_count: number
          total_distraction_minutes: number
          hourly_activity: Json
          mood_score: number | null
          daily_rating: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          total_focus_minutes?: number
          focus_session_count?: number
          avg_focus_duration?: number | null
          longest_focus_session?: number
          tasks_completed?: number
          tasks_created?: number
          high_priority_completed?: number
          completion_rate?: number | null
          distraction_count?: number
          total_distraction_minutes?: number
          hourly_activity?: Json
          mood_score?: number | null
          daily_rating?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          total_focus_minutes?: number
          focus_session_count?: number
          avg_focus_duration?: number | null
          longest_focus_session?: number
          tasks_completed?: number
          tasks_created?: number
          high_priority_completed?: number
          completion_rate?: number | null
          distraction_count?: number
          total_distraction_minutes?: number
          hourly_activity?: Json
          mood_score?: number | null
          daily_rating?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      ai_plans: {
        Row: {
          id: string
          user_id: string
          plan_date: string
          schedule: Json
          explanation: string | null
          reasoning: Json | null
          generated_at: string
          model_version: string
          status: "pending" | "accepted" | "rejected" | "edited" | "expired"
          accepted_at: string | null
          rejected_at: string | null
          original_schedule: Json | null
          edit_count: number
          last_edited_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_date: string
          schedule: Json
          explanation?: string | null
          reasoning?: Json | null
          generated_at?: string
          model_version?: string
          status?: "pending" | "accepted" | "rejected" | "edited" | "expired"
          accepted_at?: string | null
          rejected_at?: string | null
          original_schedule?: Json | null
          edit_count?: number
          last_edited_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_date?: string
          schedule?: Json
          explanation?: string | null
          reasoning?: Json | null
          generated_at?: string
          model_version?: string
          status?: "pending" | "accepted" | "rejected" | "edited" | "expired"
          accepted_at?: string | null
          rejected_at?: string | null
          original_schedule?: Json | null
          edit_count?: number
          last_edited_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      plan_feedback_events: {
        Row: {
          id: string
          plan_id: string
          user_id: string
          event_type: "accepted" | "rejected" | "edited" | "task_completed" | "task_skipped"
          event_data: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          plan_id: string
          user_id: string
          event_type: "accepted" | "rejected" | "edited" | "task_completed" | "task_skipped"
          event_data?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          plan_id?: string
          user_id?: string
          event_type?: "accepted" | "rejected" | "edited" | "task_completed" | "task_skipped"
          event_data?: Json | null
          created_at?: string
        }
      }
      user_ai_profiles: {
        Row: {
          id: string
          user_id: string
          optimal_focus_duration: number
          preferred_work_start_hour: number
          preferred_work_end_hour: number
          preferred_break_duration: number
          hourly_performance_scores: Json
          most_productive_hours: Json
          common_distraction_times: Json
          total_plans_generated: number
          total_plans_accepted: number
          total_plans_rejected: number
          avg_plan_acceptance_rate: number | null
          last_analyzed_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          optimal_focus_duration?: number
          preferred_work_start_hour?: number
          preferred_work_end_hour?: number
          preferred_break_duration?: number
          hourly_performance_scores?: Json
          most_productive_hours?: Json
          common_distraction_times?: Json
          total_plans_generated?: number
          total_plans_accepted?: number
          total_plans_rejected?: number
          avg_plan_acceptance_rate?: number | null
          last_analyzed_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          optimal_focus_duration?: number
          preferred_work_start_hour?: number
          preferred_work_end_hour?: number
          preferred_break_duration?: number
          hourly_performance_scores?: Json
          most_productive_hours?: Json
          common_distraction_times?: Json
          total_plans_generated?: number
          total_plans_accepted?: number
          total_plans_rejected?: number
          avg_plan_acceptance_rate?: number | null
          last_analyzed_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      ai_chat_history: {
        Row: {
          id: string
          user_id: string
          role: "user" | "assistant"
          message: string
          context_snapshot: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: "user" | "assistant"
          message: string
          context_snapshot?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: "user" | "assistant"
          message?: string
          context_snapshot?: Json | null
          created_at?: string
        }
      }
    }
  }
}


