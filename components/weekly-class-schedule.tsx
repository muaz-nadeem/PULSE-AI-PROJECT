"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ImageUp, ClipboardList, Upload, Trash2, Save } from "lucide-react"

type ScheduleMode = "upload" | "manual"

interface WeeklyScheduleData {
  mode: ScheduleMode
  imageDataUrl?: string
  manualEntries: Record<string, Record<string, string>>
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

// Time slots based on the requested format
const TIME_SLOTS = [
  "08:00-08:50",
  "09:00-09:50",
  "10:30-11:30",
  "11:30-12:30",
  "12:30-13:30",
  // Break 13:30-14:30
  "14:30-15:30",
  "15:30-16:30",
  "16:30-17:30",
  "17:30-18:30",
  "18:30-19:30",
]
const BREAK_SLOT = "13:30-14:30"
const STORAGE_KEY = "pulse-weekly-schedule"

export default function WeeklyClassSchedule() {
  const [mode, setMode] = useState<ScheduleMode>("upload")
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined)
  const [manualEntries, setManualEntries] = useState<Record<string, Record<string, string>>>(
    DAYS.reduce(
      (accDay, day) => ({
        ...accDay,
        [day]: TIME_SLOTS.reduce((accSlot, slot) => ({ ...accSlot, [slot]: "" }), {}),
      }),
      {}
    )
  )
  const [isSaving, setIsSaving] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed: WeeklyScheduleData = JSON.parse(stored)
        setMode(parsed.mode || "upload")
        if (parsed.imageDataUrl) setImagePreview(parsed.imageDataUrl)
        if (parsed.manualEntries) {
          // Backward compatibility: if old shape was day -> string, convert to slot map
          const upgraded = DAYS.reduce(
            (accDay, day) => ({
              ...accDay,
              [day]: TIME_SLOTS.reduce((accSlot, slot) => {
                const existing =
                  typeof parsed.manualEntries[day] === "string"
                    ? parsed.manualEntries[day]
                    : parsed.manualEntries[day]?.[slot] || ""
                return { ...accSlot, [slot]: existing }
              }, {}),
            }),
            {}
          )
          setManualEntries(upgraded)
        }
      }
    } catch (error) {
      console.warn("Failed to load weekly schedule from storage", error)
    }
  }, [])

  const handleImageUpload = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setImagePreview(result)
    }
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    setIsSaving(true)
    try {
      const data: WeeklyScheduleData = {
        mode,
        imageDataUrl: imagePreview,
        manualEntries,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      setStatus("Saved!")
      setTimeout(() => setStatus(null), 2000)
    } catch (error) {
      console.error("Failed to save schedule", error)
      setStatus("Save failed")
    } finally {
      setIsSaving(false)
    }
  }

  const handleClear = () => {
    setImagePreview(undefined)
    setManualEntries(
      DAYS.reduce(
        (accDay, day) => ({
          ...accDay,
          [day]: TIME_SLOTS.reduce((accSlot, slot) => ({ ...accSlot, [slot]: "" }), {}),
        }),
        {}
      )
    )
    setStatus("Cleared")
    setTimeout(() => setStatus(null), 1500)
  }

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Weekly Class Schedule</h2>
          <p className="text-sm text-muted-foreground">
            Upload your weekly class timetable image or fill it in manually.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={mode === "upload" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("upload")}
            className="gap-2"
          >
            <ImageUp className="w-4 h-4" />
            Upload Image
          </Button>
          <Button
            variant={mode === "manual" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("manual")}
            className="gap-2"
          >
            <ClipboardList className="w-4 h-4" />
            Manual
          </Button>
        </div>
      </div>

      {mode === "upload" ? (
        <div className="space-y-4">
          <label
            className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/60 transition-colors"
            htmlFor="schedule-upload"
          >
            <Upload className="w-6 h-6 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Drop image here or click to upload</p>
            <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to ~5MB</p>
            <Input
              id="schedule-upload"
              type="file"
              accept="image/png,image/jpeg"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleImageUpload(file)
              }}
            />
          </label>
          {imagePreview && (
            <div className="relative rounded-lg overflow-hidden border border-border">
              <img src={imagePreview} alt="Weekly schedule" className="w-full max-h-[420px] object-contain bg-muted" />
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DAYS.map((day) => (
              <Card key={day} className="p-4 bg-secondary/30 border-border/50 space-y-3">
                <div className="text-sm font-semibold text-foreground">{day}</div>
                <div className="space-y-2">
                  {TIME_SLOTS.map((slot) => (
                    <div key={`${day}-${slot}`} className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">{slot}</span>
                      <Input
                        placeholder="Enter class / room"
                        value={manualEntries[day]?.[slot] || ""}
                        onChange={(e) =>
                          setManualEntries((prev) => ({
                            ...prev,
                            [day]: {
                              ...prev[day],
                              [slot]: e.target.value,
                            },
                          }))
                        }
                        className="bg-background border-border/70"
                      />
                    </div>
                  ))}
                  {/* Break slot (display only) */}
                  <div className="flex flex-col gap-1 opacity-70">
                    <span className="text-xs text-muted-foreground">{BREAK_SLOT} (Break)</span>
                    <Input disabled value="Break" className="bg-muted/50 border-border/70" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mt-6">
        <Button onClick={handleSave} disabled={isSaving} className="gap-2 bg-primary hover:bg-primary/90">
          <Save className="w-4 h-4" />
          {isSaving ? "Saving..." : "Save Schedule"}
        </Button>
        <Button onClick={handleClear} variant="outline" className="gap-2">
          <Trash2 className="w-4 h-4" />
          Clear
        </Button>
        {status && <span className="text-sm text-muted-foreground">{status}</span>}
      </div>
    </Card>
  )
}

