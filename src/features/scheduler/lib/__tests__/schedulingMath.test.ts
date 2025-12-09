/**
 * Scheduling Math Utilities Tests
 */

import { describe, it, expect } from "vitest"
import {
    calculateFreeSlots,
    computeTaskWeight,
    timeToMinutes,
    minutesToTime,
    sortTasksByWeight,
    getSlotDuration,
    type TimeSlot,
    type MoodType,
} from "../schedulingMath"
import type { Task } from "@/lib/domain/types"

// Helper to get today's date in YYYY-MM-DD format (local timezone)
function getLocalDateString(date: Date = new Date()): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
}

// =============================================================================
// Time Utility Tests
// =============================================================================

describe("timeToMinutes", () => {
    it("converts midnight correctly", () => {
        expect(timeToMinutes("00:00")).toBe(0)
    })

    it("converts noon correctly", () => {
        expect(timeToMinutes("12:00")).toBe(720)
    })

    it("converts end of day correctly", () => {
        expect(timeToMinutes("23:59")).toBe(1439)
    })

    it("handles early morning times", () => {
        expect(timeToMinutes("08:30")).toBe(510)
    })
})

describe("minutesToTime", () => {
    it("converts 0 to midnight", () => {
        expect(minutesToTime(0)).toBe("00:00")
    })

    it("converts 720 to noon", () => {
        expect(minutesToTime(720)).toBe("12:00")
    })

    it("pads single digit hours and minutes", () => {
        expect(minutesToTime(65)).toBe("01:05")
    })
})

// =============================================================================
// calculateFreeSlots Tests
// =============================================================================

describe("calculateFreeSlots", () => {
    it("returns full day when no events", () => {
        const slots = calculateFreeSlots("08:00", "18:00", [])
        expect(slots).toEqual([{ start: "08:00", end: "18:00" }])
    })

    it("calculates gaps between events", () => {
        const events: TimeSlot[] = [
            { start: "10:00", end: "11:00" },
            { start: "14:00", end: "15:00" },
        ]
        const slots = calculateFreeSlots("08:00", "18:00", events)
        expect(slots).toEqual([
            { start: "08:00", end: "10:00" },
            { start: "11:00", end: "14:00" },
            { start: "15:00", end: "18:00" },
        ])
    })

    it("handles event at start of day", () => {
        const events: TimeSlot[] = [{ start: "08:00", end: "10:00" }]
        const slots = calculateFreeSlots("08:00", "18:00", events)
        expect(slots).toEqual([{ start: "10:00", end: "18:00" }])
    })

    it("handles event at end of day", () => {
        const events: TimeSlot[] = [{ start: "16:00", end: "18:00" }]
        const slots = calculateFreeSlots("08:00", "18:00", events)
        expect(slots).toEqual([{ start: "08:00", end: "16:00" }])
    })

    it("merges overlapping events", () => {
        const events: TimeSlot[] = [
            { start: "10:00", end: "12:00" },
            { start: "11:00", end: "14:00" },
        ]
        const slots = calculateFreeSlots("08:00", "18:00", events)
        expect(slots).toEqual([
            { start: "08:00", end: "10:00" },
            { start: "14:00", end: "18:00" },
        ])
    })

    it("merges adjacent events", () => {
        const events: TimeSlot[] = [
            { start: "10:00", end: "11:00" },
            { start: "11:00", end: "12:00" },
        ]
        const slots = calculateFreeSlots("08:00", "18:00", events)
        expect(slots).toEqual([
            { start: "08:00", end: "10:00" },
            { start: "12:00", end: "18:00" },
        ])
    })

    it("handles events outside day bounds", () => {
        const events: TimeSlot[] = [
            { start: "06:00", end: "07:00" }, // Before day start
            { start: "20:00", end: "22:00" }, // After day end
        ]
        const slots = calculateFreeSlots("08:00", "18:00", events)
        expect(slots).toEqual([{ start: "08:00", end: "18:00" }])
    })

    it("handles event that spans entire day", () => {
        const events: TimeSlot[] = [{ start: "08:00", end: "18:00" }]
        const slots = calculateFreeSlots("08:00", "18:00", events)
        expect(slots).toEqual([])
    })

    it("handles event starting before day range", () => {
        const events: TimeSlot[] = [{ start: "06:00", end: "10:00" }]
        const slots = calculateFreeSlots("08:00", "18:00", events)
        expect(slots).toEqual([{ start: "10:00", end: "18:00" }])
    })

    it("handles unsorted events", () => {
        const events: TimeSlot[] = [
            { start: "14:00", end: "15:00" },
            { start: "10:00", end: "11:00" },
        ]
        const slots = calculateFreeSlots("08:00", "18:00", events)
        expect(slots).toEqual([
            { start: "08:00", end: "10:00" },
            { start: "11:00", end: "14:00" },
            { start: "15:00", end: "18:00" },
        ])
    })
})

// =============================================================================
// computeTaskWeight Tests
// =============================================================================

describe("computeTaskWeight", () => {
    const createTask = (overrides: Partial<Task> = {}): Task => ({
        id: "test-task",
        title: "Test Task",
        priority: "medium",
        timeEstimate: 30,
        completed: false,
        createdAt: new Date(),
        ...overrides,
    })

    it("returns base weight from priority (high)", () => {
        const task = createTask({ priority: "high" })
        const weight = computeTaskWeight(task, "Okay")
        expect(weight).toBe(30)
    })

    it("returns base weight from priority (medium)", () => {
        const task = createTask({ priority: "medium" })
        const weight = computeTaskWeight(task, "Okay")
        expect(weight).toBe(20)
    })

    it("returns base weight from priority (low)", () => {
        const task = createTask({ priority: "low" })
        const weight = computeTaskWeight(task, "Okay")
        expect(weight).toBe(10)
    })

    it("adds deadline bonus when due today", () => {
        const today = getLocalDateString()
        const task = createTask({ priority: "medium", dueDate: today })
        const weight = computeTaskWeight(task, "Okay")
        expect(weight).toBe(44) // 20 + 24
    })

    it("no deadline bonus when due tomorrow", () => {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        const task = createTask({ priority: "medium", dueDate: getLocalDateString(tomorrow) })
        const weight = computeTaskWeight(task, "Okay")
        expect(weight).toBe(20)
    })



    it("boosts difficult tasks when mood is Great", () => {
        const task = createTask({ priority: "medium", timeEstimate: 120 }) // difficulty 4
        const weight = computeTaskWeight(task, "Great")
        expect(weight).toBe(28) // 20 + (4 * 2)
    })

    it("reduces difficult tasks when mood is Low", () => {
        const task = createTask({ priority: "medium", timeEstimate: 120 }) // difficulty 4
        const weight = computeTaskWeight(task, "Low")
        expect(weight).toBe(12) // 20 - (4 * 2)
    })

    it("reduces difficult tasks when mood is Bad", () => {
        const task = createTask({ priority: "medium", timeEstimate: 120 }) // difficulty 4
        const weight = computeTaskWeight(task, "Bad")
        expect(weight).toBe(12) // 20 - (4 * 2)
    })

    it("no mood adjustment for Good mood", () => {
        const task = createTask({ priority: "medium", timeEstimate: 120 })
        const weight = computeTaskWeight(task, "Good")
        expect(weight).toBe(20)
    })

    it("ensures minimum weight of 1", () => {
        const task = createTask({ priority: "low", timeEstimate: 180 }) // difficulty 5
        const weight = computeTaskWeight(task, "Bad")
        expect(weight).toBe(1) // max(1, 10 - 10) = 1
    })

    it("combines deadline and mood bonuses", () => {
        const today = getLocalDateString()
        const task = createTask({ priority: "high", dueDate: today, timeEstimate: 60 }) // difficulty 3
        const weight = computeTaskWeight(task, "Great")
        expect(weight).toBe(60) // 30 + 24 + 6
    })
})

// =============================================================================
// sortTasksByWeight Tests
// =============================================================================

describe("sortTasksByWeight", () => {
    const createTask = (id: string, priority: "high" | "medium" | "low"): Task => ({
        id,
        title: `Task ${id}`,
        priority,
        timeEstimate: 30,
        completed: false,
        createdAt: new Date(),
    })

    it("sorts tasks by weight descending", () => {
        const tasks = [
            createTask("low", "low"),
            createTask("high", "high"),
            createTask("medium", "medium"),
        ]
        const sorted = sortTasksByWeight(tasks, "Okay")
        expect(sorted.map(t => t.id)).toEqual(["high", "medium", "low"])
    })

    it("does not mutate original array", () => {
        const tasks = [createTask("a", "low"), createTask("b", "high")]
        const sorted = sortTasksByWeight(tasks, "Okay")
        expect(tasks[0].id).toBe("a")
        expect(sorted[0].id).toBe("b")
    })
})

// =============================================================================
// getSlotDuration Tests
// =============================================================================

describe("getSlotDuration", () => {
    it("calculates duration correctly", () => {
        expect(getSlotDuration({ start: "08:00", end: "10:00" })).toBe(120)
    })

    it("handles same start and end", () => {
        expect(getSlotDuration({ start: "12:00", end: "12:00" })).toBe(0)
    })

    it("handles short slots", () => {
        expect(getSlotDuration({ start: "09:00", end: "09:15" })).toBe(15)
    })
})
