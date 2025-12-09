"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

const moodOptions = [
  { value: "excellent", emoji: "😀", label: "Excellent" },
  { value: "good", emoji: "🙂", label: "Good" },
  { value: "neutral", emoji: "😐", label: "Neutral" },
  { value: "sad", emoji: "😞", label: "Sad" },
  { value: "very-sad", emoji: "😫", label: "Very Sad" },
]

export default function MoodTracker() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [notes, setNotes] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const { addMoodEntry, moodEntries } = useStore()

  const handleSubmit = () => {
    if (!selectedMood) return

    // Check if mood already exists for today
    if (todayMood) {
      // Update existing mood
      addMoodEntry(selectedMood as "excellent" | "good" | "neutral" | "sad" | "very-sad", notes)
      setSelectedMood(todayMood.mood)
      setNotes(todayMood.notes || "")
    } else {
      // Create new mood entry
      addMoodEntry(selectedMood as "excellent" | "good" | "neutral" | "sad" | "very-sad", notes)
    }
    
    setSelectedMood(null)
    setNotes("")
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  // Get today's mood entry
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayMood = moodEntries.find((entry) => {
    const entryDate = new Date(entry.date)
    entryDate.setHours(0, 0, 0, 0)
    return entryDate.getTime() === today.getTime()
  })

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">How are you feeling?</h1>
        <p className="text-muted-foreground">Check in with your mood and track your emotional well-being</p>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Today's Mood Check-in</CardTitle>
          <CardDescription>
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mood Selection */}
          <div>
            <p className="text-sm font-medium text-foreground mb-4">Select your mood:</p>
            <div className="flex justify-between gap-4">
              {moodOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedMood(option.value)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg transition-all ${
                    selectedMood === option.value
                      ? "bg-primary text-white scale-110"
                      : "bg-secondary hover:bg-secondary/80 text-foreground"
                  }`}
                >
                  <span className="text-4xl">{option.emoji}</span>
                  <span className="text-xs font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notes Section */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Notes:</label>
            <Textarea
              placeholder="Add any notes about your day, feelings, or what's on your mind..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-32 resize-none bg-secondary border-border text-foreground placeholder-muted-foreground"
            />
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={!selectedMood}
            className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2"
          >
            {todayMood ? "Update Mood" : "Submit"}
          </Button>
          
          {todayMood && (
            <p className="text-xs text-muted-foreground text-center">
              You've already logged your mood today. This will update it.
            </p>
          )}

          {/* Success Message */}
          {submitted && (
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-700 text-center">
              ✓ Mood check-in saved successfully!
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mood History */}
      {moodEntries.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-foreground mb-4">Recent Check-ins</h2>
          <div className="space-y-3">
            {[...moodEntries]
              .reverse()
              .slice(0, 5)
              .map((entry) => {
                const moodOption = moodOptions.find((m) => m.value === entry.mood)
                return (
                  <Card key={entry.id} className="border-border">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <span className="text-3xl">{moodOption?.emoji}</span>
                          <div>
                            <p className="font-medium text-foreground">{moodOption?.label}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(entry.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                      {entry.notes && <p className="mt-3 text-sm text-foreground text-gray-300">{entry.notes}</p>}
                    </CardContent>
                  </Card>
                )
              })}
          </div>
        </div>
      )}
    </div>
  )
}
