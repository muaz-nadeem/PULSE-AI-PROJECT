/**
 * Unit tests for notification-logic domain functions
 */

import { describe, it, expect } from 'vitest'
import {
    checkSmartNotificationsLogic,
    type SmartNotificationInput,
} from '../notification-logic'
import type { FocusSession, Goal, Task, Habit, Notification, Milestone } from '../types'

// =============================================================================
// Test Helpers
// =============================================================================

function createFocusSession(overrides: Partial<FocusSession> = {}): FocusSession {
    return {
        id: 'session-1',
        duration: 25,
        completed: true,
        date: new Date(),
        ...overrides,
    }
}

function createGoal(overrides: Partial<Goal> = {}): Goal {
    return {
        id: 'goal-1',
        title: 'Test Goal',
        progress: 0,
        status: 'active',
        createdAt: new Date(),
        milestones: [],
        category: 'Personal',
        color: 'bg-blue-500',
        ...overrides,
    }
}

function createMilestone(overrides: Partial<Milestone> = {}): Milestone {
    return {
        id: 'milestone-1',
        title: 'Test Milestone',
        completed: false,
        order: 0,
        ...overrides,
    }
}

function createTask(overrides: Partial<Task> = {}): Task {
    return {
        id: 'task-1',
        title: 'Test Task',
        priority: 'medium',
        timeEstimate: 30,
        completed: false,
        createdAt: new Date(),
        ...overrides,
    }
}

function createHabit(overrides: Partial<Habit> = {}): Habit {
    return {
        id: 'habit-1',
        name: 'Test Habit',
        frequency: 'daily',
        color: '#3b82f6',
        createdAt: new Date(),
        completedDates: [],
        currentStreak: 0,
        longestStreak: 0,
        ...overrides,
    }
}

function createNotification(overrides: Partial<Notification> = {}): Notification {
    return {
        id: 'notif-1',
        type: 'reminder',
        title: 'Test Notification',
        message: 'Test message',
        timestamp: new Date(),
        read: false,
        ...overrides,
    }
}

function createInput(overrides: Partial<SmartNotificationInput> = {}): SmartNotificationInput {
    return {
        now: new Date(),
        focusSessions: [],
        distractions: [],
        goals: [],
        tasks: [],
        habits: [],
        existingNotifications: [],
        ...overrides,
    }
}

// =============================================================================
// Tests
// =============================================================================

describe('checkSmartNotificationsLogic', () => {
    describe('break suggestions', () => {
        it('returns break suggestion when last session was 25-30 minutes ago', () => {
            const now = new Date()
            const sessionTime = new Date(now.getTime() - 26 * 60 * 1000) // 26 minutes ago

            const input = createInput({
                now,
                focusSessions: [createFocusSession({ date: sessionTime })],
            })

            const result = checkSmartNotificationsLogic(input)

            expect(result.some(n => n.title === 'Time for a Break!')).toBe(true)
        })

        it('does not return break suggestion if less than 25 minutes ago', () => {
            const now = new Date()
            const sessionTime = new Date(now.getTime() - 20 * 60 * 1000) // 20 minutes ago

            const input = createInput({
                now,
                focusSessions: [createFocusSession({ date: sessionTime })],
            })

            const result = checkSmartNotificationsLogic(input)

            expect(result.some(n => n.title === 'Time for a Break!')).toBe(false)
        })

        it('does not return break suggestion if more than 30 minutes ago', () => {
            const now = new Date()
            const sessionTime = new Date(now.getTime() - 35 * 60 * 1000) // 35 minutes ago

            const input = createInput({
                now,
                focusSessions: [createFocusSession({ date: sessionTime })],
            })

            const result = checkSmartNotificationsLogic(input)

            expect(result.some(n => n.title === 'Time for a Break!')).toBe(false)
        })

        it('returns empty array when no focus sessions', () => {
            const input = createInput({ focusSessions: [] })
            const result = checkSmartNotificationsLogic(input)
            expect(result.some(n => n.title === 'Time for a Break!')).toBe(false)
        })
    })

    describe('milestone celebrations', () => {
        it('returns celebration for recently completed milestones', () => {
            const now = new Date()
            const completedTime = new Date(now.getTime() - 30 * 1000) // 30 seconds ago

            const goal = createGoal({
                title: 'Learn TypeScript',
                milestones: [
                    createMilestone({
                        title: 'Finish Chapter 1',
                        completed: true,
                        completedDate: completedTime.toISOString(),
                    }),
                ],
            })

            const input = createInput({
                now,
                goals: [goal],
            })

            const result = checkSmartNotificationsLogic(input)

            expect(result.some(n => n.type === 'celebration' && n.title.includes('Milestone'))).toBe(true)
            expect(result.some(n => n.message.includes('Finish Chapter 1'))).toBe(true)
        })

        it('does not return celebration for milestones completed more than 1 minute ago', () => {
            const now = new Date()
            const completedTime = new Date(now.getTime() - 2 * 60 * 1000) // 2 minutes ago

            const goal = createGoal({
                milestones: [
                    createMilestone({
                        completed: true,
                        completedDate: completedTime.toISOString(),
                    }),
                ],
            })

            const input = createInput({
                now,
                goals: [goal],
            })

            const result = checkSmartNotificationsLogic(input)

            expect(result.some(n => n.type === 'celebration' && n.title.includes('Milestone'))).toBe(false)
        })
    })

    describe('morning task reminders', () => {
        it('returns reminder at 9:00 AM with tasks', () => {
            const now = new Date()
            now.setHours(9, 2, 0, 0) // 9:02 AM

            const task = createTask({
                completed: false,
                createdAt: now, // Created today
            })

            const input = createInput({
                now,
                tasks: [task],
            })

            const result = checkSmartNotificationsLogic(input)

            expect(result.some(n => n.title === 'Good Morning!')).toBe(true)
        })

        it('does not return reminder at other times', () => {
            const now = new Date()
            now.setHours(14, 0, 0, 0) // 2:00 PM

            const task = createTask({
                completed: false,
                createdAt: now,
            })

            const input = createInput({
                now,
                tasks: [task],
            })

            const result = checkSmartNotificationsLogic(input)

            expect(result.some(n => n.title === 'Good Morning!')).toBe(false)
        })

        it('does not return reminder if all tasks completed', () => {
            const now = new Date()
            now.setHours(9, 2, 0, 0)

            const task = createTask({
                completed: true,
                createdAt: now,
            })

            const input = createInput({
                now,
                tasks: [task],
            })

            const result = checkSmartNotificationsLogic(input)

            expect(result.some(n => n.title === 'Good Morning!')).toBe(false)
        })
    })

    describe('streak celebrations', () => {
        it('returns celebration for 7-day streak milestone', () => {
            const now = new Date()
            const todayStr = now.toISOString().split('T')[0]

            const habit = createHabit({
                name: 'Meditation',
                currentStreak: 7,
                completedDates: [todayStr],
            })

            const input = createInput({
                now,
                habits: [habit],
            })

            const result = checkSmartNotificationsLogic(input)

            expect(result.some(n => n.type === 'celebration' && n.title.includes('7-Day Streak'))).toBe(true)
        })

        it('does not duplicate streak celebration if already notified', () => {
            const now = new Date()
            const todayStr = now.toISOString().split('T')[0]

            const habit = createHabit({
                name: 'Meditation',
                currentStreak: 7,
                completedDates: [todayStr],
            })

            const existingNotif = createNotification({
                title: '🔥 7-Day Streak! Meditation',
                timestamp: new Date(now.getTime() - 60 * 60 * 1000), // 1 hour ago
            })

            const input = createInput({
                now,
                habits: [habit],
                existingNotifications: [existingNotif],
            })

            const result = checkSmartNotificationsLogic(input)

            expect(result.filter(n => n.title.includes('Streak')).length).toBe(0)
        })
    })
})
