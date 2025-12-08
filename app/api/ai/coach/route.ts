import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { processCoachMessage, type CoachContext, type ConversationMessage } from '@/lib/ai/coach-service';
import { logAIEvent, logAIError, logAIFeatureUsage } from '@/lib/ai/logger';
import { aiConfig } from '@/lib/ai/types';
import { sanitizeUserInput } from '@/lib/ai/prompt-builder';

/**
 * AI Coach Chat Endpoint
 * 
 * Processes user messages and returns AI-powered coach responses.
 * Uses Gemini for intelligent, context-aware productivity coaching.
 */
export async function POST(request: NextRequest) {
  // Check if AI coach is enabled
  if (!aiConfig.featuresEnabled || !aiConfig.coachEnabled) {
    return NextResponse.json({ 
      error: 'AI Coach is disabled' 
    }, { status: 503 });
  }

  const startTime = Date.now();

  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ 
        error: 'Message is required' 
      }, { status: 400 });
    }

    // Sanitize input
    const sanitizedMessage = sanitizeUserInput(message);

    logAIFeatureUsage('ai_coach', user.id, { messageLength: message.length });

    // Fetch context for the coach
    const context = await buildCoachContext(supabase, user.id);

    // Fetch recent conversation history
    const { data: chatHistory } = await supabase
      .from('ai_chat_history')
      .select('role, message')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    const conversationHistory: ConversationMessage[] = (chatHistory || [])
      .reverse()
      .map(msg => ({
        role: msg.role as 'user' | 'assistant',
        message: msg.message,
      }));

    // Get coach response
    const response = await processCoachMessage(
      user.id,
      sanitizedMessage,
      context,
      conversationHistory
    );

    // Save both messages to history
    const messagesToSave = [
      {
        user_id: user.id,
        role: 'user',
        message: sanitizedMessage,
        context_snapshot: {
          taskCount: context.recentTasks.length,
          focusMinutes: context.recentFocus.totalMinutes,
          goalCount: context.currentGoals.length,
        },
      },
      {
        user_id: user.id,
        role: 'assistant',
        message: response,
        context_snapshot: null,
      },
    ];

    await supabase.from('ai_chat_history').insert(messagesToSave);

    const latency = Date.now() - startTime;

    logAIEvent('coach_response_sent', {
      userId: user.id,
      latencyMs: latency,
      responseLength: response.length,
    });

    return NextResponse.json({
      response,
      latencyMs: latency,
    });

  } catch (error) {
    const latency = Date.now() - startTime;
    logAIError(error as Error, { 
      operation: 'ai_coach',
      latencyMs: latency,
    });

    return NextResponse.json({ 
      error: 'Failed to get coach response',
      latencyMs: latency,
    }, { status: 500 });
  }
}

/**
 * Builds context for the AI coach from user data.
 */
async function buildCoachContext(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<CoachContext> {
  // Fetch recent data
  const [tasksRes, focusRes, goalsRes, planRes] = await Promise.all([
    supabase.from('tasks').select('*').eq('user_id', userId)
      .order('created_at', { ascending: false }).limit(20),
    supabase.from('focus_sessions').select('*').eq('user_id', userId)
      .order('created_at', { ascending: false }).limit(10),
    supabase.from('goals').select('*').eq('user_id', userId).eq('status', 'active'),
    supabase.from('ai_plans').select('status, schedule').eq('user_id', userId)
      .eq('plan_date', new Date().toISOString().split('T')[0]).single(),
  ]);

  const tasks = tasksRes.data || [];
  const focusSessions = focusRes.data || [];
  const goals = goalsRes.data || [];
  const todaysPlan = planRes.data;

  // Map tasks to expected format
  const recentTasks = tasks.map(t => ({
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

  // Map goals
  const currentGoals = goals.map(g => ({
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

  // Calculate focus stats
  const totalFocusMinutes = focusSessions.reduce((sum, s) => sum + (s.duration || 0), 0);

  // Build plan info if exists
  let todaysPlanInfo: CoachContext['todaysPlan'] = undefined;
  if (todaysPlan) {
    const schedule = todaysPlan.schedule as any[] || [];
    const completedInPlan = schedule.filter((item: any) => {
      const matchingTask = tasks.find(t => t.id === item.taskId);
      return matchingTask?.completed;
    }).length;

    todaysPlanInfo = {
      accepted: todaysPlan.status === 'accepted',
      tasksCompleted: completedInPlan,
      totalTasks: schedule.filter((item: any) => item.type === 'work').length,
    };
  }

  return {
    recentTasks,
    recentFocus: {
      totalMinutes: totalFocusMinutes,
      sessionCount: focusSessions.length,
    },
    currentGoals,
    todaysPlan: todaysPlanInfo,
  };
}

