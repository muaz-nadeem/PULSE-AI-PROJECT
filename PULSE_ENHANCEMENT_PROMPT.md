# 🚀 PULSE AI Enhancement Prompt

> **Use this prompt to enhance PULSE AI - a Next.js productivity and wellness application**

---

## 📋 Project Context

You are enhancing **PULSE AI**, a comprehensive productivity and wellness application built with:

- **Stack**: Next.js 16 (App Router), React 19, TypeScript, Supabase, Tailwind CSS 4, Zustand, Radix UI
- **AI**: Google Gemini API for coaching and schedule generation
- **Current Features**: Task Management, Day Planner, Time Blocks, Habit Tracker, Mood Tracker, Goals, AI Coach, Focus Sounds, Challenges, Reports, Team Collaboration, Voice Commands, Smart Notifications, Site Blocking

---

## 🎯 Feature Enhancements

### 1. AI Energy Optimizer
Track energy levels throughout the day. AI schedules high-priority tasks during peak performance hours.
- Add energy level input (1-5 scale) with time tracking
- AI analyzes patterns and suggests optimal task scheduling
- Show energy curve visualization in analytics

### 2. Streak System with Rewards
Gamify productivity with visual streak counters, badges, and unlockable rewards.
- Daily Focus Streak counter
- Habit consistency badges (7-day, 30-day, 100-day)
- Unlockable themes/sounds at milestones
- Animated celebrations (confetti, fireworks) on achievements

### 3. Immersive Focus Mode
Full-screen distraction-free focus experience.
- Pomodoro timer with customizable intervals
- Breathing exercise animations between sessions
- Ambient backgrounds (rain, forest, space, coffee shop)
- Auto-enable site blocking during sessions
- Minimal UI with just timer and current task

### 4. Accountability Partner System
Connect with friends or colleagues for mutual motivation.
- Pair with a partner (invite via email/link)
- Share daily goals with privacy controls
- Real-time notifications on partner milestones
- Weekly "Productivity Battle" leaderboards

### 5. Weekly AI Insights Report
Auto-generated weekly performance summary.
- Best performing day and time
- Most common distractions
- Habit completion rate trends
- AI recommendations for improvement
- Exportable as PDF/share card

### 6. Smart Task Decomposition
AI breaks down large tasks into manageable sub-tasks.
- User enters intimidating task
- AI suggests breakdown with time estimates
- One-click to add all sub-tasks to planner
- Progress tracking for parent task

### 7. Evening Wind-Down Routine
End-of-day ritual feature.
- Reflect on daily wins
- Gratitude journaling prompt
- Tomorrow's top 3 priorities preview
- Gentle "stop working" reminder
- Sleep-friendly dark UI

### 8. Context-Aware Smart Nudges
Intelligent notifications based on behavior patterns.
- "You've been on this task for 2 hours. Break time?"
- "You usually complete habits at 7 PM. Ready?"
- "Your mood has been low. Consider a walk?"
- Configurable nudge preferences

### 9. Life Balance Wheel
Visual radar chart showing life balance.
- Dimensions: Work, Health, Relationships, Learning, Hobbies, Sleep
- Weekly self-assessment (quick 1-5 ratings)
- Trend visualization over time
- AI suggestions for underserved areas

### 10. Customizable Dashboard Widgets
Drag-and-drop widget layout.
- Available widgets: Tasks, Habits, Goals, Focus Timer, Quote, Mood, Streaks
- Resize and rearrange
- Save multiple layouts (Work, Weekend, Evening)
- Quick-add shortcuts

---

## 🎨 Aesthetic & Frontend Improvements

### Color & Theme System

```css
/* Premium color palette - implement in globals.css */
:root {
  /* Primary gradient colors */
  --gradient-start: #667eea;
  --gradient-end: #764ba2;
  
  /* Accent colors */
  --accent-success: #10b981;
  --accent-warning: #f59e0b;
  --accent-error: #ef4444;
  --accent-info: #3b82f6;
  
  /* Glass morphism */
  --glass-bg: rgba(255, 255, 255, 0.1);
  --glass-border: rgba(255, 255, 255, 0.2);
  --glass-blur: blur(10px);
  
  /* Shadows */
  --shadow-glow: 0 0 40px rgba(102, 126, 234, 0.3);
  --shadow-card: 0 10px 40px rgba(0, 0, 0, 0.1);
}

[data-theme="dark"] {
  --bg-primary: #0a0a0f;
  --bg-secondary: #13131a;
  --bg-card: #1a1a24;
  --text-primary: #ffffff;
  --text-muted: #a1a1aa;
}
```

### Typography Enhancement
- Use **Inter** or **Plus Jakarta Sans** for headings
- Use **JetBrains Mono** for numbers/stats
- Implement font size scale: xs, sm, base, lg, xl, 2xl, 3xl
- Add letter-spacing for headings

### Glassmorphism Components
Apply glass effect to:
- Navigation sidebar
- Modal dialogs
- Card components
- Floating action buttons

```css
.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}
```

### Micro-Animations
Add subtle animations for polish:
- **Hover states**: Scale 1.02 with shadow lift
- **Button clicks**: Quick 0.95 scale bounce
- **Page transitions**: Fade + slide (150ms)
- **Loading states**: Skeleton shimmer
- **Success actions**: Checkmark draw animation
- **Task completion**: Strikethrough + confetti burst

```css
.hover-lift {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.skeleton {
  background: linear-gradient(90deg, var(--bg-card) 25%, var(--bg-secondary) 50%, var(--bg-card) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

### Dashboard Layout Improvements
- **Bento grid layout**: Varied card sizes for visual hierarchy
- **Gradient accent borders**: Subtle gradient on card edges
- **Floating stats**: Key metrics as floating pills
- **Progress rings**: Animated circular progress instead of bars

### Navigation Redesign
- **Compact icons** with tooltips on hover
- **Active state glow**: Subtle glow behind active item
- **Collapsible sidebar**: Icon-only mode on mobile
- **Quick action shortcuts**: Keyboard shortcuts visible on hover

### Cards & Containers
- **Rounded corners**: 16px default, 24px for large cards
- **Subtle gradients**: Dark mode cards with slight gradient
- **Glow effects**: Important items with subtle glow
- **Consistent spacing**: 8px grid system

### Empty States
Design beautiful empty states with:
- Illustrated icons (not just generic)
- Encouraging copy
- Clear CTA button
- Subtle background pattern

### Loading & Skeleton States
- **Skeleton screens** for all data-loading views
- **Pulsing dots** for AI thinking states
- **Progress indicators** for long operations
- **Optimistic UI** updates

### Charts & Data Visualization
- **Gradient fills** instead of solid colors
- **Subtle grid lines** with low opacity
- **Animated number counters**
- **Interactive tooltips** with shadows

---

## 🛠️ Implementation Priority

### Phase 1: Quick Wins (1-2 days)
1. [ ] Theme system with dark/light toggle
2. [ ] Micro-animations (hover, click, transitions)
3. [ ] Streak counter component
4. [ ] Confetti on task completion
5. [ ] Daily motivational quote widget

### Phase 2: Core Enhancements (3-5 days)
1. [ ] Glassmorphism card redesign
2. [ ] Dashboard widget customization
3. [ ] Immersive focus mode
4. [ ] Evening wind-down routine
5. [ ] Smart nudges system

### Phase 3: AI Features (5-7 days)
1. [ ] AI task decomposition
2. [ ] Weekly AI insights report
3. [ ] Energy optimizer
4. [ ] Context-aware suggestions

### Phase 4: Social Features (7-10 days)
1. [ ] Accountability partner system
2. [ ] Shared challenges
3. [ ] Life balance wheel

---

## 📁 File Structure for New Features

```
components/
├── dashboard/
│   ├── widget-grid.tsx
│   ├── streak-counter.tsx
│   └── quick-stats.tsx
├── focus/
│   ├── immersive-mode.tsx
│   ├── breathing-exercise.tsx
│   └── ambient-backgrounds.tsx
├── gamification/
│   ├── badges.tsx
│   ├── achievements.tsx
│   └── confetti.tsx
├── insights/
│   ├── weekly-report.tsx
│   ├── energy-chart.tsx
│   └── balance-wheel.tsx
└── ui/
    ├── glass-card.tsx
    ├── animated-counter.tsx
    └── skeleton.tsx

lib/
├── ai/
│   ├── task-decomposer.ts
│   ├── insights-generator.ts
│   └── nudge-engine.ts
└── hooks/
    ├── use-streaks.ts
    ├── use-energy.ts
    └── use-achievements.ts
```

---

## 🎯 Success Metrics

After implementation, the app should feel:
- **Premium**: Like a paid SaaS, not a side project
- **Delightful**: Micro-interactions make every action satisfying
- **Intelligent**: AI feels helpful, not annoying
- **Cohesive**: Consistent design language throughout
- **Fast**: Optimistic updates, minimal loading states

---

**End of Enhancement Prompt**
