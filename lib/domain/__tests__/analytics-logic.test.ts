import { describe, it, expect } from 'vitest'
import {
  computeDistractionInsights,
  computeTotalFocusTime,
  computeAverageFocusDuration,
  getFocusSessionsInRange,
  calculateFocusStreak,
  generateCSVExport,
} from '../analytics-logic'
import type { Distraction, FocusSession, Task } from '../types'

const createDistraction = (overrides: Partial<Distraction> = {}): Distraction => ({
  id: Math.random().toString(),
  type: 'app',
  source: 'Instagram',
  duration: 5,
  date: new Date(),
  ...overrides,
})

const createFocusSession = (overrides: Partial<FocusSession> = {}): FocusSession => ({
  id: Math.random().toString(),
  duration: 25,
  date: new Date(),
  completed: true,
  ...overrides,
})

describe('computeDistractionInsights', () => {
  it('returns empty insights for no distractions', () => {
    const insights = computeDistractionInsights([])
    expect(insights.topSources).toHaveLength(0)
    expect(insights.totalTime).toBe(0)
    expect(insights.patterns).toHaveLength(0)
  })

  it('calculates total time correctly', () => {
    const distractions = [
      createDistraction({ duration: 10 }),
      createDistraction({ duration: 15 }),
      createDistraction({ duration: 5 }),
    ]
    const insights = computeDistractionInsights(distractions)
    expect(insights.totalTime).toBe(30)
  })

  it('identifies top sources', () => {
    const distractions = [
      createDistraction({ source: 'Instagram' }),
      createDistraction({ source: 'Instagram' }),
      createDistraction({ source: 'Instagram' }),
      createDistraction({ source: 'Twitter' }),
      createDistraction({ source: 'Twitter' }),
      createDistraction({ source: 'YouTube' }),
    ]
    const insights = computeDistractionInsights(distractions)
    expect(insights.topSources[0].source).toBe('Instagram')
    expect(insights.topSources[0].count).toBe(3)
  })

  it('limits top sources to 5', () => {
    const distractions = [
      createDistraction({ source: 'A' }),
      createDistraction({ source: 'B' }),
      createDistraction({ source: 'C' }),
      createDistraction({ source: 'D' }),
      createDistraction({ source: 'E' }),
      createDistraction({ source: 'F' }),
      createDistraction({ source: 'G' }),
    ]
    const insights = computeDistractionInsights(distractions)
    expect(insights.topSources.length).toBeLessThanOrEqual(5)
  })

  it('generates patterns for most common type', () => {
    const distractions = [
      createDistraction({ type: 'app' }),
      createDistraction({ type: 'app' }),
      createDistraction({ type: 'website' }),
    ]
    const insights = computeDistractionInsights(distractions)
    expect(insights.patterns.some(p => p.includes('app'))).toBe(true)
  })

  it('generates pattern for high average duration', () => {
    const distractions = [
      createDistraction({ duration: 15 }),
      createDistraction({ duration: 20 }),
    ]
    const insights = computeDistractionInsights(distractions)
    expect(insights.patterns.some(p => p.includes('minutes'))).toBe(true)
  })
})

describe('computeTotalFocusTime', () => {
  it('returns 0 for empty sessions', () => {
    expect(computeTotalFocusTime([])).toBe(0)
  })

  it('sums all session durations', () => {
    const sessions = [
      createFocusSession({ duration: 25 }),
      createFocusSession({ duration: 30 }),
      createFocusSession({ duration: 15 }),
    ]
    expect(computeTotalFocusTime(sessions)).toBe(70)
  })
})

describe('computeAverageFocusDuration', () => {
  it('returns 0 for empty sessions', () => {
    expect(computeAverageFocusDuration([])).toBe(0)
  })

  it('calculates correct average', () => {
    const sessions = [
      createFocusSession({ duration: 20 }),
      createFocusSession({ duration: 30 }),
      createFocusSession({ duration: 40 }),
    ]
    expect(computeAverageFocusDuration(sessions)).toBe(30)
  })
})

describe('getFocusSessionsInRange', () => {
  it('filters sessions within date range', () => {
    const sessions = [
      createFocusSession({ date: new Date('2024-01-01') }),
      createFocusSession({ date: new Date('2024-01-05') }),
      createFocusSession({ date: new Date('2024-01-10') }),
      createFocusSession({ date: new Date('2024-01-15') }),
    ]
    
    const filtered = getFocusSessionsInRange(
      sessions,
      new Date('2024-01-03'),
      new Date('2024-01-12')
    )
    
    expect(filtered).toHaveLength(2)
  })

  it('includes sessions on boundary dates', () => {
    const sessions = [
      createFocusSession({ date: new Date('2024-01-05T10:00:00') }),
    ]
    
    const filtered = getFocusSessionsInRange(
      sessions,
      new Date('2024-01-05'),
      new Date('2024-01-05')
    )
    
    expect(filtered).toHaveLength(1)
  })
})

describe('calculateFocusStreak', () => {
  // Helper to create a local date at noon to avoid timezone issues
  const createLocalDate = (year: number, month: number, day: number, hour: number = 12) => {
    return new Date(year, month - 1, day, hour, 0, 0)
  }

  it('returns 0 for empty sessions', () => {
    expect(calculateFocusStreak([])).toBe(0)
  })

  it('calculates consecutive days streak', () => {
    const refDate = createLocalDate(2024, 1, 5)
    const sessions = [
      createFocusSession({ date: createLocalDate(2024, 1, 3) }),
      createFocusSession({ date: createLocalDate(2024, 1, 4) }),
      createFocusSession({ date: createLocalDate(2024, 1, 5) }),
    ]
    
    const streak = calculateFocusStreak(sessions, refDate)
    expect(streak).toBe(3)
  })

  it('breaks streak on missing day', () => {
    const refDate = createLocalDate(2024, 1, 5)
    const sessions = [
      createFocusSession({ date: createLocalDate(2024, 1, 1) }),
      createFocusSession({ date: createLocalDate(2024, 1, 2) }),
      // Gap on Jan 3, 4
      createFocusSession({ date: createLocalDate(2024, 1, 5) }),
    ]
    
    const streak = calculateFocusStreak(sessions, refDate)
    expect(streak).toBe(1) // Only Jan 5
  })

  it('handles multiple sessions on same day', () => {
    const refDate = createLocalDate(2024, 1, 2)
    const sessions = [
      createFocusSession({ date: createLocalDate(2024, 1, 1, 9) }),
      createFocusSession({ date: createLocalDate(2024, 1, 1, 14) }),
      createFocusSession({ date: createLocalDate(2024, 1, 2, 10) }),
    ]
    
    const streak = calculateFocusStreak(sessions, refDate)
    expect(streak).toBe(2)
  })
})

describe('generateCSVExport', () => {
  it('generates valid CSV format', () => {
    const tasks: Task[] = [
      {
        id: '1',
        title: 'Task 1',
        priority: 'high',
        timeEstimate: 30,
        completed: true,
        createdAt: new Date('2024-01-01'),
      },
    ]
    const sessions: FocusSession[] = [
      createFocusSession({ date: new Date('2024-01-01') }),
    ]
    
    const csv = generateCSVExport(tasks, sessions)
    expect(csv).toContain('Date,Focus Sessions,Tasks Completed')
    expect(csv).toContain('2024-01-01')
  })

  it('handles empty data', () => {
    const csv = generateCSVExport([], [])
    expect(csv).toContain('Date,Focus Sessions,Tasks Completed')
  })

  it('aggregates data by date', () => {
    const sessions = [
      createFocusSession({ date: new Date('2024-01-01') }),
      createFocusSession({ date: new Date('2024-01-01') }),
      createFocusSession({ date: new Date('2024-01-02') }),
    ]
    
    const csv = generateCSVExport([], sessions)
    const lines = csv.split('\n')
    
    // Header + 2 dates
    expect(lines.length).toBe(3)
  })
})

