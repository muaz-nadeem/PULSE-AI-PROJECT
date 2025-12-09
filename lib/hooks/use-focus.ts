"use client"

/**
 * useFocus Hook
 * 
 * Abstracts focus session and distraction-related store access for components.
 */

import { useStore } from "../store"
import type { FocusSession, Distraction, DistractionInsights } from "../domain"

export interface UseFocusReturn {
    focusSessions: FocusSession[]
    distractions: Distraction[]
    addFocusSession: (duration: number) => void
    addDistraction: (distraction: Omit<Distraction, "id" | "date">) => void
    deleteDistraction: (id: string) => void
    getDistractionInsights: () => DistractionInsights
}

/**
 * Hook for accessing and managing focus sessions and distractions
 */
export function useFocus(): UseFocusReturn {
    const focusSessions = useStore((state) => state.focusSessions)
    const distractions = useStore((state) => state.distractions)
    const addFocusSession = useStore((state) => state.addFocusSession)
    const addDistraction = useStore((state) => state.addDistraction)
    const deleteDistraction = useStore((state) => state.deleteDistraction)
    const getDistractionInsights = useStore((state) => state.getDistractionInsights)

    return {
        focusSessions,
        distractions,
        addFocusSession,
        addDistraction,
        deleteDistraction,
        getDistractionInsights,
    }
}
