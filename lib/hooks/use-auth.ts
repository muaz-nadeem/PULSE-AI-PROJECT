"use client"

/**
 * useAuth Hook
 * 
 * Abstracts authentication-related store access for components.
 */

import { useStore } from "../store"
import type { AuthState } from "../domain"

export interface UseAuthReturn {
    auth: AuthState
    setAuth: (isAuthenticated: boolean, userEmail?: string) => void
    logout: () => void
}

/**
 * Hook for accessing and managing authentication state
 */
export function useAuth(): UseAuthReturn {
    const auth = useStore((state) => state.auth)
    const setAuth = useStore((state) => state.setAuth)
    const logout = useStore((state) => state.logout)

    return {
        auth,
        setAuth,
        logout,
    }
}
