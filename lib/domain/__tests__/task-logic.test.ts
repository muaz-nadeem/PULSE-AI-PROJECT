/**
 * Unit tests for task domain logic functions
 */

import { describe, it, expect } from 'vitest'
import {
  sortTasksByPriority,
  sortTasksByDueDate,
  normalizeDate,
  filterTasksForDate,
  getOverdueTasks,
  getHighPriorityIncompleteTasks,
  computeTaskCompletionRate,
  groupTasksByCategory,
  calculateTotalTimeEstimate,
  getIncompleteTasks,
  getCompletedTasks,
} from '../task-logic'
import type { Task } from '../types'

// Helper to create a test task
function createTestTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'test-task',
    title: 'Test Task',
    priority: 'medium',
    timeEstimate: 30,
    completed: false,
    createdAt: new Date('2024-06-01'),
    ...overrides,
  }
}

describe('sortTasksByPriority', () => {
  it('sorts high priority first', () => {
    const tasks = [
      createTestTask({ id: '1', priority: 'low' }),
      createTestTask({ id: '2', priority: 'high' }),
      createTestTask({ id: '3', priority: 'medium' }),
    ]
    const result = sortTasksByPriority(tasks)
    expect(result[0].id).toBe('2')
    expect(result[1].id).toBe('3')
    expect(result[2].id).toBe('1')
  })

  it('does not mutate original array', () => {
    const tasks = [
      createTestTask({ id: '1', priority: 'low' }),
      createTestTask({ id: '2', priority: 'high' }),
    ]
    const original = [...tasks]
    sortTasksByPriority(tasks)
    expect(tasks).toEqual(original)
  })
})

describe('sortTasksByDueDate', () => {
  it('sorts by due date earliest first', () => {
    const tasks = [
      createTestTask({ id: '1', dueDate: '2024-06-20' }),
      createTestTask({ id: '2', dueDate: '2024-06-10' }),
      createTestTask({ id: '3', dueDate: '2024-06-15' }),
    ]
    const result = sortTasksByDueDate(tasks)
    expect(result[0].id).toBe('2')
    expect(result[1].id).toBe('3')
    expect(result[2].id).toBe('1')
  })

  it('puts tasks without due date last', () => {
    const tasks = [
      createTestTask({ id: '1', dueDate: undefined }),
      createTestTask({ id: '2', dueDate: '2024-06-10' }),
    ]
    const result = sortTasksByDueDate(tasks)
    expect(result[0].id).toBe('2')
    expect(result[1].id).toBe('1')
  })
})

describe('normalizeDate', () => {
  it('returns undefined for undefined input', () => {
    expect(normalizeDate(undefined)).toBeUndefined()
  })

  it('returns YYYY-MM-DD string as-is', () => {
    expect(normalizeDate('2024-06-15')).toBe('2024-06-15')
  })

  it('normalizes Date object', () => {
    const date = new Date('2024-06-15T10:30:00Z')
    expect(normalizeDate(date)).toBe('2024-06-15')
  })

  it('normalizes ISO datetime string', () => {
    expect(normalizeDate('2024-06-15T10:30:00Z')).toBe('2024-06-15')
  })

  it('returns undefined for invalid date string', () => {
    expect(normalizeDate('not-a-date')).toBeUndefined()
  })
})

describe('filterTasksForDate', () => {
  it('filters tasks for specific date', () => {
    const tasks = [
      createTestTask({ id: '1', dueDate: '2024-06-15' }),
      createTestTask({ id: '2', dueDate: '2024-06-16' }),
      createTestTask({ id: '3', dueDate: '2024-06-15' }),
    ]
    const result = filterTasksForDate(tasks, '2024-06-15')
    expect(result.length).toBe(2)
    expect(result.map((t) => t.id).sort()).toEqual(['1', '3'])
  })

  it('includes tasks without due date by default', () => {
    const tasks = [
      createTestTask({ id: '1', dueDate: '2024-06-15' }),
      createTestTask({ id: '2', dueDate: undefined }),
    ]
    const result = filterTasksForDate(tasks, '2024-06-15')
    expect(result.length).toBe(2)
  })

  it('excludes tasks without due date when flag is false', () => {
    const tasks = [
      createTestTask({ id: '1', dueDate: '2024-06-15' }),
      createTestTask({ id: '2', dueDate: undefined }),
    ]
    const result = filterTasksForDate(tasks, '2024-06-15', false)
    expect(result.length).toBe(1)
  })
})

describe('getOverdueTasks', () => {
  it('returns tasks with past due dates', () => {
    const today = new Date('2024-06-15')
    const tasks = [
      createTestTask({ id: '1', dueDate: '2024-06-10', completed: false }),
      createTestTask({ id: '2', dueDate: '2024-06-15', completed: false }),
      createTestTask({ id: '3', dueDate: '2024-06-20', completed: false }),
    ]
    const result = getOverdueTasks(tasks, today)
    expect(result.length).toBe(1)
    expect(result[0].id).toBe('1')
  })

  it('excludes completed tasks', () => {
    const today = new Date('2024-06-15')
    const tasks = [createTestTask({ id: '1', dueDate: '2024-06-10', completed: true })]
    const result = getOverdueTasks(tasks, today)
    expect(result.length).toBe(0)
  })

  it('excludes tasks without due dates', () => {
    const today = new Date('2024-06-15')
    const tasks = [createTestTask({ id: '1', dueDate: undefined, completed: false })]
    const result = getOverdueTasks(tasks, today)
    expect(result.length).toBe(0)
  })
})

describe('getHighPriorityIncompleteTasks', () => {
  it('returns only high priority incomplete tasks', () => {
    const tasks = [
      createTestTask({ id: '1', priority: 'high', completed: false }),
      createTestTask({ id: '2', priority: 'high', completed: true }),
      createTestTask({ id: '3', priority: 'medium', completed: false }),
    ]
    const result = getHighPriorityIncompleteTasks(tasks)
    expect(result.length).toBe(1)
    expect(result[0].id).toBe('1')
  })
})

describe('computeTaskCompletionRate', () => {
  it('returns 0 for empty array', () => {
    expect(computeTaskCompletionRate([])).toBe(0)
  })

  it('calculates correct rate', () => {
    const tasks = [
      createTestTask({ completed: true }),
      createTestTask({ completed: true }),
      createTestTask({ completed: false }),
      createTestTask({ completed: false }),
    ]
    expect(computeTaskCompletionRate(tasks)).toBe(0.5)
  })

  it('returns 1 for all completed', () => {
    const tasks = [
      createTestTask({ completed: true }),
      createTestTask({ completed: true }),
    ]
    expect(computeTaskCompletionRate(tasks)).toBe(1)
  })
})

describe('groupTasksByCategory', () => {
  it('groups tasks by category', () => {
    const tasks = [
      createTestTask({ id: '1', category: 'Work' }),
      createTestTask({ id: '2', category: 'Personal' }),
      createTestTask({ id: '3', category: 'Work' }),
    ]
    const result = groupTasksByCategory(tasks)
    expect(result.get('Work')?.length).toBe(2)
    expect(result.get('Personal')?.length).toBe(1)
  })

  it('handles tasks without category', () => {
    const tasks = [createTestTask({ id: '1', category: undefined })]
    const result = groupTasksByCategory(tasks)
    expect(result.get('Uncategorized')?.length).toBe(1)
  })
})

describe('calculateTotalTimeEstimate', () => {
  it('sums time estimates for all tasks', () => {
    const tasks = [
      createTestTask({ timeEstimate: 30 }),
      createTestTask({ timeEstimate: 45 }),
      createTestTask({ timeEstimate: 60 }),
    ]
    const result = calculateTotalTimeEstimate(tasks)
    expect(result).toBe(135)
  })

  it('returns 0 for empty array', () => {
    expect(calculateTotalTimeEstimate([])).toBe(0)
  })
})

describe('getIncompleteTasks', () => {
  it('returns only incomplete tasks', () => {
    const tasks = [
      createTestTask({ id: '1', completed: false }),
      createTestTask({ id: '2', completed: true }),
      createTestTask({ id: '3', completed: false }),
    ]
    const result = getIncompleteTasks(tasks)
    expect(result.length).toBe(2)
  })
})

describe('getCompletedTasks', () => {
  it('returns only completed tasks', () => {
    const tasks = [
      createTestTask({ id: '1', completed: false }),
      createTestTask({ id: '2', completed: true }),
      createTestTask({ id: '3', completed: true }),
    ]
    const result = getCompletedTasks(tasks)
    expect(result.length).toBe(2)
  })
})
