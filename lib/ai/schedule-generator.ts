import { getGeminiModel } from "./gemini"
import type { Task, ScheduleItem } from "@/lib/store"

interface GenerateScheduleParams {
  tasks: Task[]
  mood?: "excellent" | "good" | "neutral" | "sad" | "very-sad"
  moodNotes?: string
  focusDuration?: number // User's preferred focus duration in minutes
  weeklySchedule?: Array<{ time: string; className: string }> // Today's classes from weekly schedule
}

export async function generateDailySchedule({
  tasks,
  mood,
  moodNotes,
  focusDuration = 25,
  weeklySchedule = [],
}: GenerateScheduleParams): Promise<ScheduleItem[]> {
  try {
    const model = getGeminiModel()

    // Filter incomplete tasks
    const incompleteTasks = tasks.filter((t) => !t.completed)

    if (incompleteTasks.length === 0) {
      return []
    }

    // Build task list for prompt with descriptions analyzed for difficulty
    const taskList = incompleteTasks
      .map((task) => {
        const dueDateStr = task.dueDate ? ` (Due: ${task.dueDate})` : ""
        const descriptionStr = task.description ? `\n  Description: ${task.description}` : ""
        return `- ${task.title} [Priority: ${task.priority}, Estimated: ${task.timeEstimate} min${dueDateStr}]${descriptionStr}`
      })
      .join("\n\n")

    // Build today's class schedule context
    const classScheduleContext = weeklySchedule.length > 0
      ? `\n\nToday's Class Schedule (DO NOT schedule tasks during these times):\n${weeklySchedule
        .map((cls) => `- ${cls.time}: ${cls.className}`)
        .join("\n")}`
      : "\n\nNo classes scheduled for today."

    // Build mood context
    const moodContext = mood
      ? `Current Mood: ${mood}${moodNotes ? ` (${moodNotes})` : ""}`
      : "No mood logged for today"

    // Create the prompt
    const prompt = `You are an AI productivity coach helping to create an optimized daily schedule.

User's Tasks:
${taskList}

${moodContext}
${classScheduleContext}

User's Preferred Focus Duration: ${focusDuration} minutes

IMPORTANT INSTRUCTIONS:
1. Analyze each task's description to determine difficulty level:
   - Complex/long descriptions, technical terms, multiple steps = HIGH difficulty
   - Medium descriptions with some detail = MEDIUM difficulty  
   - Short/simple descriptions = LOW difficulty
   - Use difficulty to decide when to schedule (harder tasks need more focus time)

2. AVOID scheduling tasks during class times listed above - those are fixed commitments

3. Create an optimized daily schedule from 8:00 AM to 7:30 PM (08:00 to 19:30) that:
   - Prioritizes high-priority AND high-difficulty tasks during peak focus hours (8-11 AM, 2:30-5 PM)
   - Schedules easier tasks during lower energy times or between classes
   - Batches similar tasks together to minimize context switching
   - Includes appropriate breaks (5-15 min breaks every 60-90 minutes, 60 min lunch break at 1:30-2:30 PM)
   - Considers the user's mood when scheduling (if mood is low, suggest lighter tasks or more breaks)
   - Respects task time estimates
   - Schedules tasks with due dates earlier in the day
   - Leaves buffer time between tasks (especially before/after classes)
   - Works around class schedule - never overlap with class times

Return ONLY a valid JSON object in this exact format (no markdown, no code blocks, just the JSON):
{
  "schedule": [
    {
      "time": "09:00",
      "duration": 90,
      "task": "Task title here",
      "priority": "high"
    }
  ]
}

Important:
- Use 24-hour format for times (09:00, 10:30, etc.)
- Duration should be in minutes
- Priority must be one of: "high", "medium", "low"
- Include breaks as separate items with task starting with "Break:" or "Lunch break"
- Ensure times don't overlap with each other OR with class times
- Start from 08:00 and end by 19:30
- Make sure all high-priority tasks are included
- Schedule difficult tasks when user has no classes and during peak focus hours
- If user is feeling sad/very-sad, suggest lighter workload and more breaks
- Account for lunch break from 13:30-14:30 (1:30 PM - 2:30 PM)`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Parse the JSON response
    // Remove markdown code blocks if present
    let jsonText = text.trim()
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "")
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```\n?/g, "")
    }

    const parsed = JSON.parse(jsonText)

    if (!parsed.schedule || !Array.isArray(parsed.schedule)) {
      throw new Error("Invalid response format from AI")
    }

    // Validate and format schedule items
    const schedule: ScheduleItem[] = parsed.schedule.map((item: any) => {
      // Validate time format
      if (!/^\d{2}:\d{2}$/.test(item.time)) {
        throw new Error(`Invalid time format: ${item.time}`)
      }

      // Validate priority
      if (!["high", "medium", "low"].includes(item.priority)) {
        item.priority = "medium" // Default to medium if invalid
      }

      return {
        time: item.time,
        duration: Math.max(15, Math.min(item.duration || 30, 240)), // Clamp between 15-240 min
        task: item.task || "Unnamed task",
        priority: item.priority,
      }
    })

    // Sort by time
    schedule.sort((a, b) => {
      const [aH, aM] = a.time.split(":").map(Number)
      const [bH, bM] = b.time.split(":").map(Number)
      return aH * 60 + aM - (bH * 60 + bM)
    })

    return schedule
  } catch (error: any) {
    console.error("Error generating schedule with AI:", error)

    // Provide helpful error message for model/API issues
    if (error?.message?.includes("404") || error?.message?.includes("not found")) {
      console.error(
        "Gemini model not found. Please check:\n" +
        "1. Your API key is valid and has Generative AI API enabled\n" +
        "2. Billing is enabled in your Google Cloud project\n" +
        "3. The model name is correct (trying gemini-2.5-flash)\n" +
        "Falling back to basic schedule generation."
      )
    }

    // Fallback to basic schedule generation
    return generateFallbackSchedule(tasks, focusDuration, weeklySchedule)
  }
}

// Fallback schedule generator if AI fails
function generateFallbackSchedule(
  tasks: Task[],
  focusDuration: number,
  weeklySchedule: Array<{ time: string; className: string }> = []
): ScheduleItem[] {
  const incompleteTasks = tasks.filter((t) => !t.completed).sort((a, b) => {
    // Sort by priority first, then by due date
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    }
    if (a.dueDate && b.dueDate) {
      return a.dueDate.localeCompare(b.dueDate)
    }
    if (a.dueDate) return -1
    if (b.dueDate) return 1
    return 0
  })

  // Convert class times to blocked time ranges
  const blockedTimes: Array<{ start: number; end: number }> = []
  weeklySchedule.forEach((cls) => {
    const [startStr, endStr] = cls.time.split("-")
    if (startStr && endStr) {
      const [startH, startM] = startStr.split(":").map(Number)
      const [endH, endM] = endStr.split(":").map(Number)
      blockedTimes.push({
        start: startH * 60 + startM,
        end: endH * 60 + endM,
      })
    }
  })

  // Helper to check if a time conflicts with classes
  const conflictsWithClass = (startMinutes: number, duration: number): boolean => {
    const endMinutes = startMinutes + duration
    return blockedTimes.some(
      (block) =>
        (startMinutes >= block.start && startMinutes < block.end) ||
        (endMinutes > block.start && endMinutes <= block.end) ||
        (startMinutes < block.start && endMinutes > block.end)
    )
  }

  // Helper to find next available time slot
  const findNextAvailableTime = (startMinutes: number, duration: number): number => {
    let currentTime = startMinutes
    while (conflictsWithClass(currentTime, duration) && currentTime < 19 * 60) {
      // Find the end of the conflicting class
      const conflictingClass = blockedTimes.find(
        (block) =>
          (currentTime >= block.start && currentTime < block.end) ||
          (currentTime < block.start && currentTime + duration > block.start)
      )
      if (conflictingClass) {
        currentTime = conflictingClass.end + 15 // Add 15 min buffer after class
      } else {
        currentTime += 30 // Skip ahead if no specific conflict found
      }
    }
    return currentTime
  }

  const schedule: ScheduleItem[] = []
  let currentTime = 8 * 60 // Start at 8:00 AM in minutes

  for (let i = 0; i < Math.min(incompleteTasks.length, 8); i++) {
    const task = incompleteTasks[i]
    const duration = Math.min(task.timeEstimate || focusDuration, 120)

    // Check if this time conflicts with classes, find next available slot
    currentTime = findNextAvailableTime(currentTime, duration)

    // Add break every 2 tasks
    if (i > 0 && i % 2 === 0) {
      const breakTime = findNextAvailableTime(currentTime, 15)
      schedule.push({
        time: minutesToTime(breakTime),
        duration: 15,
        task: "Break",
        priority: "low",
      })
      currentTime = breakTime + 15
    }

    // Ensure we don't conflict with classes
    currentTime = findNextAvailableTime(currentTime, duration)

    schedule.push({
      time: minutesToTime(currentTime),
      duration,
      task: task.title,
      priority: task.priority,
    })

    currentTime += duration

    // Add lunch break at 1:30 PM if not conflicting
    if (currentTime >= 13 * 60 + 30 && schedule.findIndex((s) => s.task.toLowerCase().includes("lunch")) === -1) {
      const lunchTime = findNextAvailableTime(13 * 60 + 30, 60)
      schedule.push({
        time: minutesToTime(lunchTime),
        duration: 60,
        task: "Lunch break",
        priority: "low",
      })
      currentTime = lunchTime + 60
    }

    // Stop if we've reached 7:30 PM
    if (currentTime >= 19 * 60 + 30) {
      break
    }
  }

  return schedule
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
}
