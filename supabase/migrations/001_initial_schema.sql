-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  time_estimate INTEGER NOT NULL DEFAULT 30,
  completed BOOLEAN DEFAULT false,
  category TEXT,
  due_date TIMESTAMPTZ,
  focus_mode BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Focus sessions table
CREATE TABLE public.focus_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  duration INTEGER NOT NULL,
  completed BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Distractions table
CREATE TABLE public.distractions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('app', 'website', 'notification', 'phone', 'person', 'thought', 'other')),
  source TEXT NOT NULL,
  duration INTEGER NOT NULL,
  notes TEXT,
  focus_session_id UUID REFERENCES public.focus_sessions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habits table
CREATE TABLE public.habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly')),
  color TEXT NOT NULL,
  completed_dates JSONB DEFAULT '[]'::jsonb,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Goals table
CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  target_date DATE,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Milestones table
CREATE TABLE public.milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT false,
  due_date DATE,
  completed_date DATE,
  "order" INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mood entries table
CREATE TABLE public.mood_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mood TEXT NOT NULL CHECK (mood IN ('excellent', 'good', 'neutral', 'sad', 'very-sad')),
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Time blocks table
CREATE TABLE public.time_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  date DATE NOT NULL,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  color TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Challenges table
CREATE TABLE public.challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('weekly', 'monthly')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  target INTEGER NOT NULL,
  current INTEGER DEFAULT 0,
  metric TEXT NOT NULL CHECK (metric IN ('focus_sessions', 'tasks_completed', 'habits_streak', 'goals_progress')),
  reward TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Achievements table (static/master data)
CREATE TABLE public.achievements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('focus', 'tasks', 'habits', 'goals', 'streaks', 'milestones')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User achievements junction table
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('reminder', 'break', 'celebration', 'suggestion', 'milestone')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User settings table
CREATE TABLE public.user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  settings JSONB DEFAULT '{"focusDuration": 25, "breakDuration": 5, "dailyGoal": 8, "theme": "dark", "soundEnabled": true}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blocking settings table
CREATE TABLE public.blocking_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  blocking_mode TEXT NOT NULL DEFAULT 'standard' CHECK (blocking_mode IN ('strict', 'standard', 'relaxed')),
  blocked_apps JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team members table
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('partner', 'mentor', 'teammate')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shared goals table
CREATE TABLE public.shared_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  shared_with_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_at TIMESTAMPTZ DEFAULT NOW(),
  last_viewed TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(goal_id, shared_with_user_id)
);

-- Group challenges table
CREATE TABLE public.group_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  target INTEGER NOT NULL,
  metric TEXT NOT NULL CHECK (metric IN ('focus_sessions', 'tasks_completed', 'habits_streak', 'goals_progress')),
  leaderboard JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Group challenge participants table
CREATE TABLE public.group_challenge_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID NOT NULL REFERENCES public.group_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(challenge_id, user_id)
);

-- Playlists table
CREATE TABLE public.playlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sound_ids JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_completed ON public.tasks(completed);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX idx_focus_sessions_user_id ON public.focus_sessions(user_id);
CREATE INDEX idx_focus_sessions_created_at ON public.focus_sessions(created_at);
CREATE INDEX idx_distractions_user_id ON public.distractions(user_id);
CREATE INDEX idx_habits_user_id ON public.habits(user_id);
CREATE INDEX idx_goals_user_id ON public.goals(user_id);
CREATE INDEX idx_milestones_goal_id ON public.milestones(goal_id);
CREATE INDEX idx_mood_entries_user_id ON public.mood_entries(user_id);
CREATE INDEX idx_mood_entries_created_at ON public.mood_entries(created_at);
CREATE INDEX idx_time_blocks_user_id ON public.time_blocks(user_id);
CREATE INDEX idx_time_blocks_date ON public.time_blocks(date);
CREATE INDEX idx_challenges_user_id ON public.challenges(user_id);
CREATE INDEX idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);
CREATE INDEX idx_shared_goals_goal_id ON public.shared_goals(goal_id);
CREATE INDEX idx_shared_goals_user_id ON public.shared_goals(shared_with_user_id);
CREATE INDEX idx_group_challenge_participants_challenge_id ON public.group_challenge_participants(challenge_id);
CREATE INDEX idx_group_challenge_participants_user_id ON public.group_challenge_participants(user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON public.goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blocking_settings_updated_at BEFORE UPDATE ON public.blocking_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, onboarding_completed)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NULL),
    false
  );
  
  -- Create default user settings
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);
  
  -- Create default blocking settings
  INSERT INTO public.blocking_settings (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.distractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocking_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for tasks table
CREATE POLICY "Users can view their own tasks"
  ON public.tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
  ON public.tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
  ON public.tasks FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for focus_sessions table
CREATE POLICY "Users can view their own focus sessions"
  ON public.focus_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own focus sessions"
  ON public.focus_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own focus sessions"
  ON public.focus_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own focus sessions"
  ON public.focus_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for distractions table
CREATE POLICY "Users can view their own distractions"
  ON public.distractions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own distractions"
  ON public.distractions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own distractions"
  ON public.distractions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own distractions"
  ON public.distractions FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for habits table
CREATE POLICY "Users can view their own habits"
  ON public.habits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own habits"
  ON public.habits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habits"
  ON public.habits FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habits"
  ON public.habits FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for goals table
CREATE POLICY "Users can view their own goals"
  ON public.goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals"
  ON public.goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals"
  ON public.goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals"
  ON public.goals FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for milestones table
CREATE POLICY "Users can view milestones of their goals"
  ON public.milestones FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.goals
      WHERE goals.id = milestones.goal_id
      AND goals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert milestones to their goals"
  ON public.milestones FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.goals
      WHERE goals.id = milestones.goal_id
      AND goals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update milestones of their goals"
  ON public.milestones FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.goals
      WHERE goals.id = milestones.goal_id
      AND goals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete milestones of their goals"
  ON public.milestones FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.goals
      WHERE goals.id = milestones.goal_id
      AND goals.user_id = auth.uid()
    )
  );

-- RLS Policies for mood_entries table
CREATE POLICY "Users can view their own mood entries"
  ON public.mood_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mood entries"
  ON public.mood_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mood entries"
  ON public.mood_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mood entries"
  ON public.mood_entries FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for time_blocks table
CREATE POLICY "Users can view their own time blocks"
  ON public.time_blocks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own time blocks"
  ON public.time_blocks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own time blocks"
  ON public.time_blocks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own time blocks"
  ON public.time_blocks FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for challenges table
CREATE POLICY "Users can view their own challenges"
  ON public.challenges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own challenges"
  ON public.challenges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own challenges"
  ON public.challenges FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own challenges"
  ON public.challenges FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for achievements table (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view all achievements"
  ON public.achievements FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for user_achievements table
CREATE POLICY "Users can view their own achievements"
  ON public.user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements"
  ON public.user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own achievements"
  ON public.user_achievements FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for notifications table
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for user_settings table
CREATE POLICY "Users can view their own settings"
  ON public.user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON public.user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON public.user_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for blocking_settings table
CREATE POLICY "Users can view their own blocking settings"
  ON public.blocking_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own blocking settings"
  ON public.blocking_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own blocking settings"
  ON public.blocking_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for team_members table
CREATE POLICY "Users can view their own team members"
  ON public.team_members FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own team members"
  ON public.team_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own team members"
  ON public.team_members FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own team members"
  ON public.team_members FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for shared_goals table
CREATE POLICY "Users can view goals shared with them"
  ON public.shared_goals FOR SELECT
  USING (
    auth.uid() = shared_with_user_id
    OR EXISTS (
      SELECT 1 FROM public.goals
      WHERE goals.id = shared_goals.goal_id
      AND goals.user_id = auth.uid()
    )
  );

CREATE POLICY "Goal owners can share goals"
  ON public.shared_goals FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.goals
      WHERE goals.id = shared_goals.goal_id
      AND goals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update shared goals they have access to"
  ON public.shared_goals FOR UPDATE
  USING (
    auth.uid() = shared_with_user_id
    OR EXISTS (
      SELECT 1 FROM public.goals
      WHERE goals.id = shared_goals.goal_id
      AND goals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete shared goals they have access to"
  ON public.shared_goals FOR DELETE
  USING (
    auth.uid() = shared_with_user_id
    OR EXISTS (
      SELECT 1 FROM public.goals
      WHERE goals.id = shared_goals.goal_id
      AND goals.user_id = auth.uid()
    )
  );

-- RLS Policies for group_challenges table
CREATE POLICY "Users can view challenges they participate in"
  ON public.group_challenges FOR SELECT
  USING (
    auth.uid() = created_by_user_id
    OR EXISTS (
      SELECT 1 FROM public.group_challenge_participants
      WHERE group_challenge_participants.challenge_id = group_challenges.id
      AND group_challenge_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create group challenges"
  ON public.group_challenges FOR INSERT
  WITH CHECK (auth.uid() = created_by_user_id);

CREATE POLICY "Challenge creators can update challenges"
  ON public.group_challenges FOR UPDATE
  USING (auth.uid() = created_by_user_id);

CREATE POLICY "Challenge creators can delete challenges"
  ON public.group_challenges FOR DELETE
  USING (auth.uid() = created_by_user_id);

-- RLS Policies for group_challenge_participants table
CREATE POLICY "Users can view participants of challenges they're in"
  ON public.group_challenge_participants FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.group_challenges
      WHERE group_challenges.id = group_challenge_participants.challenge_id
      AND group_challenges.created_by_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join challenges"
  ON public.group_challenge_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave challenges"
  ON public.group_challenge_participants FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for playlists table
CREATE POLICY "Users can view their own playlists"
  ON public.playlists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own playlists"
  ON public.playlists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own playlists"
  ON public.playlists FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own playlists"
  ON public.playlists FOR DELETE
  USING (auth.uid() = user_id);

-- Insert default achievements
INSERT INTO public.achievements (id, title, description, icon, category) VALUES
  ('first_focus', 'First Focus', 'Complete your first focus session', '🎯', 'focus'),
  ('focus_master', 'Focus Master', 'Complete 10 focus sessions', '🔥', 'focus'),
  ('task_warrior', 'Task Warrior', 'Complete 50 tasks', '⚔️', 'tasks'),
  ('habit_hero', 'Habit Hero', 'Maintain a 7-day streak on any habit', '💪', 'habits'),
  ('goal_getter', 'Goal Getter', 'Complete your first goal', '🏆', 'goals'),
  ('streak_king', 'Streak King', 'Maintain a 30-day focus streak', '👑', 'streaks'),
  ('milestone_master', 'Milestone Master', 'Complete 10 milestones', '⭐', 'milestones');

