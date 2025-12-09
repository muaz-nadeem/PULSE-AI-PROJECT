import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateScheduleWithFallback } from '@/lib/ai/schedule-generator';
import { getUserAIProfile, ensureUserProfile } from '@/lib/services/personalization-service';
import { getRecentAggregates } from '@/lib/services/aggregation-service';
import { logAIEvent, logAIError, logAIFeatureUsage } from '@/lib/ai/logger';
import type { ScheduleContext, Task, Goal, ScheduledHabit } from '@/lib/ai/types';
import { getDefaultProfile, aiConfig } from '@/lib/ai/types';

/**
 * Manual Plan Generation Endpoint
 * 
 * Allows users to regenerate their daily plan on-demand.
 * This is useful when:
 * - The user rejected the automatic plan
 * - They want a fresh plan after task changes
 * - No automatic plan was generated
 */
export async function POST(request: NextRequest) {
  // Check if AI features are enabled
  if (!aiConfig.featuresEnabled) {
    return NextResponse.json({ 
      error: 'AI features are disabled' 
    }, { status: 503 });
  }

  const startTime = Date.now();

  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    logAIFeatureUsage('manual_plan_generation', user.id);

    // Build context for schedule generation
    const context = await buildContextForUser(supabase, user.id);

    // Generate schedule
    const schedule = await generateScheduleWithFallback(user.id, context);

    const todayStr = new Date().toISOString().split('T')[0];

    // Store the plan
    const { data: savedPlan, error: upsertError } = await supabase
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
      }, { onConflict: 'user_id,plan_date' })
      .select()
      .single();

    if (upsertError) {
      throw new Error(`Failed to store plan: ${upsertError.message}`);
    }

    const latency = Date.now() - startTime;

    logAIEvent('manual_plan_generated', {
      userId: user.id,
      latencyMs: latency,
      scheduleItems: schedule.schedule.length,
    });

    return NextResponse.json({
      success: true,
      plan: savedPlan,
      latencyMs: latency,
    });

  } catch (error) {
    const latency = Date.now() - startTime;
    logAIError(error as Error, { 
      operation: 'manual_plan_generation',
      latencyMs: latency,
    });

    return NextResponse.json({ 
      error: (error as Error).message,
      latencyMs: latency,
    }, { status: 500 });
  }
}

/**
 * Builds schedule context for a user using the authenticated client.
 */
async function buildContextForUser(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<ScheduleContext> {
  // Get current day of week for weekly habit filtering
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.

  // Fetch all required data in parallel (including habits)
  const [userRes, profileRes, aggregatesRes, tasksRes, goalsRes, habitsRes] = await Promise.all([
    supabase.from('users').select('name').eq('id', userId).single(),
    supabase.from('user_ai_profiles').select('*').eq('user_id', userId).single(),
    supabase.from('daily_aggregates').select('*').eq('user_id', userId)
      .order('date', { ascending: false }).limit(14),
    supabase.from('tasks').select('*').eq('user_id', userId).eq('completed', false)
      .order('created_at', { ascending: false }),
    supabase.from('goals').select('*').eq('user_id', userId).eq('status', 'active'),
    // Fetch habits with auto_schedule enabled
    supabase.from('habits').select('*').eq('user_id', userId).neq('auto_schedule', false),
  ]);

  // Map tasks to expected format
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

  // Map goals to expected format
  const goals: Goal[] = (goalsRes.data || []).map(g => ({
    id: g.id,
    title: g.title,
    description: g.description || undefined,
    category: g.category,
    targetDate: g.target_date || undefined,
    createdAt: new Date(g.created_at),
    milestones: [],
    progress: g.progress || 0,
    status: g.status as 'active' | 'completed' | 'paused',
    color: g.color,
  }));

  // Filter and map habits to expected format
  // Daily habits are always included, weekly habits only on their scheduled day
  const habits: ScheduledHabit[] = (habitsRes.data || [])
    .filter(h => {
      if (h.frequency === 'daily') return true;
      // For weekly habits, we could add day-of-week filtering later
      // For now, include all weekly habits 
      return h.frequency === 'weekly';
    })
    .map(h => ({
      id: h.id,
      name: h.name,
      description: h.description || undefined,
      frequency: h.frequency as 'daily' | 'weekly',
      preferredTime: h.preferred_time || 'morning',
      duration: h.duration || 15,
      autoSchedule: h.auto_schedule !== false,
      category: h.category || 'other',
      currentStreak: h.current_streak || 0,
    }));

  // Get profile or create default
  let profile = profileRes.data;
  if (!profile) {
    profile = {
      ...getDefaultProfile(),
      user_id: userId,
      id: '',
      created_at: '',
      updated_at: '',
    };
  }

  return {
    user: {
      name: userRes.data?.name || 'User',
      timezone: 'UTC',
    },
    profile: profile as any,
    recentAggregates: (aggregatesRes.data || []) as any[],
    todaysTasks: tasks,
    activeGoals: goals,
    activeHabits: habits,
    currentTime: new Date().toTimeString().slice(0, 5),
  };
}

