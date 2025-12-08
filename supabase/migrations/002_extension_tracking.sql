-- Migration: Add extension tracking tables
-- Created: 2024

-- Tab analytics table for tracking browser usage
CREATE TABLE IF NOT EXISTS public.tab_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  url TEXT,
  title TEXT,
  time_spent INTEGER NOT NULL, -- in seconds
  visit_count INTEGER DEFAULT 1,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_tab_analytics_user_date ON public.tab_analytics(user_id, date);
CREATE INDEX IF NOT EXISTS idx_tab_analytics_domain ON public.tab_analytics(domain);

-- Accepted schedules table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.accepted_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  schedule JSONB NOT NULL, -- Array of schedule items
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Index for accepted schedules
CREATE INDEX IF NOT EXISTS idx_accepted_schedules_user_date ON public.accepted_schedules(user_id, date);

-- Row Level Security for tab_analytics
ALTER TABLE public.tab_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tab analytics"
  ON public.tab_analytics
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tab analytics"
  ON public.tab_analytics
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tab analytics"
  ON public.tab_analytics
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Row Level Security for accepted_schedules
ALTER TABLE public.accepted_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own accepted schedules"
  ON public.accepted_schedules
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own accepted schedules"
  ON public.accepted_schedules
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own accepted schedules"
  ON public.accepted_schedules
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for tab_analytics
CREATE TRIGGER update_tab_analytics_updated_at
  BEFORE UPDATE ON public.tab_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for accepted_schedules
CREATE TRIGGER update_accepted_schedules_updated_at
  BEFORE UPDATE ON public.accepted_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

