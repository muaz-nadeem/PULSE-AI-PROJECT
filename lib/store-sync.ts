import { useStore } from "./store"
import { tasksAPI, focusSessionsAPI, aiAPI } from "./api"

/**
 * Syncs the local Zustand store with the Supabase backend
 * This function fetches data from Supabase and updates the store
 */
export async function syncStoreWithAPI(): Promise<void> {
  try {
    // Sync tasks
    try {
      const tasks = await tasksAPI.getAll()
      const mappedTasks = tasks.map((task: any) => ({
        id: task.id,
        title: task.title,
        description: task.description || "",
        priority: task.priority,
        timeEstimate: task.time_estimate || 30,
        completed: task.completed || false,
        createdAt: new Date(task.created_at),
        category: task.category,
        dueDate: task.due_date ? new Date(task.due_date).toISOString().split("T")[0] : undefined,
        focusMode: task.focus_mode || false,
      }))

      // Update store with synced tasks
      useStore.setState({ tasks: mappedTasks })
    } catch (error) {
      console.error("Failed to sync tasks:", error)
    }

    // Sync focus sessions
    try {
      const sessions = await focusSessionsAPI.getAll()
      const mappedSessions = sessions.map((session: any) => ({
        id: session.id,
        duration: session.duration,
        date: new Date(session.created_at || session.date),
        completed: session.completed || false,
      }))

      useStore.setState({ focusSessions: mappedSessions })
    } catch (error) {
      console.error("Failed to sync focus sessions:", error)
    }

    // Sync AI plan
    try {
      await syncAIPlan()
    } catch (error) {
      console.error("Failed to sync AI plan:", error)
    }

    // Sync AI profile
    try {
      await syncAIProfile()
    } catch (error) {
      console.error("Failed to sync AI profile:", error)
    }
  } catch (error) {
    console.error("Failed to sync store with API:", error)
    // Don't throw - allow app to continue with local state
  }
}

/**
 * Syncs today's AI plan from the database to the store
 */
export async function syncAIPlan(): Promise<void> {
  try {
    useStore.setState({ aiPlanLoading: true, aiPlanError: null })
    
    const today = new Date().toISOString().split("T")[0]
    const plan = await aiAPI.getDailyPlan(today)
    
    if (plan) {
      useStore.setState({ 
        currentAIPlan: plan,
        currentSchedule: plan.schedule || [],
      })
    }
  } catch (error) {
    console.error("Failed to sync AI plan:", error)
    useStore.setState({ aiPlanError: "Failed to load AI plan" })
  } finally {
    useStore.setState({ aiPlanLoading: false })
  }
}

/**
 * Syncs the user's AI profile from the database to the store
 */
export async function syncAIProfile(): Promise<void> {
  try {
    const profile = await aiAPI.getUserAIProfile()
    
    if (profile) {
      useStore.setState({ 
        userAIProfile: {
          optimal_focus_duration: profile.optimal_focus_duration,
          preferred_work_start_hour: profile.preferred_work_start_hour,
          preferred_work_end_hour: profile.preferred_work_end_hour,
          most_productive_hours: profile.most_productive_hours || [],
          avg_plan_acceptance_rate: profile.avg_plan_acceptance_rate || 0,
        }
      })
    }
  } catch (error) {
    console.error("Failed to sync AI profile:", error)
    // Non-critical - continue without profile
  }
}

/**
 * Manually triggers a new AI plan generation and syncs it to the store
 */
export async function regenerateAIPlan(): Promise<void> {
  try {
    useStore.setState({ aiPlanLoading: true, aiPlanError: null })
    
    const response = await fetch("/api/ai/generate-plan", { method: "POST" })
    
    if (!response.ok) {
      throw new Error("Failed to generate plan")
    }
    
    const data = await response.json()
    
    if (data.plan) {
      useStore.setState({ 
        currentAIPlan: data.plan,
        currentSchedule: data.plan.schedule || [],
      })
    }
  } catch (error) {
    console.error("Failed to regenerate AI plan:", error)
    useStore.setState({ aiPlanError: "Failed to generate new plan" })
  } finally {
    useStore.setState({ aiPlanLoading: false })
  }
}
