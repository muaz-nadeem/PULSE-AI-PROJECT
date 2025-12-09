module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/lib/supabase/server.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createClient",
    ()=>createClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/createServerClient.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/headers.js [app-route] (ecmascript)");
;
;
async function createClient() {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createServerClient"])(("TURBOPACK compile-time value", "https://yyfbfttutejbykkeuktm.supabase.co"), ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5ZmJmdHR1dGVqYnlra2V1a3RtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMDU5ODcsImV4cCI6MjA4MDc4MTk4N30.sIhJws6nPUOIaHvZj2QI8JB1hE5wEE6I-WPCqwR1qgE"), {
        cookies: {
            getAll () {
                return cookieStore.getAll();
            },
            setAll (cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options })=>cookieStore.set(name, value, options));
                } catch  {
                // The `setAll` method was called from a Server Component.
                // This can be ignored if you have middleware refreshing
                // user sessions.
                }
            }
        }
    });
}
}),
"[project]/lib/ai/logger.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * AI System Logger
 * Provides structured logging for AI operations, useful for debugging and monitoring.
 */ __turbopack_context__.s([
    "logAIError",
    ()=>logAIError,
    "logAIEvent",
    ()=>logAIEvent,
    "logAIFeatureUsage",
    ()=>logAIFeatureUsage,
    "logAIMetrics",
    ()=>logAIMetrics
]);
function logAIEvent(event, data) {
    const logEntry = {
        timestamp: new Date().toISOString(),
        event,
        data
    };
    // Development: console logging
    if ("TURBOPACK compile-time truthy", 1) {
        console.log('[AI]', JSON.stringify(logEntry, null, 2));
    } else //TURBOPACK unreachable
    ;
// TODO: Add integration with monitoring service (e.g., Sentry, LogRocket, Datadog)
// Example:
// if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
//   sendToMonitoringService(logEntry);
// }
}
function logAIError(error, context) {
    const errorEntry = {
        timestamp: new Date().toISOString(),
        error: {
            message: error.message,
            stack: error.stack
        },
        context
    };
    console.error('[AI ERROR]', JSON.stringify(errorEntry, null, 2));
// TODO: Add integration with error tracking service
// Example:
// if (process.env.NODE_ENV === 'production') {
//   Sentry.captureException(error, { extra: context });
// }
}
function logAIMetrics(operation, metrics) {
    logAIEvent('ai_metrics', {
        operation,
        ...metrics
    });
}
function logAIFeatureUsage(feature, userId, metadata) {
    logAIEvent('ai_feature_usage', {
        feature,
        userId,
        ...metadata
    });
}
}),
"[project]/lib/ai/gemini-client.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "callGemini",
    ()=>callGemini,
    "callGeminiJSON",
    ()=>callGeminiJSON,
    "isGeminiConfigured",
    ()=>isGeminiConfigured
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@google/generative-ai/dist/index.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$ai$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/ai/logger.ts [app-route] (ecmascript)");
;
;
// Initialize Gemini client
const genAI = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GoogleGenerativeAI"](process.env.GEMINI_API_KEY || '');
// Safety settings to allow productivity-related content
const safetySettings = [
    {
        category: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["HarmCategory"].HARM_CATEGORY_HARASSMENT,
        threshold: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["HarmBlockThreshold"].BLOCK_MEDIUM_AND_ABOVE
    },
    {
        category: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["HarmCategory"].HARM_CATEGORY_HATE_SPEECH,
        threshold: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["HarmBlockThreshold"].BLOCK_MEDIUM_AND_ABOVE
    },
    {
        category: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["HarmCategory"].HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["HarmBlockThreshold"].BLOCK_MEDIUM_AND_ABOVE
    },
    {
        category: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["HarmCategory"].HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["HarmBlockThreshold"].BLOCK_MEDIUM_AND_ABOVE
    }
];
async function callGemini(prompt, systemInstruction, conversationHistory) {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY environment variable is not set');
    }
    const startTime = Date.now();
    try {
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            systemInstruction: systemInstruction,
            safetySettings,
            generationConfig: {
                temperature: 0.7,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 2048
            }
        });
        let result;
        if (conversationHistory && conversationHistory.length > 0) {
            // Use chat mode for conversations
            const chat = model.startChat({
                history: conversationHistory.map((msg)=>({
                        role: msg.role,
                        parts: [
                            {
                                text: msg.parts
                            }
                        ]
                    }))
            });
            result = await chat.sendMessage(prompt);
        } else {
            // Use simple generation for single prompts
            result = await model.generateContent(prompt);
        }
        const response = result.response;
        const text = response.text();
        const latency = Date.now() - startTime;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$ai$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logAIEvent"])('gemini_call_success', {
            latencyMs: latency,
            promptLength: prompt.length,
            responseLength: text.length,
            promptTokens: response.usageMetadata?.promptTokenCount || 0,
            completionTokens: response.usageMetadata?.candidatesTokenCount || 0
        });
        return {
            text,
            usage: {
                promptTokens: response.usageMetadata?.promptTokenCount || 0,
                completionTokens: response.usageMetadata?.candidatesTokenCount || 0
            }
        };
    } catch (error) {
        const latency = Date.now() - startTime;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$ai$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logAIError"])(error, {
            operation: 'callGemini',
            latencyMs: latency,
            promptLength: prompt.length
        });
        throw new Error(`Gemini API call failed: ${error.message}`);
    }
}
async function callGeminiJSON(prompt, systemInstruction) {
    const response = await callGemini(prompt, systemInstruction);
    try {
        // Try to extract JSON from the response
        let jsonText = response.text.trim();
        // Handle markdown code blocks
        if (jsonText.startsWith('```json')) {
            jsonText = jsonText.slice(7);
        } else if (jsonText.startsWith('```')) {
            jsonText = jsonText.slice(3);
        }
        if (jsonText.endsWith('```')) {
            jsonText = jsonText.slice(0, -3);
        }
        jsonText = jsonText.trim();
        const parsed = JSON.parse(jsonText);
        return parsed;
    } catch (parseError) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$ai$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logAIError"])(parseError, {
            operation: 'callGeminiJSON',
            rawResponse: response.text.slice(0, 500)
        });
        throw new Error(`Failed to parse Gemini response as JSON: ${parseError.message}`);
    }
}
function isGeminiConfigured() {
    return !!process.env.GEMINI_API_KEY;
}
}),
"[project]/lib/ai/prompt-builder.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildCoachPrompt",
    ()=>buildCoachPrompt,
    "buildSchedulePrompt",
    ()=>buildSchedulePrompt,
    "getCoachSystemInstruction",
    ()=>getCoachSystemInstruction,
    "getScheduleSystemInstruction",
    ()=>getScheduleSystemInstruction,
    "sanitizeUserInput",
    ()=>sanitizeUserInput
]);
function buildSchedulePrompt(context) {
    const { user, profile, recentAggregates, todaysTasks, activeGoals } = context;
    // Compute summary stats from recent aggregates
    const avgFocusTime = recentAggregates.length > 0 ? recentAggregates.reduce((sum, a)=>sum + (a.total_focus_minutes || 0), 0) / recentAggregates.length : 0;
    const avgCompletionRate = recentAggregates.length > 0 ? recentAggregates.reduce((sum, a)=>sum + (a.completion_rate || 0), 0) / recentAggregates.length : 0;
    const avgDailyRating = recentAggregates.filter((a)=>a.daily_rating).length > 0 ? recentAggregates.filter((a)=>a.daily_rating).reduce((sum, a)=>sum + (a.daily_rating || 0), 0) / recentAggregates.filter((a)=>a.daily_rating).length : null;
    // Format productive hours
    const productiveHoursStr = profile.most_productive_hours.length > 0 ? profile.most_productive_hours.map((h)=>`${h}:00`).join(', ') : 'Not yet determined';
    // Format distraction times
    const distractionTimesStr = profile.common_distraction_times.length > 0 ? profile.common_distraction_times.map((h)=>`${h}:00`).join(', ') : 'None identified';
    // Sort tasks by priority
    const sortedTasks = [
        ...todaysTasks
    ].sort((a, b)=>{
        const priorityOrder = {
            high: 0,
            medium: 1,
            low: 2
        };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    return `You are an AI productivity coach helping ${user.name || 'the user'} plan their day.

**User's Personalization Profile:**
- Optimal focus duration: ${profile.optimal_focus_duration} minutes
- Preferred work hours: ${profile.preferred_work_start_hour}:00 - ${profile.preferred_work_end_hour}:00
- Preferred break duration: ${profile.preferred_break_duration} minutes
- Most productive hours: ${productiveHoursStr}
- Common distraction times: ${distractionTimesStr}

**Recent Performance (last ${recentAggregates.length} days):**
- Average focus time: ${Math.round(avgFocusTime)} minutes/day
- Average task completion rate: ${(avgCompletionRate * 100).toFixed(1)}%
- Plan acceptance rate: ${((profile.avg_plan_acceptance_rate || 0) * 100).toFixed(1)}%
${avgDailyRating ? `- Average daily satisfaction: ${avgDailyRating.toFixed(1)}/10` : ''}

**Today's Tasks (${sortedTasks.length} total):**
${sortedTasks.slice(0, 10).map((t, i)=>`${i + 1}. [${t.priority.toUpperCase()}] ${t.title} (${t.timeEstimate} min)${t.dueDate ? ` - Due: ${t.dueDate}` : ''}${t.category ? ` [${t.category}]` : ''}`).join('\n')}
${sortedTasks.length > 10 ? `\n... and ${sortedTasks.length - 10} more tasks` : ''}
${sortedTasks.length === 0 ? 'No tasks scheduled yet. Suggest a productive day structure.' : ''}

**Active Goals:**
${activeGoals.slice(0, 5).map((g)=>`- ${g.title} (${g.progress}% complete)${g.targetDate ? ` - Target: ${g.targetDate}` : ''}`).join('\n')}
${activeGoals.length === 0 ? 'No active goals set.' : ''}

**Current Time:** ${context.currentTime}

**Instructions:**
1. Create a realistic schedule for today starting from the current time
2. Prioritize high-priority tasks during the user's most productive hours (${productiveHoursStr})
3. Include breaks of ${profile.preferred_break_duration} minutes after every ${profile.optimal_focus_duration} minutes of work
4. Avoid scheduling demanding tasks during distraction-prone times (${distractionTimesStr})
5. Keep focus blocks around ${profile.optimal_focus_duration} minutes
6. Leave some buffer time between tasks
7. Consider task due dates when prioritizing

Return a JSON object with this exact structure:
{
  "schedule": [
    {
      "time": "HH:MM",
      "duration": <minutes as number>,
      "task": "<task description>",
      "priority": "high" | "medium" | "low",
      "taskId": "<task id if matching a user task, or null>",
      "type": "work" | "break" | "meeting"
    }
  ],
  "explanation": "<2-3 sentence personalized explanation of why this schedule is optimized for the user>",
  "reasoning": {
    "focusHours": ["<hours where deep work is scheduled>"],
    "breakStrategy": "<brief explanation of break placement>",
    "prioritization": "<brief explanation of task order>"
  }
}

Important: Ensure the JSON is valid and parseable.`;
}
function getScheduleSystemInstruction() {
    return `You are an expert productivity coach AI. Your role is to create personalized daily schedules that maximize the user's productivity while maintaining work-life balance.

Key principles:
- Always respect the user's preferred work hours
- Schedule high-priority and cognitively demanding tasks during peak productivity hours
- Include regular breaks to prevent burnout
- Be realistic about time estimates
- Consider task dependencies and energy levels throughout the day
- Always respond with valid, parseable JSON matching the requested schema
- Keep explanations concise but personalized`;
}
function buildCoachPrompt(userMessage, context, conversationHistory) {
    const completedTasks = context.recentTasks.filter((t)=>t.completed).length;
    const totalTasks = context.recentTasks.length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(0) : 0;
    return `The user just said: "${userMessage}"

**Current User Context:**
- Recent tasks: ${totalTasks} tasks (${completedTasks} completed, ${completionRate}% completion rate)
- Recent focus time: ${context.recentFocus.totalMinutes} minutes${context.recentFocus.sessionCount ? ` across ${context.recentFocus.sessionCount} sessions` : ''}
- Active goals: ${context.currentGoals.length} goals in progress
${context.todaysPlan ? `- Today's plan: ${context.todaysPlan.accepted ? 'Accepted' : 'Pending'}, ${context.todaysPlan.tasksCompleted}/${context.todaysPlan.totalTasks} tasks done` : ''}

**Recent Conversation:**
${conversationHistory.slice(-5).map((h)=>`${h.role === 'user' ? 'User' : 'Coach'}: ${h.message}`).join('\n')}

Respond as a supportive, knowledgeable productivity coach. Reference their actual data when relevant. Keep responses concise (2-4 sentences) and actionable.`;
}
function getCoachSystemInstruction() {
    return `You are a supportive and knowledgeable AI productivity coach called "Pulse Coach". Your personality is:
- Encouraging but realistic
- Data-driven (reference user's actual stats when helpful)
- Action-oriented (give specific, practical advice)
- Empathetic (acknowledge challenges and celebrate wins)

Guidelines:
- Keep responses concise (2-4 sentences max)
- Offer specific suggestions when asked for help
- Celebrate achievements and progress
- Provide gentle accountability when needed
- Never be preachy or condescending
- Reference the user's actual data to personalize advice`;
}
function sanitizeUserInput(input) {
    // Remove potential instruction override attempts
    let sanitized = input.replace(/system:/gi, '[filtered]').replace(/instruction:/gi, '[filtered]').replace(/ignore previous/gi, '[filtered]').replace(/disregard/gi, '[filtered]');
    // Limit length
    if (sanitized.length > 2000) {
        sanitized = sanitized.slice(0, 2000) + '...';
    }
    return sanitized;
}
}),
"[project]/lib/ai/schedule-generator.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateDailySchedule",
    ()=>generateDailySchedule,
    "generateFallbackSchedule",
    ()=>generateFallbackSchedule,
    "generateScheduleWithFallback",
    ()=>generateScheduleWithFallback
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$ai$2f$gemini$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/ai/gemini-client.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$ai$2f$prompt$2d$builder$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/ai/prompt-builder.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$ai$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/ai/logger.ts [app-route] (ecmascript)");
;
;
;
async function generateDailySchedule(userId, context) {
    const startTime = Date.now();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$ai$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logAIEvent"])('schedule_generation_start', {
        userId,
        taskCount: context.todaysTasks.length,
        goalCount: context.activeGoals.length,
        aggregateDays: context.recentAggregates.length
    });
    try {
        const prompt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$ai$2f$prompt$2d$builder$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildSchedulePrompt"])(context);
        const systemInstruction = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$ai$2f$prompt$2d$builder$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getScheduleSystemInstruction"])();
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$ai$2f$gemini$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["callGeminiJSON"])(prompt, systemInstruction);
        // Validate response structure
        if (!response.schedule || !Array.isArray(response.schedule)) {
            throw new Error('Invalid schedule format: missing or invalid schedule array');
        }
        // Validate and clean schedule items
        const validatedSchedule = response.schedule.map((item, index)=>{
            // Ensure required fields exist
            if (!item.time || typeof item.duration !== 'number' || !item.task) {
                throw new Error(`Invalid schedule item at index ${index}: missing required fields`);
            }
            return {
                time: item.time,
                duration: Math.max(5, Math.min(item.duration, 240)),
                task: item.task,
                priority: [
                    'high',
                    'medium',
                    'low'
                ].includes(item.priority) ? item.priority : 'medium',
                taskId: item.taskId || undefined,
                type: [
                    'work',
                    'break',
                    'meeting'
                ].includes(item.type) ? item.type : 'work'
            };
        });
        const latency = Date.now() - startTime;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$ai$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logAIMetrics"])('schedule_generation', {
            latencyMs: latency,
            success: true,
            userId
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$ai$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logAIEvent"])('schedule_generation_success', {
            userId,
            itemCount: validatedSchedule.length,
            latencyMs: latency
        });
        return {
            userId,
            schedule: validatedSchedule,
            explanation: response.explanation || 'AI-generated schedule based on your productivity patterns.',
            reasoning: response.reasoning || {},
            modelVersion: 'gemini-1.5-flash',
            generatedAt: new Date()
        };
    } catch (error) {
        const latency = Date.now() - startTime;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$ai$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logAIMetrics"])('schedule_generation', {
            latencyMs: latency,
            success: false,
            userId
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$ai$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logAIError"])(error, {
            operation: 'generateDailySchedule',
            userId,
            contextSummary: {
                taskCount: context.todaysTasks.length,
                goalCount: context.activeGoals.length
            }
        });
        throw error;
    }
}
function generateFallbackSchedule(userId, context) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$ai$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logAIEvent"])('fallback_schedule_used', {
        userId,
        reason: 'AI unavailable'
    });
    const schedule = [];
    const startHour = context.profile.preferred_work_start_hour || 9;
    const focusDuration = context.profile.optimal_focus_duration || 25;
    const breakDuration = context.profile.preferred_break_duration || 5;
    // Sort tasks by priority
    const sortedTasks = [
        ...context.todaysTasks
    ].filter((t)=>!t.completed).sort((a, b)=>{
        const priorityOrder = {
            high: 0,
            medium: 1,
            low: 2
        };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    // Schedule up to 5 tasks with breaks
    let currentHour = startHour;
    let currentMinute = 0;
    sortedTasks.slice(0, 5).forEach((task, index)=>{
        // Add work block
        schedule.push({
            time: `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`,
            duration: Math.min(task.timeEstimate || focusDuration, focusDuration * 2),
            task: task.title,
            priority: task.priority,
            taskId: task.id,
            type: 'work'
        });
        // Calculate next time slot
        const taskDuration = Math.min(task.timeEstimate || focusDuration, focusDuration * 2);
        currentMinute += taskDuration;
        if (currentMinute >= 60) {
            currentHour += Math.floor(currentMinute / 60);
            currentMinute = currentMinute % 60;
        }
        // Add break after work (except after last task)
        if (index < Math.min(sortedTasks.length - 1, 4)) {
            schedule.push({
                time: `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`,
                duration: breakDuration,
                task: 'Short break',
                priority: 'low',
                type: 'break'
            });
            currentMinute += breakDuration;
            if (currentMinute >= 60) {
                currentHour += Math.floor(currentMinute / 60);
                currentMinute = currentMinute % 60;
            }
        }
    });
    return {
        userId,
        schedule,
        explanation: 'This is a simple schedule based on your task priorities. AI-powered scheduling is currently unavailable.',
        reasoning: {
            prioritization: 'Tasks ordered by priority (high first)',
            breakStrategy: `${breakDuration}-minute breaks between tasks`
        },
        modelVersion: 'fallback',
        generatedAt: new Date()
    };
}
async function generateScheduleWithFallback(userId, context) {
    try {
        return await generateDailySchedule(userId, context);
    } catch (error) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$ai$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logAIEvent"])('schedule_fallback_triggered', {
            userId,
            error: error.message
        });
        return generateFallbackSchedule(userId, context);
    }
}
}),
"[project]/lib/ai/types.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// AI System TypeScript Types
__turbopack_context__.s([
    "aiConfig",
    ()=>aiConfig,
    "getDefaultProfile",
    ()=>getDefaultProfile
]);
const aiConfig = {
    featuresEnabled: process.env.NEXT_PUBLIC_AI_FEATURES_ENABLED === 'true',
    dailyBrainEnabled: process.env.AI_DAILY_BRAIN_ENABLED === 'true',
    coachEnabled: process.env.AI_COACH_ENABLED === 'true'
};
function getDefaultProfile() {
    return {
        optimal_focus_duration: 25,
        preferred_work_start_hour: 9,
        preferred_work_end_hour: 17,
        preferred_break_duration: 5,
        most_productive_hours: [
            9,
            10,
            11
        ],
        common_distraction_times: [],
        hourly_performance_scores: new Array(24).fill(0.5),
        total_plans_generated: 0,
        total_plans_accepted: 0,
        total_plans_rejected: 0,
        avg_plan_acceptance_rate: 0,
        last_analyzed_date: null
    };
}
}),
"[project]/app/api/ai/generate-plan/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase/server.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$ai$2f$schedule$2d$generator$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/ai/schedule-generator.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$ai$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/ai/logger.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$ai$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/ai/types.ts [app-route] (ecmascript)");
;
;
;
;
;
async function POST(request) {
    // Check if AI features are enabled
    if (!__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$ai$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["aiConfig"].featuresEnabled) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'AI features are disabled'
        }, {
            status: 503
        });
    }
    const startTime = Date.now();
    try {
        const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createClient"])();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Unauthorized'
            }, {
                status: 401
            });
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$ai$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logAIFeatureUsage"])('manual_plan_generation', user.id);
        // Build context for schedule generation
        const context = await buildContextForUser(supabase, user.id);
        // Generate schedule
        const schedule = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$ai$2f$schedule$2d$generator$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateScheduleWithFallback"])(user.id, context);
        const todayStr = new Date().toISOString().split('T')[0];
        // Store the plan
        const { data: savedPlan, error: upsertError } = await supabase.from('ai_plans').upsert({
            user_id: user.id,
            plan_date: todayStr,
            schedule: schedule.schedule,
            explanation: schedule.explanation,
            reasoning: schedule.reasoning,
            model_version: schedule.modelVersion,
            status: 'pending',
            generated_at: new Date().toISOString()
        }, {
            onConflict: 'user_id,plan_date'
        }).select().single();
        if (upsertError) {
            throw new Error(`Failed to store plan: ${upsertError.message}`);
        }
        const latency = Date.now() - startTime;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$ai$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logAIEvent"])('manual_plan_generated', {
            userId: user.id,
            latencyMs: latency,
            scheduleItems: schedule.schedule.length
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            plan: savedPlan,
            latencyMs: latency
        });
    } catch (error) {
        const latency = Date.now() - startTime;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$ai$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logAIError"])(error, {
            operation: 'manual_plan_generation',
            latencyMs: latency
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: error.message,
            latencyMs: latency
        }, {
            status: 500
        });
    }
}
/**
 * Builds schedule context for a user using the authenticated client.
 */ async function buildContextForUser(supabase, userId) {
    // Fetch all required data in parallel
    const [userRes, profileRes, aggregatesRes, tasksRes, goalsRes] = await Promise.all([
        supabase.from('users').select('name').eq('id', userId).single(),
        supabase.from('user_ai_profiles').select('*').eq('user_id', userId).single(),
        supabase.from('daily_aggregates').select('*').eq('user_id', userId).order('date', {
            ascending: false
        }).limit(14),
        supabase.from('tasks').select('*').eq('user_id', userId).eq('completed', false).order('created_at', {
            ascending: false
        }),
        supabase.from('goals').select('*').eq('user_id', userId).eq('status', 'active')
    ]);
    // Map tasks to expected format
    const tasks = (tasksRes.data || []).map((t)=>({
            id: t.id,
            title: t.title,
            description: t.description || undefined,
            priority: t.priority,
            timeEstimate: t.time_estimate || 30,
            completed: t.completed || false,
            createdAt: new Date(t.created_at),
            category: t.category || undefined,
            dueDate: t.due_date || undefined,
            focusMode: t.focus_mode || false
        }));
    // Map goals to expected format
    const goals = (goalsRes.data || []).map((g)=>({
            id: g.id,
            title: g.title,
            description: g.description || undefined,
            category: g.category,
            targetDate: g.target_date || undefined,
            createdAt: new Date(g.created_at),
            milestones: [],
            progress: g.progress || 0,
            status: g.status,
            color: g.color
        }));
    // Get profile or create default
    let profile = profileRes.data;
    if (!profile) {
        profile = {
            ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$ai$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDefaultProfile"])(),
            user_id: userId,
            id: '',
            created_at: '',
            updated_at: ''
        };
    }
    return {
        user: {
            name: userRes.data?.name || 'User',
            timezone: 'UTC'
        },
        profile: profile,
        recentAggregates: aggregatesRes.data || [],
        todaysTasks: tasks,
        activeGoals: goals,
        currentTime: new Date().toTimeString().slice(0, 5)
    };
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__ab616774._.js.map