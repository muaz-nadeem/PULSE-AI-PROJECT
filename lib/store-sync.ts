import { useStore } from "./store"
import { tasksAPI, focusSessionsAPI } from "./api"

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
  } catch (error) {
    console.error("Failed to sync store with API:", error)
    // Don't throw - allow app to continue with local state
  }
}
