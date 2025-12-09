-- Migration: Add habit scheduling columns for AI integration
-- This enables habits to be automatically scheduled by the AI into daily plans

-- Add scheduling columns to habits table
ALTER TABLE public.habits 
ADD COLUMN IF NOT EXISTS preferred_time TEXT DEFAULT 'morning',
ADD COLUMN IF NOT EXISTS duration INTEGER DEFAULT 15,
ADD COLUMN IF NOT EXISTS auto_schedule BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'other';

-- Add comments for documentation
COMMENT ON COLUMN public.habits.preferred_time IS 'When the habit should be scheduled: morning, afternoon, evening, or specific HH:MM time';
COMMENT ON COLUMN public.habits.duration IS 'Estimated duration in minutes';
COMMENT ON COLUMN public.habits.auto_schedule IS 'Whether AI should include this habit in daily schedule generation';
COMMENT ON COLUMN public.habits.category IS 'Habit category: health, learning, mindfulness, productivity, social, other';

-- Create index for efficient habit queries during schedule generation
CREATE INDEX IF NOT EXISTS idx_habits_auto_schedule 
ON public.habits(user_id, auto_schedule) 
WHERE auto_schedule = true;

-- Create index for category-based queries
CREATE INDEX IF NOT EXISTS idx_habits_category 
ON public.habits(user_id, category);

-- Add scheduled_time column for storing AI-assigned times
ALTER TABLE public.habits 
ADD COLUMN IF NOT EXISTS scheduled_time TEXT;

COMMENT ON COLUMN public.habits.scheduled_time IS 'Today''s scheduled time assigned by AI (HH:MM format)';

-- Create a table to track habit completion history with timing data
CREATE TABLE IF NOT EXISTS public.habit_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  completed_date DATE NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  scheduled_time TEXT,
  actual_time TEXT,
  on_time BOOLEAN, -- Whether completed within scheduled window
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(habit_id, completed_date)
);

-- Add indexes for habit completions
CREATE INDEX IF NOT EXISTS idx_habit_completions_user 
ON public.habit_completions(user_id, completed_date);

CREATE INDEX IF NOT EXISTS idx_habit_completions_habit 
ON public.habit_completions(habit_id, completed_date);

-- Enable RLS on habit_completions
ALTER TABLE public.habit_completions ENABLE ROW LEVEL SECURITY;

-- RLS policies for habit_completions
CREATE POLICY "Users can view own habit completions"
  ON public.habit_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own habit completions"
  ON public.habit_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own habit completions"
  ON public.habit_completions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own habit completions"
  ON public.habit_completions FOR DELETE
  USING (auth.uid() = user_id);

-- Create a view for habit analytics
CREATE OR REPLACE VIEW public.habit_analytics AS
SELECT 
  h.user_id,
  h.id AS habit_id,
  h.name AS habit_name,
  h.category,
  h.preferred_time,
  h.duration,
  h.current_streak,
  h.longest_streak,
  COUNT(hc.id) AS total_completions,
  COUNT(CASE WHEN hc.on_time = true THEN 1 END) AS on_time_completions,
  ROUND(
    COUNT(CASE WHEN hc.on_time = true THEN 1 END)::NUMERIC / 
    NULLIF(COUNT(hc.id), 0) * 100, 
    2
  ) AS on_time_percentage,
  MAX(hc.completed_date) AS last_completed
FROM public.habits h
LEFT JOIN public.habit_completions hc ON h.id = hc.habit_id
GROUP BY h.user_id, h.id, h.name, h.category, h.preferred_time, h.duration, h.current_streak, h.longest_streak;

-- Grant access to the view
GRANT SELECT ON public.habit_analytics TO authenticated;

-- Function to update scheduled_time for habits based on AI plan
CREATE OR REPLACE FUNCTION public.update_habit_scheduled_times(
  p_user_id UUID,
  p_schedule JSONB
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Reset all scheduled times for this user's habits
  UPDATE public.habits 
  SET scheduled_time = NULL 
  WHERE user_id = p_user_id;
  
  -- Update scheduled times from the AI plan
  UPDATE public.habits h
  SET scheduled_time = (schedule_item->>'time')
  FROM jsonb_array_elements(p_schedule) AS schedule_item
  WHERE h.user_id = p_user_id 
    AND h.id = (schedule_item->>'habitId')::UUID
    AND schedule_item->>'type' = 'habit';
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.update_habit_scheduled_times(UUID, JSONB) TO authenticated;

