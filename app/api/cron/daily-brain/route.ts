import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { computeDailyAggregates } from '@/lib/services/aggregation-service';
import { updateUserAIProfile, getUserAIProfile } from '@/lib/services/personalization-service';
import { generateScheduleWithFallback } from '@/lib/ai/schedule-generator';
import { getRecentAggregates } from '@/lib/services/aggregation-service';
import { logAIEvent, logAIError } from '@/lib/ai/logger';
import type { ScheduleContext, Task, Goal, ScheduledHabit } from '@/lib/ai/types';
import { getDefaultProfile } from '@/lib/ai/types';

// Create a Supabase client with service role for server-side operations
function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase configuration for service client');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Daily Brain Cron Job
 * 
 * This endpoint runs daily (configured in vercel.json) to:
 * 1. Compute yesterday's aggregates for all active users
 * 2. Update personalization profiles
 * 3. Generate today's AI schedule for each user
 * 
 * Security: Protected by CRON_SECRET environment variable
 */
export async function GET(request: NextRequest) {
  // Verify cron secret for security
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if AI features are enabled
  if (process.env.AI_DAILY_BRAIN_ENABLED !== 'true') {
    return NextResponse.json({ message: 'Daily brain is disabled' }, { status: 200 });
  }

  const startTime = Date.now();
  logAIEvent('daily_brain_start', { timestamp: new Date().toISOString() });

  try {
    const supabase = createServiceClient();

    // Get all active users (users who have completed onboarding)
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('onboarding_completed', true);

    if (usersError) {
      throw new Error(`Failed to fetch users: ${usersError.message}`);
    }

    if (!users || users.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No active users to process',
        processed: 0 
      });
    }

    const results: { userId: string; status: string; error?: string }[] = [];
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const todayStr = today.toISOString().split('T')[0];

    // Process each user (in production, consider batching or using a queue)
    for (const user of users) {
      try {
        logAIEvent('processing_user', { userId: user.id });

        // Step 1: Compute yesterday's aggregates
        await computeDailyAggregatesForUser(supabase, user.id, yesterday);

        // Step 2: Update personalization profile
        await updateUserAIProfile(user.id);

        // Step 3: Build context and generate today's schedule
        const context = await buildScheduleContextForUser(supabase, user);
        const schedule = await generateScheduleWithFallback(user.id, context);

        // Step 4: Store the plan
        const { error: upsertError } = await supabase
          .from('ai_plans')
          .upsert({
            user_id: user.id,
            plan_date: todayStr,
            schedule: schedule.schedule,
            explanation: schedule.explanation,
            reasoning: schedule.reasoning,
            model_version: schedule.modelVersion,
            status: 'pending',
            generated_at: new Date().toISOString(),
          }, { onConflict: 'user_id,plan_date' });

        if (upsertError) {
          throw new Error(`Failed to store plan: ${upsertError.message}`);
        }

        results.push({ userId: user.id, status: 'success' });
        logAIEvent('user_processed_success', { 
          userId: user.id, 
          scheduleItems: schedule.schedule.length 
        });

      } catch (userError) {
        const errorMessage = (userError as Error).message;
        logAIError(userError as Error, { userId: user.id, operation: 'daily_brain_user' });
        results.push({ userId: user.id, status: 'error', error: errorMessage });
      }
    }

    const latency = Date.now() - startTime;
    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;

    logAIEvent('daily_brain_complete', {
      latencyMs: latency,
      totalUsers: users.length,
      successCount,
      errorCount,
    });

    return NextResponse.json({
      success: true,
      processed: results.length,
      successCount,
      errorCount,
      latencyMs: latency,
      results,
    });

  } catch (error) {
    const latency = Date.now() - startTime;
    logAIError(error as Error, { operation: 'daily_brain', latencyMs: latency });
    
    return NextResponse.json({ 
      error: (error as Error).message,
      latencyMs: latency,
    }, { status: 500 });
  }
}

/**
 * Computes daily aggregates for a specific user using service client.
 */
async function computeDailyAggregatesForUser(
  supabase: ReturnType<typeof createServiceClient>,
  userId: string,
  date: Date
): Promise<void> {
  const dateStr = date.toISOString().split('T')[0];
  const nextDateStr = new Date(date.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Fetch raw data
  const [tasksRes, focusRes, distractionsRes, moodRes] = await Promise.all([
    supabase.from('tasks').select('*').eq('user_id', userId)
      .gte('created_at', `${dateStr}T00:00:00`).lt('created_at', `${nextDateStr}T00:00:00`),
    supabase.from('focus_sessions').select('*').eq('user_id', userId)
      .gte('created_at', `${dateStr}T00:00:00`).lt('created_at', `${nextDateStr}T00:00:00`),
    supabase.from('distractions').select('*').eq('user_id', userId)
      .gte('created_at', `${dateStr}T00:00:00`).lt('created_at', `${nextDateStr}T00:00:00`),
    supabase.from('mood_entries').select('*').eq('user_id', userId)
      .gte('created_at', `${dateStr}T00:00:00`).lt('created_at', `${nextDateStr}T00:00:00`)
      .limit(1),
  ]);

  const tasks = tasksRes.data || [];
  const focusSessions = focusRes.data || [];
  const distractions = distractionsRes.data || [];
  const moodEntries = moodRes.data || [];

  // Compute metrics
  const totalFocusMinutes = focusSessions.reduce((sum, s) => sum + (s.duration || 0), 0);
  const completedTasks = tasks.filter(t => t.completed);
  const completionRate = tasks.length > 0 ? completedTasks.length / tasks.length : 0;

  // Hourly activity
  const hourlyActivity = new Array(24).fill(0);
  focusSessions.forEach(session => {
    const hour = new Date(session.created_at).getHours();
    hourlyActivity[hour] += session.duration || 0;
  });

  // Mood
  const moodMap: Record<string, number> = {
    'excellent': 5, 'good': 4, 'neutral': 3, 'sad': 2, 'very-sad': 1
  };
  const moodScore = moodEntries.length > 0 ? moodMap[moodEntries[0].mood] || 3 : null;

  // Upsert aggregate
  await supabase.from('daily_aggregates').upsert({
    user_id: userId,
    date: dateStr,
    total_focus_minutes: totalFocusMinutes,
    focus_session_count: focusSessions.length,
    avg_focus_duration: focusSessions.length > 0 ? totalFocusMinutes / focusSessions.length : 0,
    longest_focus_session: focusSessions.length > 0 ? Math.max(...focusSessions.map(s => s.duration || 0)) : 0,
    tasks_completed: completedTasks.length,
    tasks_created: tasks.length,
    high_priority_completed: completedTasks.filter(t => t.priority === 'high').length,
    completion_rate: Math.round(completionRate * 100) / 100,
    distraction_count: distractions.length,
    total_distraction_minutes: distractions.reduce((sum, d) => sum + (d.duration || 0), 0),
    hourly_activity: hourlyActivity,
    mood_score: moodScore,
  }, { onConflict: 'user_id,date' });
}

/**
 * Builds the schedule context for a user.
 */
async function buildScheduleContextForUser(
  supabase: ReturnType<typeof createServiceClient>,
  user: { id: string; name: string | null; email: string }
): Promise<ScheduleContext> {
  // Fetch all required data in parallel
  const [profileRes, aggregatesRes, tasksRes, goalsRes, habitsRes] = await Promise.all([
    supabase.from('user_ai_profiles').select('*').eq('user_id', user.id).single(),
    supabase.from('daily_aggregates').select('*').eq('user_id', user.id)
      .order('date', { ascending: false }).limit(14),
    supabase.from('tasks').select('*').eq('user_id', user.id).eq('completed', false)
      .order('priority', { ascending: true }),
    supabase.from('goals').select('*').eq('user_id', user.id).eq('status', 'active'),
    supabase.from('habits').select('*').eq('user_id', user.id),
  ]);

  // Map tasks to the expected format
  const tasks: Task[] = (tasksRes.data || []).map(t => ({
    id: t.id,
    title: t.title,
    description: t.description || undefined,
    priority: t.priority as 'high' | 'medium' | 'low',
    timeEstimate: t.time_estimate || 30,
    completed: t.completed || false,
    createdAt: new Date(t.created_at),
    category: t.category || undefined,
    dueDate: t.due_date || undefined,
    focusMode: t.focus_mode || false,
  }));

  // Map goals to the expected format
  const goals: Goal[] = (goalsRes.data || []).map(g => ({
    id: g.id,
    title: g.title,
    description: g.description || undefined,
    category: g.category,
    targetDate: g.target_date || undefined,
    createdAt: new Date(g.created_at),
    milestones: [], // We don't need milestones for scheduling
    progress: g.progress || 0,
    status: g.status as 'active' | 'completed' | 'paused',
    color: g.color,
  }));

  // Map habits to ScheduledHabit format for AI scheduling
  const activeHabits: ScheduledHabit[] = (habitsRes.data || [])
    .filter((h: any) => h.auto_schedule !== false) // Include habits that should be scheduled
    .map((h: any) => ({
      id: h.id,
      name: h.name,
      description: h.description || undefined,
      frequency: h.frequency as 'daily' | 'weekly',
      preferredTime: h.preferred_time || undefined,
      duration: h.duration || 15,
      autoSchedule: h.auto_schedule !== false,
      category: h.category || undefined,
      currentStreak: h.current_streak || 0,
    }));

  // Get profile or use defaults
  const profile = profileRes.data || {
    ...getDefaultProfile(),
    user_id: user.id,
    id: '',
    created_at: '',
    updated_at: '',
  };

  return {
    user: {
      name: user.name || 'User',
      timezone: 'UTC', // TODO: Get from user settings
    },
    profile: profile as any,
    recentAggregates: (aggregatesRes.data || []) as any[],
    todaysTasks: tasks,
    activeGoals: goals,
    activeHabits,
    currentTime: new Date().toTimeString().slice(0, 5),
  };
}

