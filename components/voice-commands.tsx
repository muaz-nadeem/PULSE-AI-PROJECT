"use client"

import { useState, useEffect } from "react"
import { useStore } from "@/lib/store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Volume2, CheckCircle2, X } from "lucide-react"

export default function VoiceCommands() {
  const { isVoiceActive, setVoiceActive, processVoiceCommand } = useStore()
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [lastCommand, setLastCommand] = useState("")
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || (window as any).SpeechRecognition
      const recognitionInstance = new SpeechRecognition()
      recognitionInstance.continuous = false
      recognitionInstance.interimResults = false
      recognitionInstance.lang = "en-US"

      recognitionInstance.onstart = () => {
        setIsListening(true)
      }

      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript
        setTranscript(transcript)
        setLastCommand(transcript)
        processVoiceCommand(transcript)
      }

      recognitionInstance.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error)
        setIsListening(false)
      }

      recognitionInstance.onend = () => {
        setIsListening(false)
      }

      setRecognition(recognitionInstance)
    }
  }, [])

  const startListening = () => {
    if (recognition && !isListening) {
      try {
        recognition.start()
        setVoiceActive(true)
      } catch (error) {
        console.error("Error starting recognition:", error)
      }
    }
  }

  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop()
      setVoiceActive(false)
      setIsListening(false)
    }
  }

  const voiceCommands = [
    {
      command: "Add task [task name]",
      description: "Create a new task",
      example: "Add task finish project report",
    },
    {
      command: "Start focus session",
      description: "Begin a 25-minute focus session",
      example: "Start focus session",
    },
    {
      command: "Log mood [feeling]",
      description: "Record your current mood",
      example: "Log mood feeling good today",
    },
  ]

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Voice Commands</h1>
            <p className="text-muted-foreground mt-2">Control Pulse hands-free with voice commands</p>
          </div>
        </div>

        {/* Voice Control */}
        <Card className="p-8 bg-card border-border">
          <div className="flex flex-col items-center justify-center space-y-6">
            <div
              className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${
                isListening
                  ? "bg-primary animate-pulse ring-4 ring-primary/50"
                  : isVoiceActive
                    ? "bg-primary/20"
                    : "bg-secondary/30"
              }`}
            >
              {isListening ? (
                <MicOff className="w-12 h-12 text-white" />
              ) : (
                <Mic className="w-12 h-12 text-primary" />
              )}
            </div>

            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {isListening ? "Listening..." : isVoiceActive ? "Voice Active" : "Voice Inactive"}
              </h2>
              <p className="text-muted-foreground">
                {isListening
                  ? "Speak your command now"
                  : isVoiceActive
                    ? "Click the button to start listening"
                    : "Enable voice commands to get started"}
              </p>
            </div>

            {transcript && (
              <div className="w-full max-w-md p-4 bg-secondary/30 rounded-lg border border-border/50">
                <p className="text-sm text-muted-foreground mb-1">Last Command:</p>
                <p className="font-medium text-foreground">{transcript}</p>
              </div>
            )}

            <div className="flex gap-4">
              {!isListening ? (
                <Button
                  onClick={startListening}
                  className="gap-2 bg-primary hover:bg-primary/90"
                  size="lg"
                  disabled={!recognition}
                >
                  <Mic className="w-5 h-5" />
                  Start Listening
                </Button>
              ) : (
                <Button onClick={stopListening} className="gap-2 bg-red-500 hover:bg-red-600" size="lg">
                  <MicOff className="w-5 h-5" />
                  Stop Listening
                </Button>
              )}
            </div>

            {!recognition && (
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-lg text-center">
                <p className="text-sm text-yellow-600">
                  Voice recognition is not available in your browser. Please use Chrome or Edge for voice commands.
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Available Commands */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Available Commands</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {voiceCommands.map((cmd, idx) => (
              <Card key={idx} className="p-6 bg-card border-border">
                <div className="flex items-start gap-3 mb-3">
                  <Volume2 className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground mb-1">{cmd.command}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{cmd.description}</p>
                    <div className="p-2 bg-secondary/30 rounded border border-border/50">
                      <p className="text-xs text-muted-foreground mb-1">Example:</p>
                      <p className="text-sm font-mono text-foreground">"{cmd.example}"</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-card/50 rounded-lg border border-border/50">
              <h4 className="font-semibold text-foreground mb-2">Task Capture</h4>
              <p className="text-sm text-muted-foreground">
                Say "Add task" followed by your task name to quickly capture tasks without typing.
              </p>
            </div>
            <div className="p-4 bg-card/50 rounded-lg border border-border/50">
              <h4 className="font-semibold text-foreground mb-2">Focus Sessions</h4>
              <p className="text-sm text-muted-foreground">
                Start focus sessions hands-free by saying "Start focus session" or "Begin focus".
              </p>
            </div>
            <div className="p-4 bg-card/50 rounded-lg border border-border/50">
              <h4 className="font-semibold text-foreground mb-2">Mood Logging</h4>
              <p className="text-sm text-muted-foreground">
                Log your mood quickly by saying "Log mood" followed by how you're feeling.
              </p>
            </div>
          </div>
        </Card>

        {/* Last Command Result */}
        {lastCommand && (
          <Card className="p-6 bg-card border-border">
            <h3 className="font-bold text-foreground mb-4">Last Command Result</h3>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-muted-foreground">Command processed:</span>
              <span className="font-medium text-foreground">"{lastCommand}"</span>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    webkitSpeechRecognition: any
    SpeechRecognition: any
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  onstart: (() => void) | null
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: any) => void) | null
  onend: (() => void) | null
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult
  length: number
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative
  length: number
  isFinal: boolean
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}


