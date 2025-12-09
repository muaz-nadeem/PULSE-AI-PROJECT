-- Energy Tracking System for AI Energy Optimizer
-- This migration adds tables to track user energy levels throughout the day
-- and store AI-generated energy pattern analysis

-- Energy entries table - stores individual energy readings
CREATE TABLE public.energy_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  energy_level INTEGER NOT NULL CHECK (energy_level >= 1 AND energy_level <= 5),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  -- Context data
  activity_type TEXT CHECK (activity_type IN ('work', 'break', 'exercise', 'meal', 'sleep', 'other')),
  mood TEXT CHECK (mood IN ('excellent', 'good', 'neutral', 'sad', 'very-sad')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User energy patterns table - stores AI analysis results
CREATE TABLE public.user_energy_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Hourly energy scores (0-100 scale, 24 hours)
  hourly_energy_scores JSONB DEFAULT '[]'::jsonb,
  
  -- Peak performance hours (array of hours 0-23)
  peak_hours INTEGER[] DEFAULT '{}',
  
  -- Low energy hours
  low_hours INTEGER[] DEFAULT '{}',
  
  -- Recommended task scheduling
  high_priority_hours INTEGER[] DEFAULT '{}',
  break_recommended_hours INTEGER[] DEFAULT '{}',
  
  -- Pattern insights
  avg_morning_energy DECIMAL(3,2) DEFAULT 0,
  avg_afternoon_energy DECIMAL(3,2) DEFAULT 0,
  avg_evening_energy DECIMAL(3,2) DEFAULT 0,
  
  -- Best day patterns
  best_day_of_week INTEGER, -- 0=Sunday, 6=Saturday
  worst_day_of_week INTEGER,
  
  -- AI recommendations (stored as JSONB for flexibility)
  ai_recommendations JSONB DEFAULT '[]'::jsonb,
  
  -- Analysis metadata
  last_analyzed_at TIMESTAMPTZ,
  total_entries_analyzed INTEGER DEFAULT 0,
  analysis_confidence DECIMAL(3,2) DEFAULT 0, -- 0-1 scale
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Weekly AI insights reports
CREATE TABLE public.weekly_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Report period
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  
  -- Summary stats
  total_focus_minutes INTEGER DEFAULT 0,
  total_tasks_completed INTEGER DEFAULT 0,
  total_tasks_created INTEGER DEFAULT 0,
  total_habits_completed INTEGER DEFAULT 0,
  avg_mood_score DECIMAL(3,2),
  avg_energy_score DECIMAL(3,2),
  streak_days INTEGER DEFAULT 0,
  
  -- Best performing metrics
  best_day DATE,
  best_day_focus_minutes INTEGER,
  most_productive_hour INTEGER,
  
  -- Challenges identified
  common_distractions JSONB DEFAULT '[]'::jsonb,
  missed_habits JSONB DEFAULT '[]'::jsonb,
  
  -- Trends (compared to previous week)
  focus_trend DECIMAL(5,2), -- percentage change
  task_completion_trend DECIMAL(5,2),
  habit_consistency_trend DECIMAL(5,2),
  
  -- AI-generated content
  summary_text TEXT,
  key_achievements JSONB DEFAULT '[]'::jsonb,
  recommendations JSONB DEFAULT '[]'::jsonb,
  motivational_message TEXT,
  
  -- Generation metadata
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  model_version TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one report per week per user
  UNIQUE(user_id, week_start)
);

-- Task decomposition history (for learning and improving suggestions)
CREATE TABLE public.task_decompositions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Original task
  original_task_title TEXT NOT NULL,
  original_task_description TEXT,
  original_estimated_time INTEGER, -- minutes
  
  -- AI-generated subtasks
  subtasks JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Example subtask structure:
  -- { "title": "...", "estimatedTime": 30, "priority": "high", "order": 1 }
  
  total_estimated_time INTEGER, -- sum of all subtask times
  subtask_count INTEGER,
  
  -- User feedback
  was_accepted BOOLEAN,
  subtasks_used INTEGER, -- how many subtasks user actually added
  user_modified BOOLEAN DEFAULT false,
  feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
  feedback_notes TEXT,
  
  -- Generation metadata
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  model_version TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX idx_energy_entries_user_id ON public.energy_entries(user_id);
CREATE INDEX idx_energy_entries_recorded_at ON public.energy_entries(recorded_at);
CREATE INDEX idx_energy_entries_user_time ON public.energy_entries(user_id, recorded_at);
CREATE INDEX idx_user_energy_patterns_user_id ON public.user_energy_patterns(user_id);
CREATE INDEX idx_weekly_insights_user_id ON public.weekly_insights(user_id);
CREATE INDEX idx_weekly_insights_week ON public.weekly_insights(user_id, week_start);
CREATE INDEX idx_task_decompositions_user_id ON public.task_decompositions(user_id);

-- Trigger for updated_at
CREATE TRIGGER update_user_energy_patterns_updated_at 
  BEFORE UPDATE ON public.user_energy_patterns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.energy_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_energy_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_decompositions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for energy_entries
CREATE POLICY "Users can view their own energy entries"
  ON public.energy_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own energy entries"
  ON public.energy_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own energy entries"
  ON public.energy_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own energy entries"
  ON public.energy_entries FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for user_energy_patterns
CREATE POLICY "Users can view their own energy patterns"
  ON public.user_energy_patterns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own energy patterns"
  ON public.user_energy_patterns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own energy patterns"
  ON public.user_energy_patterns FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for weekly_insights
CREATE POLICY "Users can view their own weekly insights"
  ON public.weekly_insights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own weekly insights"
  ON public.weekly_insights FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weekly insights"
  ON public.weekly_insights FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for task_decompositions
CREATE POLICY "Users can view their own task decompositions"
  ON public.task_decompositions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own task decompositions"
  ON public.task_decompositions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own task decompositions"
  ON public.task_decompositions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own task decompositions"
  ON public.task_decompositions FOR DELETE
  USING (auth.uid() = user_id);

-- Function to initialize energy patterns for new users
CREATE OR REPLACE FUNCTION public.init_user_energy_patterns()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_energy_patterns (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger to create energy patterns on user creation
CREATE TRIGGER on_user_created_init_energy
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.init_user_energy_patterns();
