# Feature Deprecation Audit

## Features Deprecated ✅
- Challenges (UI removed from routing)
- Habit Tracker (FULLY DELETED)
- AI Insights (FULLY DELETED)
- Team Collaboration (UI removed from routing)
- Time Blocks (FULLY DELETED)

## Completed Deletions

### 1. Habit Feature - FULLY REMOVED
- [x] Deleted `src/features/habits/` directory
- [x] Deleted `lib/store/slices/habit-slice.ts`
- [x] Deleted `components/habit-tracker.tsx`
- [x] Deleted `components/today-habits.tsx`
- [x] Removed `useHabitStore` exports from `lib/store.ts` and `lib/store/index.ts`
- [x] Removed habit imports and usage from `components/goals.tsx`

### 2. TimeBlock Feature - FULLY REMOVED
- [x] Deleted `src/features/scheduler/ui/TimeBlockCalendar.tsx`
- [x] Removed `TimeBlockCalendar` export from `src/features/scheduler/index.ts`
- [x] Removed TimeBlock sync logic from `src/features/scheduler/ui/DayPlanner.tsx`

### 3. AI Insights Feature - FULLY REMOVED
- [x] Deleted `components/insights/` directory (contained `weekly-report.tsx`)
- [x] Deleted `app/api/ai/weekly-insights/` API endpoint
- [x] Removed navigation items from `components/navigation.tsx`
- [x] Removed route rendering from `app/page.tsx`
- [x] Removed habit widgets from `components/dashboard.tsx`

## Remaining References (Not Deleted - Still in Store)
The following TimeBlock type and store methods still exist in `lib/store.ts` but are orphaned (no UI uses them):
- `TimeBlock` type import/export
- `timeBlocks` state array
- `addTimeBlock`, `updateTimeBlock`, `deleteTimeBlock`, `getTimeBlocksForDate`, `moveTimeBlock` methods
- `scheduleSyncedFromTimeBlocks`, `clearTimeBlockSync` methods

These can be cleaned up in a future pass if needed.
