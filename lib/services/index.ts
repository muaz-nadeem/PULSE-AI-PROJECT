/**
 * Services Module Exports
 * 
 * Central export point for all service-related functionality.
 * This provides a unified interface for external integrations.
 */

// Service types and interfaces
export * from "./types"

// Core services
export { authService } from "./auth-service"
export { taskService } from "./task-service"
export { focusService } from "./focus-service"
export { habitService } from "./habit-service"
export { goalService } from "./goal-service"

// AI services
export {
  aiPlanService,
  aiProfileService,
  aiChatService,
  aiAggregatesService,
  aiServices,
} from "./ai-service"
export type {
  IAIPlanService,
  IAIProfileService,
  IAIChatService,
  IAIAggregatesService,
} from "./ai-service"

// Legacy AI-related services
export * from "./aggregation-service"
export * from "./personalization-service"
export * from "./feedback-service"

// Combined services object for dependency injection
import { authService } from "./auth-service"
import { taskService } from "./task-service"
import { focusService } from "./focus-service"
import { habitService } from "./habit-service"
import { goalService } from "./goal-service"
import type { IServices } from "./types"

/**
 * Collection of all services for easy access and dependency injection.
 * Note: Some services (mood, timeBlocks, challenges, etc.) are not yet implemented.
 * They will use the local store fallback until database integration is added.
 */
export const services: Partial<IServices> = {
  auth: authService,
  tasks: taskService,
  focus: focusService,
  habits: habitService,
  goals: goalService,
}
