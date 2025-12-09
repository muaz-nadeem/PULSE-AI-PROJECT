"use client"

/**
 * useTasks Hook
 * 
 * Abstracts task-related store access for components.
 */

import { useStore } from "../store"
import type { Task } from "../domain"

export interface UseTasksReturn {
    tasks: Task[]
    addTask: (task: Omit<Task, "id" | "completed" | "createdAt">) => void
    deleteTask: (id: string) => void
    toggleTask: (id: string) => void
    updateTask: (id: string, updates: Partial<Task>) => void
}

/**
 * Hook for accessing and managing tasks
 */
export function useTasks(): UseTasksReturn {
    const tasks = useStore((state) => state.tasks)
    const addTask = useStore((state) => state.addTask)
    const deleteTask = useStore((state) => state.deleteTask)
    const toggleTask = useStore((state) => state.toggleTask)
    const updateTask = useStore((state) => state.updateTask)

    return {
        tasks,
        addTask,
        deleteTask,
        toggleTask,
        updateTask,
    }
}
