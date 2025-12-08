"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, X, Calendar, Clock, GripVertical } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, "0")
  return `${hour}:00`
})

const BLOCK_COLORS = [
  { name: "Blue", value: "bg-blue-500", border: "border-blue-500" },
  { name: "Green", value: "bg-green-500", border: "border-green-500" },
  { name: "Purple", value: "bg-purple-500", border: "border-purple-500" },
  { name: "Orange", value: "bg-orange-500", border: "border-orange-500" },
  { name: "Pink", value: "bg-pink-500", border: "border-pink-500" },
  { name: "Teal", value: "bg-teal-500", border: "border-teal-500" },
]

export default function TimeBlockCalendar() {
  const { timeBlocks, tasks, addTimeBlock, updateTimeBlock, deleteTimeBlock, getTimeBlocksForDate, moveTimeBlock, setCurrentSchedule } = useStore()
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [showAddForm, setShowAddForm] = useState(false)
  const [draggedBlock, setDraggedBlock] = useState<string | null>(null)
  const [newBlock, setNewBlock] = useState({
    title: "",
    startTime: "09:00",
    endTime: "10:00",
    taskId: "",
    color: "bg-blue-500",
    notes: "",
  })

  const dateBlocks = getTimeBlocksForDate(selectedDate)
  const availableTasks = tasks.filter((t) => !t.completed)

  const handleAddBlock = () => {
    if (newBlock.title.trim()) {
      addTimeBlock({
        title: newBlock.title.trim(),
        startTime: newBlock.startTime,
        endTime: newBlock.endTime,
        date: selectedDate,
        taskId: newBlock.taskId || undefined,
        color: newBlock.color,
        notes: newBlock.notes.trim() || undefined,
      })
      setNewBlock({
        title: "",
        startTime: "09:00",
        endTime: "10:00",
        taskId: "",
        color: "bg-blue-500",
        notes: "",
      })
      setShowAddForm(false)
    }
  }

  const getBlockPosition = (startTime: string) => {
    const [hours, minutes] = startTime.split(":").map(Number)
    return (hours * 60 + minutes) / 60 // Position in hours (0-24)
  }

  const getBlockHeight = (startTime: string, endTime: string) => {
    const [startH, startM] = startTime.split(":").map(Number)
    const [endH, endM] = endTime.split(":").map(Number)
    const startMinutes = startH * 60 + startM
    const endMinutes = endH * 60 + endM
    return (endMinutes - startMinutes) / 60 // Height in hours
  }

  const handleTimeSlotClick = (time: string) => {
    if (!showAddForm) {
      setNewBlock({
        ...newBlock,
        startTime: time,
        endTime: `${(parseInt(time.split(":")[0]) + 1).toString().padStart(2, "0")}:00`,
      })
      setShowAddForm(true)
    }
  }

  const handleDragStart = (blockId: string) => {
    setDraggedBlock(blockId)
  }

  const handleDrop = (time: string) => {
    if (draggedBlock) {
      moveTimeBlock(draggedBlock, selectedDate, time)
      setDraggedBlock(null)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
  }

  const convertToScheduleItems = () => {
    const schedule = dateBlocks.map((block) => ({
      time: block.startTime,
      duration: getBlockHeight(block.startTime, block.endTime) * 60,
      task: block.title,
      priority: "medium" as const,
    }))
    setCurrentSchedule(schedule)
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Time Block Calendar</h1>
            <p className="text-muted-foreground mt-2">Visual calendar with time blocks for better planning</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={convertToScheduleItems} variant="outline" className="gap-2">
              <Calendar className="w-4 h-4" />
              Sync with Day Planner
            </Button>
            <Button onClick={() => setShowAddForm(!showAddForm)} className="gap-2 bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4" />
              Add Time Block
            </Button>
          </div>
        </div>

        {/* Date Selector */}
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-secondary/50 border-border"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])}
              >
                Today
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const date = new Date(selectedDate)
                  date.setDate(date.getDate() - 1)
                  setSelectedDate(date.toISOString().split("T")[0])
                }}
              >
                ←
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const date = new Date(selectedDate)
                  date.setDate(date.getDate() + 1)
                  setSelectedDate(date.toISOString().split("T")[0])
                }}
              >
                →
              </Button>
            </div>
            <h2 className="text-lg font-semibold text-foreground">{formatDate(selectedDate)}</h2>
          </div>
        </Card>

        {/* Add Block Form */}
        {showAddForm && (
          <Card className="p-6 bg-card border-border">
            <h2 className="text-xl font-bold text-foreground mb-4">Create Time Block</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Title</label>
                <Input
                  placeholder="e.g., Deep Work, Meeting, Break"
                  value={newBlock.title}
                  onChange={(e) => setNewBlock({ ...newBlock, title: e.target.value })}
                  className="bg-secondary/50 border-border"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Start Time</label>
                  <Input
                    type="time"
                    value={newBlock.startTime}
                    onChange={(e) => setNewBlock({ ...newBlock, startTime: e.target.value })}
                    className="bg-secondary/50 border-border"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">End Time</label>
                  <Input
                    type="time"
                    value={newBlock.endTime}
                    onChange={(e) => setNewBlock({ ...newBlock, endTime: e.target.value })}
                    className="bg-secondary/50 border-border"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Link Task (optional)</label>
                  <Select value={newBlock.taskId} onValueChange={(value) => setNewBlock({ ...newBlock, taskId: value })}>
                    <SelectTrigger className="bg-secondary/50 border-border">
                      <SelectValue placeholder="Select task" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {availableTasks.map((task) => (
                        <SelectItem key={task.id} value={task.id}>
                          {task.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Color</label>
                  <div className="flex gap-2 flex-wrap">
                    {BLOCK_COLORS.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setNewBlock({ ...newBlock, color: color.value })}
                        className={`w-8 h-8 rounded-full ${color.value} border-2 ${
                          newBlock.color === color.value ? "border-foreground scale-110" : "border-transparent"
                        } transition-all`}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Notes (optional)</label>
                  <Input
                    placeholder="Add notes"
                    value={newBlock.notes}
                    onChange={(e) => setNewBlock({ ...newBlock, notes: e.target.value })}
                    className="bg-secondary/50 border-border"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddBlock} className="flex-1 bg-primary hover:bg-primary/90">
                  Create Block
                </Button>
                <Button onClick={() => setShowAddForm(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Calendar View */}
        <Card className="p-6 bg-card border-border">
          <div className="relative">
            {/* Time slots */}
            <div className="space-y-0 border-l-2 border-border">
              {TIME_SLOTS.map((time, idx) => {
                const blocksAtTime = dateBlocks.filter(
                  (block) =>
                    block.startTime <= time &&
                    block.endTime > time &&
                    (idx === 0 || block.startTime > TIME_SLOTS[idx - 1])
                )

                return (
                  <div
                    key={time}
                    className="relative border-b border-border/50 min-h-[60px] flex items-start"
                    onClick={() => handleTimeSlotClick(time)}
                    onDragOver={(e) => {
                      e.preventDefault()
                    }}
                    onDrop={() => handleDrop(time)}
                  >
                    {/* Time label */}
                    <div className="w-20 flex-shrink-0 pt-2 pr-4 text-right">
                      <span className="text-sm font-medium text-muted-foreground">{time}</span>
                    </div>

                    {/* Blocks */}
                    <div className="flex-1 relative min-h-[60px]">
                      {blocksAtTime.map((block) => {
                        const position = getBlockPosition(block.startTime)
                        const height = getBlockHeight(block.startTime, block.endTime)
                        const topOffset = (position - idx) * 60

                        return (
                          <div
                            key={block.id}
                            draggable
                            onDragStart={() => handleDragStart(block.id)}
                            className={`absolute ${block.color} text-white p-2 rounded-lg border-2 border-white/20 cursor-move hover:shadow-lg transition-all min-w-[200px]`}
                            style={{
                              top: `${topOffset}px`,
                              height: `${height * 60}px`,
                              left: "0",
                              width: "calc(100% - 20px)",
                            }}
                          >
                            <div className="flex items-start justify-between h-full">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <GripVertical className="w-4 h-4 opacity-50" />
                                  <p className="font-semibold text-sm truncate">{block.title}</p>
                                </div>
                                <p className="text-xs opacity-90">
                                  {block.startTime} - {block.endTime}
                                </p>
                                {block.notes && <p className="text-xs opacity-75 mt-1 truncate">{block.notes}</p>}
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteTimeBlock(block.id)
                                }}
                                className="h-6 w-6 text-white hover:bg-white/20"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {dateBlocks.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No time blocks scheduled for this date.</p>
              <p className="text-sm">Click on a time slot or use "Add Time Block" to schedule.</p>
            </div>
          )}
        </Card>

        {/* Integration with Day Planner */}
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Integration with Day Planner
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Your time blocks can be synced with the AI Day Planner. Click "Sync with Day Planner" to convert your
            time blocks into a schedule that the AI can optimize.
          </p>
          <Button onClick={convertToScheduleItems} variant="outline" className="gap-2">
            <Clock className="w-4 h-4" />
            Sync Now
          </Button>
        </Card>
      </div>
    </div>
  )
}


