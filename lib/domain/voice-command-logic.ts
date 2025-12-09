/**
 * Voice Command Logic
 * 
 * Pure functions for parsing voice commands and determining user intent.
 * These functions do not execute actions - they return structured data
 * representing what action should be taken.
 */

// =============================================================================
// Types
// =============================================================================

/**
 * Mood types that can be logged.
 */
export type MoodType = "excellent" | "good" | "neutral" | "sad" | "very-sad"

/**
 * Task priority levels.
 */
export type TaskPriority = "low" | "medium" | "high"

/**
 * Represents a parsed voice command intent.
 */
export type VoiceCommandIntent =
    | { type: "add_task"; title: string; priority: TaskPriority }
    | { type: "start_focus"; duration: number }
    | { type: "log_mood"; mood: MoodType; notes: string }
    | { type: "unknown" }

// =============================================================================
// Voice Command Parsing
// =============================================================================

/**
 * Extracts task title from an "add task" command.
 * 
 * @param command - The original command text
 * @returns The extracted task title
 */
function extractTaskTitle(command: string): string {
    return command.replace(/add task|create task|new task/gi, "").trim()
}

/**
 * Determines priority from command text.
 * 
 * @param command - The command text (lowercase)
 * @returns The priority level
 */
function extractPriority(command: string): TaskPriority {
    const lowerCommand = command.toLowerCase()
    if (lowerCommand.includes("high priority") || lowerCommand.includes("urgent")) {
        return "high"
    }
    if (lowerCommand.includes("low priority")) {
        return "low"
    }
    return "medium"
}

/**
 * Parses a task-related voice command.
 * 
 * @param command - The original command text
 * @param lowerCommand - Lowercase version for matching
 * @returns Task intent or null if not a task command
 */
function parseTaskCommand(command: string, lowerCommand: string): VoiceCommandIntent | null {
    if (
        lowerCommand.includes("add task") ||
        lowerCommand.includes("create task") ||
        lowerCommand.includes("new task")
    ) {
        const title = extractTaskTitle(command)
        if (title) {
            return {
                type: "add_task",
                title,
                priority: extractPriority(lowerCommand),
            }
        }
    }
    return null
}

/**
 * Parses a focus session voice command.
 * 
 * @param lowerCommand - Lowercase command for matching
 * @returns Focus intent or null if not a focus command
 */
function parseFocusCommand(lowerCommand: string): VoiceCommandIntent | null {
    if (
        lowerCommand.includes("start focus") ||
        lowerCommand.includes("begin focus") ||
        lowerCommand.includes("focus session")
    ) {
        // Default to 25 minutes (pomodoro)
        let duration = 25

        // Try to extract custom duration
        const durationMatch = lowerCommand.match(/(\d+)\s*(?:minute|min|m)/)
        if (durationMatch) {
            duration = parseInt(durationMatch[1], 10)
        }

        return {
            type: "start_focus",
            duration,
        }
    }
    return null
}

/**
 * Extracts mood from command text.
 * 
 * @param lowerCommand - Lowercase command for matching
 * @returns The detected mood
 */
function extractMood(lowerCommand: string): MoodType {
    // Check from most specific to least specific
    if (lowerCommand.includes("very sad") || lowerCommand.includes("awful") || lowerCommand.includes("terrible")) {
        return "very-sad"
    }
    if (lowerCommand.includes("excellent") || lowerCommand.includes("great") || lowerCommand.includes("amazing")) {
        return "excellent"
    }
    if (lowerCommand.includes("good") || lowerCommand.includes("fine") || lowerCommand.includes("okay")) {
        return "good"
    }
    if (lowerCommand.includes("sad") || lowerCommand.includes("bad") || lowerCommand.includes("down")) {
        return "sad"
    }
    return "neutral"
}

/**
 * Extracts notes from a mood command.
 * 
 * @param command - The original command text
 * @returns Extracted notes
 */
function extractMoodNotes(command: string): string {
    return command.replace(/mood|feeling|log|excellent|great|amazing|good|fine|okay|sad|bad|terrible|awful|very sad|down/gi, "").trim()
}

/**
 * Parses a mood logging voice command.
 * 
 * @param command - The original command text
 * @param lowerCommand - Lowercase command for matching
 * @returns Mood intent or null if not a mood command
 */
function parseMoodCommand(command: string, lowerCommand: string): VoiceCommandIntent | null {
    if (lowerCommand.includes("mood") || lowerCommand.includes("feeling")) {
        return {
            type: "log_mood",
            mood: extractMood(lowerCommand),
            notes: extractMoodNotes(command),
        }
    }
    return null
}

/**
 * Parses a voice command and determines the user's intent.
 * This is a pure function that returns structured data without side effects.
 * 
 * @param command - The voice command text to parse
 * @returns A VoiceCommandIntent describing what action should be taken
 * 
 * @example
 * parseVoiceCommand("add task finish report")
 * // Returns: { type: "add_task", title: "finish report", priority: "medium" }
 * 
 * @example
 * parseVoiceCommand("start focus session")
 * // Returns: { type: "start_focus", duration: 25 }
 * 
 * @example
 * parseVoiceCommand("log mood feeling good today")
 * // Returns: { type: "log_mood", mood: "good", notes: "today" }
 */
export function parseVoiceCommand(command: string): VoiceCommandIntent {
    const lowerCommand = command.toLowerCase().trim()

    // Try each command type in order
    const taskIntent = parseTaskCommand(command, lowerCommand)
    if (taskIntent) return taskIntent

    const focusIntent = parseFocusCommand(lowerCommand)
    if (focusIntent) return focusIntent

    const moodIntent = parseMoodCommand(command, lowerCommand)
    if (moodIntent) return moodIntent

    // Unknown command
    return { type: "unknown" }
}

/**
 * Checks if a command matches any known voice command patterns.
 * 
 * @param command - The voice command text
 * @returns True if the command is recognized
 */
export function isKnownVoiceCommand(command: string): boolean {
    return parseVoiceCommand(command).type !== "unknown"
}
