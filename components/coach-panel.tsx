"use client"

import { useState, useEffect } from "react"
import { useStore } from "@/lib/store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageSquare, Send, Lightbulb } from "lucide-react"

interface Message {
  id: string
  text: string
  sender: "user" | "coach"
  timestamp: Date
}

const coachResponses = [
  "Great question! Let me help you with that.",
  "I notice you've been working hard. Remember to take breaks!",
  "Your focus sessions are improving. Keep it up!",
  "Would you like me to reorganize your tasks for better productivity?",
  "You're making excellent progress this week!",
  "Try batching similar tasks together - it can boost your efficiency.",
  "Consider tackling your most important task first thing in the morning.",
  "Your streak is impressive! Keep maintaining this momentum.",
]

export default function CoachPanel() {
  const { tasks, analytics } = useStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [isMounted, setIsMounted] = useState(false)

  // Initialize messages only on client side to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true)
    setMessages([
      {
        id: "1",
        text: "Hey! I'm your AI Productivity Coach. I'm here to help you stay focused and achieve your goals. How can I help you today?",
        sender: "coach",
        timestamp: new Date(Date.now() - 5 * 60000),
      },
    ])
  }, [])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = async () => {
    if (!input.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
      timestamp: new Date(),
    }
    setMessages([...messages, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate AI response delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    const coachMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: coachResponses[Math.floor(Math.random() * coachResponses.length)],
      sender: "coach",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, coachMessage])
    setIsLoading(false)
  }

  const completedCount = tasks.filter((t) => t.completed).length

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto h-[calc(100vh-120px)] flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-primary" />
            AI Coach
          </h1>
          <p className="text-muted-foreground mt-2">Your personal productivity assistant</p>
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

        {/* Chat Area */}
        <Card className="flex-1 flex flex-col bg-card border-border mb-4">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                    message.sender === "user"
                      ? "bg-primary text-white rounded-br-none"
                      : "bg-secondary/50 text-foreground border border-border/50 rounded-bl-none"
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  {isMounted && (
                    <p
                      className={`text-xs mt-1 ${message.sender === "user" ? "text-white/70" : "text-muted-foreground"}`}
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
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                    <div
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-border p-4">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask me anything about productivity..."
                className="bg-secondary/50 border-border"
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-primary hover:bg-primary/90"
                size="icon"
              >
                <Send className="w-5 h-5" />
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
                You're doing great! Try scheduling your most important tasks during your peak focus hours (usually 9-11
                AM).
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
