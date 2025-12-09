import { describe, it, expect } from 'vitest'
import {
  calculateStreak,
  isHabitCompletedOnDate,
  toggleHabitCompletionForDate,
  getHabitCompletionRate,
  getIncompleteHabitsForDate,
  sortHabitsByStreak,
  getTopStreakHabit,
} from '../habit-logic'
import type { Habit } from '../types'

describe('calculateStreak', () => {
  // Helper to create a local date at noon to avoid timezone issues
  const createLocalDate = (year: number, month: number, day: number) => {
    return new Date(year, month - 1, day, 12, 0, 0)
  }

  it('returns zero for empty completed dates', () => {
    const result = calculateStreak([])
    expect(result.currentStreak).toBe(0)
    expect(result.longestStreak).toBe(0)
  })

  it('calculates current streak correctly for consecutive days', () => {
    const today = createLocalDate(2024, 1, 5)
    const completedDates = ['2024-01-03', '2024-01-04', '2024-01-05']
    const result = calculateStreak(completedDates, today)
    expect(result.currentStreak).toBe(3)
  })

  it('returns zero current streak when today is not completed', () => {
    const today = createLocalDate(2024, 1, 5)
    const completedDates = ['2024-01-01', '2024-01-02', '2024-01-03']
    const result = calculateStreak(completedDates, today)
    expect(result.currentStreak).toBe(0)
  })

  it('calculates longest streak correctly', () => {
    const today = createLocalDate(2024, 1, 10)
    // Gap between 05 and 08
    const completedDates = ['2024-01-01', '2024-01-02', '2024-01-03', '2024-01-04', '2024-01-05', '2024-01-08', '2024-01-09', '2024-01-10']
    const result = calculateStreak(completedDates, today)
    expect(result.longestStreak).toBe(5) // Jan 1-5
    expect(result.currentStreak).toBe(3) // Jan 8-10
  })

  it('handles single day streak', () => {
    const today = createLocalDate(2024, 1, 1)
    const completedDates = ['2024-01-01']
    const result = calculateStreak(completedDates, today)
    expect(result.currentStreak).toBe(1)
    expect(result.longestStreak).toBe(1)
  })

  it('handles unsorted dates', () => {
    const today = createLocalDate(2024, 1, 3)
    const completedDates = ['2024-01-03', '2024-01-01', '2024-01-02']
    const result = calculateStreak(completedDates, today)
    expect(result.currentStreak).toBe(3)
    expect(result.longestStreak).toBe(3)
  })
})

describe('isHabitCompletedOnDate', () => {
  const habit: Habit = {
    id: '1',
    name: 'Test Habit',
    frequency: 'daily',
    color: '#ff0000',
    createdAt: new Date('2024-01-01'),
    completedDates: ['2024-01-01', '2024-01-02', '2024-01-03'],
    currentStreak: 3,
    longestStreak: 3,
  }

  it('returns true when habit is completed on date', () => {
    expect(isHabitCompletedOnDate(habit, '2024-01-02')).toBe(true)
  })

  it('returns false when habit is not completed on date', () => {
    expect(isHabitCompletedOnDate(habit, '2024-01-04')).toBe(false)
  })
})

describe('toggleHabitCompletionForDate', () => {
  // Helper to create a local date at noon to avoid timezone issues
  const createLocalDate = (year: number, month: number, day: number) => {
    return new Date(year, month - 1, day, 12, 0, 0)
  }

  it('adds date when not completed', () => {
    const completedDates = ['2024-01-01', '2024-01-02']
    const result = toggleHabitCompletionForDate(completedDates, '2024-01-03', createLocalDate(2024, 1, 3))
    expect(result.completedDates).toContain('2024-01-03')
    expect(result.currentStreak).toBe(3)
  })

  it('removes date when already completed', () => {
    const completedDates = ['2024-01-01', '2024-01-02', '2024-01-03']
    const result = toggleHabitCompletionForDate(completedDates, '2024-01-02', createLocalDate(2024, 1, 3))
    expect(result.completedDates).not.toContain('2024-01-02')
    expect(result.completedDates).toHaveLength(2)
  })

  it('maintains sorted order after adding', () => {
    const completedDates = ['2024-01-01', '2024-01-03']
    const result = toggleHabitCompletionForDate(completedDates, '2024-01-02', createLocalDate(2024, 1, 3))
    expect(result.completedDates).toEqual(['2024-01-01', '2024-01-02', '2024-01-03'])
  })
})

describe('getHabitCompletionRate', () => {
  // Helper to create a local date at noon to avoid timezone issues
  const createLocalDate = (year: number, month: number, day: number) => {
    return new Date(year, month - 1, day, 12, 0, 0)
  }

  it('returns 0 for no relevant days', () => {
    const habit: Habit = {
      id: '1',
      name: 'Test',
      frequency: 'daily',
      color: '#ff0000',
      createdAt: createLocalDate(2024, 12, 1),
      completedDates: [],
      currentStreak: 0,
      longestStreak: 0,
    }
    const rate = getHabitCompletionRate(habit, 30, createLocalDate(2024, 1, 1))
    expect(rate).toBe(0)
  })

  it('calculates correct completion rate', () => {
    const habit: Habit = {
      id: '1',
      name: 'Test',
      frequency: 'daily',
      color: '#ff0000',
      createdAt: createLocalDate(2024, 1, 1),
      completedDates: ['2024-01-08', '2024-01-09', '2024-01-10'],
      currentStreak: 3,
      longestStreak: 3,
    }
    // 10 days from Jan 1 to Jan 10, 3 completed = 30%
    const rate = getHabitCompletionRate(habit, 10, createLocalDate(2024, 1, 10))
    expect(rate).toBe(0.3)
  })
})

describe('getIncompleteHabitsForDate', () => {
  const habits: Habit[] = [
    {
      id: '1',
      name: 'Habit 1',
      frequency: 'daily',
      color: '#ff0000',
      createdAt: new Date(),
      completedDates: ['2024-01-01'],
      currentStreak: 1,
      longestStreak: 1,
    },
    {
      id: '2',
      name: 'Habit 2',
      frequency: 'daily',
      color: '#00ff00',
      createdAt: new Date(),
      completedDates: [],
      currentStreak: 0,
      longestStreak: 0,
    },
  ]

  it('filters out completed habits for the date', () => {
    const incomplete = getIncompleteHabitsForDate(habits, '2024-01-01')
    expect(incomplete).toHaveLength(1)
    expect(incomplete[0].id).toBe('2')
  })

  it('returns all habits when none completed', () => {
    const incomplete = getIncompleteHabitsForDate(habits, '2024-01-02')
    expect(incomplete).toHaveLength(2)
  })
})

describe('sortHabitsByStreak', () => {
  it('sorts habits by current streak descending', () => {
    const habits: Habit[] = [
      { id: '1', name: 'Low', frequency: 'daily', color: '#000', createdAt: new Date(), completedDates: [], currentStreak: 1, longestStreak: 1 },
      { id: '2', name: 'High', frequency: 'daily', color: '#000', createdAt: new Date(), completedDates: [], currentStreak: 10, longestStreak: 10 },
      { id: '3', name: 'Mid', frequency: 'daily', color: '#000', createdAt: new Date(), completedDates: [], currentStreak: 5, longestStreak: 5 },
    ]
    const sorted = sortHabitsByStreak(habits)
    expect(sorted[0].name).toBe('High')
    expect(sorted[1].name).toBe('Mid')
    expect(sorted[2].name).toBe('Low')
  })

  it('does not mutate original array', () => {
    const habits: Habit[] = [
      { id: '1', name: 'A', frequency: 'daily', color: '#000', createdAt: new Date(), completedDates: [], currentStreak: 1, longestStreak: 1 },
    ]
    const sorted = sortHabitsByStreak(habits)
    expect(sorted).not.toBe(habits)
  })
})

describe('getTopStreakHabit', () => {
  it('returns habit with highest streak', () => {
    const habits: Habit[] = [
      { id: '1', name: 'Low', frequency: 'daily', color: '#000', createdAt: new Date(), completedDates: [], currentStreak: 1, longestStreak: 1 },
      { id: '2', name: 'High', frequency: 'daily', color: '#000', createdAt: new Date(), completedDates: [], currentStreak: 10, longestStreak: 10 },
    ]
    const top = getTopStreakHabit(habits)
    expect(top?.name).toBe('High')
  })

  it('returns null for empty array', () => {
    const top = getTopStreakHabit([])
    expect(top).toBeNull()
  })
})
