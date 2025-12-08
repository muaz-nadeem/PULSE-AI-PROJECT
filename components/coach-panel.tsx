"use client"

import { useState, useEffect, useRef } from "react"
import { useStore } from "@/lib/store"
import { aiAPI } from "@/lib/api"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageSquare, Send, Lightbulb, Sparkles, AlertCircle, Loader2 } from "lucide-react"

interface Message {
  id: string
  text: string
  sender: "user" | "coach"
  timestamp: Date
}

export default function CoachPanel() {
  const { tasks, analytics } = useStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load chat history on mount
  useEffect(() => {
    setIsMounted(true)
    loadChatHistory()
  }, [])

  async function loadChatHistory() {
    setIsLoadingHistory(true)
    try {
      const history = await aiAPI.getChatHistory(20)
      const mapped = history.reverse().map((h: any) => ({
        id: h.id,
        text: h.message,
        sender: h.role === "user" ? "user" : "coach",
        timestamp: new Date(h.created_at),
      }))

      if (mapped.length === 0) {
        // Add welcome message for new users
        mapped.push({
          id: "welcome",
          text: "Hey! 👋 I'm your AI Productivity Coach powered by Gemini. I've been analyzing your productivity patterns and I'm here to help you stay focused and achieve your goals. How can I help you today?",
          sender: "coach",
          timestamp: new Date(),
        })
      }

      setMessages(mapped)
    } catch (err) {
      console.error("Failed to load chat history:", err)
      // Add welcome message even if history fails
      setMessages([{
        id: "welcome",
        text: "Hey! 👋 I'm your AI Productivity Coach. I'm here to help you stay focused and achieve your goals. How can I help you today?",
        sender: "coach",
        timestamp: new Date(),
      }])
    } finally {
      setIsLoadingHistory(false)
    }
  }

  async function handleSend() {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: "user",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setError(null)

    try {
      // Send to AI coach endpoint
      const response = await fetch("/api/ai/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.text }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()

      const coachMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        sender: "coach",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, coachMessage])
    } catch (err) {
      console.error("Chat failed:", err)
      setError("I'm having trouble connecting right now. Please try again.")
      
      // Add fallback response
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm experiencing some technical difficulties at the moment. In the meantime, here's a tip: Try breaking your tasks into smaller, manageable chunks and tackle them one at a time. Feel free to try again in a moment!",
        sender: "coach",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, fallbackMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const completedCount = tasks.filter((t) => t.completed).length

  // Quick suggestion buttons
  const quickSuggestions = [
    "How can I be more productive today?",
    "I'm feeling distracted, help!",
    "What should I focus on first?",
    "Give me a motivation boost",
  ]

  const handleQuickSuggestion = (suggestion: string) => {
    setInput(suggestion)
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto h-[calc(100vh-120px)] flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-primary" />
            AI Coach
            <Sparkles className="w-5 h-5 text-accent" />
          </h1>
          <p className="text-muted-foreground mt-2">Your personal productivity assistant powered by Gemini</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <p className="text-xs text-muted-foreground">Today's Tasks</p>
            <p className="text-2xl font-bold text-primary">
              {completedCount}/{tasks.length}
            </p>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <p className="text-xs text-muted-foreground">Focus Streak</p>
            <p className="text-2xl font-bold text-accent">{analytics.streakDays} days</p>
          </Card>
          <Card className="p-4 bg-card border-border">
            <p className="text-xs text-muted-foreground">This Week</p>
            <p className="text-2xl font-bold text-foreground">{analytics.totalFocusTime}h focus</p>
          </Card>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="p-3 mb-4 bg-red-500/10 border-red-500/30">
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          </Card>
        )}

        {/* Chat Area */}
        <Card className="flex-1 flex flex-col bg-card border-border mb-4 overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {isLoadingHistory ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                  <p className="text-sm text-muted-foreground mt-2">Loading conversation...</p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                        message.sender === "user"
                          ? "bg-primary text-primary-foreground rounded-br-none"
                          : "bg-secondary/50 text-foreground border border-border/50 rounded-bl-none"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                      {isMounted && (
                        <p
                          className={`text-xs mt-1 ${
                            message.sender === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                          }`}
                        >
                          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-secondary/50 text-foreground border border-border/50 px-4 py-3 rounded-lg rounded-bl-none">
                      <div className="flex gap-2 items-center">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Quick Suggestions */}
          {messages.length <= 2 && !isLoadingHistory && (
            <div className="px-6 pb-2">
              <p className="text-xs text-muted-foreground mb-2">Quick suggestions:</p>
              <div className="flex flex-wrap gap-2">
                {quickSuggestions.map((suggestion, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickSuggestion(suggestion)}
                    className="text-xs"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t border-border p-4">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about productivity..."
                className="bg-secondary/50 border-border"
                disabled={isLoading || isLoadingHistory}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading || isLoadingHistory}
                className="bg-primary hover:bg-primary/90"
                size="icon"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* AI Tips */}
        <Card className="p-4 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <div className="flex gap-3">
            <Lightbulb className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground text-sm mb-1">Coach Tip</p>
              <p className="text-sm text-muted-foreground">
                I learn from your interactions! The more you chat with me and use the AI planner, 
                the better I'll understand your work style and provide personalized advice.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
