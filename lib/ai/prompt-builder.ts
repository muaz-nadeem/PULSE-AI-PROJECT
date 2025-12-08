import type { ScheduleContext, Task, Goal, UserAIProfile, DailyAggregate } from './types';

/**
 * Builds a prompt for generating a daily schedule using Gemini.
 * Includes user profile, recent performance data, and current tasks.
 */
export function buildSchedulePrompt(context: ScheduleContext): string {
  const { user, profile, recentAggregates, todaysTasks, activeGoals } = context;

  // Compute summary stats from recent aggregates
  const avgFocusTime = recentAggregates.length > 0
    ? recentAggregates.reduce((sum, a) => sum + (a.total_focus_minutes || 0), 0) / recentAggregates.length
    : 0;
  const avgCompletionRate = recentAggregates.length > 0
    ? recentAggregates.reduce((sum, a) => sum + (a.completion_rate || 0), 0) / recentAggregates.length
    : 0;
  const avgDailyRating = recentAggregates.filter(a => a.daily_rating).length > 0
    ? recentAggregates.filter(a => a.daily_rating).reduce((sum, a) => sum + (a.daily_rating || 0), 0) / recentAggregates.filter(a => a.daily_rating).length
    : null;

  // Format productive hours
  const productiveHoursStr = profile.most_productive_hours.length > 0
    ? profile.most_productive_hours.map(h => `${h}:00`).join(', ')
    : 'Not yet determined';

  // Format distraction times
  const distractionTimesStr = profile.common_distraction_times.length > 0
    ? profile.common_distraction_times.map(h => `${h}:00`).join(', ')
    : 'None identified';

  // Sort tasks by priority
  const sortedTasks = [...todaysTasks].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return `You are an AI productivity coach helping ${user.name || 'the user'} plan their day.

**User's Personalization Profile:**
- Optimal focus duration: ${profile.optimal_focus_duration} minutes
- Preferred work hours: ${profile.preferred_work_start_hour}:00 - ${profile.preferred_work_end_hour}:00
- Preferred break duration: ${profile.preferred_break_duration} minutes
- Most productive hours: ${productiveHoursStr}
- Common distraction times: ${distractionTimesStr}

**Recent Performance (last ${recentAggregates.length} days):**
- Average focus time: ${Math.round(avgFocusTime)} minutes/day
- Average task completion rate: ${(avgCompletionRate * 100).toFixed(1)}%
- Plan acceptance rate: ${((profile.avg_plan_acceptance_rate || 0) * 100).toFixed(1)}%
${avgDailyRating ? `- Average daily satisfaction: ${avgDailyRating.toFixed(1)}/10` : ''}

**Today's Tasks (${sortedTasks.length} total):**
${sortedTasks.slice(0, 10).map((t, i) =>
    `${i + 1}. [${t.priority.toUpperCase()}] ${t.title} (${t.timeEstimate} min)${t.dueDate ? ` - Due: ${t.dueDate}` : ''}${t.category ? ` [${t.category}]` : ''}`
  ).join('\n')}
${sortedTasks.length > 10 ? `\n... and ${sortedTasks.length - 10} more tasks` : ''}
${sortedTasks.length === 0 ? 'No tasks scheduled yet. Suggest a productive day structure.' : ''}

**Active Goals:**
${activeGoals.slice(0, 5).map(g => `- ${g.title} (${g.progress}% complete)${g.targetDate ? ` - Target: ${g.targetDate}` : ''}`).join('\n')}
${activeGoals.length === 0 ? 'No active goals set.' : ''}

**Current Time:** ${context.currentTime}

**Instructions:**
1. Create a realistic schedule for today starting from the current time
2. Prioritize high-priority tasks during the user's most productive hours (${productiveHoursStr})
3. Include breaks of ${profile.preferred_break_duration} minutes after every ${profile.optimal_focus_duration} minutes of work
4. Avoid scheduling demanding tasks during distraction-prone times (${distractionTimesStr})
5. Keep focus blocks around ${profile.optimal_focus_duration} minutes
6. Leave some buffer time between tasks
7. Consider task due dates when prioritizing

Return a JSON object with this exact structure:
{
  "schedule": [
    {
      "time": "HH:MM",
      "duration": <minutes as number>,
      "task": "<task description>",
      "priority": "high" | "medium" | "low",
      "taskId": "<task id if matching a user task, or null>",
      "type": "work" | "break" | "meeting"
    }
  ],
  "explanation": "<2-3 sentence personalized explanation of why this schedule is optimized for the user>",
  "reasoning": {
    "focusHours": ["<hours where deep work is scheduled>"],
    "breakStrategy": "<brief explanation of break placement>",
    "prioritization": "<brief explanation of task order>"
  }
}

Important: Ensure the JSON is valid and parseable.`;
}

/**
 * Builds a system instruction for schedule generation.
 */
export function getScheduleSystemInstruction(): string {
  return `You are an expert productivity coach AI. Your role is to create personalized daily schedules that maximize the user's productivity while maintaining work-life balance.

Key principles:
- Always respect the user's preferred work hours
- Schedule high-priority and cognitively demanding tasks during peak productivity hours
- Include regular breaks to prevent burnout
- Be realistic about time estimates
- Consider task dependencies and energy levels throughout the day
- Always respond with valid, parseable JSON matching the requested schema
- Keep explanations concise but personalized`;
}

/**
 * Builds a prompt for the AI Coach conversation feature.
 */
export function buildCoachPrompt(
  userMessage: string,
  context: {
    recentTasks: Task[];
    recentFocus: { totalMinutes: number; sessionCount?: number };
    currentGoals: Goal[];
    todaysPlan?: { accepted: boolean; tasksCompleted: number; totalTasks: number };
  },
  conversationHistory: { role: string; message: string }[]
): string {
  const completedTasks = context.recentTasks.filter(t => t.completed).length;
  const totalTasks = context.recentTasks.length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(0) : 0;

  return `The user just said: "${userMessage}"

**Current User Context:**
- Recent tasks: ${totalTasks} tasks (${completedTasks} completed, ${completionRate}% completion rate)
- Recent focus time: ${context.recentFocus.totalMinutes} minutes${context.recentFocus.sessionCount ? ` across ${context.recentFocus.sessionCount} sessions` : ''}
- Active goals: ${context.currentGoals.length} goals in progress
${context.todaysPlan ? `- Today's plan: ${context.todaysPlan.accepted ? 'Accepted' : 'Pending'}, ${context.todaysPlan.tasksCompleted}/${context.todaysPlan.totalTasks} tasks done` : ''}

**Recent Conversation:**
${conversationHistory.slice(-5).map(h => `${h.role === 'user' ? 'User' : 'Coach'}: ${h.message}`).join('\n')}

Respond as a supportive, knowledgeable productivity coach. Reference their actual data when relevant. Keep responses concise (2-4 sentences) and actionable.`;
}

/**
 * Builds a system instruction for the AI Coach.
 */
export function getCoachSystemInstruction(): string {
  return `You are a supportive and knowledgeable AI productivity coach called "Pulse Coach". Your personality is:
- Encouraging but realistic
- Data-driven (reference user's actual stats when helpful)
- Action-oriented (give specific, practical advice)
- Empathetic (acknowledge challenges and celebrate wins)

Guidelines:
- Keep responses concise (2-4 sentences max)
- Offer specific suggestions when asked for help
- Celebrate achievements and progress
- Provide gentle accountability when needed
- Never be preachy or condescending
- Reference the user's actual data to personalize advice`;
}

/**
 * Sanitizes user input to prevent prompt injection.
 */
export function sanitizeUserInput(input: string): string {
  // Remove potential instruction override attempts
  let sanitized = input
    .replace(/system:/gi, '[filtered]')
    .replace(/instruction:/gi, '[filtered]')
    .replace(/ignore previous/gi, '[filtered]')
    .replace(/disregard/gi, '[filtered]');
  
  // Limit length
  if (sanitized.length > 2000) {
    sanitized = sanitized.slice(0, 2000) + '...';
  }
  
  return sanitized;
}

