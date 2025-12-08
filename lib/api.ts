import { supabase } from "./supabase/client"
import type { Database } from "./supabase/types"

// Helper function to handle Supabase errors
function handleSupabaseError(error: any): never {
  console.error("Supabase error:", error)
  throw new Error(error.message || "An error occurred")
}

// Auth API
export const authAPI = {
  async login(email: string, password: string): Promise<void> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw new Error(error.message || "Login failed")
    }

    // Session is automatically stored by Supabase client
    if (!data.session) {
      throw new Error("No session returned")
    }
  },

  async register(email: string, name: string, password: string): Promise<void> {
    // Trim and normalize email
    const normalizedEmail = email.trim().toLowerCase()
    
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          name,
        },
      },
    })

    if (error) {
      // Provide more helpful error messages
      const errorMsg = error.message.toLowerCase()
      
      // Check for common Supabase error codes
      if (error.status === 422 || errorMsg.includes("already registered") || errorMsg.includes("already exists") || errorMsg.includes("user already registered")) {
        throw new Error("This email is already registered. Please try logging in instead.")
      } else if (errorMsg.includes("invalid") && errorMsg.includes("email")) {
        // Check if it's actually an "already exists" error disguised as invalid
        if (errorMsg.includes("yawar@gmail.com") || errorMsg.includes("already")) {
          throw new Error("This email is already registered. Please try logging in instead.")
        }
        throw new Error("Please check your email format. Make sure it's a valid email address.")
      } else {
        // Pass through the original error message
        throw new Error(error.message || "Registration failed. Please try again.")
      }
    }

    // Email confirmation is disabled - user should be immediately signed in
    if (!data.user) {
      throw new Error("Failed to create user account. Please try again.")
    }

    // If no session was returned, try to sign in immediately
    if (!data.session) {
      // Try to sign in with the same credentials to get a session
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: password,
      })

      if (signInError || !signInData.session) {
        // If sign in fails, it might be because email confirmation is still enabled
        console.error("Signup session error:", signInError)
        throw new Error("Account created but failed to sign in. Please try logging in manually. If this persists, check that email confirmation is disabled in Supabase settings.")
      }
    }
    
    // Wait a bit for the user profile to be created by the trigger
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Update user profile with name
    const { error: updateError } = await supabase
      .from("users")
      .update({ name })
      .eq("id", data.user.id)

    if (updateError) {
      console.error("Failed to update user name:", updateError)
      // Don't throw - profile might not exist yet, it will be created by trigger
    }
  },

  logout(): void {
    supabase.auth.signOut()
  },
}

// Users API
export const usersAPI = {
  async getCurrentUser(): Promise<{ email: string; name: string; onboarding_completed: boolean }> {
    // First check session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      throw new Error("Not authenticated")
    }

    const user = session.user

    // Try to get user profile, but handle case where it might not exist yet
    const { data, error } = await supabase
      .from("users")
      .select("email, name, onboarding_completed")
      .eq("id", user.id)
      .single()

    // If user profile doesn't exist yet, create it
    if (error && error.code === 'PGRST116') {
      // Profile doesn't exist, create it
      const { error: insertError } = await supabase
        .from("users")
        .insert({
          id: user.id,
          email: user.email || "",
          name: user.user_metadata?.name || null,
          onboarding_completed: false,
        })

      if (insertError) {
        console.error("Failed to create user profile:", insertError)
      }

      return {
        email: user.email || "",
        name: user.user_metadata?.name || "",
        onboarding_completed: false,
      }
    }

    if (error) {
      handleSupabaseError(error)
    }

    return {
      email: data?.email || user.email || "",
      name: data?.name || "",
      onboarding_completed: data?.onboarding_completed || false,
    }
  },

  async updateCurrentUser(data: { onboarding_completed?: boolean; name?: string }): Promise<void> {
    // Check session first
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      throw new Error("Not authenticated")
    }

    const user = session.user

    const updates: any = {}
    if (data.onboarding_completed !== undefined) {
      updates.onboarding_completed = data.onboarding_completed
    }
    if (data.name !== undefined) {
      updates.name = data.name
    }

    const { error } = await supabase.from("users").update(updates).eq("id", user.id)

    if (error) {
      // If user profile doesn't exist, create it first
      if (error.code === 'PGRST116') {
        const { error: insertError } = await supabase
          .from("users")
          .insert({
            id: user.id,
            email: user.email || "",
            name: data.name || user.user_metadata?.name || null,
            onboarding_completed: data.onboarding_completed || false,
          })

        if (insertError) {
          handleSupabaseError(insertError)
        }
      } else {
        handleSupabaseError(error)
      }
    }
  },
}

// Tasks API
export const tasksAPI = {
  async getAll(): Promise<any[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("Not authenticated")
    }

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      handleSupabaseError(error)
    }

    return (
      data?.map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description || "",
        priority: task.priority,
        time_estimate: task.time_estimate,
        completed: task.completed,
        created_at: task.created_at,
        category: task.category,
        due_date: task.due_date,
        focus_mode: task.focus_mode,
      })) || []
    )
  },

  async getById(id: string): Promise<any> {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("Not authenticated")
    }

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (error) {
      handleSupabaseError(error)
    }

    return {
      id: data.id,
      title: data.title,
      description: data.description || "",
      priority: data.priority,
      time_estimate: data.time_estimate,
      completed: data.completed,
      created_at: data.created_at,
      category: data.category,
      due_date: data.due_date,
      focus_mode: data.focus_mode,
    }
  },

  async create(data: {
    title: string
    description?: string
    priority: "high" | "medium" | "low"
    time_estimate: number
    category?: string
    due_date?: string
    focus_mode?: boolean
  }): Promise<any> {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("Not authenticated")
    }

    const { data: task, error } = await supabase
      .from("tasks")
      .insert({
        user_id: user.id,
        title: data.title,
        description: data.description || "",
        priority: data.priority,
        time_estimate: data.time_estimate,
        category: data.category || null,
        due_date: data.due_date || null,
        focus_mode: data.focus_mode || false,
      })
      .select()
      .single()

    if (error) {
      handleSupabaseError(error)
    }

    return {
      id: task.id,
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      time_estimate: task.time_estimate,
      completed: task.completed,
      created_at: task.created_at,
      category: task.category,
      due_date: task.due_date,
      focus_mode: task.focus_mode,
    }
  },

  async update(
    id: string,
    data: Partial<{
      title: string
      description: string
      priority: "high" | "medium" | "low"
      time_estimate: number
      category: string
      due_date: string
      focus_mode: boolean
      completed: boolean
    }>
  ): Promise<any> {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("Not authenticated")
    }

    const updates: any = {}
    if (data.title !== undefined) updates.title = data.title
    if (data.description !== undefined) updates.description = data.description
    if (data.priority !== undefined) updates.priority = data.priority
    if (data.time_estimate !== undefined) updates.time_estimate = data.time_estimate
    if (data.category !== undefined) updates.category = data.category
    if (data.due_date !== undefined) updates.due_date = data.due_date || null
    if (data.focus_mode !== undefined) updates.focus_mode = data.focus_mode
    if (data.completed !== undefined) updates.completed = data.completed

    const { data: task, error } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) {
      handleSupabaseError(error)
    }

    return {
      id: task.id,
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      time_estimate: task.time_estimate,
      completed: task.completed,
      created_at: task.created_at,
      category: task.category,
      due_date: task.due_date,
      focus_mode: task.focus_mode,
    }
  },

  async delete(id: string): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("Not authenticated")
    }

    const { error } = await supabase.from("tasks").delete().eq("id", id).eq("user_id", user.id)

    if (error) {
      handleSupabaseError(error)
    }
  },
}

// Focus Sessions API
export const focusSessionsAPI = {
  async getAll(): Promise<any[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("Not authenticated")
    }

    const { data, error } = await supabase
      .from("focus_sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      handleSupabaseError(error)
    }

    return (
      data?.map((session) => ({
        id: session.id,
        duration: session.duration,
        completed: session.completed,
        created_at: session.created_at,
        date: session.created_at,
      })) || []
    )
  },

  async create(data: { duration: number; completed: boolean }): Promise<any> {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("Not authenticated")
    }

    const { data: session, error } = await supabase
      .from("focus_sessions")
      .insert({
        user_id: user.id,
        duration: data.duration,
        completed: data.completed,
      })
      .select()
      .single()

    if (error) {
      handleSupabaseError(error)
    }

    return {
      id: session.id,
      duration: session.duration,
      completed: session.completed,
      created_at: session.created_at,
      date: session.created_at,
    }
  },
}

// Extension API helpers
export const extensionAPI = {
  async getAuthToken(): Promise<string | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      return session?.access_token || null
    } catch (error) {
      console.error("Error getting auth token:", error)
      return null
    }
  },

  async validateToken(token: string): Promise<boolean> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser(token)
      return !error && !!user
    } catch (error) {
      return false
    }
  },
}
