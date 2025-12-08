"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import OnboardingStep1 from "./onboarding-step-1"
import OnboardingStep2 from "./onboarding-step-2"
import OnboardingStep3 from "./onboarding-step-3"

interface OnboardingFlowProps {
  onComplete: () => void
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const { setUserData, setSettings } = useStore()
  const [step, setStep] = useState(1)
  const [data, setData] = useState<{
    name: string
    role: string
    goals: string[]
    focusTime: number
  }>({
    name: "",
    role: "",
    goals: [],
    focusTime: 25,
  })

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    } else {
      setUserData(data.name, data.goals, data.role)
      setSettings({
        focusDuration: data.focusTime,
        breakDuration: 5,
        dailyGoal: 8,
        theme: "dark",
        soundEnabled: true,
      })
      onComplete()
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col items-center justify-center p-4">
      {/* Progress indicator */}
      <div className="w-full max-w-2xl mb-8">
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`flex-1 h-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-border"}`}
            />
          ))}
        </div>
      </div>

      {/* Steps */}
      <div className="w-full max-w-2xl">
        {step === 1 && <OnboardingStep1 data={data} onDataChange={(newData) => setData({ ...data, ...newData })} />}
        {step === 2 && <OnboardingStep2 data={data} onDataChange={(newData) => setData({ ...data, ...newData })} />}
        {step === 3 && <OnboardingStep3 data={data} onDataChange={(newData) => setData({ ...data, ...newData })} />}
      </div>

      {/* Navigation */}
      <div className="w-full max-w-2xl mt-12 flex gap-4 justify-between">
        <Button variant="outline" onClick={handleBack} disabled={step === 1} className="flex-1 bg-transparent">
          Back
        </Button>
        <Button onClick={handleNext} className="flex-1 bg-primary hover:bg-primary/90">
          {step === 3 ? "Get Started" : "Next"}
        </Button>
      </div>
    </div>
  )
}
