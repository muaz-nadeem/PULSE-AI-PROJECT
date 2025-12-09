/**
 * Smart Schedule Hook
 * 
 * Master orchestration hook that integrates:
 * - OCR parsing for schedule images
 * - Task store for pending tasks
 * - Learning store for mood-based capacity adjustments
 * - Scheduler engine for generating optimized plans
 */

"use client"

import { useState, useCallback } from "react"
import { useTaskStore } from "@/lib/store/slices/task-slice"
import { useLearningStore } from "./learningStore"
import {
    generateSchedule,
    toScheduleItems,
    type ScheduleResult,
    type ScheduledTask
} from "../lib/schedulerEngine"
import { calculateFreeSlots, type TimeSlot, type MoodType } from "../lib/schedulingMath"
import type { ScheduleItem } from "@/lib/domain/types"

// =============================================================================
// Types
// =============================================================================

export interface OCREvent {
    title: string
    startTime: string  // HH:MM format
    endTime: string    // HH:MM format
}

export interface DayPlan {
    schedule: ScheduleItem[]
    scheduledTasks: ScheduledTask[]
    unscheduledCount: number
    totalMinutes: number
    utilizationPercent: number
    loadFactor: number
}

export interface SmartScheduleResult {
    dayPlan: DayPlan | null
    isProcessing: boolean
    error: string | null
    generate: (scheduleImage?: File | null, userMood?: MoodType) => Promise<void>
    generateFromEvents: (events: OCREvent[], userMood?: MoodType) => Promise<void>
}

export interface SmartScheduleOptions {
    dayStart?: string       // Default work day start (default: "08:00")
    dayEnd?: string         // Default work day end (default: "22:00")
    defaultMood?: MoodType  // Default mood if not specified
}

// =============================================================================
// OCR Service Interface (to be implemented)
// =============================================================================

/**
 * OCR Service interface for parsing schedule images.
 * This is a placeholder - implement actual OCR integration separately.
 */
export interface OCRService {
    parseScheduleImage(image: File): Promise<OCREvent[]>
}

/**
 * Placeholder OCR service that returns empty events.
 * Replace with actual implementation (Google Vision, Tesseract, etc.)
 */
const placeholderOCRService: OCRService = {
    async parseScheduleImage(_image: File): Promise<OCREvent[]> {
        // TODO: Implement actual OCR integration
        console.warn("OCR Service not implemented. Using empty events.")
        return []
    }
}

// =============================================================================
// Hook Implementation
// =============================================================================

/**
 * Smart Schedule Hook
 * 
 * Orchestrates the full scheduling pipeline:
 * 1. Parse schedule image via OCR (optional)
 * 2. Get pending tasks from store
 * 3. Calculate load factor from learning store
 * 4. Generate optimized schedule
 * 
 * @param options - Configuration options
 * @param ocrService - OCR service implementation (defaults to placeholder)
 * @returns SmartScheduleResult with dayPlan, processing state, and generation functions
 * 
 * @example
 * const { dayPlan, isProcessing, error, generate, generateFromEvents } = useSmartSchedule()
 * 
 * // Generate from image
 * await generate(imageFile, "Great")
 * 
 * // Generate from manual events
 * await generateFromEvents([
 *   { title: "Meeting", startTime: "10:00", endTime: "11:00" }
 * ], "Okay")
 */
export function useSmartSchedule(
    options: SmartScheduleOptions = {},
    ocrService: OCRService = placeholderOCRService
): SmartScheduleResult {
    const {
        dayStart = "08:00",
        dayEnd = "22:00",
        defaultMood = "Okay",
    } = options

    // State
    const [dayPlan, setDayPlan] = useState<DayPlan | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Store access
    const tasks = useTaskStore((state) => state.tasks)
    const getLoadFactor = useLearningStore((state) => state.getLoadFactor)

    /**
     * Converts OCR events to busy time slots.
     */
    const eventsToTimeSlots = useCallback((events: OCREvent[]): TimeSlot[] => {
        return events.map(event => ({
            start: event.startTime,
            end: event.endTime,
        }))
    }, [])

    /**
     * Generates a schedule from pre-parsed events.
     */
    const generateFromEvents = useCallback(async (
        events: OCREvent[],
        userMood: MoodType = defaultMood
    ): Promise<void> => {
        setIsProcessing(true)
        setError(null)

        try {
            // Step 1: Convert events to busy slots
            const busySlots = eventsToTimeSlots(events)

            // Step 2: Calculate free slots
            const freeSlots = calculateFreeSlots(dayStart, dayEnd, busySlots)

            // Step 3: Get pending (incomplete) tasks
            const pendingTasks = tasks.filter(t => !t.completed)

            // Step 4: Get load factor from learning store
            const loadFactor = getLoadFactor(userMood)

            // Step 5: Generate schedule
            const result: ScheduleResult = generateSchedule(
                pendingTasks,
                freeSlots,
                {
                    mood: userMood,
                    loadFactor,
                }
            )

            // Step 6: Convert to app format
            const schedule = toScheduleItems(result.scheduledTasks)

            // Build day plan
            const plan: DayPlan = {
                schedule,
                scheduledTasks: result.scheduledTasks,
                unscheduledCount: result.unscheduledTasks.filter(t => t.reason !== "completed").length,
                totalMinutes: result.totalScheduledMinutes,
                utilizationPercent: result.utilizationPercent,
                loadFactor,
            }

            setDayPlan(plan)
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to generate schedule"
            setError(message)
            console.error("Schedule generation error:", err)
        } finally {
            setIsProcessing(false)
        }
    }, [tasks, getLoadFactor, eventsToTimeSlots, dayStart, dayEnd, defaultMood])

    /**
     * Generates a schedule from a schedule image.
     * Uses OCR to extract events, then generates plan.
     */
    const generate = useCallback(async (
        scheduleImage?: File | null,
        userMood: MoodType = defaultMood
    ): Promise<void> => {
        setIsProcessing(true)
        setError(null)

        try {
            // Step A: Parse image via OCR (if provided)
            let events: OCREvent[] = []
            if (scheduleImage) {
                events = await ocrService.parseScheduleImage(scheduleImage)
            }

            // Step B-D: Generate schedule
            await generateFromEvents(events, userMood)
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to process schedule"
            setError(message)
            console.error("Schedule processing error:", err)
            setIsProcessing(false)
        }
    }, [ocrService, generateFromEvents, defaultMood])

    return {
        dayPlan,
        isProcessing,
        error,
        generate,
        generateFromEvents,
    }
}

// =============================================================================
// Convenience Export
// =============================================================================

export type { MoodType } from "../lib/schedulingMath"
