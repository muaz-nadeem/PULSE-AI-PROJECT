import { callGemini } from './gemini-client';
import { buildCoachPrompt, getCoachSystemInstruction, sanitizeUserInput } from './prompt-builder';
import type { Task, Goal, GeminiMessage } from './types';
import { logAIEvent, logAIError, logAIMetrics } from './logger';

export interface CoachContext {
  recentTasks: Task[];
  recentFocus: {
    totalMinutes: number;
    sessionCount?: number;
  };
  currentGoals: Goal[];
  todaysPlan?: {
    accepted: boolean;
    tasksCompleted: number;
    totalTasks: number;
  };
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  message: string;
}

/**
 * Generates a coach response using Gemini AI.
 */
export async function getCoachResponse(
  userId: string,
  userMessage: string,
  context: CoachContext,
  conversationHistory: ConversationMessage[]
): Promise<string> {
  const startTime = Date.now();

  logAIEvent('coach_request_start', {
    userId,
    messageLength: userMessage.length,
    historyLength: conversationHistory.length,
  });

  try {
    // Sanitize user input to prevent prompt injection
    const sanitizedMessage = sanitizeUserInput(userMessage);

    // Build the prompt
    const prompt = buildCoachPrompt(sanitizedMessage, context, conversationHistory);
    const systemInstruction = getCoachSystemInstruction();

    // Convert conversation history to Gemini format
    const geminiHistory: GeminiMessage[] = conversationHistory.slice(-10).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: msg.message,
    }));

    // Call Gemini
    const response = await callGemini(prompt, systemInstruction, geminiHistory);

    const latency = Date.now() - startTime;

    logAIMetrics('coach_response', {
      latencyMs: latency,
      success: true,
      userId,
    });

    logAIEvent('coach_response_success', {
      userId,
      latencyMs: latency,
      responseLength: response.text.length,
    });

    return response.text;
  } catch (error) {
    const latency = Date.now() - startTime;

    logAIMetrics('coach_response', {
      latencyMs: latency,
      success: false,
      userId,
    });

    logAIError(error as Error, {
      operation: 'getCoachResponse',
      userId,
      messagePreview: userMessage.slice(0, 100),
    });

    // Return a friendly fallback message
    return getFallbackCoachResponse(userMessage);
  }
}

/**
 * Generates a fallback response when AI is unavailable.
 */
function getFallbackCoachResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();

  // Try to match common queries
  if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
    return "I can help you with productivity tips, task prioritization, focus strategies, and goal tracking. I'm having some connection issues right now, but feel free to ask me anything!";
  }

  if (lowerMessage.includes('focus') || lowerMessage.includes('concentrate')) {
    return "For better focus, try the Pomodoro technique: 25 minutes of focused work followed by a 5-minute break. Also, consider silencing notifications during deep work sessions.";
  }

  if (lowerMessage.includes('task') || lowerMessage.includes('priorit')) {
    return "A good approach is to tackle your most important or difficult task first thing when your energy is highest. Try categorizing tasks by urgency and importance.";
  }

  if (lowerMessage.includes('break') || lowerMessage.includes('tired')) {
    return "Taking regular breaks is essential! Try stepping away from your screen, doing some light stretching, or taking a short walk. Your brain needs rest to perform at its best.";
  }

  if (lowerMessage.includes('goal') || lowerMessage.includes('achieve')) {
    return "Break your goals into smaller, actionable milestones. Celebrate each milestone to stay motivated, and review your progress regularly to stay on track.";
  }

  // Default response
  return "Thanks for reaching out! I'm here to help with your productivity journey. I'm experiencing some temporary issues, but please feel free to ask me about tasks, focus strategies, or goal planning.";
}

/**
 * Quick responses for common coach interactions that don't need AI.
 */
export function getQuickResponse(intent: string): string | null {
  const quickResponses: Record<string, string> = {
    greeting: "Hey! Ready to make today productive. How can I help?",
    thanks: "You're welcome! Keep up the great work. 💪",
    bye: "Good luck with your tasks! Remember, progress over perfection.",
  };

  return quickResponses[intent] || null;
}

/**
 * Detects simple intents that don't need full AI processing.
 */
export function detectSimpleIntent(message: string): string | null {
  const lowerMessage = message.toLowerCase().trim();

  // Greetings
  if (/^(hi|hello|hey|good morning|good afternoon|good evening)[\s!.]*$/i.test(lowerMessage)) {
    return 'greeting';
  }

  // Thanks
  if (/^(thanks|thank you|thx|ty)[\s!.]*$/i.test(lowerMessage)) {
    return 'thanks';
  }

  // Goodbye
  if (/^(bye|goodbye|see you|later|cya)[\s!.]*$/i.test(lowerMessage)) {
    return 'bye';
  }

  return null;
}

/**
 * Main entry point for coach messages. Handles simple intents locally,
 * falls back to AI for complex queries.
 */
export async function processCoachMessage(
  userId: string,
  userMessage: string,
  context: CoachContext,
  conversationHistory: ConversationMessage[]
): Promise<string> {
  // Check for simple intents first
  const simpleIntent = detectSimpleIntent(userMessage);
  if (simpleIntent) {
    const quickResponse = getQuickResponse(simpleIntent);
    if (quickResponse) {
      logAIEvent('coach_quick_response', { userId, intent: simpleIntent });
      return quickResponse;
    }
  }

  // Use AI for complex messages
  return getCoachResponse(userId, userMessage, context, conversationHistory);
}

