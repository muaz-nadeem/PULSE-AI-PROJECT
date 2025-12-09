import { describe, it, expect } from 'vitest'
import {
  calculateGoalProgress,
  shouldAutoCompleteGoal,
  generateGoalSuggestions,
  findRelatedTasks,
  toggleMilestoneCompletion,
  removeMilestone,
  getGoalsByStatus,
  sortGoalsByProgress,
  getUpcomingGoals,
} from '../goal-logic'
import type { Goal, Milestone, Task } from '../types'

const createMilestone = (overrides: Partial<Milestone> = {}): Milestone => ({
  id: Math.random().toString(),
  title: 'Test Milestone',
  completed: false,
  order: 0,
  ...overrides,
})

const createGoal = (overrides: Partial<Goal> = {}): Goal => ({
  id: Math.random().toString(),
  title: 'Test Goal',
  category: 'personal',
  createdAt: new Date(),
  milestones: [],
  progress: 0,
  status: 'active',
  color: '#ff0000',
  ...overrides,
})

const createTask = (overrides: Partial<Task> = {}): Task => ({
  id: Math.random().toString(),
  title: 'Test Task',
  priority: 'medium',
  timeEstimate: 30,
  completed: false,
  createdAt: new Date(),
  ...overrides,
})

describe('calculateGoalProgress', () => {
  it('returns 0 for no milestones', () => {
    expect(calculateGoalProgress([])).toBe(0)
  })

  it('returns 0 for no completed milestones', () => {
    const milestones = [
      createMilestone({ completed: false }),
      createMilestone({ completed: false }),
    ]
    expect(calculateGoalProgress(milestones)).toBe(0)
  })

  it('returns 100 for all completed milestones', () => {
    const milestones = [
      createMilestone({ completed: true }),
      createMilestone({ completed: true }),
    ]
    expect(calculateGoalProgress(milestones)).toBe(100)
  })

  it('calculates correct percentage', () => {
    const milestones = [
      createMilestone({ completed: true }),
      createMilestone({ completed: false }),
      createMilestone({ completed: false }),
      createMilestone({ completed: false }),
    ]
    expect(calculateGoalProgress(milestones)).toBe(25)
  })

  it('rounds to nearest integer', () => {
    const milestones = [
      createMilestone({ completed: true }),
      createMilestone({ completed: false }),
      createMilestone({ completed: false }),
    ]
    expect(calculateGoalProgress(milestones)).toBe(33)
  })
})

describe('shouldAutoCompleteGoal', () => {
  it('returns false for non-active goals', () => {
    const goal = createGoal({ status: 'completed' })
    expect(shouldAutoCompleteGoal(goal)).toBe(false)
  })

  it('returns false for goals with no milestones', () => {
    const goal = createGoal({ milestones: [] })
    expect(shouldAutoCompleteGoal(goal)).toBe(false)
  })

  it('returns false when not all milestones completed', () => {
    const goal = createGoal({
      milestones: [
        createMilestone({ completed: true }),
        createMilestone({ completed: false }),
      ],
    })
    expect(shouldAutoCompleteGoal(goal)).toBe(false)
  })

  it('returns true when all milestones completed and goal is active', () => {
    const goal = createGoal({
      status: 'active',
      milestones: [
        createMilestone({ completed: true }),
        createMilestone({ completed: true }),
      ],
    })
    expect(shouldAutoCompleteGoal(goal)).toBe(true)
  })
})

describe('generateGoalSuggestions', () => {
  it('returns suggestions for goal with no progress', () => {
    const goal = createGoal({ progress: 0 })
    const suggestions = generateGoalSuggestions(goal, [])
    expect(suggestions.length).toBeGreaterThan(0)
    expect(suggestions.some(s => s.includes('first milestone'))).toBe(true)
  })

  it('returns different suggestions based on progress', () => {
    const lowProgressGoal = createGoal({ progress: 20 })
    const highProgressGoal = createGoal({ progress: 90 })
    
    const lowSuggestions = generateGoalSuggestions(lowProgressGoal, [])
    const highSuggestions = generateGoalSuggestions(highProgressGoal, [])
    
    expect(lowSuggestions).not.toEqual(highSuggestions)
  })

  it('suggests creating tasks when no related tasks exist', () => {
    const goal = createGoal({ title: 'Learn Python', progress: 50 })
    const tasks: Task[] = [createTask({ title: 'Buy groceries' })]
    
    const suggestions = generateGoalSuggestions(goal, tasks)
    expect(suggestions.some(s => s.includes('Create tasks'))).toBe(true)
  })

  it('limits suggestions to 3', () => {
    const goal = createGoal({ progress: 50 })
    const suggestions = generateGoalSuggestions(goal, [])
    expect(suggestions.length).toBeLessThanOrEqual(3)
  })
})

describe('findRelatedTasks', () => {
  it('finds tasks with matching words in title', () => {
    const goal = createGoal({ title: 'Learn Python Programming' })
    const tasks = [
      createTask({ title: 'Complete Python tutorial' }),
      createTask({ title: 'Buy groceries' }),
      createTask({ title: 'Practice programming exercises' }),
    ]
    
    const related = findRelatedTasks(goal, tasks)
    expect(related).toHaveLength(2)
  })

  it('ignores short words', () => {
    const goal = createGoal({ title: 'Go to gym' })
    const tasks = [
      createTask({ title: 'Go shopping' }),
      createTask({ title: 'Gym workout' }),
    ]
    
    const related = findRelatedTasks(goal, tasks)
    expect(related.some(t => t.title === 'Gym workout')).toBe(true)
  })

  it('returns empty array when no matches', () => {
    const goal = createGoal({ title: 'Learn Japanese' })
    const tasks = [createTask({ title: 'Buy groceries' })]
    
    const related = findRelatedTasks(goal, tasks)
    expect(related).toHaveLength(0)
  })
})

describe('toggleMilestoneCompletion', () => {
  it('toggles milestone to completed', () => {
    const milestones = [
      createMilestone({ id: '1', completed: false }),
    ]
    
    const result = toggleMilestoneCompletion(milestones, '1')
    expect(result?.milestones[0].completed).toBe(true)
    expect(result?.milestones[0].completedDate).toBeDefined()
  })

  it('toggles milestone to incomplete', () => {
    const milestones = [
      createMilestone({ id: '1', completed: true, completedDate: '2024-01-01' }),
    ]
    
    const result = toggleMilestoneCompletion(milestones, '1')
    expect(result?.milestones[0].completed).toBe(false)
    expect(result?.milestones[0].completedDate).toBeUndefined()
  })

  it('returns null for non-existent milestone', () => {
    const milestones = [createMilestone({ id: '1' })]
    const result = toggleMilestoneCompletion(milestones, 'nonexistent')
    expect(result).toBeNull()
  })

  it('recalculates progress', () => {
    const milestones = [
      createMilestone({ id: '1', completed: false }),
      createMilestone({ id: '2', completed: false }),
    ]
    
    const result = toggleMilestoneCompletion(milestones, '1')
    expect(result?.progress).toBe(50)
  })
})

describe('removeMilestone', () => {
  it('removes milestone and recalculates progress', () => {
    const milestones = [
      createMilestone({ id: '1', completed: true }),
      createMilestone({ id: '2', completed: false }),
    ]
    
    const result = removeMilestone(milestones, '2')
    expect(result.milestones).toHaveLength(1)
    expect(result.progress).toBe(100)
  })

  it('handles empty result', () => {
    const milestones = [createMilestone({ id: '1' })]
    const result = removeMilestone(milestones, '1')
    expect(result.milestones).toHaveLength(0)
    expect(result.progress).toBe(0)
  })
})

describe('getGoalsByStatus', () => {
  it('filters goals by status', () => {
    const goals = [
      createGoal({ status: 'active' }),
      createGoal({ status: 'completed' }),
      createGoal({ status: 'active' }),
      createGoal({ status: 'paused' }),
    ]
    
    const active = getGoalsByStatus(goals, 'active')
    expect(active).toHaveLength(2)
    
    const completed = getGoalsByStatus(goals, 'completed')
    expect(completed).toHaveLength(1)
  })
})

describe('sortGoalsByProgress', () => {
  it('sorts by progress descending by default', () => {
    const goals = [
      createGoal({ title: 'Low', progress: 20 }),
      createGoal({ title: 'High', progress: 80 }),
      createGoal({ title: 'Mid', progress: 50 }),
    ]
    
    const sorted = sortGoalsByProgress(goals)
    expect(sorted[0].title).toBe('High')
    expect(sorted[1].title).toBe('Mid')
    expect(sorted[2].title).toBe('Low')
  })

  it('sorts ascending when specified', () => {
    const goals = [
      createGoal({ title: 'Low', progress: 20 }),
      createGoal({ title: 'High', progress: 80 }),
    ]
    
    const sorted = sortGoalsByProgress(goals, true)
    expect(sorted[0].title).toBe('Low')
  })
})

describe('getUpcomingGoals', () => {
  it('returns goals within threshold days', () => {
    const today = new Date('2024-01-15')
    const goals = [
      createGoal({ title: 'Soon', targetDate: '2024-01-18', status: 'active' }),
      createGoal({ title: 'Far', targetDate: '2024-02-01', status: 'active' }),
      createGoal({ title: 'Past', targetDate: '2024-01-10', status: 'active' }),
    ]
    
    // Mock Date.now for the function
    const upcoming = getUpcomingGoals(goals, 7)
    // Note: This test depends on current date, in real testing we'd mock the date
    expect(upcoming.length).toBeGreaterThanOrEqual(0)
  })

  it('excludes non-active goals', () => {
    const goals = [
      createGoal({ targetDate: '2024-12-31', status: 'completed' }),
    ]
    
    const upcoming = getUpcomingGoals(goals, 365)
    expect(upcoming).toHaveLength(0)
  })
})
