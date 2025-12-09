/**
 * Learning Store Tests
 */

import { describe, it, expect, beforeEach } from "vitest"
import { useLearningStore, calculateAdjustedLoad, recordDayStats } from "../learningStore"

// =============================================================================
// Test Setup
// =============================================================================

describe("useLearningStore", () => {
    beforeEach(() => {
        // Reset store before each test
        useLearningStore.getState().resetStats()
    })

    describe("initial state", () => {
        it("starts with zero stats for all moods", () => {
            const state = useLearningStore.getState()

            expect(state.moodStats.Great.numDays).toBe(0)
            expect(state.moodStats.Good.numDays).toBe(0)
            expect(state.moodStats.Okay.numDays).toBe(0)
            expect(state.moodStats.Low.numDays).toBe(0)
            expect(state.moodStats.Bad.numDays).toBe(0)
        })
    })

    describe("updateMoodStats", () => {
        it("increments numDays after update", () => {
            useLearningStore.getState().updateMoodStats("Great", 100, 80)

            expect(useLearningStore.getState().moodStats.Great.numDays).toBe(1)
        })

        it("tracks completion ratio", () => {
            useLearningStore.getState().updateMoodStats("Great", 100, 100)

            const avg = useLearningStore.getState().getAverageCompletionRatio("Great")
            expect(avg).toBeCloseTo(1.0, 1)
        })

        it("caps completion ratio at 200%", () => {
            useLearningStore.getState().updateMoodStats("Great", 50, 200)

            const avg = useLearningStore.getState().getAverageCompletionRatio("Great")
            expect(avg).toBeLessThanOrEqual(2.0)
        })

        it("ignores updates with zero planned", () => {
            useLearningStore.getState().updateMoodStats("Great", 0, 50)

            expect(useLearningStore.getState().moodStats.Great.numDays).toBe(0)
        })

        it("updates stats independently for each mood", () => {
            useLearningStore.getState().updateMoodStats("Great", 100, 90)
            useLearningStore.getState().updateMoodStats("Low", 100, 50)

            expect(useLearningStore.getState().moodStats.Great.numDays).toBe(1)
            expect(useLearningStore.getState().moodStats.Low.numDays).toBe(1)
            expect(useLearningStore.getState().moodStats.Okay.numDays).toBe(0)
        })

        it("uses exponential moving average for multiple updates", () => {
            // First day: 100% completion
            useLearningStore.getState().updateMoodStats("Okay", 100, 100)
            const avgAfter1 = useLearningStore.getState().getAverageCompletionRatio("Okay")

            // Second day: 50% completion
            useLearningStore.getState().updateMoodStats("Okay", 100, 50)
            const avgAfter2 = useLearningStore.getState().getAverageCompletionRatio("Okay")

            // EMA should be between 0.5 and 1.0, biased toward recent (0.5)
            expect(avgAfter2).toBeLessThan(avgAfter1)
            expect(avgAfter2).toBeGreaterThan(0.5)
        })
    })

    describe("getAverageCompletionRatio", () => {
        it("returns 1.0 when no data exists", () => {
            const avg = useLearningStore.getState().getAverageCompletionRatio("Great")
            expect(avg).toBe(1.0)
        })

        it("returns calculated average after updates", () => {
            useLearningStore.getState().updateMoodStats("Good", 100, 80)

            const avg = useLearningStore.getState().getAverageCompletionRatio("Good")
            expect(avg).toBeCloseTo(0.8, 1)
        })
    })

    describe("getLoadFactor", () => {
        it("returns 1.0 for new mood with no data", () => {
            const factor = useLearningStore.getState().getLoadFactor("Great")
            expect(factor).toBe(1.0)
        })

        it("returns 0.6 for very low completion (<50%)", () => {
            useLearningStore.getState().updateMoodStats("Low", 100, 40)

            const factor = useLearningStore.getState().getLoadFactor("Low")
            expect(factor).toBe(0.6)
        })

        it("returns 0.8 for low completion (50-70%)", () => {
            useLearningStore.getState().updateMoodStats("Low", 100, 60)

            const factor = useLearningStore.getState().getLoadFactor("Low")
            expect(factor).toBe(0.8)
        })

        it("returns 0.9 for slightly below target (70-90%)", () => {
            useLearningStore.getState().updateMoodStats("Okay", 100, 85)

            const factor = useLearningStore.getState().getLoadFactor("Okay")
            expect(factor).toBe(0.9)
        })

        it("returns 1.0 for on-target (90-110%)", () => {
            useLearningStore.getState().updateMoodStats("Good", 100, 100)

            const factor = useLearningStore.getState().getLoadFactor("Good")
            expect(factor).toBe(1.0)
        })

        it("returns 1.1 for exceeding target (110-130%)", () => {
            useLearningStore.getState().updateMoodStats("Great", 100, 120)

            const factor = useLearningStore.getState().getLoadFactor("Great")
            expect(factor).toBe(1.1)
        })

        it("returns 1.2 for significantly exceeding (>130%)", () => {
            useLearningStore.getState().updateMoodStats("Great", 100, 150)

            const factor = useLearningStore.getState().getLoadFactor("Great")
            expect(factor).toBe(1.2)
        })
    })

    describe("resetStats", () => {
        it("clears all mood stats", () => {
            useLearningStore.getState().updateMoodStats("Great", 100, 100)
            useLearningStore.getState().updateMoodStats("Low", 100, 50)

            useLearningStore.getState().resetStats()

            expect(useLearningStore.getState().moodStats.Great.numDays).toBe(0)
            expect(useLearningStore.getState().moodStats.Low.numDays).toBe(0)
        })
    })
})

// =============================================================================
// Utility Function Tests
// =============================================================================

describe("calculateAdjustedLoad", () => {
    beforeEach(() => {
        useLearningStore.getState().resetStats()
    })

    it("returns base duration when no learning data", () => {
        const adjusted = calculateAdjustedLoad(120, "Okay")
        expect(adjusted).toBe(120)
    })

    it("reduces load when completion ratio is low", () => {
        useLearningStore.getState().updateMoodStats("Low", 100, 50)

        const adjusted = calculateAdjustedLoad(120, "Low")
        expect(adjusted).toBeLessThan(120)
    })

    it("increases load when completion ratio is high", () => {
        useLearningStore.getState().updateMoodStats("Great", 100, 140)

        const adjusted = calculateAdjustedLoad(120, "Great")
        expect(adjusted).toBeGreaterThan(120)
    })
})

describe("recordDayStats", () => {
    beforeEach(() => {
        useLearningStore.getState().resetStats()
    })

    it("records stats via helper function", () => {
        recordDayStats("Good", 100, 90)

        expect(useLearningStore.getState().moodStats.Good.numDays).toBe(1)
    })
})
