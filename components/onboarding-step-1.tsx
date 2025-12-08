"use client"

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface OnboardingStep1Props {
  data: { name: string; role: string }
  onDataChange: (data: { name?: string; role?: string }) => void
}

export default function OnboardingStep1({ data, onDataChange }: OnboardingStep1Props) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">Welcome to Pulse</h1>
        <p className="text-muted-foreground text-lg">Your personal AI coach for productivity and focus</p>
      </div>

      <Card className="p-8 bg-card border-border">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">What's your name?</label>
            <Input
              placeholder="Enter your name"
              value={data.name}
              onChange={(e) => onDataChange({ name: e.target.value })}
              className="bg-white border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">What's your role or profession?</label>
            <Input
              placeholder="e.g., Software Engineer, Designer, Manager"
              value={data.role}
              onChange={(e) => onDataChange({ role: e.target.value })}
              className="bg-white border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Pulse learns about your work style to give you personalized recommendations for staying focused and
              achieving your goals.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
