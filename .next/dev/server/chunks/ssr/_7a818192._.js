module.exports = [
"[project]/lib/store.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useStore",
    ()=>useStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-ssr] (ecmascript)");
"use client";
;
const useStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["create"])((set, get)=>({
        userName: "",
        userGoals: [],
        userData: undefined,
        userPreferences: {
            focusDuration: 25,
            breakDuration: 5,
            dailyGoal: 8,
            theme: "dark",
            soundEnabled: true
        },
        currentPage: "dashboard",
        isMobileMenuOpen: false,
        setMobileMenuOpen: (isOpen)=>set({
                isMobileMenuOpen: isOpen
            }),
        blockingSettings: {
            blockingMode: "standard",
            blockedApps: [
                "Instagram",
                "TikTok",
                "YouTube"
            ]
        },
        setBlockingMode: (mode)=>set((state)=>({
                    blockingSettings: {
                        ...state.blockingSettings,
                        blockingMode: mode
                    }
                })),
        addBlockedApp: (appName)=>set((state)=>({
                    blockingSettings: {
                        ...state.blockingSettings,
                        blockedApps: [
                            ...state.blockingSettings.blockedApps,
                            appName
                        ]
                    }
                })),
        removeBlockedApp: (appName)=>set((state)=>({
                    blockingSettings: {
                        ...state.blockingSettings,
                        blockedApps: state.blockingSettings.blockedApps.filter((app)=>app !== appName)
                    }
                })),
        tasks: [],
        focusSessions: [],
        distractions: [],
        challenges: [],
        achievements: [
            {
                id: "first_focus",
                title: "First Focus",
                description: "Complete your first focus session",
                icon: "🎯",
                category: "focus"
            },
            {
                id: "focus_master",
                title: "Focus Master",
                description: "Complete 10 focus sessions",
                icon: "🔥",
                category: "focus"
            },
            {
                id: "task_warrior",
                title: "Task Warrior",
                description: "Complete 50 tasks",
                icon: "⚔️",
                category: "tasks"
            },
            {
                id: "habit_hero",
                title: "Habit Hero",
                description: "Maintain a 7-day streak on any habit",
                icon: "💪",
                category: "habits"
            },
            {
                id: "goal_getter",
                title: "Goal Getter",
                description: "Complete your first goal",
                icon: "🏆",
                category: "goals"
            },
            {
                id: "streak_king",
                title: "Streak King",
                description: "Maintain a 30-day focus streak",
                icon: "👑",
                category: "streaks"
            },
            {
                id: "milestone_master",
                title: "Milestone Master",
                description: "Complete 10 milestones",
                icon: "⭐",
                category: "milestones"
            }
        ],
        analytics: {
            totalFocusHours: 0,
            totalFocusTime: 0,
            tasksCompletedToday: 0,
            tasksCompletedThisWeek: 0,
            averageFocusTime: 0,
            streakDays: 0,
            tasksCompleted: 0,
            focusSessions: []
        },
        moodEntries: [],
        habits: [],
        goals: [],
        currentSchedule: [],
        acceptedSchedules: [],
        timeBlocks: [],
        soundPresets: [
            {
                id: "white_noise_1",
                name: "White Noise",
                type: "white_noise",
                icon: "🌊"
            },
            {
                id: "rain_1",
                name: "Rain",
                type: "nature",
                icon: "🌧️"
            },
            {
                id: "forest_1",
                name: "Forest",
                type: "nature",
                icon: "🌲"
            },
            {
                id: "coffee_1",
                name: "Coffee Shop",
                type: "ambient",
                icon: "☕"
            },
            {
                id: "ocean_1",
                name: "Ocean Waves",
                type: "nature",
                icon: "🌊"
            },
            {
                id: "focus_1",
                name: "Deep Focus",
                type: "focus",
                icon: "🎵"
            }
        ],
        playlists: [],
        currentPlaylist: undefined,
        teamMembers: [],
        sharedGoals: [],
        groupChallenges: [],
        notifications: [],
        isVoiceActive: false,
        auth: {
            isAuthenticated: false,
            userEmail: ""
        },
        // AI Features - Initial State
        currentAIPlan: null,
        userAIProfile: null,
        aiPlanLoading: false,
        aiPlanError: null,
        addTask: async (task)=>{
            try {
                const api = await __turbopack_context__.A("[project]/lib/api.ts [app-ssr] (ecmascript, async loader)");
                // Prepare data for API - only send snake_case fields
                const apiData = {
                    title: task.title,
                    description: task.description || "",
                    priority: task.priority,
                    time_estimate: task.timeEstimate,
                    category: task.category,
                    focus_mode: task.focusMode || false
                };
                // Convert dueDate to ISO string if provided
                if (task.dueDate) {
                    // If it's already a string in YYYY-MM-DD format, convert to ISO datetime
                    const dueDate = new Date(task.dueDate);
                    if (!isNaN(dueDate.getTime())) {
                        apiData.due_date = dueDate.toISOString();
                    }
                }
                const created = await api.tasksAPI.create(apiData);
                // Add to store with proper field mapping
                set((state)=>({
                        tasks: [
                            ...state.tasks,
                            {
                                id: created.id,
                                title: created.title,
                                description: created.description || "",
                                priority: created.priority,
                                timeEstimate: created.time_estimate || 30,
                                completed: created.completed || false,
                                createdAt: new Date(created.created_at),
                                category: created.category,
                                dueDate: created.due_date ? new Date(created.due_date).toISOString().split("T")[0] : undefined,
                                focusMode: created.focus_mode || false
                            }
                        ]
                    }));
            } catch (error) {
                console.error("Failed to create task in API:", error);
                // Still add to local state as fallback, but log the error
                set((state)=>{
                    const newTask = {
                        ...task,
                        id: Math.random().toString(36).substring(7),
                        completed: false,
                        createdAt: new Date()
                    };
                    return {
                        tasks: [
                            ...state.tasks,
                            newTask
                        ]
                    };
                });
            }
        },
        deleteTask: async (id)=>{
            try {
                const api = await __turbopack_context__.A("[project]/lib/api.ts [app-ssr] (ecmascript, async loader)");
                await api.tasksAPI.delete(id);
            } catch (error) {
                console.error("Failed to delete task from API:", error);
            }
            set((state)=>({
                    tasks: state.tasks.filter((t)=>t.id !== id)
                }));
        },
        toggleTask: async (id)=>{
            const state = get();
            const task = state.tasks.find((t)=>t.id === id);
            if (task) {
                try {
                    const api = await __turbopack_context__.A("[project]/lib/api.ts [app-ssr] (ecmascript, async loader)");
                    await api.tasksAPI.update(id, {
                        completed: !task.completed
                    });
                } catch (error) {
                    console.error("Failed to update task in API:", error);
                }
            }
            set((state)=>({
                    tasks: state.tasks.map((t)=>t.id === id ? {
                            ...t,
                            completed: !t.completed
                        } : t)
                }));
        },
        updateTask: async (id, updates)=>{
            try {
                const api = await __turbopack_context__.A("[project]/lib/api.ts [app-ssr] (ecmascript, async loader)");
                const apiUpdates = {};
                if (updates.timeEstimate !== undefined) apiUpdates.time_estimate = updates.timeEstimate;
                if (updates.dueDate !== undefined) apiUpdates.due_date = updates.dueDate;
                if (updates.focusMode !== undefined) apiUpdates.focus_mode = updates.focusMode;
                if (updates.completed !== undefined) apiUpdates.completed = updates.completed;
                if (updates.title !== undefined) apiUpdates.title = updates.title;
                if (updates.description !== undefined) apiUpdates.description = updates.description;
                if (updates.priority !== undefined) apiUpdates.priority = updates.priority;
                if (updates.category !== undefined) apiUpdates.category = updates.category;
                await api.tasksAPI.update(id, apiUpdates);
            } catch (error) {
                console.error("Failed to update task in API:", error);
            }
            set((state)=>({
                    tasks: state.tasks.map((t)=>t.id === id ? {
                            ...t,
                            ...updates
                        } : t)
                }));
        },
        addFocusSession: async (duration)=>{
            try {
                const api = await __turbopack_context__.A("[project]/lib/api.ts [app-ssr] (ecmascript, async loader)");
                await api.focusSessionsAPI.create({
                    duration,
                    completed: true
                });
            } catch (error) {
                console.error("Failed to create focus session in API:", error);
            }
            set((state)=>{
                const newSession = {
                    id: Math.random().toString(36).substring(7),
                    duration,
                    date: new Date(),
                    completed: true
                };
                const updatedSessions = [
                    ...state.focusSessions,
                    newSession
                ];
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const todaySessions = updatedSessions.filter((s)=>{
                    const sessionDate = new Date(s.date);
                    sessionDate.setHours(0, 0, 0, 0);
                    return sessionDate.getTime() === today.getTime();
                });
                const thisWeekStart = new Date(today);
                thisWeekStart.setDate(today.getDate() - today.getDay());
                const weekTasks = state.tasks.filter((t)=>{
                    const taskDate = new Date(t.createdAt);
                    taskDate.setHours(0, 0, 0, 0);
                    return taskDate >= thisWeekStart && t.completed;
                });
                const totalFocusMinutes = updatedSessions.reduce((sum, s)=>sum + s.duration, 0);
                const totalFocusHours = Math.round(totalFocusMinutes / 60 * 10) / 10;
                const averageFocusTime = updatedSessions.length > 0 ? Math.round(totalFocusMinutes / updatedSessions.length * 10) / 10 : 0;
                const todayCompleted = state.tasks.filter((t)=>{
                    const taskDate = new Date(t.createdAt);
                    taskDate.setHours(0, 0, 0, 0);
                    return taskDate.getTime() === today.getTime() && t.completed;
                }).length;
                return {
                    focusSessions: updatedSessions,
                    analytics: {
                        totalFocusHours,
                        totalFocusTime: totalFocusHours,
                        tasksCompletedToday: todayCompleted,
                        tasksCompletedThisWeek: weekTasks.length,
                        averageFocusTime,
                        streakDays: updatedSessions.length > 0 ? Math.min(updatedSessions.length, 30) : 0,
                        tasksCompleted: state.tasks.filter((t)=>t.completed).length,
                        focusSessions: updatedSessions
                    }
                };
            });
        },
        getAnalytics: ()=>{
            const state = get();
            return state.analytics;
        },
        setSettings: (settings)=>set((state)=>({
                    userPreferences: {
                        ...state.userPreferences,
                        ...settings
                    }
                })),
        setUserData: (name, goals, role)=>set({
                userName: name,
                userGoals: goals,
                userData: {
                    name,
                    role
                }
            }),
        setCurrentPage: (page)=>set({
                currentPage: page
            }),
        addMoodEntry: (mood, notes)=>set((state)=>{
                const newEntry = {
                    id: Math.random().toString(36).substring(7),
                    mood,
                    notes,
                    date: new Date()
                };
                return {
                    moodEntries: [
                        ...state.moodEntries,
                        newEntry
                    ]
                };
            }),
        getMoodHistory: ()=>{
            const state = get();
            return state.moodEntries;
        },
        addHabit: (habit)=>set((state)=>{
                const newHabit = {
                    ...habit,
                    id: Math.random().toString(36).substring(7),
                    createdAt: new Date(),
                    completedDates: [],
                    currentStreak: 0,
                    longestStreak: 0
                };
                return {
                    habits: [
                        ...state.habits,
                        newHabit
                    ]
                };
            }),
        deleteHabit: (id)=>set((state)=>({
                    habits: state.habits.filter((h)=>h.id !== id)
                })),
        toggleHabitCompletion: (habitId, date)=>set((state)=>{
                const habit = state.habits.find((h)=>h.id === habitId);
                if (!habit) return state;
                const dateStr = date;
                const isCompleted = habit.completedDates.includes(dateStr);
                const newCompletedDates = isCompleted ? habit.completedDates.filter((d)=>d !== dateStr) : [
                    ...habit.completedDates,
                    dateStr
                ].sort();
                // Calculate streaks
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const todayStr = today.toISOString().split("T")[0];
                let currentStreak = 0;
                let longestStreak = habit.longestStreak;
                if (newCompletedDates.length > 0) {
                    // Calculate current streak
                    const sortedDates = [
                        ...newCompletedDates
                    ].sort().reverse();
                    let checkDate = new Date(today);
                    for (const dateStr of sortedDates){
                        const checkDateStr = checkDate.toISOString().split("T")[0];
                        if (dateStr === checkDateStr) {
                            currentStreak++;
                            checkDate.setDate(checkDate.getDate() - 1);
                        } else {
                            break;
                        }
                    }
                    // Calculate longest streak
                    let tempStreak = 0;
                    let prevDate = null;
                    for (const dateStr of sortedDates){
                        const currentDate = new Date(dateStr);
                        if (prevDate === null) {
                            tempStreak = 1;
                        } else {
                            const diffDays = Math.floor((prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
                            if (diffDays === 1) {
                                tempStreak++;
                            } else {
                                longestStreak = Math.max(longestStreak, tempStreak);
                                tempStreak = 1;
                            }
                        }
                        prevDate = currentDate;
                    }
                    longestStreak = Math.max(longestStreak, tempStreak);
                }
                return {
                    habits: state.habits.map((h)=>h.id === habitId ? {
                            ...h,
                            completedDates: newCompletedDates,
                            currentStreak,
                            longestStreak
                        } : h)
                };
            }),
        getHabitStreak: (habitId)=>{
            const state = get();
            const habit = state.habits.find((h)=>h.id === habitId);
            return habit?.currentStreak || 0;
        },
        addGoal: (goal)=>set((state)=>{
                const newGoal = {
                    ...goal,
                    id: Math.random().toString(36).substring(7),
                    createdAt: new Date(),
                    progress: 0,
                    status: "active",
                    milestones: goal.milestones || []
                };
                return {
                    goals: [
                        ...state.goals,
                        newGoal
                    ]
                };
            }),
        deleteGoal: (id)=>set((state)=>({
                    goals: state.goals.filter((g)=>g.id !== id)
                })),
        updateGoal: (id, updates)=>set((state)=>{
                const goal = state.goals.find((g)=>g.id === id);
                if (!goal) return state;
                const updatedGoal = {
                    ...goal,
                    ...updates
                };
                // Recalculate progress if milestones changed
                if (updates.milestones !== undefined) {
                    const completedMilestones = updatedGoal.milestones.filter((m)=>m.completed).length;
                    updatedGoal.progress = updatedGoal.milestones.length > 0 ? Math.round(completedMilestones / updatedGoal.milestones.length * 100) : 0;
                    // Auto-update status if all milestones completed
                    if (updatedGoal.progress === 100 && updatedGoal.status === "active") {
                        updatedGoal.status = "completed";
                    }
                }
                return {
                    goals: state.goals.map((g)=>g.id === id ? updatedGoal : g)
                };
            }),
        addMilestone: (goalId, milestone)=>set((state)=>{
                const goal = state.goals.find((g)=>g.id === goalId);
                if (!goal) return state;
                const maxOrder = goal.milestones.length > 0 ? Math.max(...goal.milestones.map((m)=>m.order)) : -1;
                const newMilestone = {
                    ...milestone,
                    id: Math.random().toString(36).substring(7),
                    order: maxOrder + 1
                };
                const updatedMilestones = [
                    ...goal.milestones,
                    newMilestone
                ].sort((a, b)=>a.order - b.order);
                const completedMilestones = updatedMilestones.filter((m)=>m.completed).length;
                const progress = updatedMilestones.length > 0 ? Math.round(completedMilestones / updatedMilestones.length * 100) : 0;
                return {
                    goals: state.goals.map((g)=>g.id === goalId ? {
                            ...g,
                            milestones: updatedMilestones,
                            progress,
                            status: progress === 100 && g.status === "active" ? "completed" : g.status
                        } : g)
                };
            }),
        updateMilestone: (goalId, milestoneId, updates)=>set((state)=>{
                const goal = state.goals.find((g)=>g.id === goalId);
                if (!goal) return state;
                const updatedMilestones = goal.milestones.map((m)=>m.id === milestoneId ? {
                        ...m,
                        ...updates
                    } : m);
                const completedMilestones = updatedMilestones.filter((m)=>m.completed).length;
                const progress = updatedMilestones.length > 0 ? Math.round(completedMilestones / updatedMilestones.length * 100) : 0;
                return {
                    goals: state.goals.map((g)=>g.id === goalId ? {
                            ...g,
                            milestones: updatedMilestones,
                            progress,
                            status: progress === 100 && g.status === "active" ? "completed" : g.status
                        } : g)
                };
            }),
        deleteMilestone: (goalId, milestoneId)=>set((state)=>{
                const goal = state.goals.find((g)=>g.id === goalId);
                if (!goal) return state;
                const updatedMilestones = goal.milestones.filter((m)=>m.id !== milestoneId);
                const completedMilestones = updatedMilestones.filter((m)=>m.completed).length;
                const progress = updatedMilestones.length > 0 ? Math.round(completedMilestones / updatedMilestones.length * 100) : 0;
                return {
                    goals: state.goals.map((g)=>g.id === goalId ? {
                            ...g,
                            milestones: updatedMilestones,
                            progress
                        } : g)
                };
            }),
        toggleMilestone: (goalId, milestoneId)=>set((state)=>{
                const goal = state.goals.find((g)=>g.id === goalId);
                if (!goal) return state;
                const updatedMilestones = goal.milestones.map((m)=>{
                    if (m.id === milestoneId) {
                        const today = new Date().toISOString().split("T")[0];
                        return {
                            ...m,
                            completed: !m.completed,
                            completedDate: !m.completed ? today : undefined
                        };
                    }
                    return m;
                });
                const completedMilestones = updatedMilestones.filter((m)=>m.completed).length;
                const progress = updatedMilestones.length > 0 ? Math.round(completedMilestones / updatedMilestones.length * 100) : 0;
                return {
                    goals: state.goals.map((g)=>g.id === goalId ? {
                            ...g,
                            milestones: updatedMilestones,
                            progress,
                            status: progress === 100 && g.status === "active" ? "completed" : g.status
                        } : g)
                };
            }),
        getGoalProgress: (goalId)=>{
            const state = get();
            const goal = state.goals.find((g)=>g.id === goalId);
            return goal?.progress || 0;
        },
        getAISuggestions: (goalId)=>{
            const state = get();
            const goal = state.goals.find((g)=>g.id === goalId);
            if (!goal) return [];
            const suggestions = [];
            const completedMilestones = goal.milestones.filter((m)=>m.completed).length;
            const totalMilestones = goal.milestones.length;
            const progress = goal.progress;
            // Progress-based suggestions
            if (progress === 0) {
                suggestions.push("Start by completing your first milestone to build momentum!");
                suggestions.push("Break down your first milestone into smaller daily tasks.");
            } else if (progress < 30) {
                suggestions.push("You're just getting started! Focus on completing 1-2 milestones this week.");
                suggestions.push("Consider scheduling specific times for goal-related tasks.");
            } else if (progress < 50) {
                suggestions.push("Great progress! You're almost halfway there. Keep the momentum going!");
                suggestions.push("Review your upcoming milestones and plan ahead.");
            } else if (progress < 80) {
                suggestions.push("You're making excellent progress! Focus on the remaining milestones.");
                suggestions.push("Consider celebrating your progress so far to stay motivated.");
            } else if (progress < 100) {
                suggestions.push("You're so close! Push through the final milestones to achieve your goal.");
                suggestions.push("Review what's worked well and apply it to the remaining tasks.");
            }
            // Task integration suggestions
            const relatedTasks = state.tasks.filter((t)=>t.title.toLowerCase().includes(goal.title.toLowerCase().split(" ")[0].toLowerCase()) || goal.title.toLowerCase().includes(t.title.toLowerCase().split(" ")[0].toLowerCase()));
            if (relatedTasks.length === 0) {
                suggestions.push("Create tasks related to this goal to track daily progress.");
            } else {
                const incompleteTasks = relatedTasks.filter((t)=>!t.completed);
                if (incompleteTasks.length > 0) {
                    suggestions.push(`You have ${incompleteTasks.length} related tasks. Complete them to advance your goal.`);
                }
            }
            // Time-based suggestions
            if (goal.targetDate) {
                const targetDate = new Date(goal.targetDate);
                const today = new Date();
                const daysRemaining = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                const milestonesRemaining = totalMilestones - completedMilestones;
                if (daysRemaining > 0 && milestonesRemaining > 0) {
                    const dailyMilestoneRate = milestonesRemaining / daysRemaining;
                    if (dailyMilestoneRate > 0.5) {
                        suggestions.push(`You have ${daysRemaining} days left. Complete ${Math.ceil(dailyMilestoneRate)} milestone(s) per day to stay on track.`);
                    }
                }
            }
            return suggestions.slice(0, 3) // Return top 3 suggestions
            ;
        },
        addDistraction: (distraction)=>set((state)=>{
                const newDistraction = {
                    ...distraction,
                    id: Math.random().toString(36).substring(7),
                    date: new Date()
                };
                return {
                    distractions: [
                        ...state.distractions,
                        newDistraction
                    ]
                };
            }),
        deleteDistraction: (id)=>set((state)=>({
                    distractions: state.distractions.filter((d)=>d.id !== id)
                })),
        getDistractionInsights: ()=>{
            const state = get();
            const distractions = state.distractions;
            // Get top sources
            const sourceCounts = {};
            distractions.forEach((d)=>{
                sourceCounts[d.source] = (sourceCounts[d.source] || 0) + 1;
            });
            const topSources = Object.entries(sourceCounts).map(([source, count])=>({
                    source,
                    count
                })).sort((a, b)=>b.count - a.count).slice(0, 5);
            // Calculate total time lost
            const totalTime = distractions.reduce((sum, d)=>sum + d.duration, 0);
            // Generate patterns/insights
            const patterns = [];
            const typeCounts = {};
            distractions.forEach((d)=>{
                typeCounts[d.type] = (typeCounts[d.type] || 0) + 1;
            });
            const mostCommonType = Object.entries(typeCounts).sort((a, b)=>b[1] - a[1])[0];
            if (mostCommonType) {
                patterns.push(`Most common distraction type: ${mostCommonType[0]} (${mostCommonType[1]} times)`);
            }
            const avgDuration = distractions.length > 0 ? totalTime / distractions.length : 0;
            if (avgDuration > 10) {
                patterns.push(`Average distraction duration is ${Math.round(avgDuration)} minutes - consider shorter breaks`);
            }
            if (topSources.length > 0) {
                patterns.push(`Top distraction source: ${topSources[0].source} (${topSources[0].count} times)`);
            }
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayDistractions = distractions.filter((d)=>{
                const dDate = new Date(d.date);
                dDate.setHours(0, 0, 0, 0);
                return dDate.getTime() === today.getTime();
            });
            if (todayDistractions.length > 5) {
                patterns.push(`You've had ${todayDistractions.length} distractions today - consider using blocking mode`);
            }
            return {
                topSources,
                totalTime,
                patterns
            };
        },
        addChallenge: (challenge)=>set((state)=>{
                const newChallenge = {
                    ...challenge,
                    id: Math.random().toString(36).substring(7),
                    current: 0,
                    completed: false
                };
                return {
                    challenges: [
                        ...state.challenges,
                        newChallenge
                    ]
                };
            }),
        updateChallengeProgress: (challengeId)=>set((state)=>{
                const challenge = state.challenges.find((c)=>c.id === challengeId);
                if (!challenge) return state;
                let current = 0;
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                switch(challenge.metric){
                    case "focus_sessions":
                        const sessionsInPeriod = state.focusSessions.filter((s)=>{
                            const sessionDate = new Date(s.date);
                            sessionDate.setHours(0, 0, 0, 0);
                            return sessionDate >= challenge.startDate && sessionDate <= challenge.endDate;
                        });
                        current = sessionsInPeriod.length;
                        break;
                    case "tasks_completed":
                        const tasksInPeriod = state.tasks.filter((t)=>{
                            if (!t.completed) return false;
                            const taskDate = new Date(t.createdAt);
                            taskDate.setHours(0, 0, 0, 0);
                            return taskDate >= challenge.startDate && taskDate <= challenge.endDate;
                        });
                        current = tasksInPeriod.length;
                        break;
                    case "habits_streak":
                        const maxStreak = Math.max(...state.habits.map((h)=>h.currentStreak), 0);
                        current = maxStreak;
                        break;
                    case "goals_progress":
                        const totalProgress = state.goals.reduce((sum, g)=>sum + g.progress, 0);
                        current = Math.round(totalProgress / (state.goals.length || 1));
                        break;
                }
                const completed = current >= challenge.target;
                return {
                    challenges: state.challenges.map((c)=>c.id === challengeId ? {
                            ...c,
                            current,
                            completed
                        } : c)
                };
            }),
        checkAchievements: ()=>set((state)=>{
                const unlocked = [];
                // Check focus achievements
                if (state.focusSessions.length >= 1) {
                    const achievement = state.achievements.find((a)=>a.id === "first_focus" && !a.unlockedAt);
                    if (achievement) {
                        unlocked.push({
                            ...achievement,
                            unlockedAt: new Date()
                        });
                    }
                }
                if (state.focusSessions.length >= 10) {
                    const achievement = state.achievements.find((a)=>a.id === "focus_master" && !a.unlockedAt);
                    if (achievement) {
                        unlocked.push({
                            ...achievement,
                            unlockedAt: new Date()
                        });
                    }
                }
                // Check task achievements
                const completedTasks = state.tasks.filter((t)=>t.completed).length;
                if (completedTasks >= 50) {
                    const achievement = state.achievements.find((a)=>a.id === "task_warrior" && !a.unlockedAt);
                    if (achievement) {
                        unlocked.push({
                            ...achievement,
                            unlockedAt: new Date()
                        });
                    }
                }
                // Check habit achievements
                const maxStreak = Math.max(...state.habits.map((h)=>h.currentStreak), 0);
                if (maxStreak >= 7) {
                    const achievement = state.achievements.find((a)=>a.id === "habit_hero" && !a.unlockedAt);
                    if (achievement) {
                        unlocked.push({
                            ...achievement,
                            unlockedAt: new Date()
                        });
                    }
                }
                // Check goal achievements
                const completedGoals = state.goals.filter((g)=>g.status === "completed").length;
                if (completedGoals >= 1) {
                    const achievement = state.achievements.find((a)=>a.id === "goal_getter" && !a.unlockedAt);
                    if (achievement) {
                        unlocked.push({
                            ...achievement,
                            unlockedAt: new Date()
                        });
                    }
                }
                // Check streak achievements
                if (state.analytics.streakDays >= 30) {
                    const achievement = state.achievements.find((a)=>a.id === "streak_king" && !a.unlockedAt);
                    if (achievement) {
                        unlocked.push({
                            ...achievement,
                            unlockedAt: new Date()
                        });
                    }
                }
                // Check milestone achievements
                const totalMilestones = state.goals.reduce((sum, g)=>{
                    return sum + g.milestones.filter((m)=>m.completed).length;
                }, 0);
                if (totalMilestones >= 10) {
                    const achievement = state.achievements.find((a)=>a.id === "milestone_master" && !a.unlockedAt);
                    if (achievement) {
                        unlocked.push({
                            ...achievement,
                            unlockedAt: new Date()
                        });
                    }
                }
                if (unlocked.length > 0) {
                    return {
                        achievements: state.achievements.map((a)=>{
                            const unlockedAchievement = unlocked.find((u)=>u.id === a.id);
                            return unlockedAchievement || a;
                        })
                    };
                }
                return state;
            }),
        getUnlockedAchievements: ()=>{
            const state = get();
            return state.achievements.filter((a)=>a.unlockedAt !== undefined);
        },
        getLeaderboard: ()=>{
            const state = get();
            // Simulated leaderboard - in real app, this would come from backend
            const score = state.focusSessions.length * 10 + state.tasks.filter((t)=>t.completed).length * 5 + state.habits.reduce((sum, h)=>sum + h.currentStreak, 0) * 3 + state.goals.filter((g)=>g.status === "completed").length * 50;
            return [
                {
                    userId: "you",
                    score,
                    rank: 1
                },
                {
                    userId: "user2",
                    score: score - 50,
                    rank: 2
                },
                {
                    userId: "user3",
                    score: score - 100,
                    rank: 3
                }
            ];
        },
        setCurrentSchedule: (schedule)=>set({
                currentSchedule: schedule
            }),
        acceptSchedule: ()=>set((state)=>({
                    acceptedSchedules: [
                        ...state.acceptedSchedules,
                        state.currentSchedule
                    ]
                })),
        getAcceptedSchedules: ()=>{
            const state = get();
            return state.acceptedSchedules;
        },
        addTimeBlock: (block)=>set((state)=>{
                const newBlock = {
                    ...block,
                    id: Math.random().toString(36).substring(7)
                };
                return {
                    timeBlocks: [
                        ...state.timeBlocks,
                        newBlock
                    ]
                };
            }),
        updateTimeBlock: (id, updates)=>set((state)=>({
                    timeBlocks: state.timeBlocks.map((b)=>b.id === id ? {
                            ...b,
                            ...updates
                        } : b)
                })),
        deleteTimeBlock: (id)=>set((state)=>({
                    timeBlocks: state.timeBlocks.filter((b)=>b.id !== id)
                })),
        getTimeBlocksForDate: (date)=>{
            const state = get();
            return state.timeBlocks.filter((b)=>b.date === date).sort((a, b)=>a.startTime.localeCompare(b.startTime));
        },
        moveTimeBlock: (id, newDate, newStartTime)=>set((state)=>{
                const block = state.timeBlocks.find((b)=>b.id === id);
                if (!block) return state;
                const startMinutes = parseInt(newStartTime.split(":")[0]) * 60 + parseInt(newStartTime.split(":")[1]);
                const endMinutes = parseInt(block.endTime.split(":")[0]) * 60 + parseInt(block.endTime.split(":")[1]);
                const duration = endMinutes - (parseInt(block.startTime.split(":")[0]) * 60 + parseInt(block.startTime.split(":")[1]));
                const newEndMinutes = startMinutes + duration;
                const newEndTime = `${Math.floor(newEndMinutes / 60).toString().padStart(2, "0")}:${(newEndMinutes % 60).toString().padStart(2, "0")}`;
                return {
                    timeBlocks: state.timeBlocks.map((b)=>b.id === id ? {
                            ...b,
                            date: newDate,
                            startTime: newStartTime,
                            endTime: newEndTime
                        } : b)
                };
            }),
        addSoundPreset: (preset)=>set((state)=>{
                const newPreset = {
                    ...preset,
                    id: Math.random().toString(36).substring(7)
                };
                return {
                    soundPresets: [
                        ...state.soundPresets,
                        newPreset
                    ]
                };
            }),
        addPlaylist: (playlist)=>set((state)=>{
                const newPlaylist = {
                    ...playlist,
                    id: Math.random().toString(36).substring(7),
                    createdAt: new Date()
                };
                return {
                    playlists: [
                        ...state.playlists,
                        newPlaylist
                    ]
                };
            }),
        deletePlaylist: (id)=>set((state)=>({
                    playlists: state.playlists.filter((p)=>p.id !== id),
                    currentPlaylist: state.currentPlaylist === id ? undefined : state.currentPlaylist
                })),
        setCurrentPlaylist: (id)=>set({
                currentPlaylist: id
            }),
        generateWeeklyReport: ()=>{
            const state = get();
            const today = new Date();
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            const weekTasks = state.tasks.filter((t)=>{
                const taskDate = new Date(t.createdAt);
                return taskDate >= weekStart && taskDate <= today;
            });
            const weekSessions = state.focusSessions.filter((s)=>{
                const sessionDate = new Date(s.date);
                return sessionDate >= weekStart && sessionDate <= today;
            });
            const summary = `Weekly Report (${weekStart.toLocaleDateString()} - ${today.toLocaleDateString()})
    
Focus Sessions: ${weekSessions.length}
Total Focus Time: ${weekSessions.reduce((sum, s)=>sum + s.duration, 0)} minutes
Tasks Completed: ${weekTasks.filter((t)=>t.completed).length} / ${weekTasks.length}
Habits Maintained: ${state.habits.filter((h)=>h.currentStreak > 0).length}
Goals Progress: ${state.goals.filter((g)=>g.status === "active").length} active goals
Distractions: ${state.distractions.filter((d)=>{
                const dDate = new Date(d.date);
                return dDate >= weekStart && dDate <= today;
            }).length}`;
            return {
                summary,
                data: {
                    focusSessions: weekSessions.length,
                    focusTime: weekSessions.reduce((sum, s)=>sum + s.duration, 0),
                    tasksCompleted: weekTasks.filter((t)=>t.completed).length,
                    tasksTotal: weekTasks.length,
                    habitsActive: state.habits.filter((h)=>h.currentStreak > 0).length,
                    goalsActive: state.goals.filter((g)=>g.status === "active").length,
                    distractions: state.distractions.filter((d)=>{
                        const dDate = new Date(d.date);
                        return dDate >= weekStart && dDate <= today;
                    }).length
                }
            };
        },
        generateMonthlyReport: ()=>{
            const state = get();
            const today = new Date();
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            const monthTasks = state.tasks.filter((t)=>{
                const taskDate = new Date(t.createdAt);
                return taskDate >= monthStart && taskDate <= today;
            });
            const monthSessions = state.focusSessions.filter((s)=>{
                const sessionDate = new Date(s.date);
                return sessionDate >= monthStart && sessionDate <= today;
            });
            const summary = `Monthly Report (${monthStart.toLocaleDateString()} - ${today.toLocaleDateString()})
    
Focus Sessions: ${monthSessions.length}
Total Focus Time: ${Math.round(monthSessions.reduce((sum, s)=>sum + s.duration, 0) / 60)} hours
Tasks Completed: ${monthTasks.filter((t)=>t.completed).length} / ${monthTasks.length}
Habits Maintained: ${state.habits.filter((h)=>h.currentStreak > 0).length}
Goals Completed: ${state.goals.filter((g)=>g.status === "completed").length}
Achievements Unlocked: ${state.achievements.filter((a)=>a.unlockedAt).length}
Challenges Completed: ${state.challenges.filter((c)=>c.completed).length}`;
            return {
                summary,
                data: {
                    focusSessions: monthSessions.length,
                    focusTime: Math.round(monthSessions.reduce((sum, s)=>sum + s.duration, 0) / 60),
                    tasksCompleted: monthTasks.filter((t)=>t.completed).length,
                    tasksTotal: monthTasks.length,
                    habitsActive: state.habits.filter((h)=>h.currentStreak > 0).length,
                    goalsCompleted: state.goals.filter((g)=>g.status === "completed").length,
                    achievements: state.achievements.filter((a)=>a.unlockedAt).length,
                    challengesCompleted: state.challenges.filter((c)=>c.completed).length
                }
            };
        },
        exportToCSV: ()=>{
            const state = get();
            const headers = [
                "Date",
                "Focus Sessions",
                "Tasks Completed",
                "Habits Streak",
                "Goals Progress"
            ];
            const rows = [];
            // Group by date
            const dateMap = {};
            state.focusSessions.forEach((s)=>{
                const date = new Date(s.date).toISOString().split("T")[0];
                if (!dateMap[date]) dateMap[date] = {
                    date,
                    focusSessions: 0,
                    tasks: 0,
                    habits: 0,
                    goals: 0
                };
                dateMap[date].focusSessions++;
            });
            state.tasks.filter((t)=>t.completed).forEach((t)=>{
                const date = new Date(t.createdAt).toISOString().split("T")[0];
                if (!dateMap[date]) dateMap[date] = {
                    date,
                    focusSessions: 0,
                    tasks: 0,
                    habits: 0,
                    goals: 0
                };
                dateMap[date].tasks++;
            });
            Object.values(dateMap).forEach((row)=>{
                rows.push(`${row.date},${row.focusSessions},${row.tasks},${row.habits},${row.goals}`);
            });
            return [
                headers.join(","),
                ...rows
            ].join("\n");
        },
        exportToPDF: ()=>{
            // In a real app, this would use a PDF library like jsPDF
            // For now, we'll create a downloadable text file
            const state = get();
            const weeklyReport = state.generateWeeklyReport();
            const monthlyReport = state.generateMonthlyReport();
            const content = `PULSE PRODUCTIVITY REPORT
Generated: ${new Date().toLocaleDateString()}

${weeklyReport.summary}

${monthlyReport.summary}

---
For detailed analytics, visit the Analytics dashboard.
`;
            const blob = new Blob([
                content
            ], {
                type: "text/plain"
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `pulse-report-${new Date().toISOString().split("T")[0]}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        },
        addTeamMember: (member)=>set((state)=>{
                const newMember = {
                    ...member,
                    id: Math.random().toString(36).substring(7),
                    joinedAt: new Date()
                };
                return {
                    teamMembers: [
                        ...state.teamMembers,
                        newMember
                    ]
                };
            }),
        shareGoal: (goalId, memberIds)=>set((state)=>{
                const existingShare = state.sharedGoals.find((sg)=>sg.goalId === goalId);
                if (existingShare) {
                    return {
                        sharedGoals: state.sharedGoals.map((sg)=>sg.goalId === goalId ? {
                                ...sg,
                                sharedWith: [
                                    ...new Set([
                                        ...sg.sharedWith,
                                        ...memberIds
                                    ])
                                ]
                            } : sg)
                    };
                }
                const newShare = {
                    id: Math.random().toString(36).substring(7),
                    goalId,
                    sharedWith: memberIds,
                    sharedAt: new Date()
                };
                return {
                    sharedGoals: [
                        ...state.sharedGoals,
                        newShare
                    ]
                };
            }),
        createGroupChallenge: (challenge)=>set((state)=>{
                const newChallenge = {
                    ...challenge,
                    id: Math.random().toString(36).substring(7),
                    leaderboard: challenge.participants.map((userId)=>({
                            userId,
                            score: 0
                        }))
                };
                return {
                    groupChallenges: [
                        ...state.groupChallenges,
                        newChallenge
                    ]
                };
            }),
        getTeamProductivityInsights: ()=>{
            const state = get();
            // Simulated team data - in real app, this would aggregate from all team members
            const totalFocusTime = state.focusSessions.reduce((sum, s)=>sum + s.duration, 0);
            const totalTasks = state.tasks.length;
            const averageProgress = state.goals.length > 0 ? state.goals.reduce((sum, g)=>sum + g.progress, 0) / state.goals.length : 0;
            return {
                totalFocusTime,
                totalTasks,
                averageProgress: Math.round(averageProgress)
            };
        },
        addNotification: (notification)=>set((state)=>{
                const newNotification = {
                    ...notification,
                    id: Math.random().toString(36).substring(7),
                    timestamp: new Date(),
                    read: false
                };
                return {
                    notifications: [
                        newNotification,
                        ...state.notifications
                    ]
                };
            }),
        markNotificationRead: (id)=>set((state)=>({
                    notifications: state.notifications.map((n)=>n.id === id ? {
                            ...n,
                            read: true
                        } : n)
                })),
        clearNotifications: ()=>set({
                notifications: []
            }),
        getUnreadNotifications: ()=>{
            const state = get();
            return state.notifications.filter((n)=>!n.read);
        },
        checkSmartNotifications: ()=>{
            const state = get();
            const now = new Date();
            const lastSession = state.focusSessions[state.focusSessions.length - 1];
            // Break suggestion - if last session was more than 25 minutes ago and no break taken
            if (lastSession) {
                const sessionTime = new Date(lastSession.date).getTime();
                const timeSinceSession = (now.getTime() - sessionTime) / (1000 * 60) // minutes
                ;
                if (timeSinceSession >= 25 && timeSinceSession < 30) {
                    const hasRecentBreak = state.distractions.some((d)=>{
                        const distTime = new Date(d.date).getTime();
                        return distTime > sessionTime && d.type === "other" && d.source.toLowerCase().includes("break");
                    });
                    if (!hasRecentBreak) {
                        state.addNotification({
                            type: "suggestion",
                            title: "Time for a Break!",
                            message: "You've been focusing for a while. Take a 5-minute break to recharge.",
                            actionUrl: "/dashboard"
                        });
                    }
                }
            }
            // Goal milestone celebration
            state.goals.forEach((goal)=>{
                const recentMilestones = goal.milestones.filter((m)=>{
                    if (!m.completedDate) return false;
                    const completedTime = new Date(m.completedDate).getTime();
                    return now.getTime() - completedTime < 60000 // Within last minute
                    ;
                });
                if (recentMilestones.length > 0) {
                    state.addNotification({
                        type: "celebration",
                        title: "Milestone Achieved! 🎉",
                        message: `You completed "${recentMilestones[0].title}" for "${goal.title}"`,
                        actionUrl: "/goals"
                    });
                }
            });
            // Context-aware reminders
            const todayTasks = state.tasks.filter((t)=>{
                if (t.completed) return false;
                const taskDate = new Date(t.createdAt);
                return taskDate.toDateString() === now.toDateString();
            });
            if (todayTasks.length > 0 && now.getHours() === 9 && now.getMinutes() < 5) {
                state.addNotification({
                    type: "reminder",
                    title: "Good Morning!",
                    message: `You have ${todayTasks.length} task${todayTasks.length > 1 ? "s" : ""} to complete today.`,
                    actionUrl: "/tasks"
                });
            }
        },
        setVoiceActive: (active)=>set({
                isVoiceActive: active
            }),
        processVoiceCommand: (command)=>{
            const state = get();
            const lowerCommand = command.toLowerCase().trim();
            // Task capture
            if (lowerCommand.includes("add task") || lowerCommand.includes("create task") || lowerCommand.includes("new task")) {
                const taskText = command.replace(/add task|create task|new task/gi, "").trim();
                if (taskText) {
                    state.addTask({
                        title: taskText,
                        priority: "medium",
                        timeEstimate: 30
                    });
                    state.addNotification({
                        type: "reminder",
                        title: "Task Added",
                        message: `"${taskText}" has been added to your tasks.`
                    });
                }
            }
            // Start focus session
            if (lowerCommand.includes("start focus") || lowerCommand.includes("begin focus") || lowerCommand.includes("focus session")) {
                const duration = 25 // Default
                ;
                state.addFocusSession(duration);
                state.addNotification({
                    type: "reminder",
                    title: "Focus Session Started",
                    message: `Started a ${duration}-minute focus session.`
                });
            }
            // Log mood
            if (lowerCommand.includes("mood") || lowerCommand.includes("feeling")) {
                let mood = "neutral";
                if (lowerCommand.includes("excellent") || lowerCommand.includes("great") || lowerCommand.includes("amazing")) {
                    mood = "excellent";
                } else if (lowerCommand.includes("good") || lowerCommand.includes("fine") || lowerCommand.includes("okay")) {
                    mood = "good";
                } else if (lowerCommand.includes("sad") || lowerCommand.includes("bad") || lowerCommand.includes("terrible")) {
                    mood = "sad";
                } else if (lowerCommand.includes("very sad") || lowerCommand.includes("awful")) {
                    mood = "very-sad";
                }
                const notes = command.replace(/mood|feeling/gi, "").trim();
                state.addMoodEntry(mood, notes || "");
                state.addNotification({
                    type: "reminder",
                    title: "Mood Logged",
                    message: `Your mood has been recorded as "${mood}".`
                });
            }
        },
        // Add auth actions
        setAuth: (isAuthenticated, userEmail = "")=>set({
                auth: {
                    isAuthenticated,
                    userEmail
                }
            }),
        logout: async ()=>{
            try {
                const api = await __turbopack_context__.A("[project]/lib/api.ts [app-ssr] (ecmascript, async loader)");
                api.authAPI.logout();
            } catch (error) {
                console.error("Error during logout:", error);
            }
            set({
                auth: {
                    isAuthenticated: false,
                    userEmail: ""
                },
                tasks: [],
                habits: [],
                goals: [],
                focusSessions: [],
                distractions: [],
                challenges: [],
                timeBlocks: [],
                notifications: [],
                currentAIPlan: null,
                userAIProfile: null,
                aiPlanLoading: false,
                aiPlanError: null
            });
        },
        // AI Features - Actions
        setCurrentAIPlan: (plan)=>set({
                currentAIPlan: plan
            }),
        setUserAIProfile: (profile)=>set({
                userAIProfile: profile
            }),
        setAIPlanLoading: (loading)=>set({
                aiPlanLoading: loading
            }),
        setAIPlanError: (error)=>set({
                aiPlanError: error
            }),
        acceptAIPlan: async ()=>{
            const state = get();
            if (!state.currentAIPlan) return;
            try {
                const api = await __turbopack_context__.A("[project]/lib/api.ts [app-ssr] (ecmascript, async loader)");
                await api.aiAPI.acceptPlan(state.currentAIPlan.id);
                set({
                    currentAIPlan: {
                        ...state.currentAIPlan,
                        status: "accepted"
                    }
                });
                // Also accept schedule to history
                state.acceptSchedule();
            } catch (error) {
                console.error("Failed to accept AI plan:", error);
                set({
                    aiPlanError: "Failed to accept plan"
                });
            }
        },
        rejectAIPlan: async ()=>{
            const state = get();
            if (!state.currentAIPlan) return;
            try {
                const api = await __turbopack_context__.A("[project]/lib/api.ts [app-ssr] (ecmascript, async loader)");
                await api.aiAPI.rejectPlan(state.currentAIPlan.id);
                set({
                    currentAIPlan: {
                        ...state.currentAIPlan,
                        status: "rejected"
                    }
                });
            } catch (error) {
                console.error("Failed to reject AI plan:", error);
                set({
                    aiPlanError: "Failed to reject plan"
                });
            }
        }
    }));
}),
"[project]/lib/supabase/client.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "supabase",
    ()=>supabase
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$esm$2f$wrapper$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/esm/wrapper.mjs [app-ssr] (ecmascript)");
;
const supabaseUrl = ("TURBOPACK compile-time value", "https://yyfbfttutejbykkeuktm.supabase.co") || "";
const supabaseAnonKey = ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5ZmJmdHR1dGVqYnlra2V1a3RtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMDU5ODcsImV4cCI6MjA4MDc4MTk4N30.sIhJws6nPUOIaHvZj2QI8JB1hE5wEE6I-WPCqwR1qgE") || "";
const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$esm$2f$wrapper$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createClient"])(supabaseUrl || "https://placeholder.supabase.co", supabaseAnonKey || "placeholder-key", {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    }
});
// Validate environment variables at runtime (client-side only)
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
}),
"[project]/lib/api.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "aiAPI",
    ()=>aiAPI,
    "authAPI",
    ()=>authAPI,
    "focusSessionsAPI",
    ()=>focusSessionsAPI,
    "tasksAPI",
    ()=>tasksAPI,
    "usersAPI",
    ()=>usersAPI
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase/client.ts [app-ssr] (ecmascript)");
;
// Helper function to handle Supabase errors
function handleSupabaseError(error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "An error occurred");
}
const authAPI = {
    async login (email, password) {
        const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].auth.signInWithPassword({
            email,
            password
        });
        if (error) {
            throw new Error(error.message || "Login failed");
        }
        // Session is automatically stored by Supabase client
        if (!data.session) {
            throw new Error("No session returned");
        }
    },
    async register (email, name, password) {
        // Trim and normalize email
        const normalizedEmail = email.trim().toLowerCase();
        const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].auth.signUp({
            email: normalizedEmail,
            password,
            options: {
                data: {
                    name
                }
            }
        });
        if (error) {
            // Provide more helpful error messages
            const errorMsg = error.message.toLowerCase();
            // Check for common Supabase error codes
            if (error.status === 422 || errorMsg.includes("already registered") || errorMsg.includes("already exists") || errorMsg.includes("user already registered")) {
                throw new Error("This email is already registered. Please try logging in instead.");
            } else if (errorMsg.includes("invalid") && errorMsg.includes("email")) {
                // Check if it's actually an "already exists" error disguised as invalid
                if (errorMsg.includes("yawar@gmail.com") || errorMsg.includes("already")) {
                    throw new Error("This email is already registered. Please try logging in instead.");
                }
                throw new Error("Please check your email format. Make sure it's a valid email address.");
            } else {
                // Pass through the original error message
                throw new Error(error.message || "Registration failed. Please try again.");
            }
        }
        // Email confirmation is disabled - user should be immediately signed in
        if (!data.user) {
            throw new Error("Failed to create user account. Please try again.");
        }
        // If no session was returned, try to sign in immediately
        if (!data.session) {
            // Try to sign in with the same credentials to get a session
            const { data: signInData, error: signInError } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].auth.signInWithPassword({
                email: normalizedEmail,
                password: password
            });
            if (signInError || !signInData.session) {
                // If sign in fails, it might be because email confirmation is still enabled
                console.error("Signup session error:", signInError);
                throw new Error("Account created but failed to sign in. Please try logging in manually. If this persists, check that email confirmation is disabled in Supabase settings.");
            }
        }
        // Wait a bit for the user profile to be created by the trigger
        await new Promise((resolve)=>setTimeout(resolve, 500));
        // Update user profile with name
        const { error: updateError } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from("users").update({
            name
        }).eq("id", data.user.id);
        if (updateError) {
            console.error("Failed to update user name:", updateError);
        // Don't throw - profile might not exist yet, it will be created by trigger
        }
    },
    logout () {
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].auth.signOut();
    }
};
const usersAPI = {
    async getCurrentUser () {
        // First check session
        const { data: { session }, error: sessionError } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].auth.getSession();
        if (sessionError || !session) {
            throw new Error("Not authenticated");
        }
        const user = session.user;
        // Try to get user profile, but handle case where it might not exist yet
        const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from("users").select("email, name, onboarding_completed").eq("id", user.id).single();
        // If user profile doesn't exist yet, create it
        if (error && error.code === 'PGRST116') {
            // Profile doesn't exist, create it
            const { error: insertError } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from("users").insert({
                id: user.id,
                email: user.email || "",
                name: user.user_metadata?.name || null,
                onboarding_completed: false
            });
            if (insertError) {
                console.error("Failed to create user profile:", insertError);
            }
            return {
                email: user.email || "",
                name: user.user_metadata?.name || "",
                onboarding_completed: false
            };
        }
        if (error) {
            handleSupabaseError(error);
        }
        return {
            email: data?.email || user.email || "",
            name: data?.name || "",
            onboarding_completed: data?.onboarding_completed || false
        };
    },
    async updateCurrentUser (data) {
        // Check session first
        const { data: { session }, error: sessionError } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].auth.getSession();
        if (sessionError || !session) {
            throw new Error("Not authenticated");
        }
        const user = session.user;
        const updates = {};
        if (data.onboarding_completed !== undefined) {
            updates.onboarding_completed = data.onboarding_completed;
        }
        if (data.name !== undefined) {
            updates.name = data.name;
        }
        const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from("users").update(updates).eq("id", user.id);
        if (error) {
            // If user profile doesn't exist, create it first
            if (error.code === 'PGRST116') {
                const { error: insertError } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from("users").insert({
                    id: user.id,
                    email: user.email || "",
                    name: data.name || user.user_metadata?.name || null,
                    onboarding_completed: data.onboarding_completed || false
                });
                if (insertError) {
                    handleSupabaseError(insertError);
                }
            } else {
                handleSupabaseError(error);
            }
        }
    }
};
const tasksAPI = {
    async getAll () {
        const { data: { user } } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].auth.getUser();
        if (!user) {
            throw new Error("Not authenticated");
        }
        const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from("tasks").select("*").eq("user_id", user.id).order("created_at", {
            ascending: false
        });
        if (error) {
            handleSupabaseError(error);
        }
        return data?.map((task)=>({
                id: task.id,
                title: task.title,
                description: task.description || "",
                priority: task.priority,
                time_estimate: task.time_estimate,
                completed: task.completed,
                created_at: task.created_at,
                category: task.category,
                due_date: task.due_date,
                focus_mode: task.focus_mode
            })) || [];
    },
    async getById (id) {
        const { data: { user } } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].auth.getUser();
        if (!user) {
            throw new Error("Not authenticated");
        }
        const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from("tasks").select("*").eq("id", id).eq("user_id", user.id).single();
        if (error) {
            handleSupabaseError(error);
        }
        return {
            id: data.id,
            title: data.title,
            description: data.description || "",
            priority: data.priority,
            time_estimate: data.time_estimate,
            completed: data.completed,
            created_at: data.created_at,
            category: data.category,
            due_date: data.due_date,
            focus_mode: data.focus_mode
        };
    },
    async create (data) {
        const { data: { user } } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].auth.getUser();
        if (!user) {
            throw new Error("Not authenticated");
        }
        const { data: task, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from("tasks").insert({
            user_id: user.id,
            title: data.title,
            description: data.description || "",
            priority: data.priority,
            time_estimate: data.time_estimate,
            category: data.category || null,
            due_date: data.due_date || null,
            focus_mode: data.focus_mode || false
        }).select().single();
        if (error) {
            handleSupabaseError(error);
        }
        return {
            id: task.id,
            title: task.title,
            description: task.description || "",
            priority: task.priority,
            time_estimate: task.time_estimate,
            completed: task.completed,
            created_at: task.created_at,
            category: task.category,
            due_date: task.due_date,
            focus_mode: task.focus_mode
        };
    },
    async update (id, data) {
        const { data: { user } } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].auth.getUser();
        if (!user) {
            throw new Error("Not authenticated");
        }
        const updates = {};
        if (data.title !== undefined) updates.title = data.title;
        if (data.description !== undefined) updates.description = data.description;
        if (data.priority !== undefined) updates.priority = data.priority;
        if (data.time_estimate !== undefined) updates.time_estimate = data.time_estimate;
        if (data.category !== undefined) updates.category = data.category;
        if (data.due_date !== undefined) updates.due_date = data.due_date || null;
        if (data.focus_mode !== undefined) updates.focus_mode = data.focus_mode;
        if (data.completed !== undefined) updates.completed = data.completed;
        const { data: task, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from("tasks").update(updates).eq("id", id).eq("user_id", user.id).select().single();
        if (error) {
            handleSupabaseError(error);
        }
        return {
            id: task.id,
            title: task.title,
            description: task.description || "",
            priority: task.priority,
            time_estimate: task.time_estimate,
            completed: task.completed,
            created_at: task.created_at,
            category: task.category,
            due_date: task.due_date,
            focus_mode: task.focus_mode
        };
    },
    async delete (id) {
        const { data: { user } } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].auth.getUser();
        if (!user) {
            throw new Error("Not authenticated");
        }
        const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from("tasks").delete().eq("id", id).eq("user_id", user.id);
        if (error) {
            handleSupabaseError(error);
        }
    }
};
const focusSessionsAPI = {
    async getAll () {
        const { data: { user } } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].auth.getUser();
        if (!user) {
            throw new Error("Not authenticated");
        }
        const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from("focus_sessions").select("*").eq("user_id", user.id).order("created_at", {
            ascending: false
        });
        if (error) {
            handleSupabaseError(error);
        }
        return data?.map((session)=>({
                id: session.id,
                duration: session.duration,
                completed: session.completed,
                created_at: session.created_at,
                date: session.created_at
            })) || [];
    },
    async create (data) {
        const { data: { user } } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].auth.getUser();
        if (!user) {
            throw new Error("Not authenticated");
        }
        const { data: session, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from("focus_sessions").insert({
            user_id: user.id,
            duration: data.duration,
            completed: data.completed
        }).select().single();
        if (error) {
            handleSupabaseError(error);
        }
        return {
            id: session.id,
            duration: session.duration,
            completed: session.completed,
            created_at: session.created_at,
            date: session.created_at
        };
    }
};
const aiAPI = {
    /**
   * Fetches today's AI-generated plan for the current user.
   */ async getDailyPlan (date) {
        const { data: { user } } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].auth.getUser();
        if (!user) throw new Error("Not authenticated");
        const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from("ai_plans").select("*").eq("user_id", user.id).eq("plan_date", date).single();
        // PGRST116 means no rows found - that's okay, return null
        if (error && error.code !== "PGRST116") {
            handleSupabaseError(error);
        }
        return data || null;
    },
    /**
   * Marks a plan as accepted.
   */ async acceptPlan (planId) {
        const { data: { user } } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].auth.getUser();
        if (!user) throw new Error("Not authenticated");
        const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from("ai_plans").update({
            status: "accepted",
            accepted_at: new Date().toISOString()
        }).eq("id", planId).eq("user_id", user.id);
        if (error) handleSupabaseError(error);
        // Log feedback event
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from("plan_feedback_events").insert({
            plan_id: planId,
            user_id: user.id,
            event_type: "accepted"
        });
    },
    /**
   * Marks a plan as rejected.
   */ async rejectPlan (planId) {
        const { data: { user } } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].auth.getUser();
        if (!user) throw new Error("Not authenticated");
        const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from("ai_plans").update({
            status: "rejected",
            rejected_at: new Date().toISOString()
        }).eq("id", planId).eq("user_id", user.id);
        if (error) handleSupabaseError(error);
        // Log feedback event
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from("plan_feedback_events").insert({
            plan_id: planId,
            user_id: user.id,
            event_type: "rejected"
        });
    },
    /**
   * Updates a plan's schedule (when user edits it).
   */ async updatePlanSchedule (planId, newSchedule) {
        const { data: { user } } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].auth.getUser();
        if (!user) throw new Error("Not authenticated");
        // First get current plan to store original
        const { data: plan } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from("ai_plans").select("schedule, edit_count").eq("id", planId).eq("user_id", user.id).single();
        const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from("ai_plans").update({
            schedule: newSchedule,
            original_schedule: plan?.schedule || null,
            status: "edited",
            edit_count: (plan?.edit_count || 0) + 1,
            last_edited_at: new Date().toISOString()
        }).eq("id", planId).eq("user_id", user.id);
        if (error) handleSupabaseError(error);
        // Log feedback event
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from("plan_feedback_events").insert({
            plan_id: planId,
            user_id: user.id,
            event_type: "edited",
            event_data: {
                editCount: (plan?.edit_count || 0) + 1
            }
        });
    },
    /**
   * Logs a feedback event for task completion within a plan.
   */ async logPlanTaskCompletion (planId, taskId) {
        const { data: { user } } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].auth.getUser();
        if (!user) throw new Error("Not authenticated");
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from("plan_feedback_events").insert({
            plan_id: planId,
            user_id: user.id,
            event_type: "task_completed",
            event_data: {
                taskId
            }
        });
    },
    /**
   * Fetches recent chat history for the AI coach.
   */ async getChatHistory (limit = 20) {
        const { data: { user } } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].auth.getUser();
        if (!user) throw new Error("Not authenticated");
        const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from("ai_chat_history").select("*").eq("user_id", user.id).order("created_at", {
            ascending: false
        }).limit(limit);
        if (error) handleSupabaseError(error);
        return data || [];
    },
    /**
   * Saves a chat message to history.
   */ async saveChatMessage (role, message, context) {
        const { data: { user } } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].auth.getUser();
        if (!user) throw new Error("Not authenticated");
        const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from("ai_chat_history").insert({
            user_id: user.id,
            role,
            message,
            context_snapshot: context || null
        });
        if (error) handleSupabaseError(error);
    },
    /**
   * Fetches the user's AI profile (personalization data).
   */ async getUserAIProfile () {
        const { data: { user } } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].auth.getUser();
        if (!user) throw new Error("Not authenticated");
        const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from("user_ai_profiles").select("*").eq("user_id", user.id).single();
        if (error && error.code !== "PGRST116") {
            handleSupabaseError(error);
        }
        return data || null;
    },
    /**
   * Fetches recent daily aggregates.
   */ async getRecentAggregates (days = 14) {
        const { data: { user } } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].auth.getUser();
        if (!user) throw new Error("Not authenticated");
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const startDateStr = startDate.toISOString().split("T")[0];
        const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from("daily_aggregates").select("*").eq("user_id", user.id).gte("date", startDateStr).order("date", {
            ascending: false
        });
        if (error) handleSupabaseError(error);
        return data || [];
    },
    /**
   * Updates daily rating for a specific date.
   */ async updateDailyRating (date, rating) {
        const { data: { user } } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].auth.getUser();
        if (!user) throw new Error("Not authenticated");
        const clampedRating = Math.max(1, Math.min(10, rating));
        const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from("daily_aggregates").upsert({
            user_id: user.id,
            date,
            daily_rating: clampedRating
        }, {
            onConflict: "user_id,date"
        });
        if (error) handleSupabaseError(error);
    }
};
}),
"[project]/lib/store-sync.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "regenerateAIPlan",
    ()=>regenerateAIPlan,
    "syncAIPlan",
    ()=>syncAIPlan,
    "syncAIProfile",
    ()=>syncAIProfile,
    "syncStoreWithAPI",
    ()=>syncStoreWithAPI
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/store.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api.ts [app-ssr] (ecmascript)");
;
;
async function syncStoreWithAPI() {
    try {
        // Sync tasks
        try {
            const tasks = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["tasksAPI"].getAll();
            const mappedTasks = tasks.map((task)=>({
                    id: task.id,
                    title: task.title,
                    description: task.description || "",
                    priority: task.priority,
                    timeEstimate: task.time_estimate || 30,
                    completed: task.completed || false,
                    createdAt: new Date(task.created_at),
                    category: task.category,
                    dueDate: task.due_date ? new Date(task.due_date).toISOString().split("T")[0] : undefined,
                    focusMode: task.focus_mode || false
                }));
            // Update store with synced tasks
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useStore"].setState({
                tasks: mappedTasks
            });
        } catch (error) {
            console.error("Failed to sync tasks:", error);
        }
        // Sync focus sessions
        try {
            const sessions = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["focusSessionsAPI"].getAll();
            const mappedSessions = sessions.map((session)=>({
                    id: session.id,
                    duration: session.duration,
                    date: new Date(session.created_at || session.date),
                    completed: session.completed || false
                }));
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useStore"].setState({
                focusSessions: mappedSessions
            });
        } catch (error) {
            console.error("Failed to sync focus sessions:", error);
        }
        // Sync AI plan
        try {
            await syncAIPlan();
        } catch (error) {
            console.error("Failed to sync AI plan:", error);
        }
        // Sync AI profile
        try {
            await syncAIProfile();
        } catch (error) {
            console.error("Failed to sync AI profile:", error);
        }
    } catch (error) {
        console.error("Failed to sync store with API:", error);
    // Don't throw - allow app to continue with local state
    }
}
async function syncAIPlan() {
    try {
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useStore"].setState({
            aiPlanLoading: true,
            aiPlanError: null
        });
        const today = new Date().toISOString().split("T")[0];
        const plan = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["aiAPI"].getDailyPlan(today);
        if (plan) {
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useStore"].setState({
                currentAIPlan: plan,
                currentSchedule: plan.schedule || []
            });
        }
    } catch (error) {
        console.error("Failed to sync AI plan:", error);
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useStore"].setState({
            aiPlanError: "Failed to load AI plan"
        });
    } finally{
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useStore"].setState({
            aiPlanLoading: false
        });
    }
}
async function syncAIProfile() {
    try {
        const profile = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["aiAPI"].getUserAIProfile();
        if (profile) {
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useStore"].setState({
                userAIProfile: {
                    optimal_focus_duration: profile.optimal_focus_duration,
                    preferred_work_start_hour: profile.preferred_work_start_hour,
                    preferred_work_end_hour: profile.preferred_work_end_hour,
                    most_productive_hours: profile.most_productive_hours || [],
                    avg_plan_acceptance_rate: profile.avg_plan_acceptance_rate || 0
                }
            });
        }
    } catch (error) {
        console.error("Failed to sync AI profile:", error);
    // Non-critical - continue without profile
    }
}
async function regenerateAIPlan() {
    try {
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useStore"].setState({
            aiPlanLoading: true,
            aiPlanError: null
        });
        const response = await fetch("/api/ai/generate-plan", {
            method: "POST"
        });
        if (!response.ok) {
            throw new Error("Failed to generate plan");
        }
        const data = await response.json();
        if (data.plan) {
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useStore"].setState({
                currentAIPlan: data.plan,
                currentSchedule: data.plan.schedule || []
            });
        }
    } catch (error) {
        console.error("Failed to regenerate AI plan:", error);
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useStore"].setState({
            aiPlanError: "Failed to generate new plan"
        });
    } finally{
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useStore"].setState({
            aiPlanLoading: false
        });
    }
}
}),
"[project]/lib/utils.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cn",
    ()=>cn
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/clsx/dist/clsx.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-ssr] (ecmascript)");
;
;
function cn(...inputs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
}),
"[project]/app/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/store.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2d$sync$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/store-sync.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase/client.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$auth$2d$welcome$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/auth-welcome.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$onboarding$2d$flow$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/onboarding-flow.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$dashboard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/dashboard.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$day$2d$planner$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/day-planner.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$analytics$2d$dashboard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/analytics-dashboard.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$settings$2d$page$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/settings-page.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$coach$2d$panel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/coach-panel.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$navigation$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/navigation.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$task$2d$manager$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/task-manager.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mood$2d$tracker$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/mood-tracker.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$app$2d$header$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/app-header.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$blocking$2d$settings$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/blocking-settings.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$habit$2d$tracker$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/habit-tracker.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$goals$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/goals.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$distraction$2d$log$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/distraction-log.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$challenges$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/challenges.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$time$2d$block$2d$calendar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/time-block-calendar.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$focus$2d$sounds$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/focus-sounds.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$reports$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/reports.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$team$2d$collaboration$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/team-collaboration.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$smart$2d$notifications$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/smart-notifications.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$voice$2d$commands$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/voice-commands.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
function Home() {
    // ALL HOOKS MUST BE CALLED AT THE TOP - BEFORE ANY CONDITIONAL RETURNS
    const { auth, setAuth, currentPage, isMobileMenuOpen, setMobileMenuOpen } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useStore"])();
    const [isOnboarded, setIsOnboarded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null) // null = loading, false = not onboarded, true = onboarded
    ;
    const [isCheckingAuth, setIsCheckingAuth] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true) // Track if we're still checking auth
    ;
    const [hasSetInitialPage, setHasSetInitialPage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false) // Track if we've set initial page
    ;
    // Check if user is authenticated on mount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        let isMounted = true;
        const checkAuth = async ()=>{
            setIsCheckingAuth(true);
            try {
                // Check Supabase session
                const { data: { session }, error: sessionError } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].auth.getSession();
                if (sessionError || !session) {
                    // No session - show login
                    if (isMounted) {
                        setAuth(false, "");
                        setIsOnboarded(false);
                        setIsCheckingAuth(false);
                    }
                    return;
                }
                // We have a session - get user info
                try {
                    const user = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usersAPI"].getCurrentUser();
                    if (isMounted) {
                        if (user && user.email) {
                            setAuth(true, user.email);
                            // Set onboarding status - existing users should have this as true
                            const onboardingStatus = user.onboarding_completed === true;
                            setIsOnboarded(onboardingStatus);
                            setIsCheckingAuth(false);
                            // Sync data from API (don't wait for it)
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2d$sync$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["syncStoreWithAPI"])().catch((syncError)=>{
                                console.error("Failed to sync store:", syncError);
                            });
                        } else {
                            // User data not found
                            setIsOnboarded(false);
                            setIsCheckingAuth(false);
                        }
                    }
                } catch (error) {
                    console.error("Failed to get user info:", error);
                    if (isMounted) {
                        setIsOnboarded(false);
                        setIsCheckingAuth(false);
                    }
                }
            } catch (error) {
                console.error("Auth check error:", error);
                if (isMounted) {
                    // Not authenticated - show login
                    setAuth(false, "");
                    setIsOnboarded(false);
                    setIsCheckingAuth(false);
                }
            }
        };
        checkAuth();
        // Listen for auth state changes
        const { data: { subscription } } = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].auth.onAuthStateChange((event, session)=>{
            if (!isMounted) return;
            if (event === 'SIGNED_OUT' || !session) {
                setAuth(false, "");
                setIsOnboarded(false);
            } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                checkAuth();
            }
        });
        // Cleanup function
        return ()=>{
            isMounted = false;
            subscription.unsubscribe();
        };
    }, [
        setAuth
    ]); // Run only on mount
    // Set initial page to dashboard only once when user first becomes authenticated and onboarded
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (auth.isAuthenticated && isOnboarded && !isCheckingAuth && !hasSetInitialPage) {
            const { setCurrentPage, currentPage: storeCurrentPage } = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useStore"].getState();
            // Only set to dashboard if currentPage is not already set to a valid page
            // This ensures we don't override user navigation
            if (!storeCurrentPage || storeCurrentPage === "dashboard") {
                setCurrentPage("dashboard");
            }
            setHasSetInitialPage(true);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        auth.isAuthenticated,
        isOnboarded,
        isCheckingAuth
    ]); // Only depend on auth state, not currentPage
    // NOW WE CAN DO CONDITIONAL RENDERING AFTER ALL HOOKS
    if (!auth.isAuthenticated) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$auth$2d$welcome$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
            fileName: "[project]/app/page.tsx",
            lineNumber: 134,
            columnNumber: 12
        }, this);
    }
    // Show loading state while checking auth
    if (isCheckingAuth) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen bg-background flex items-center justify-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 142,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-4 text-muted-foreground",
                        children: "Loading..."
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 143,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 141,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/page.tsx",
            lineNumber: 140,
            columnNumber: 7
        }, this);
    }
    if (!isOnboarded) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$onboarding$2d$flow$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
            onComplete: async ()=>{
                try {
                    // Wait a bit to ensure session is ready
                    await new Promise((resolve)=>setTimeout(resolve, 300));
                    await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usersAPI"].updateCurrentUser({
                        onboarding_completed: true
                    });
                    setIsOnboarded(true);
                    // Ensure we're on dashboard after onboarding
                    const { setCurrentPage } = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useStore"].getState();
                    setCurrentPage("dashboard");
                } catch (error) {
                    console.error("Failed to update onboarding status:", error);
                    // Still proceed even if API call fails - user can complete onboarding later
                    setIsOnboarded(true);
                    const { setCurrentPage } = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useStore"].getState();
                    setCurrentPage("dashboard");
                }
            }
        }, void 0, false, {
            fileName: "[project]/app/page.tsx",
            lineNumber: 151,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex h-screen bg-background",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$navigation$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                isMobileOpen: isMobileMenuOpen,
                onMobileClose: ()=>setMobileMenuOpen(false)
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 175,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: "flex-1 overflow-auto lg:ml-0 flex flex-col",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$app$2d$header$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 180,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 overflow-auto",
                        children: [
                            currentPage === "dashboard" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$dashboard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 182,
                                columnNumber: 43
                            }, this),
                            currentPage === "tasks" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$task$2d$manager$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 183,
                                columnNumber: 39
                            }, this),
                            currentPage === "habits" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$habit$2d$tracker$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 184,
                                columnNumber: 40
                            }, this),
                            currentPage === "goals" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$goals$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 185,
                                columnNumber: 39
                            }, this),
                            currentPage === "mood" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mood$2d$tracker$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 186,
                                columnNumber: 38
                            }, this),
                            currentPage === "planner" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$day$2d$planner$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 187,
                                columnNumber: 41
                            }, this),
                            currentPage === "timeblocks" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$time$2d$block$2d$calendar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 188,
                                columnNumber: 44
                            }, this),
                            currentPage === "analytics" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$analytics$2d$dashboard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 189,
                                columnNumber: 43
                            }, this),
                            currentPage === "distractions" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$distraction$2d$log$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 190,
                                columnNumber: 46
                            }, this),
                            currentPage === "challenges" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$challenges$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 191,
                                columnNumber: 44
                            }, this),
                            currentPage === "sounds" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$focus$2d$sounds$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 192,
                                columnNumber: 40
                            }, this),
                            currentPage === "reports" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$reports$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 193,
                                columnNumber: 41
                            }, this),
                            currentPage === "team" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$team$2d$collaboration$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 194,
                                columnNumber: 38
                            }, this),
                            currentPage === "notifications" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$smart$2d$notifications$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 195,
                                columnNumber: 47
                            }, this),
                            currentPage === "voice" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$voice$2d$commands$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 196,
                                columnNumber: 39
                            }, this),
                            currentPage === "blocking" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$blocking$2d$settings$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 197,
                                columnNumber: 42
                            }, this),
                            currentPage === "settings" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$settings$2d$page$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 198,
                                columnNumber: 42
                            }, this),
                            currentPage === "coach" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$coach$2d$panel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 199,
                                columnNumber: 39
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 181,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 179,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 174,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=_7a818192._.js.map