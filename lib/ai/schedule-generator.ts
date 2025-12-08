import { getGeminiModel } from "./gemini"
import type { Task, ScheduleItem } from "@/lib/store"

interface GenerateScheduleParams {
  tasks: Task[]
  mood?: "excellent" | "good" | "neutral" | "sad" | "very-sad"
  moodNotes?: string
  focusDuration?: number // User's preferred focus duration in minutes
}

export async function generateDailySchedule({
  tasks,
  mood,
  moodNotes,
  focusDuration = 25,
}: GenerateScheduleParams): Promise<ScheduleItem[]> {
  try {
    const model = getGeminiModel()

    // Filter incomplete tasks
    const incompleteTasks = tasks.filter((t) => !t.completed)

    if (incompleteTasks.length === 0) {
      return []
    }

    // Build task list for prompt
    const taskList = incompleteTasks
      .map((task) => {
        const dueDateStr = task.dueDate ? ` (Due: ${task.dueDate})` : ""
        return `- ${task.title} [Priority: ${task.priority}, Estimated: ${task.timeEstimate} min${dueDateStr}]`
      })
      .join("\n")

    // Build mood context
    const moodContext = mood
      ? `Current Mood: ${mood}${moodNotes ? ` (${moodNotes})` : ""}`
      : "No mood logged for today"

    // Create the prompt
    const prompt = `You are an AI productivity coach helping to create an optimized daily schedule.

User's Tasks:
${taskList}

${moodContext}

User's Preferred Focus Duration: ${focusDuration} minutes

Please create an optimized daily schedule from 9:00 AM to 6:00 PM (09:00 to 18:00) that:
1. Prioritizes high-priority tasks during peak focus hours (9-11 AM)
2. Batches similar tasks together to minimize context switching
3. Includes appropriate breaks (5-15 min breaks every 60-90 minutes, 60 min lunch break)
4. Considers the user's mood when scheduling (if mood is low, suggest lighter tasks or more breaks)
5. Respects task time estimates
6. Schedules tasks with due dates earlier in the day
7. Leaves buffer time between tasks

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
- Ensure times don't overlap
- Start from 09:00 and end by 18:00
- Make sure all high-priority tasks are included
- If user is feeling sad/very-sad, suggest lighter workload and more breaks`

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
        "3. The model name is correct (trying gemini-1.5-flash-latest)\n" +
        "Falling back to basic schedule generation."
      )
    }
    
    // Fallback to basic schedule generation
    return generateFallbackSchedule(tasks, focusDuration)
  }
}

// Fallback schedule generator if AI fails
function generateFallbackSchedule(tasks: Task[], focusDuration: number): ScheduleItem[] {
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

  const schedule: ScheduleItem[] = []
  let currentTime = 9 * 60 // Start at 9:00 AM in minutes

  for (let i = 0; i < Math.min(incompleteTasks.length, 6); i++) {
    const task = incompleteTasks[i]
    const duration = Math.min(task.timeEstimate || focusDuration, 120)

    // Add break every 2 tasks
    if (i > 0 && i % 2 === 0) {
      schedule.push({
        time: minutesToTime(currentTime),
        duration: 15,
        task: "Break",
        priority: "low",
      })
      currentTime += 15
    }

    schedule.push({
      time: minutesToTime(currentTime),
      duration,
      task: task.title,
      priority: task.priority,
    })

    currentTime += duration

    // Add lunch break after 4 hours
    if (currentTime >= 13 * 60 && schedule.findIndex((s) => s.task.toLowerCase().includes("lunch")) === -1) {
      schedule.push({
        time: "13:00",
        duration: 60,
        task: "Lunch break",
        priority: "low",
      })
      currentTime = 14 * 60
    }

    // Stop if we've reached 6 PM
    if (currentTime >= 18 * 60) {
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

