import { getGeminiModel } from "./gemini"
import type { Task, AnalyticsData, MoodEntry, Habit } from "@/lib/store"

interface CoachContext {
  tasks: Task[]
  analytics: AnalyticsData
  moodEntries: MoodEntry[]
  habits: Habit[]
  recentMessages?: string[]
}

export async function getCoachResponse(
  userMessage: string,
  context: CoachContext
): Promise<string> {
  try {
    const model = getGeminiModel()

    // Build context summary
    const completedTasks = context.tasks.filter((t) => t.completed).length
    const totalTasks = context.tasks.length
    const incompleteTasks = context.tasks.filter((t) => !t.completed)
    const highPriorityTasks = incompleteTasks.filter((t) => t.priority === "high")
    
    // Get today's mood
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayMood = context.moodEntries?.find((entry) => {
      const entryDate = new Date(entry.date)
      entryDate.setHours(0, 0, 0, 0)
      return entryDate.getTime() === today.getTime()
    })

    // Build task summary
    const taskSummary = incompleteTasks.length > 0
      ? incompleteTasks
          .slice(0, 5)
          .map((t) => `- ${t.title} (${t.priority} priority${t.dueDate ? `, due: ${t.dueDate}` : ""})`)
          .join("\n")
      : "No pending tasks"

    // Build habit summary
    const activeHabits = context.habits.filter((h) => h.completedDates.length > 0)
    const habitSummary = activeHabits.length > 0
      ? activeHabits
          .slice(0, 3)
          .map((h) => `- ${h.name} (${h.currentStreak} day streak)`)
          .join("\n")
      : "No active habits"

    const prompt = `You are an AI Productivity Coach helping a user improve their focus and productivity. 

USER'S CURRENT SITUATION:
- Tasks Completed: ${completedTasks}/${totalTasks}
- Focus Streak: ${context.analytics.streakDays} days
- Total Focus Time This Week: ${context.analytics.totalFocusTime} hours
- Today's Mood: ${todayMood ? todayMood.mood : "Not logged"}
${todayMood?.notes ? `- Mood Notes: ${todayMood.notes}` : ""}

PENDING TASKS:
${taskSummary}
${highPriorityTasks.length > 0 ? `\nHigh Priority Tasks: ${highPriorityTasks.length}` : ""}

ACTIVE HABITS:
${habitSummary}

CONVERSATION HISTORY:
${context.recentMessages && context.recentMessages.length > 0
  ? context.recentMessages.slice(-3).join("\n")
  : "This is the start of the conversation."}

USER'S MESSAGE: "${userMessage}"

INSTRUCTIONS:
1. Provide helpful, encouraging, and actionable advice
2. Reference the user's specific data when relevant (tasks, mood, habits, streaks)
3. Be concise but warm and supportive
4. Offer specific suggestions based on their current situation
5. If they ask about tasks, reference their actual tasks
6. If they ask about productivity, reference their focus time and streaks
7. If their mood is low, be empathetic and suggest lighter workloads
8. Keep responses under 200 words
9. Use a friendly, conversational tone
10. Don't make up data - only reference what's provided

Respond directly to the user's message with helpful, personalized advice:`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    return text.trim()
  } catch (error: any) {
    console.error("Error getting coach response:", error)
    
    // Fallback responses based on context
    const completedTasks = context.tasks.filter((t) => t.completed).length
    const totalTasks = context.tasks.length
    
    // Get today's mood for fallback
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayMood = context.moodEntries?.find((entry) => {
      const entryDate = new Date(entry.date)
      entryDate.setHours(0, 0, 0, 0)
      return entryDate.getTime() === today.getTime()
    })
    
    if (userMessage.toLowerCase().includes("task")) {
      return `I see you have ${totalTasks - completedTasks} tasks remaining. Would you like help prioritizing them?`
    }
    
    if (userMessage.toLowerCase().includes("focus") || userMessage.toLowerCase().includes("productivity")) {
      return `You've been doing great with ${context.analytics.streakDays} days of focus! Keep up the momentum.`
    }
    
    if (userMessage.toLowerCase().includes("mood")) {
      return `I notice ${todayMood ? `you're feeling ${todayMood.mood} today` : "you haven't logged your mood today"}. Remember, it's okay to adjust your workload based on how you're feeling.`
    }
    
    return "I'm here to help! Could you tell me more about what you'd like to work on today?"
  }
}

