/**
 * Unit tests for voice-command-logic domain functions
 */

import { describe, it, expect } from 'vitest'
import {
    parseVoiceCommand,
    isKnownVoiceCommand,
    type VoiceCommandIntent,
} from '../voice-command-logic'

// =============================================================================
// Tests
// =============================================================================

describe('parseVoiceCommand', () => {
    describe('task commands', () => {
        it('parses "add task" command', () => {
            const result = parseVoiceCommand('add task finish project report')

            expect(result).toEqual({
                type: 'add_task',
                title: 'finish project report',
                priority: 'medium',
            })
        })

        it('parses "create task" command', () => {
            const result = parseVoiceCommand('create task buy groceries')

            expect(result).toEqual({
                type: 'add_task',
                title: 'buy groceries',
                priority: 'medium',
            })
        })

        it('parses "new task" command', () => {
            const result = parseVoiceCommand('new task call mom')

            expect(result).toEqual({
                type: 'add_task',
                title: 'call mom',
                priority: 'medium',
            })
        })

        it('extracts high priority from command', () => {
            const result = parseVoiceCommand('add task high priority submit report')

            expect(result.type).toBe('add_task')
            if (result.type === 'add_task') {
                expect(result.priority).toBe('high')
            }
        })

        it('extracts low priority from command', () => {
            const result = parseVoiceCommand('add task low priority organize desk')

            expect(result.type).toBe('add_task')
            if (result.type === 'add_task') {
                expect(result.priority).toBe('low')
            }
        })

        it('handles case insensitivity', () => {
            const result = parseVoiceCommand('ADD TASK Check Email')

            expect(result).toEqual({
                type: 'add_task',
                title: 'Check Email',
                priority: 'medium',
            })
        })
    })

    describe('focus commands', () => {
        it('parses "start focus session" command', () => {
            const result = parseVoiceCommand('start focus session')

            expect(result).toEqual({
                type: 'start_focus',
                duration: 25,
            })
        })

        it('parses "begin focus" command', () => {
            const result = parseVoiceCommand('begin focus')

            expect(result).toEqual({
                type: 'start_focus',
                duration: 25,
            })
        })

        it('extracts custom duration from command', () => {
            const result = parseVoiceCommand('start focus session for 45 minutes')

            expect(result).toEqual({
                type: 'start_focus',
                duration: 45,
            })
        })

        it('extracts duration with short notation', () => {
            const result = parseVoiceCommand('start focus 30 min')

            expect(result).toEqual({
                type: 'start_focus',
                duration: 30,
            })
        })
    })

    describe('mood commands', () => {
        it('parses "log mood good" command', () => {
            const result = parseVoiceCommand('log mood good')

            expect(result.type).toBe('log_mood')
            if (result.type === 'log_mood') {
                expect(result.mood).toBe('good')
            }
        })

        it('parses "feeling excellent" command', () => {
            const result = parseVoiceCommand('feeling excellent today')

            expect(result.type).toBe('log_mood')
            if (result.type === 'log_mood') {
                expect(result.mood).toBe('excellent')
            }
        })

        it('parses "mood sad" command', () => {
            const result = parseVoiceCommand('mood sad')

            expect(result.type).toBe('log_mood')
            if (result.type === 'log_mood') {
                expect(result.mood).toBe('sad')
            }
        })

        it('parses "very sad" as very-sad mood', () => {
            const result = parseVoiceCommand('log mood very sad')

            expect(result.type).toBe('log_mood')
            if (result.type === 'log_mood') {
                expect(result.mood).toBe('very-sad')
            }
        })

        it('extracts notes from mood command', () => {
            const result = parseVoiceCommand('log mood good had a productive day')

            expect(result.type).toBe('log_mood')
            if (result.type === 'log_mood') {
                expect(result.notes).toBe('had a productive day')
            }
        })

        it('defaults to neutral when no specific mood detected', () => {
            const result = parseVoiceCommand('log mood')

            expect(result.type).toBe('log_mood')
            if (result.type === 'log_mood') {
                expect(result.mood).toBe('neutral')
            }
        })
    })

    describe('unknown commands', () => {
        it('returns unknown for unrecognized commands', () => {
            const result = parseVoiceCommand('play some music')

            expect(result).toEqual({ type: 'unknown' })
        })

        it('returns unknown for empty command', () => {
            const result = parseVoiceCommand('')

            expect(result).toEqual({ type: 'unknown' })
        })

        it('returns unknown for random text', () => {
            const result = parseVoiceCommand('hello world how are you')

            expect(result).toEqual({ type: 'unknown' })
        })
    })
})

describe('isKnownVoiceCommand', () => {
    it('returns true for task commands', () => {
        expect(isKnownVoiceCommand('add task do something')).toBe(true)
    })

    it('returns true for focus commands', () => {
        expect(isKnownVoiceCommand('start focus session')).toBe(true)
    })

    it('returns true for mood commands', () => {
        expect(isKnownVoiceCommand('log mood good')).toBe(true)
    })

    it('returns false for unknown commands', () => {
        expect(isKnownVoiceCommand('play music')).toBe(false)
    })
})
