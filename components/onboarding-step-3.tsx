"use client"

import { Card } from "@/components/ui/card"

interface OnboardingStep3Props {
  data: { focusTime: number }
  onDataChange: (data: { focusTime?: number }) => void
}

const FOCUS_DURATIONS = [
  { value: 15, label: "15 min" },
  { value: 25, label: "25 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "60 min" },
]

export default function OnboardingStep3({ data, onDataChange }: OnboardingStep3Props) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">Customize your focus sessions</h1>
        <p className="text-muted-foreground text-lg">Choose your ideal focus duration (Pomodoro technique)</p>
      </div>

      <Card className="p-8 bg-card border-border">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {FOCUS_DURATIONS.map((duration) => (
              <button
                key={duration.value}
                onClick={() => onDataChange({ focusTime: duration.value })}
                className={`p-4 border-2 rounded-lg transition-all font-medium ${
                  data.focusTime === duration.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card hover:border-primary/50"
                }`}
              >
                {duration.label}
              </button>
            ))}
          </div>

          <div className="p-4 bg-secondary/5 border border-secondary/20 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Recommended:</span> Start with 25 minutes for optimal focus
              and breaks.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
