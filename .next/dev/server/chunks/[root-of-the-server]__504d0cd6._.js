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
"[project]/lib/ai/coach-service.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "detectSimpleIntent",
    ()=>detectSimpleIntent,
    "getCoachResponse",
    ()=>getCoachResponse,
    "getQuickResponse",
    ()=>getQuickResponse,
    "processCoachMessage",
    ()=>processCoachMessage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$ai$2f$gemini$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/ai/gemini-client.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$ai$2f$prompt$2d$builder$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/ai/prompt-builder.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$ai$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/ai/logger.ts [app-route] (ecmascript)");
;
;
;
async function getCoachResponse(userId, userMessage, context, conversationHistory) {
    const startTime = Date.now();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$ai$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logAIEvent"])('coach_request_start', {
        userId,
        messageLength: userMessage.length,
        historyLength: conversationHistory.length
    });
    try {
        // Sanitize user input to prevent prompt injection
        const sanitizedMessage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$ai$2f$prompt$2d$builder$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sanitizeUserInput"])(userMessage);
        // Build the prompt
        const prompt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$ai$2f$prompt$2d$builder$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildCoachPrompt"])(sanitizedMessage, context, conversationHistory);
        const systemInstruction = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$ai$2f$prompt$2d$builder$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCoachSystemInstruction"])();
        // Convert conversation history to Gemini format
        const geminiHistory = conversationHistory.slice(-10).map((msg)=>({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: msg.message
            }));
        // Call Gemini
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$ai$2f$gemini$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["callGemini"])(prompt, systemInstruction, geminiHistory);
        const latency = Date.now() - startTime;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$ai$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logAIMetrics"])('coach_response', {
            latencyMs: latency,
            success: true,
            userId
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$ai$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logAIEvent"])('coach_response_success', {
            userId,
            latencyMs: latency,
            responseLength: response.text.length
        });
        return response.text;
    } catch (error) {
        const latency = Date.now() - startTime;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$ai$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logAIMetrics"])('coach_response', {
            latencyMs: latency,
            success: false,
            userId
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$ai$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logAIError"])(error, {
            operation: 'getCoachResponse',
            userId,
            messagePreview: userMessage.slice(0, 100)
        });
        // Return a friendly fallback message
        return getFallbackCoachResponse(userMessage);
    }
}
/**
 * Generates a fallback response when AI is unavailable.
 */ function getFallbackCoachResponse(userMessage) {
    const lowerMessage = userMessage.toLowerCase();
    // Try to match common queries
    if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
        return "I can help you with productivity tips, task prioritization, focus strategies, and goal tracking. I'm having some connection issues right now, but feel free to ask me anything!";
    }
    if (lowerMessage.includes('focus') || lowerMessage.includes('concentrate')) {
        return "For better focus, try the Pomodoro technique: 25 minutes of focused work followed by a 5-minute break. Also, consider silencing notifications during deep work sessions.";
    }
    if (lowerMessage.includes('task') || lowerMessage.includes('priorit')) {
        return "A good approach is to tackle your most important or difficult task first thing when your energy is highest. Try categorizing tasks by urgency and importance.";
    }
    if (lowerMessage.includes('break') || lowerMessage.includes('tired')) {
        return "Taking regular breaks is essential! Try stepping away from your screen, doing some light stretching, or taking a short walk. Your brain needs rest to perform at its best.";
    }
    if (lowerMessage.includes('goal') || lowerMessage.includes('achieve')) {
        return "Break your goals into smaller, actionable milestones. Celebrate each milestone to stay motivated, and review your progress regularly to stay on track.";
    }
    // Default response
    return "Thanks for reaching out! I'm here to help with your productivity journey. I'm experiencing some temporary issues, but please feel free to ask me about tasks, focus strategies, or goal planning.";
}
function getQuickResponse(intent) {
    const quickResponses = {
        greeting: "Hey! Ready to make today productive. How can I help?",
        thanks: "You're welcome! Keep up the great work. 💪",
        bye: "Good luck with your tasks! Remember, progress over perfection."
    };
    return quickResponses[intent] || null;
}
function detectSimpleIntent(message) {
    const lowerMessage = message.toLowerCase().trim();
    // Greetings
    if (/^(hi|hello|hey|good morning|good afternoon|good evening)[\s!.]*$/i.test(lowerMessage)) {
        return 'greeting';
    }
    // Thanks
    if (/^(thanks|thank you|thx|ty)[\s!.]*$/i.test(lowerMessage)) {
        return 'thanks';
    }
    // Goodbye
    if (/^(bye|goodbye|see you|later|cya)[\s!.]*$/i.test(lowerMessage)) {
        return 'bye';
    }
    return null;
}
async function processCoachMessage(userId, userMessage, context, conversationHistory) {
    // Check for simple intents first
    const simpleIntent = detectSimpleIntent(userMessage);
    if (simpleIntent) {
        const quickResponse = getQuickResponse(simpleIntent);
        if (quickResponse) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$ai$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logAIEvent"])('coach_quick_response', {
                userId,
                intent: simpleIntent
            });
            return quickResponse;
        }
    }
    // Use AI for complex messages
    return getCoachResponse(userId, userMessage, context, conversationHistory);
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
"[project]/app/api/ai/coach/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase/server.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$ai$2f$coach$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/ai/coach-service.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$ai$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/ai/logger.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$ai$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/ai/types.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$ai$2f$prompt$2d$builder$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/ai/prompt-builder.ts [app-route] (ecmascript)");
;
;
;
;
;
;
async function POST(request) {
    // Check if AI coach is enabled
    if (!__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$ai$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["aiConfig"].featuresEnabled || !__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$ai$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["aiConfig"].coachEnabled) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'AI Coach is disabled'
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
        // Parse request body
        const body = await request.json();
        const { message } = body;
        if (!message || typeof message !== 'string') {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Message is required'
            }, {
                status: 400
            });
        }
        // Sanitize input
        const sanitizedMessage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$ai$2f$prompt$2d$builder$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sanitizeUserInput"])(message);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$ai$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logAIFeatureUsage"])('ai_coach', user.id, {
            messageLength: message.length
        });
        // Fetch context for the coach
        const context = await buildCoachContext(supabase, user.id);
        // Fetch recent conversation history
        const { data: chatHistory } = await supabase.from('ai_chat_history').select('role, message').eq('user_id', user.id).order('created_at', {
            ascending: false
        }).limit(10);
        const conversationHistory = (chatHistory || []).reverse().map((msg)=>({
                role: msg.role,
                message: msg.message
            }));
        // Get coach response
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$ai$2f$coach$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["processCoachMessage"])(user.id, sanitizedMessage, context, conversationHistory);
        // Save both messages to history
        const messagesToSave = [
            {
                user_id: user.id,
                role: 'user',
                message: sanitizedMessage,
                context_snapshot: {
                    taskCount: context.recentTasks.length,
                    focusMinutes: context.recentFocus.totalMinutes,
                    goalCount: context.currentGoals.length
                }
            },
            {
                user_id: user.id,
                role: 'assistant',
                message: response,
                context_snapshot: null
            }
        ];
        await supabase.from('ai_chat_history').insert(messagesToSave);
        const latency = Date.now() - startTime;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$ai$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logAIEvent"])('coach_response_sent', {
            userId: user.id,
            latencyMs: latency,
            responseLength: response.length
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            response,
            latencyMs: latency
        });
    } catch (error) {
        const latency = Date.now() - startTime;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$ai$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logAIError"])(error, {
            operation: 'ai_coach',
            latencyMs: latency
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to get coach response',
            latencyMs: latency
        }, {
            status: 500
        });
    }
}
/**
 * Builds context for the AI coach from user data.
 */ async function buildCoachContext(supabase, userId) {
    // Fetch recent data
    const [tasksRes, focusRes, goalsRes, planRes] = await Promise.all([
        supabase.from('tasks').select('*').eq('user_id', userId).order('created_at', {
            ascending: false
        }).limit(20),
        supabase.from('focus_sessions').select('*').eq('user_id', userId).order('created_at', {
            ascending: false
        }).limit(10),
        supabase.from('goals').select('*').eq('user_id', userId).eq('status', 'active'),
        supabase.from('ai_plans').select('status, schedule').eq('user_id', userId).eq('plan_date', new Date().toISOString().split('T')[0]).single()
    ]);
    const tasks = tasksRes.data || [];
    const focusSessions = focusRes.data || [];
    const goals = goalsRes.data || [];
    const todaysPlan = planRes.data;
    // Map tasks to expected format
    const recentTasks = tasks.map((t)=>({
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
    // Map goals
    const currentGoals = goals.map((g)=>({
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
    // Calculate focus stats
    const totalFocusMinutes = focusSessions.reduce((sum, s)=>sum + (s.duration || 0), 0);
    // Build plan info if exists
    let todaysPlanInfo = undefined;
    if (todaysPlan) {
        const schedule = todaysPlan.schedule || [];
        const completedInPlan = schedule.filter((item)=>{
            const matchingTask = tasks.find((t)=>t.id === item.taskId);
            return matchingTask?.completed;
        }).length;
        todaysPlanInfo = {
            accepted: todaysPlan.status === 'accepted',
            tasksCompleted: completedInPlan,
            totalTasks: schedule.filter((item)=>item.type === 'work').length
        };
    }
    return {
        recentTasks,
        recentFocus: {
            totalMinutes: totalFocusMinutes,
            sessionCount: focusSessions.length
        },
        currentGoals,
        todaysPlan: todaysPlanInfo
    };
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__504d0cd6._.js.map