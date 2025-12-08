"use client"

import { useState, useEffect, useRef } from "react"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"

interface FocusSessionProps {
  fullScreen?: boolean
  onExit?: () => void
}

export default function FocusSession({ fullScreen = false, onExit }: FocusSessionProps) {
  const { addFocusSession, userPreferences } = useStore()
  const focusDuration = userPreferences.focusDuration || 25
  const [isActive, setIsActive] = useState(false)
  const [seconds, setSeconds] = useState(focusDuration * 60)
  const [totalSeconds, setTotalSeconds] = useState(focusDuration * 60)
  const [sessionsCompleted, setSessionsCompleted] = useState(0)
  const prevFocusDurationRef = useRef(focusDuration)

  // Update timer when focus duration changes (only reset if timer is at initial state)
  useEffect(() => {
    if (prevFocusDurationRef.current !== focusDuration) {
      // Only reset if timer hasn't been started (is at initial state)
      if (seconds === totalSeconds) {
        const newTotal = focusDuration * 60
        setSeconds(newTotal)
        setTotalSeconds(newTotal)
      }
      prevFocusDurationRef.current = focusDuration
    }
  }, [focusDuration, seconds, totalSeconds])

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((s) => s - 1)
      }, 1000)
    } else if (seconds === 0 && isActive) {
      setIsActive(false)
      setSessionsCompleted((s) => s + 1)
      addFocusSession(focusDuration)
      const audio = new Audio(
        "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBg==",
      )
      audio.play().catch(() => {})
    }

    return () => clearInterval(interval)
  }, [isActive, seconds, addFocusSession])

  const toggleTimer = () => {
    setIsActive(!isActive)
  }

  const resetTimer = () => {
    setIsActive(false)
    setSeconds(totalSeconds)
  }

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60)
    const secsRem = secs % 60
    return `${mins.toString().padStart(2, "0")}:${secsRem.toString().padStart(2, "0")}`
  }

  const progress = ((totalSeconds - seconds) / totalSeconds) * 100

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/20 flex flex-col items-center justify-center z-50">
        <button
          type="button"
          onClick={onExit}
          className="absolute top-8 right-8 p-2 rounded-lg bg-card/50 hover:bg-card border border-border/50 text-foreground"
        >
          ✕
        </button>

        <div className="text-center space-y-8">
          <div>
            <h1 className="text-6xl font-bold text-primary mb-2">Focus Time</h1>
            <p className="text-xl text-muted-foreground">Stay focused, make progress</p>
          </div>

          <div className="relative w-80 h-80">
            <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-border"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                className="text-primary transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-7xl font-bold text-foreground font-mono">{formatTime(seconds)}</p>
                <p className="text-lg text-muted-foreground mt-2">Sessions: {sessionsCompleted}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <Button
              type="button"
              onClick={toggleTimer}
              className="w-16 h-16 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center"
              size="icon"
            >
              {isActive ? "⏸" : "▶"}
            </Button>
            <Button
              type="button"
              onClick={resetTimer}
              variant="outline"
              className="w-16 h-16 rounded-full"
              size="icon"
            >
              ↻
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-card border border-border rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-foreground">Focus Session</h3>
        <span className="text-sm text-muted-foreground">{sessionsCompleted} completed</span>
      </div>

      <div className="relative w-full h-32 mb-4">
        <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-border"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
            className="text-primary transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-3xl font-bold text-foreground font-mono">{formatTime(seconds)}</p>
            <p className="text-xs text-muted-foreground mt-1">Pomodoro Timer</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2">
        <Button
          type="button"
          onClick={toggleTimer}
          className="flex-1"
          variant={isActive ? "secondary" : "default"}
        >
          {isActive ? "Pause" : "Start"}
        </Button>
        <Button
          type="button"
          onClick={resetTimer}
          variant="outline"
          size="icon"
        >
          ↻
        </Button>
      </div>
    </div>
  )
}
