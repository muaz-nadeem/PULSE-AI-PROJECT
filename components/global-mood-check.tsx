"use client"

import { useEffect, useState } from "react"
import { useStore } from "@/lib/store"
import MoodPromptDialog from "./mood-prompt-dialog"

export default function GlobalMoodCheck() {
    const { moodEntries, auth } = useStore()
    const [showPrompt, setShowPrompt] = useState(false)
    const [hasChecked, setHasChecked] = useState(false)

    useEffect(() => {
        // Only check once per session/loaded component instance
        // And make sure user is authenticated
        if (hasChecked || !auth.isAuthenticated) return

        const checkMood = () => {
            const today = new Date()
            today.setHours(0, 0, 0, 0)

            const todayMood = moodEntries.find((entry) => {
                const entryDate = new Date(entry.date)
                entryDate.setHours(0, 0, 0, 0)
                return entryDate.getTime() === today.getTime()
            })

            // If no mood entry for today, show prompt
            if (!todayMood) {
                setShowPrompt(true)
            }
            setHasChecked(true)
        }

        // Small delay to ensure store is hydrated
        const timer = setTimeout(checkMood, 1500)
        return () => clearTimeout(timer)
    }, [moodEntries, hasChecked, auth.isAuthenticated])

    return (
        <MoodPromptDialog
            isOpen={showPrompt}
            onClose={() => setShowPrompt(false)}
            onMoodLogged={() => setShowPrompt(false)}
            title="How are you feeling today?"
            submitLabel="Log Mood"
            description="Take a moment to check in with yourself. Tracking your mood helps us understand your energy levels."
        />
    )
}
