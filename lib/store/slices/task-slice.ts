"use client"

/**
 * Task Store Slice
 * 
 * Standalone Zustand store for task management.
 * Part of Phase 5 Stage B store slicing.
 */

import { create } from "zustand"
import { taskService } from "@/lib/services"
import type { Task } from "@/lib/domain"

export interface TaskSlice {
    tasks: Task[]
    addTask: (task: Omit<Task, "id" | "completed" | "createdAt">) => Promise<void>
    deleteTask: (id: string) => Promise<void>
    toggleTask: (id: string) => Promise<void>
    updateTask: (id: string, updates: Partial<Task>) => Promise<void>
    setTasks: (tasks: Task[]) => void
    loadTasks: () => Promise<void>
}

export const useTaskStore = create<TaskSlice>((set, get) => ({
    tasks: [],

    addTask: async (task) => {
        try {
            const result = await taskService.create({
                title: task.title,
                description: task.description,
                priority: task.priority,
                timeEstimate: task.timeEstimate,
                category: task.category,
                dueDate: task.dueDate,
                focusMode: task.focusMode,
            })

            if (result.error) throw new Error(result.error)
            const created = result.data!

            set((state) => ({
                tasks: [...state.tasks, created],
            }))
        } catch (error) {
            console.error("Failed to create task:", error)
            // Optimistic update fallback
            set((state) => ({
                tasks: [
                    ...state.tasks,
                    {
                        ...task,
                        id: Math.random().toString(36).substring(7),
                        completed: false,
                        createdAt: new Date(),
                    },
                ],
            }))
        }
    },

    deleteTask: async (id) => {
        try {
            await taskService.delete(id)
        } catch (error) {
            console.error("Failed to delete task:", error)
        }
        set((state) => ({
            tasks: state.tasks.filter((t) => t.id !== id),
        }))
    },

    toggleTask: async (id) => {
        const state = get()
        const task = state.tasks.find((t) => t.id === id)
        if (task) {
            try {
                await taskService.toggleComplete(id)
            } catch (error) {
                console.error("Failed to toggle task:", error)
            }
        }
        set((state) => ({
            tasks: state.tasks.map((t) =>
                t.id === id ? { ...t, completed: !t.completed } : t
            ),
        }))
    },

    updateTask: async (id, updates) => {
        try {
            await taskService.update(id, updates)
        } catch (error) {
            console.error("Failed to update task:", error)
        }
        set((state) => ({
            tasks: state.tasks.map((t) =>
                t.id === id ? { ...t, ...updates } : t
            ),
        }))
    },

    setTasks: (tasks) => set({ tasks }),

    loadTasks: async () => {
        try {
            const result = await taskService.getAll()
            if (result.data) {
                set({ tasks: result.data })
            }
        } catch (error) {
            console.error("Failed to load tasks:", error)
        }
    },
}))
