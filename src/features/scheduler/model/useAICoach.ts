"use client"

/**
 * useAICoach Hook
 * 
 * React hook for interacting with the AI productivity coach.
 * Manages conversation history, message sending, and context.
 */

import { useState, useCallback, useRef, useEffect } from "react"
import { aiChatService } from "@/lib/services/ai-service"
import type { ChatMessage } from "@/lib/ai/types"

export interface ConversationMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export interface UseAICoachOptions {
  /** Maximum number of messages to keep in history */
  maxHistory?: number
  /** Auto-load chat history on mount */
  autoLoadHistory?: boolean
}

export interface UseAICoachReturn {
  /** Conversation messages */
  messages: ConversationMessage[]
  /** Loading state (while sending/receiving) */
  isLoading: boolean
  /** Error message if any */
  error: string | null
  /** Send a message to the coach */
  sendMessage: (message: string) => Promise<void>
  /** Clear conversation history */
  clearHistory: () => Promise<void>
  /** Refresh history from server */
  refreshHistory: () => Promise<void>
}

/**
 * Hook for AI coach interactions
 */
export function useAICoach(options: UseAICoachOptions = {}): UseAICoachReturn {
  const { maxHistory = 50, autoLoadHistory = true } = options

  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Convert ChatMessage to ConversationMessage
  const mapChatMessage = useCallback((msg: ChatMessage): ConversationMessage => {
    return {
      id: msg.id,
      role: msg.role,
      content: msg.message,
      timestamp: new Date(msg.created_at),
    }
  }, [])

  // Load history from server
  const refreshHistory = useCallback(async () => {
    const result = await aiChatService.getHistory(maxHistory)

    if (result.error) {
      setError(result.error)
      return
    }

    if (result.data) {
      // Reverse to get chronological order (oldest first)
      const chronological = [...result.data].reverse()
      setMessages(chronological.map(mapChatMessage))
    }
  }, [maxHistory, mapChatMessage])

  // Send a message
  const sendMessage = useCallback(
    async (message: string) => {
      if (!message.trim()) return

      setIsLoading(true)
      setError(null)

      // Optimistically add user message
      const userMessage: ConversationMessage = {
        id: `temp-${Date.now()}`,
        role: "user",
        content: message,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, userMessage])

      try {
        // Save user message to server
        const saveResult = await aiChatService.saveMessage("user", message)
        if (saveResult.error) {
          throw new Error(saveResult.error)
        }

        // Update the temp ID with the real one
        if (saveResult.data) {
          setMessages((prev) =>
            prev.map((m) => (m.id === userMessage.id ? mapChatMessage(saveResult.data!) : m))
          )
        }

        // Call the AI coach API
        abortControllerRef.current = new AbortController()

        const response = await fetch("/api/ai/coach", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message,
            history: messages.slice(-10).map((m) => ({
              role: m.role,
              message: m.content,
            })),
          }),
          signal: abortControllerRef.current.signal,
        })

        if (!response.ok) {
          throw new Error("Failed to get coach response")
        }

        const data = await response.json()
        const assistantResponse = data.response || data.message || "I apologize, but I couldn't generate a response."

        // Save assistant message
        const assistantSaveResult = await aiChatService.saveMessage("assistant", assistantResponse)

        const assistantMessage: ConversationMessage = assistantSaveResult.data
          ? mapChatMessage(assistantSaveResult.data)
          : {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: assistantResponse,
            timestamp: new Date(),
          }

        setMessages((prev) => [...prev, assistantMessage])
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          return // Request was cancelled
        }

        const errorMessage = err instanceof Error ? err.message : "Failed to send message"
        setError(errorMessage)

        // Add error message to chat
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: "assistant",
            content: "I'm having trouble responding right now. Please try again in a moment.",
            timestamp: new Date(),
          },
        ])
      } finally {
        setIsLoading(false)
        abortControllerRef.current = null
      }
    },
    [messages, mapChatMessage]
  )

  // Clear history
  const clearHistory = useCallback(async () => {
    setIsLoading(true)

    const result = await aiChatService.clearHistory()

    if (result.error) {
      setError(result.error)
    } else {
      setMessages([])
    }

    setIsLoading(false)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  // Auto-load history
  useEffect(() => {
    if (autoLoadHistory) {
      refreshHistory()
    }
  }, [autoLoadHistory, refreshHistory])

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearHistory,
    refreshHistory,
  }
}

