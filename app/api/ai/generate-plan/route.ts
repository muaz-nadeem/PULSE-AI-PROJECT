import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateDailySchedule } from '@/lib/ai/schedule-generator';
import { getUserAIProfile, ensureUserProfile } from '@/lib/services/personalization-service';
import { getRecentAggregates } from '@/lib/services/aggregation-service';
import { logAIEvent, logAIError, logAIFeatureUsage } from '@/lib/ai/logger';
import type { ScheduleContext, Task, Goal } from '@/lib/ai/types';
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

    // Generate schedule using the direct Gemini approach
    const schedule = await generateDailySchedule({
      tasks: context.todaysTasks,
      focusDuration: context.profile.optimal_focus_duration || 25,
    });

    const todayStr = new Date().toISOString().split('T')[0];

    // Store the plan
    const { data: savedPlan, error: upsertError } = await supabase
      .from('ai_plans')
      .upsert({
        user_id: user.id,
        plan_date: todayStr,
        schedule: schedule,
        explanation: 'AI-generated schedule based on your tasks.',
        reasoning: {},
        model_version: 'gemini-2.5-flash',
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
      scheduleItems: schedule.length,
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
  // Fetch all required data in parallel
  const [userRes, profileRes, aggregatesRes, tasksRes, goalsRes] = await Promise.all([
    supabase.from('users').select('name').eq('id', userId).single(),
    supabase.from('user_ai_profiles').select('*').eq('user_id', userId).single(),
    supabase.from('daily_aggregates').select('*').eq('user_id', userId)
      .order('date', { ascending: false }).limit(14),
    supabase.from('tasks').select('*').eq('user_id', userId).eq('completed', false)
      .order('created_at', { ascending: false }),
    supabase.from('goals').select('*').eq('user_id', userId).eq('status', 'active'),
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
    currentTime: new Date().toTimeString().slice(0, 5),
  };
}

