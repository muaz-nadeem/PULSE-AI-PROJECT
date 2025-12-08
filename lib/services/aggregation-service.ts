import { supabase } from '../supabase/client';
import type { DailyAggregate } from '../ai/types';

/**
 * Parses mood string to numeric score.
 */
function parseMoodToScore(mood: string): number {
  const moodMap: Record<string, number> = {
    'excellent': 5,
    'good': 4,
    'neutral': 3,
    'sad': 2,
    'very-sad': 1,
  };
  return moodMap[mood] || 3;
}

/**
 * Computes and stores daily aggregates for a user for a specific date.
 * This aggregates raw data (tasks, focus sessions, distractions, mood) into metrics.
 */
export async function computeDailyAggregates(
  userId: string,
  date: Date
): Promise<DailyAggregate | null> {
  const dateStr = date.toISOString().split('T')[0];
  const nextDateStr = new Date(date.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  try {
    // Fetch raw data for the day in parallel
    const [tasksRes, focusSessionsRes, distractionsRes, moodEntriesRes] = await Promise.all([
      supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', `${dateStr}T00:00:00`)
        .lt('created_at', `${nextDateStr}T00:00:00`),
      supabase
        .from('focus_sessions')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', `${dateStr}T00:00:00`)
        .lt('created_at', `${nextDateStr}T00:00:00`),
      supabase
        .from('distractions')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', `${dateStr}T00:00:00`)
        .lt('created_at', `${nextDateStr}T00:00:00`),
      supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', `${dateStr}T00:00:00`)
        .lt('created_at', `${nextDateStr}T00:00:00`)
        .order('created_at', { ascending: false })
        .limit(1),
    ]);

    const tasks = tasksRes.data || [];
    const focusSessions = focusSessionsRes.data || [];
    const distractions = distractionsRes.data || [];
    const moodEntries = moodEntriesRes.data || [];

    // Compute focus metrics
    const totalFocusMinutes = focusSessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const focusSessionCount = focusSessions.length;
    const avgFocusDuration = focusSessionCount > 0 ? totalFocusMinutes / focusSessionCount : 0;
    const longestFocusSession = focusSessions.length > 0
      ? Math.max(...focusSessions.map(s => s.duration || 0))
      : 0;

    // Compute task metrics
    const completedTasks = tasks.filter(t => t.completed);
    const tasksCompleted = completedTasks.length;
    const tasksCreated = tasks.length;
    const highPriorityCompleted = completedTasks.filter(t => t.priority === 'high').length;
    const completionRate = tasksCreated > 0 ? tasksCompleted / tasksCreated : 0;

    // Compute distraction metrics
    const distractionCount = distractions.length;
    const totalDistractionMinutes = distractions.reduce((sum, d) => sum + (d.duration || 0), 0);

    // Compute hourly activity (focus minutes per hour)
    const hourlyActivity = new Array(24).fill(0);
    focusSessions.forEach(session => {
      const hour = new Date(session.created_at).getHours();
      hourlyActivity[hour] += session.duration || 0;
    });

    // Get mood score from latest mood entry
    const moodScore = moodEntries.length > 0
      ? parseMoodToScore(moodEntries[0].mood)
      : null;

    // Upsert the aggregate
    const aggregateData = {
      user_id: userId,
      date: dateStr,
      total_focus_minutes: totalFocusMinutes,
      focus_session_count: focusSessionCount,
      avg_focus_duration: Math.round(avgFocusDuration * 100) / 100,
      longest_focus_session: longestFocusSession,
      tasks_completed: tasksCompleted,
      tasks_created: tasksCreated,
      high_priority_completed: highPriorityCompleted,
      completion_rate: Math.round(completionRate * 100) / 100,
      distraction_count: distractionCount,
      total_distraction_minutes: totalDistractionMinutes,
      hourly_activity: hourlyActivity,
      mood_score: moodScore,
    };

    const { data, error } = await supabase
      .from('daily_aggregates')
      .upsert(aggregateData, { onConflict: 'user_id,date' })
      .select()
      .single();

    if (error) {
      console.error('Failed to upsert daily aggregate:', error);
      return null;
    }

    return data as DailyAggregate;
  } catch (error) {
    console.error('Error computing daily aggregates:', error);
    return null;
  }
}

/**
 * Fetches recent daily aggregates for a user.
 */
export async function getRecentAggregates(
  userId: string,
  days: number = 14
): Promise<DailyAggregate[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('daily_aggregates')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDateStr)
    .order('date', { ascending: false });

  if (error) {
    console.error('Failed to fetch recent aggregates:', error);
    return [];
  }

  return (data || []) as DailyAggregate[];
}

/**
 * Updates the daily rating for a specific date.
 */
export async function updateDailyRating(
  userId: string,
  date: string,
  rating: number
): Promise<boolean> {
  // Ensure rating is in valid range
  const clampedRating = Math.max(1, Math.min(10, rating));

  const { error } = await supabase
    .from('daily_aggregates')
    .upsert(
      {
        user_id: userId,
        date,
        daily_rating: clampedRating,
      },
      { onConflict: 'user_id,date' }
    );

  if (error) {
    console.error('Failed to update daily rating:', error);
    return false;
  }

  return true;
}

/**
 * Computes aggregates for multiple past days (backfill).
 */
export async function backfillAggregates(
  userId: string,
  daysBack: number = 30
): Promise<number> {
  let successCount = 0;

  for (let i = 1; i <= daysBack; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    const result = await computeDailyAggregates(userId, date);
    if (result) successCount++;
  }

  return successCount;
}

