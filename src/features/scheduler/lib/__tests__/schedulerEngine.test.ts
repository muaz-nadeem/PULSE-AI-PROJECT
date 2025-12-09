/**
 * Scheduler Engine Tests
 */

import { describe, it, expect } from "vitest"
import {
    generateSchedule,
    toScheduleItems,
    insertBreaks,
    type ScheduledTask,
    type ScheduleResult,
} from "../schedulerEngine"
import type { Task } from "@/lib/domain/types"
import type { TimeSlot } from "../schedulingMath"

// =============================================================================
// Test Helpers
// =============================================================================

function createTask(overrides: Partial<Task> & { id: string }): Task {
    return {
        title: `Task ${overrides.id}`,
        priority: "medium",
        timeEstimate: 30,
        completed: false,
        createdAt: new Date(),
        ...overrides,
    }
}

function createSlot(start: string, end: string): TimeSlot {
    return { start, end }
}

// =============================================================================
// generateSchedule Tests
// =============================================================================

describe("generateSchedule", () => {
    describe("basic scheduling", () => {
        it("schedules a single task into a single slot", () => {
            const tasks = [createTask({ id: "1", timeEstimate: 30 })]
            const slots = [createSlot("09:00", "10:00")]

            const result = generateSchedule(tasks, slots)

            expect(result.scheduledTasks).toHaveLength(1)
            expect(result.scheduledTasks[0].taskId).toBe("1")
            expect(result.scheduledTasks[0].startTime).toBe("09:00")
            expect(result.scheduledTasks[0].endTime).toBe("09:30")
        })

        it("schedules multiple tasks that fit in one slot", () => {
            const tasks = [
                createTask({ id: "1", timeEstimate: 30 }),
                createTask({ id: "2", timeEstimate: 30 }),
            ]
            const slots = [createSlot("09:00", "11:00")]

            const result = generateSchedule(tasks, slots)

            expect(result.scheduledTasks).toHaveLength(2)
            expect(result.scheduledTasks[0].startTime).toBe("09:00")
            expect(result.scheduledTasks[1].startTime).toBe("09:30")
        })

        it("schedules tasks across multiple slots", () => {
            const tasks = [
                createTask({ id: "1", timeEstimate: 60 }),
                createTask({ id: "2", timeEstimate: 60 }),
            ]
            const slots = [
                createSlot("09:00", "10:00"),
                createSlot("14:00", "15:00"),
            ]

            const result = generateSchedule(tasks, slots)

            expect(result.scheduledTasks).toHaveLength(2)
            expect(result.scheduledTasks[0].startTime).toBe("09:00")
            expect(result.scheduledTasks[1].startTime).toBe("14:00")
        })

        it("returns empty when no tasks provided", () => {
            const result = generateSchedule([], [createSlot("09:00", "17:00")])

            expect(result.scheduledTasks).toHaveLength(0)
            expect(result.unscheduledTasks).toHaveLength(0)
        })

        it("returns empty when no slots provided", () => {
            const tasks = [createTask({ id: "1", timeEstimate: 30 })]
            const result = generateSchedule(tasks, [])

            expect(result.scheduledTasks).toHaveLength(0)
            expect(result.unscheduledTasks).toHaveLength(1)
            expect(result.unscheduledTasks[0].reason).toBe("no_fit")
        })
    })

    describe("priority handling", () => {
        it("schedules high priority tasks first", () => {
            const tasks = [
                createTask({ id: "low", priority: "low", timeEstimate: 60 }),
                createTask({ id: "high", priority: "high", timeEstimate: 60 }),
                createTask({ id: "medium", priority: "medium", timeEstimate: 60 }),
            ]
            const slots = [createSlot("09:00", "12:00")]

            const result = generateSchedule(tasks, slots)

            expect(result.scheduledTasks[0].taskId).toBe("high")
            expect(result.scheduledTasks[1].taskId).toBe("medium")
            expect(result.scheduledTasks[2].taskId).toBe("low")
        })

        it("respects deadline priority", () => {
            const today = new Date()
            const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`

            const tasks = [
                createTask({ id: "no-deadline", priority: "high", timeEstimate: 60 }),
                createTask({ id: "due-today", priority: "medium", timeEstimate: 60, dueDate: todayStr }),
            ]
            const slots = [createSlot("09:00", "11:00")]

            const result = generateSchedule(tasks, slots)

            // Due today task gets +24 bonus, so: medium(20) + 24 = 44 > high(30)
            expect(result.scheduledTasks[0].taskId).toBe("due-today")
        })
    })

    describe("task filtering", () => {
        it("excludes completed tasks", () => {
            const tasks = [
                createTask({ id: "completed", completed: true, timeEstimate: 30 }),
                createTask({ id: "pending", completed: false, timeEstimate: 30 }),
            ]
            const slots = [createSlot("09:00", "10:00")]

            const result = generateSchedule(tasks, slots)

            expect(result.scheduledTasks).toHaveLength(1)
            expect(result.scheduledTasks[0].taskId).toBe("pending")
            expect(result.unscheduledTasks).toHaveLength(1)
            expect(result.unscheduledTasks[0].reason).toBe("completed")
        })
    })

    describe("slot constraints", () => {
        it("respects minimum slot duration", () => {
            const tasks = [createTask({ id: "1", timeEstimate: 20 })]
            const slots = [createSlot("09:00", "09:10")] // Only 10 minutes

            const result = generateSchedule(tasks, slots, { mood: "Okay", minSlotDuration: 15 })

            expect(result.scheduledTasks).toHaveLength(0)
            expect(result.unscheduledTasks).toHaveLength(1)
        })

        it("handles task too large for any slot", () => {
            const tasks = [createTask({ id: "1", timeEstimate: 120 })]
            const slots = [createSlot("09:00", "10:00")] // Only 60 minutes

            const result = generateSchedule(tasks, slots)

            expect(result.scheduledTasks).toHaveLength(0)
            expect(result.unscheduledTasks).toHaveLength(1)
            expect(result.unscheduledTasks[0].reason).toBe("no_fit")
        })

        it("packs multiple small tasks into remaining slot time", () => {
            const tasks = [
                createTask({ id: "big", priority: "high", timeEstimate: 45 }),
                createTask({ id: "small", priority: "low", timeEstimate: 15 }),
            ]
            const slots = [createSlot("09:00", "10:00")]

            const result = generateSchedule(tasks, slots)

            expect(result.scheduledTasks).toHaveLength(2)
            expect(result.scheduledTasks[0].taskId).toBe("big")
            expect(result.scheduledTasks[0].endTime).toBe("09:45")
            expect(result.scheduledTasks[1].taskId).toBe("small")
            expect(result.scheduledTasks[1].startTime).toBe("09:45")
        })
    })

    describe("statistics", () => {
        it("calculates correct utilization percentage", () => {
            const tasks = [createTask({ id: "1", timeEstimate: 30 })]
            const slots = [createSlot("09:00", "10:00")] // 60 minutes available

            const result = generateSchedule(tasks, slots)

            expect(result.totalScheduledMinutes).toBe(30)
            expect(result.utilizationPercent).toBe(50)
        })

        it("handles empty slots for utilization", () => {
            const result = generateSchedule([], [])

            expect(result.utilizationPercent).toBe(0)
        })
    })

    describe("mood adjustment", () => {
        it("boosts difficult tasks when mood is Great", () => {
            const tasks = [
                createTask({ id: "easy", priority: "medium", timeEstimate: 15 }), // difficulty 1
                createTask({ id: "hard", priority: "medium", timeEstimate: 120 }), // difficulty 4
            ]
            const slots = [createSlot("09:00", "12:00")]

            const result = generateSchedule(tasks, slots, { mood: "Great" })

            // Hard task gets +8 bonus (4*2), so it should be scheduled first
            expect(result.scheduledTasks[0].taskId).toBe("hard")
        })

        it("deprioritizes difficult tasks when mood is Low", () => {
            const tasks = [
                createTask({ id: "easy", priority: "medium", timeEstimate: 15 }), // difficulty 1
                createTask({ id: "hard", priority: "medium", timeEstimate: 120 }), // difficulty 4
            ]
            const slots = [createSlot("09:00", "12:00")]

            const result = generateSchedule(tasks, slots, { mood: "Low" })

            // Hard task gets -8 penalty (4*2), easy gets -2, so easy should be first
            expect(result.scheduledTasks[0].taskId).toBe("easy")
        })
    })

    describe("loadFactor capacity limiting", () => {
        it("limits scheduling to capacity when loadFactor < 1", () => {
            const tasks = [
                createTask({ id: "1", timeEstimate: 30 }),
                createTask({ id: "2", timeEstimate: 30 }),
                createTask({ id: "3", timeEstimate: 30 }),
            ]
            const slots = [createSlot("09:00", "10:30")] // 90 minutes available

            // With loadFactor 0.5, capacity = 45 minutes
            const result = generateSchedule(tasks, slots, { mood: "Okay", loadFactor: 0.5 })

            // Should only schedule 1 task (30 min) as next would exceed 45 min capacity
            expect(result.scheduledTasks).toHaveLength(1)
            expect(result.totalScheduledMinutes).toBeLessThanOrEqual(45)
        })

        it("schedules all tasks when loadFactor is 1.0", () => {
            const tasks = [
                createTask({ id: "1", timeEstimate: 30 }),
                createTask({ id: "2", timeEstimate: 30 }),
            ]
            const slots = [createSlot("09:00", "10:00")] // 60 minutes available

            const result = generateSchedule(tasks, slots, { mood: "Okay", loadFactor: 1.0 })

            expect(result.scheduledTasks).toHaveLength(2)
            expect(result.totalScheduledMinutes).toBe(60)
        })

        it("allows more tasks when loadFactor > 1", () => {
            // This tests that loadFactor > 1 doesn't cause issues
            // (it won't actually add more time, but shouldn't break)
            const tasks = [createTask({ id: "1", timeEstimate: 60 })]
            const slots = [createSlot("09:00", "10:00")] // 60 minutes

            const result = generateSchedule(tasks, slots, { mood: "Okay", loadFactor: 1.2 })

            // Still only 60 minutes available, so only 1 task scheduled
            expect(result.scheduledTasks).toHaveLength(1)
        })

        it("marks excess tasks as no_fit when capacity limited", () => {
            const tasks = [
                createTask({ id: "1", priority: "high", timeEstimate: 30 }),
                createTask({ id: "2", priority: "low", timeEstimate: 30 }),
            ]
            const slots = [createSlot("09:00", "10:00")] // 60 minutes

            // With loadFactor 0.5, capacity = 30 minutes
            const result = generateSchedule(tasks, slots, { mood: "Okay", loadFactor: 0.5 })

            expect(result.scheduledTasks).toHaveLength(1)
            expect(result.scheduledTasks[0].taskId).toBe("1") // High priority first
            expect(result.unscheduledTasks).toHaveLength(1)
            expect(result.unscheduledTasks[0].task.id).toBe("2")
            expect(result.unscheduledTasks[0].reason).toBe("no_fit")
        })
    })
})

// =============================================================================
// toScheduleItems Tests
// =============================================================================

describe("toScheduleItems", () => {
    it("converts scheduled tasks to schedule item format", () => {
        const scheduled: ScheduledTask[] = [
            {
                taskId: "1",
                task: createTask({ id: "1", title: "Code review", priority: "high", timeEstimate: 60 }),
                startTime: "09:00",
                endTime: "10:00",
                duration: 60,
            },
        ]

        const items = toScheduleItems(scheduled)

        expect(items).toHaveLength(1)
        expect(items[0]).toEqual({
            time: "09:00",
            duration: 60,
            task: "Code review",
            priority: "high",
            taskId: "1",
            type: "work",
        })
    })
})

// =============================================================================
// insertBreaks Tests
// =============================================================================

describe("insertBreaks", () => {
    it("inserts breaks between tasks with gaps", () => {
        const scheduled: ScheduledTask[] = [
            {
                taskId: "1",
                task: createTask({ id: "1", timeEstimate: 60 }),
                startTime: "09:00",
                endTime: "10:00",
                duration: 60,
            },
            {
                taskId: "2",
                task: createTask({ id: "2", timeEstimate: 60 }),
                startTime: "10:30",
                endTime: "11:30",
                duration: 60,
            },
        ]

        const withBreaks = insertBreaks(scheduled, 15)

        expect(withBreaks).toHaveLength(3)
        expect(withBreaks[0].type).toBe("work")
        expect(withBreaks[1].type).toBe("break")
        expect(withBreaks[1].time).toBe("10:00")
        expect(withBreaks[1].duration).toBe(15)
        expect(withBreaks[2].type).toBe("work")
    })

    it("does not insert break when gap is too small", () => {
        const scheduled: ScheduledTask[] = [
            {
                taskId: "1",
                task: createTask({ id: "1", timeEstimate: 60 }),
                startTime: "09:00",
                endTime: "10:00",
                duration: 60,
            },
            {
                taskId: "2",
                task: createTask({ id: "2", timeEstimate: 60 }),
                startTime: "10:05", // Only 5 minutes gap
                endTime: "11:05",
                duration: 60,
            },
        ]

        const withBreaks = insertBreaks(scheduled, 15)

        expect(withBreaks).toHaveLength(2)
        expect(withBreaks.every(item => item.type === "work")).toBe(true)
    })

    it("handles empty input", () => {
        const withBreaks = insertBreaks([])
        expect(withBreaks).toHaveLength(0)
    })
})
