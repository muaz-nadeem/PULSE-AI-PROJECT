"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import { Star, X, Loader2 } from "lucide-react"

interface DailyRatingDialogProps {
  onClose: () => void
  onSubmit?: (rating: number) => void
}

export default function DailyRatingDialog({ onClose, onSubmit }: DailyRatingDialogProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    if (rating === 0) return

    setSubmitting(true)
    setError(null)
    
    try {
      const today = new Date().toISOString().split("T")[0]
      
      const response = await fetch("/api/ai/daily-rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: today, rating }),
      })

      if (!response.ok) {
        throw new Error("Failed to save rating")
      }

      setSubmitted(true)
      onSubmit?.(rating)
      
      // Close after showing success
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (err) {
      console.error("Failed to save rating:", err)
      setError("Failed to save your rating. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const getRatingLabel = (value: number): string => {
    if (value <= 2) return "Tough day"
    if (value <= 4) return "Could be better"
    if (value <= 6) return "Okay"
    if (value <= 8) return "Good day!"
    return "Amazing! 🎉"
  }

  const getRatingColor = (value: number): string => {
    if (value <= 2) return "text-red-500"
    if (value <= 4) return "text-orange-500"
    if (value <= 6) return "text-yellow-500"
    if (value <= 8) return "text-green-500"
    return "text-emerald-500"
  }

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">✨</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Thanks for the feedback!</h2>
          <p className="text-muted-foreground">
            Your rating helps me understand what works best for you and improve future schedules.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="p-8 max-w-md w-full relative">
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8"
        >
          <X className="w-4 h-4" />
        </Button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">How was your day?</h2>
          <p className="text-muted-foreground">
            Your feedback helps improve tomorrow's AI schedule
          </p>
        </div>

        {/* Star Rating */}
        <div className="flex gap-1 justify-center mb-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
            <button
              key={value}
              onClick={() => setRating(value)}
              onMouseEnter={() => setHoveredRating(value)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary rounded"
              disabled={submitting}
            >
              <Star
                className={`w-7 h-7 transition-colors ${
                  (hoveredRating || rating) >= value
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300 dark:text-gray-600"
                }`}
              />
            </button>
          ))}
        </div>

        {/* Rating Label */}
        <div className="text-center mb-6 h-8">
          {(hoveredRating || rating) > 0 && (
            <div className="space-y-1">
              <span className={`text-lg font-semibold ${getRatingColor(hoveredRating || rating)}`}>
                {hoveredRating || rating}/10
              </span>
              <p className="text-sm text-muted-foreground">
                {getRatingLabel(hoveredRating || rating)}
              </p>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
            disabled={submitting}
          >
            Skip
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={rating === 0 || submitting}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Submit"
            )}
          </Button>
        </div>

        {/* Info Text */}
        <p className="text-xs text-muted-foreground text-center mt-4">
          This rating is used to personalize your AI-generated schedules
        </p>
      </Card>
    </div>
  )
}

/**
 * Hook to show the daily rating dialog at appropriate times
 */
export function useDailyRating() {
  const [showDialog, setShowDialog] = useState(false)

  // Check if we should show the rating dialog
  const checkShouldShowRating = (): boolean => {
    // Only show after 6 PM
    const currentHour = new Date().getHours()
    if (currentHour < 18) return false

    // Check if already rated today
    const lastRatingDate = localStorage.getItem("lastRatingDate")
    const today = new Date().toISOString().split("T")[0]
    if (lastRatingDate === today) return false

    return true
  }

  const triggerRatingPrompt = () => {
    if (checkShouldShowRating()) {
      setShowDialog(true)
    }
  }

  const handleClose = () => {
    setShowDialog(false)
  }

  const handleSubmit = (rating: number) => {
    // Mark as rated for today
    const today = new Date().toISOString().split("T")[0]
    localStorage.setItem("lastRatingDate", today)
    setShowDialog(false)
  }

  return {
    showDialog,
    triggerRatingPrompt,
    handleClose,
    handleSubmit,
    DialogComponent: showDialog ? (
      <DailyRatingDialog onClose={handleClose} onSubmit={handleSubmit} />
    ) : null,
  }
}

