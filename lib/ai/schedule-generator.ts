import { callGeminiJSON } from './gemini-client';
import { buildSchedulePrompt, getScheduleSystemInstruction } from './prompt-builder';
import type { AISchedule, ScheduleContext, ScheduleItem } from './types';
import { logAIEvent, logAIError, logAIMetrics } from './logger';

interface GeminiScheduleResponse {
  schedule: ScheduleItem[];
  explanation: string;
  reasoning: {
    focusHours?: string[];
    breakStrategy?: string;
    prioritization?: string;
  };
}

/**
 * Generates a daily schedule for a user using Gemini AI.
 * 
 * @param userId - The user's ID
 * @param context - The schedule context including user profile, tasks, and history
 * @returns An AISchedule object with the generated schedule
 */
export async function generateDailySchedule(
  userId: string,
  context: ScheduleContext
): Promise<AISchedule> {
  const startTime = Date.now();
  
  logAIEvent('schedule_generation_start', {
    userId,
    taskCount: context.todaysTasks.length,
    goalCount: context.activeGoals.length,
    aggregateDays: context.recentAggregates.length,
  });

  try {
    const prompt = buildSchedulePrompt(context);
    const systemInstruction = getScheduleSystemInstruction();

    const response = await callGeminiJSON<GeminiScheduleResponse>(
      prompt,
      systemInstruction
    );

    // Validate response structure
    if (!response.schedule || !Array.isArray(response.schedule)) {
      throw new Error('Invalid schedule format: missing or invalid schedule array');
    }

    // Validate and clean schedule items
    const validatedSchedule = response.schedule.map((item, index) => {
      // Ensure required fields exist
      if (!item.time || typeof item.duration !== 'number' || !item.task) {
        throw new Error(`Invalid schedule item at index ${index}: missing required fields`);
      }

      return {
        time: item.time,
        duration: Math.max(5, Math.min(item.duration, 240)), // Clamp between 5 and 240 minutes
        task: item.task,
        priority: ['high', 'medium', 'low'].includes(item.priority) ? item.priority : 'medium',
        taskId: item.taskId || undefined,
        type: ['work', 'break', 'meeting'].includes(item.type) ? item.type : 'work',
      } as ScheduleItem;
    });

    const latency = Date.now() - startTime;
    
    logAIMetrics('schedule_generation', {
      latencyMs: latency,
      success: true,
      userId,
    });

    logAIEvent('schedule_generation_success', {
      userId,
      itemCount: validatedSchedule.length,
      latencyMs: latency,
    });

    return {
      userId,
      schedule: validatedSchedule,
      explanation: response.explanation || 'AI-generated schedule based on your productivity patterns.',
      reasoning: response.reasoning || {},
      modelVersion: 'gemini-1.5-flash',
      generatedAt: new Date(),
    };
  } catch (error) {
    const latency = Date.now() - startTime;
    
    logAIMetrics('schedule_generation', {
      latencyMs: latency,
      success: false,
      userId,
    });

    logAIError(error as Error, {
      operation: 'generateDailySchedule',
      userId,
      contextSummary: {
        taskCount: context.todaysTasks.length,
        goalCount: context.activeGoals.length,
      },
    });

    throw error;
  }
}

/**
 * Generates a fallback schedule when AI is unavailable.
 * Uses simple rule-based logic similar to the original implementation.
 */
export function generateFallbackSchedule(
  userId: string,
  context: ScheduleContext
): AISchedule {
  logAIEvent('fallback_schedule_used', { userId, reason: 'AI unavailable' });

  const schedule: ScheduleItem[] = [];
  const startHour = context.profile.preferred_work_start_hour || 9;
  const focusDuration = context.profile.optimal_focus_duration || 25;
  const breakDuration = context.profile.preferred_break_duration || 5;

  // Sort tasks by priority
  const sortedTasks = [...context.todaysTasks]
    .filter(t => !t.completed)
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

  // Schedule up to 5 tasks with breaks
  let currentHour = startHour;
  let currentMinute = 0;

  sortedTasks.slice(0, 5).forEach((task, index) => {
    // Add work block
    schedule.push({
      time: `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`,
      duration: Math.min(task.timeEstimate || focusDuration, focusDuration * 2),
      task: task.title,
      priority: task.priority,
      taskId: task.id,
      type: 'work',
    });

    // Calculate next time slot
    const taskDuration = Math.min(task.timeEstimate || focusDuration, focusDuration * 2);
    currentMinute += taskDuration;
    if (currentMinute >= 60) {
      currentHour += Math.floor(currentMinute / 60);
      currentMinute = currentMinute % 60;
    }

    // Add break after work (except after last task)
    if (index < Math.min(sortedTasks.length - 1, 4)) {
      schedule.push({
        time: `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`,
        duration: breakDuration,
        task: 'Short break',
        priority: 'low',
        type: 'break',
      });

      currentMinute += breakDuration;
      if (currentMinute >= 60) {
        currentHour += Math.floor(currentMinute / 60);
        currentMinute = currentMinute % 60;
      }
    }
  });

  return {
    userId,
    schedule,
    explanation: 'This is a simple schedule based on your task priorities. AI-powered scheduling is currently unavailable.',
    reasoning: {
      prioritization: 'Tasks ordered by priority (high first)',
      breakStrategy: `${breakDuration}-minute breaks between tasks`,
    },
    modelVersion: 'fallback',
    generatedAt: new Date(),
  };
}

/**
 * Attempts to generate a schedule with AI, falling back to rule-based if it fails.
 */
export async function generateScheduleWithFallback(
  userId: string,
  context: ScheduleContext
): Promise<AISchedule> {
  try {
    return await generateDailySchedule(userId, context);
  } catch (error) {
    logAIEvent('schedule_fallback_triggered', {
      userId,
      error: (error as Error).message,
    });
    return generateFallbackSchedule(userId, context);
  }
}

