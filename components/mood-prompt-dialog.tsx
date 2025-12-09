"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Heart, X } from "lucide-react"

interface MoodPromptDialogProps {
  isOpen: boolean
  onClose: () => void
  onMoodLogged: () => void
  title?: string
  description?: string
  submitLabel?: string
}

const moodOptions = [
  { value: "excellent", emoji: "😀", label: "Excellent" },
  { value: "good", emoji: "🙂", label: "Good" },
  { value: "neutral", emoji: "😐", label: "Neutral" },
  { value: "sad", emoji: "😞", label: "Sad" },
  { value: "very-sad", emoji: "😫", label: "Very Sad" },
]

export default function MoodPromptDialog({
  isOpen,
  onClose,
  onMoodLogged,
  title = "Log Your Mood First",
  description = "To generate the best schedule for you, we need to know how you're feeling today. This helps the AI create a plan that matches your energy and mood.",
  submitLabel = "Log Mood & Generate Schedule"
}: MoodPromptDialogProps) {
  const { addMoodEntry, setCurrentPage } = useStore()
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [notes, setNotes] = useState("")

  if (!isOpen) return null

  const handleSubmit = () => {
    if (!selectedMood) return

    addMoodEntry(selectedMood as "excellent" | "good" | "neutral" | "sad" | "very-sad", notes)
    setSelectedMood(null)
    setNotes("")
    onMoodLogged()
    onClose()
  }

  const handleGoToMoodTracker = () => {
    setCurrentPage("mood")
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg shadow-lg max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-6">
          {description}
        </p>

        {/* Mood Selection */}
        <div className="mb-4">
          <p className="text-sm font-medium text-foreground mb-3">How are you feeling today?</p>
          <div className="grid grid-cols-5 gap-2">
            {moodOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedMood(option.value)}
                className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-all ${selectedMood === option.value
                    ? "bg-primary text-white scale-105"
                    : "bg-secondary hover:bg-secondary/80 text-foreground"
                  }`}
              >
                <span className="text-2xl">{option.emoji}</span>
                <span className="text-xs font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Notes (Optional) */}
        <div className="mb-6">
          <label className="text-sm font-medium text-foreground mb-2 block">Notes (optional):</label>
          <Textarea
            placeholder="Add any notes about your day or feelings..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-20 resize-none bg-secondary border-border text-foreground placeholder-muted-foreground"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={handleGoToMoodTracker}
            variant="outline"
            className="flex-1 bg-transparent"
          >
            Go to Mood Tracker
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedMood}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            {submitLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
