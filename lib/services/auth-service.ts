/**
 * Auth Service
 * 
 * Handles all authentication operations with Supabase.
 */

import { supabase } from "../supabase/client"
import type {
  IAuthService,
  AuthUser,
  LoginCredentials,
  RegisterCredentials,
  ServiceResult,
} from "./types"

/**
 * Maps Supabase user data to our AuthUser type
 */
function mapToAuthUser(user: any, profile?: any): AuthUser {
  return {
    id: user.id,
    email: user.email || "",
    name: profile?.name || user.user_metadata?.name || null,
    onboardingCompleted: profile?.onboarding_completed || false,
  }
}

/**
 * Creates a standardized error result
 */
function errorResult<T>(message: string): ServiceResult<T> {
  return { data: null, error: message }
}

/**
 * Creates a standardized success result
 */
function successResult<T>(data: T): ServiceResult<T> {
  return { data, error: null }
}

export const authService: IAuthService = {
  async login(credentials: LoginCredentials): Promise<ServiceResult<AuthUser>> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })

      if (error) {
        return errorResult(error.message || "Login failed")
      }

      if (!data.session || !data.user) {
        return errorResult("No session returned")
      }

      // Fetch user profile
      const { data: profile } = await supabase
        .from("users")
        .select("name, onboarding_completed")
        .eq("id", data.user.id)
        .single()

      return successResult(mapToAuthUser(data.user, profile))
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : "Login failed")
    }
  },

  async register(credentials: RegisterCredentials): Promise<ServiceResult<AuthUser>> {
    try {
      const normalizedEmail = credentials.email.trim().toLowerCase()

      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: credentials.password,
        options: {
          data: { name: credentials.name },
        },
      })

      if (error) {
        const errorMsg = error.message.toLowerCase()

        if (
          error.status === 422 ||
          errorMsg.includes("already registered") ||
          errorMsg.includes("already exists") ||
          errorMsg.includes("user already registered")
        ) {
          return errorResult("This email is already registered. Please try logging in instead.")
        }

        if (errorMsg.includes("invalid") && errorMsg.includes("email")) {
          return errorResult("Please check your email format. Make sure it's a valid email address.")
        }

        return errorResult(error.message || "Registration failed")
      }

      if (!data.user) {
        return errorResult("Failed to create user account")
      }

      // If no session was returned, try to sign in immediately
      if (!data.session) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password: credentials.password,
        })

        if (signInError || !signInData.session) {
          return errorResult(
            "Account created but failed to sign in. Please try logging in manually."
          )
        }
      }

      // Wait for profile trigger to complete
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Update user profile with name
      await supabase.from("users").update({ name: credentials.name }).eq("id", data.user.id)

      return successResult(mapToAuthUser(data.user, { name: credentials.name }))
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : "Registration failed")
    }
  },

  async logout(): Promise<ServiceResult<void>> {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        return errorResult(error.message)
      }
      return successResult(undefined)
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : "Logout failed")
    }
  },

  async getCurrentUser(): Promise<ServiceResult<AuthUser>> {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError || !session) {
        return errorResult("Not authenticated")
      }

      const user = session.user

      // Try to get user profile
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("email, name, onboarding_completed")
        .eq("id", user.id)
        .single()

      // If profile doesn't exist, create it
      if (profileError && profileError.code === "PGRST116") {
        const { error: insertError } = await supabase.from("users").insert({
          id: user.id,
          email: user.email || "",
          name: user.user_metadata?.name || null,
          onboarding_completed: false,
        })

        if (insertError) {
          console.error("Failed to create user profile:", insertError)
        }

        return successResult({
          id: user.id,
          email: user.email || "",
          name: user.user_metadata?.name || null,
          onboardingCompleted: false,
        })
      }

      if (profileError) {
        return errorResult(profileError.message)
      }

      return successResult(mapToAuthUser(user, profile))
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : "Failed to get current user")
    }
  },

  async updateUser(
    updates: Partial<Pick<AuthUser, "name" | "onboardingCompleted">>
  ): Promise<ServiceResult<AuthUser>> {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError || !session) {
        return errorResult("Not authenticated")
      }

      const user = session.user
      const dbUpdates: Record<string, unknown> = {}

      if (updates.name !== undefined) {
        dbUpdates.name = updates.name
      }
      if (updates.onboardingCompleted !== undefined) {
        dbUpdates.onboarding_completed = updates.onboardingCompleted
      }

      const { error } = await supabase.from("users").update(dbUpdates).eq("id", user.id)

      if (error) {
        // If user profile doesn't exist, create it
        if (error.code === "PGRST116") {
          const { error: insertError } = await supabase.from("users").insert({
            id: user.id,
            email: user.email || "",
            name: updates.name || user.user_metadata?.name || null,
            onboarding_completed: updates.onboardingCompleted || false,
          })

          if (insertError) {
            return errorResult(insertError.message)
          }
        } else {
          return errorResult(error.message)
        }
      }

      // Fetch updated profile
      const { data: profile } = await supabase
        .from("users")
        .select("name, onboarding_completed")
        .eq("id", user.id)
        .single()

      return successResult(mapToAuthUser(user, profile))
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : "Failed to update user")
    }
  },

  onAuthStateChange(callback: (user: AuthUser | null) => void): () => void {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from("users")
          .select("name, onboarding_completed")
          .eq("id", session.user.id)
          .single()

        callback(mapToAuthUser(session.user, profile))
      } else {
        callback(null)
      }
    })

    return () => subscription.unsubscribe()
  },
}

