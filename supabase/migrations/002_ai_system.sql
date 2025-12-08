-- AI System Tables Migration
-- This migration adds tables for AI-powered features: aggregates, plans, feedback, profiles, and chat

-- Table: daily_aggregates
-- Stores computed daily metrics for each user
CREATE TABLE public.daily_aggregates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Focus metrics
  total_focus_minutes INTEGER DEFAULT 0,
  focus_session_count INTEGER DEFAULT 0,
  avg_focus_duration DECIMAL(5,2),
  longest_focus_session INTEGER DEFAULT 0,
  
  -- Task metrics
  tasks_completed INTEGER DEFAULT 0,
  tasks_created INTEGER DEFAULT 0,
  high_priority_completed INTEGER DEFAULT 0,
  completion_rate DECIMAL(5,2),
  
  -- Distraction metrics
  distraction_count INTEGER DEFAULT 0,
  total_distraction_minutes INTEGER DEFAULT 0,
  
  -- Time-of-day patterns (JSON array of hourly activity scores 0-23)
  hourly_activity JSONB DEFAULT '[]'::jsonb,
  
  -- Mood/ratings
  mood_score INTEGER, -- 1-5 or null
  daily_rating INTEGER, -- 1-10 or null (user's end-of-day rating)
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, date)
);

CREATE INDEX idx_daily_aggregates_user_date ON public.daily_aggregates(user_id, date DESC);

-- Table: ai_plans
-- Stores AI-generated daily plans and their metadata
CREATE TABLE public.ai_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_date DATE NOT NULL,
  
  -- Plan content (array of schedule items)
  schedule JSONB NOT NULL, -- [{time, duration, task, priority, taskId}]
  
  -- AI explanation
  explanation TEXT,
  reasoning JSONB, -- Structured reasoning: {focusHours: [...], breakSuggestions: [...]}
  
  -- Metadata
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  model_version TEXT DEFAULT 'gemini-1.5-pro',
  
  -- Feedback tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'edited', 'expired')),
  accepted_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  
  -- Edit tracking
  original_schedule JSONB, -- Copy of schedule before edits
  edit_count INTEGER DEFAULT 0,
  last_edited_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, plan_date)
);

CREATE INDEX idx_ai_plans_user_date ON public.ai_plans(user_id, plan_date DESC);
CREATE INDEX idx_ai_plans_status ON public.ai_plans(status);

-- Table: plan_feedback_events
-- Logs user interactions with AI plans for detailed feedback analysis
CREATE TABLE public.plan_feedback_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES public.ai_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  event_type TEXT NOT NULL CHECK (event_type IN ('accepted', 'rejected', 'edited', 'task_completed', 'task_skipped')),
  
  -- Event-specific data
  event_data JSONB, -- {editedFields: [...], taskId: "...", reason: "..."}
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_feedback_events_plan ON public.plan_feedback_events(plan_id);
CREATE INDEX idx_feedback_events_user ON public.plan_feedback_events(user_id, created_at DESC);

-- Table: user_ai_profiles
-- Stores learned personalization data for each user
CREATE TABLE public.user_ai_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Learned preferences
  optimal_focus_duration INTEGER DEFAULT 25, -- minutes
  preferred_work_start_hour INTEGER DEFAULT 9, -- 0-23
  preferred_work_end_hour INTEGER DEFAULT 17,
  preferred_break_duration INTEGER DEFAULT 5,
  
  -- Time-of-day performance (0.0-1.0 scores for each hour)
  hourly_performance_scores JSONB DEFAULT '[]'::jsonb, -- [0.8, 0.9, 0.7, ...]
  
  -- Patterns
  most_productive_hours JSONB DEFAULT '[]'::jsonb, -- [9, 10, 11]
  common_distraction_times JSONB DEFAULT '[]'::jsonb, -- [14, 15]
  
  -- Historical stats
  total_plans_generated INTEGER DEFAULT 0,
  total_plans_accepted INTEGER DEFAULT 0,
  total_plans_rejected INTEGER DEFAULT 0,
  avg_plan_acceptance_rate DECIMAL(5,2),
  
  -- Last update tracking
  last_analyzed_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_ai_profiles_user ON public.user_ai_profiles(user_id);

-- Table: ai_chat_history
-- Stores conversation history for AI Coach feature
CREATE TABLE public.ai_chat_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  message TEXT NOT NULL,
  
  -- Context at time of message
  context_snapshot JSONB, -- {tasksSummary, recentFocus, currentGoals}
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_history_user ON public.ai_chat_history(user_id, created_at DESC);

-- Enable RLS on all new tables
ALTER TABLE public.daily_aggregates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_feedback_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_ai_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for daily_aggregates
CREATE POLICY "Users can view their own aggregates"
  ON public.daily_aggregates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own aggregates"
  ON public.daily_aggregates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own aggregates"
  ON public.daily_aggregates FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for ai_plans
CREATE POLICY "Users can view their own plans"
  ON public.ai_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own plans"
  ON public.ai_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plans"
  ON public.ai_plans FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for plan_feedback_events
CREATE POLICY "Users can view their own feedback"
  ON public.plan_feedback_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own feedback"
  ON public.plan_feedback_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_ai_profiles
CREATE POLICY "Users can view their own profile"
  ON public.user_ai_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.user_ai_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.user_ai_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for ai_chat_history
CREATE POLICY "Users can view their own chat history"
  ON public.ai_chat_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat messages"
  ON public.ai_chat_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Triggers for updated_at columns
CREATE TRIGGER update_daily_aggregates_updated_at 
  BEFORE UPDATE ON public.daily_aggregates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_plans_updated_at 
  BEFORE UPDATE ON public.ai_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_ai_profiles_updated_at 
  BEFORE UPDATE ON public.user_ai_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create AI profile for new users (extends existing handle_new_user trigger)
-- Note: We'll add profile creation to the existing trigger or create profiles on first AI interaction

