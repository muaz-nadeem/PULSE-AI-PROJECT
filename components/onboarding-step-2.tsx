"use client"

import { Card } from "@/components/ui/card"

interface OnboardingStep2Props {
  data: { goals: string[] }
  onDataChange: (data: { goals?: string[] }) => void
}

const GOAL_OPTIONS = [
  { id: "focus", label: "Stay focused and reduce distractions" },
  { id: "schedule", label: "Plan and organize my day better" },
  { id: "productivity", label: "Increase my productivity" },
  { id: "breaks", label: "Take better breaks and avoid burnout" },
  { id: "habits", label: "Build better work habits" },
  { id: "goals", label: "Achieve my long-term goals" },
]

export default function OnboardingStep2({ data, onDataChange }: OnboardingStep2Props) {
  const toggleGoal = (goalId: string) => {
    const newGoals = data.goals.includes(goalId) ? data.goals.filter((g) => g !== goalId) : [...data.goals, goalId]
    onDataChange({ goals: newGoals })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">What are your productivity goals?</h1>
        <p className="text-muted-foreground text-lg">Select all that apply</p>
      </div>

      <Card className="p-8 bg-card border-border">
        <div className="grid gap-3">
          {GOAL_OPTIONS.map((goal) => (
            <button
              key={goal.id}
              onClick={() => toggleGoal(goal.id)}
              className={`p-4 text-left border-2 rounded-lg transition-all ${
                data.goals.includes(goal.id)
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card hover:border-primary/50"
              }`}
            >
              <span className="font-medium text-foreground">{goal.label}</span>
            </button>
          ))}
        </div>
      </Card>

      <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
        <p className="text-sm text-muted-foreground">
          We'll tailor your experience based on these goals to help you succeed.
        </p>
      </div>
    </div>
  )
}
