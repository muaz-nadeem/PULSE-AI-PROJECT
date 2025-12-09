import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { callGeminiJSON } from '@/lib/ai/gemini-client';

interface SubTask {
  title: string;
  description?: string;
  estimatedMinutes: number;
  priority: 'high' | 'medium' | 'low';
  order: number;
}

interface DecompositionResult {
  originalTask: string;
  subTasks: SubTask[];
  totalEstimatedMinutes: number;
  reasoning: string;
  tips: string[];
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { task, context } = body;

    if (!task || typeof task !== 'string' || task.trim().length < 3) {
      return NextResponse.json(
        { error: 'Please provide a valid task description' },
        { status: 400 }
      );
    }

    const result = await decomposeTask(task.trim(), context);

    // Save decomposition history
    await supabase.from('task_decompositions').insert({
      user_id: user.id,
      original_task: task.trim(),
      sub_tasks: result.subTasks,
      total_estimated_minutes: result.totalEstimatedMinutes,
      model_version: 'gemini-2.5-flash',
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Task decomposition error:', error);
    return NextResponse.json({ error: 'Failed to decompose task' }, { status: 500 });
  }
}

async function decomposeTask(task: string, context?: string): Promise<DecompositionResult> {
  const prompt = `Break down this task into smaller, actionable sub-tasks:

Task: "${task}"
${context ? `Context: ${context}` : ''}

Requirements:
1. Create 3-7 sub-tasks that together complete the main task
2. Each sub-task should be specific and actionable (can be done in one sitting)
3. Estimate time in minutes for each (realistic estimates, 15-120 min range)
4. Assign priority: high (critical path), medium (important), low (nice to have)
5. Order them logically (dependencies first)

Return a JSON object with this exact structure:
{
  "subTasks": [
    {
      "title": "Clear, actionable sub-task title",
      "description": "Brief explanation if needed",
      "estimatedMinutes": 30,
      "priority": "high",
      "order": 1
    }
  ],
  "reasoning": "Brief explanation of how you broke down the task",
  "tips": ["Helpful tip for completing this task", "Another tip"]
}

Be specific and practical. Return ONLY valid JSON.`;

  const systemInstruction = `You are a productivity expert that helps break down complex tasks into manageable sub-tasks. Focus on creating actionable, specific tasks that can be completed in one focused session. Be practical with time estimates.`;

  try {
    const response = await callGeminiJSON<{
      subTasks: SubTask[];
      reasoning: string;
      tips: string[];
    }>(prompt, systemInstruction);

    // Validate and sanitize response
    const subTasks = response.subTasks.map((task, index) => ({
      title: task.title || `Sub-task ${index + 1}`,
      description: task.description,
      estimatedMinutes: Math.max(15, Math.min(120, task.estimatedMinutes || 30)),
      priority: ['high', 'medium', 'low'].includes(task.priority) ? task.priority : 'medium',
      order: task.order || index + 1,
    })) as SubTask[];

    const totalEstimatedMinutes = subTasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);

    return {
      originalTask: task,
      subTasks: subTasks.sort((a, b) => a.order - b.order),
      totalEstimatedMinutes,
      reasoning: response.reasoning || 'Task broken down into manageable steps.',
      tips: response.tips || [],
    };
  } catch (error) {
    console.error('AI decomposition failed:', error);
    
    // Fallback: create a simple breakdown
    return {
      originalTask: task,
      subTasks: [
        {
          title: `Research and plan: ${task}`,
          description: 'Gather information and create an action plan',
          estimatedMinutes: 30,
          priority: 'high',
          order: 1,
        },
        {
          title: `Execute main work: ${task}`,
          description: 'Complete the core task',
          estimatedMinutes: 60,
          priority: 'high',
          order: 2,
        },
        {
          title: `Review and finalize: ${task}`,
          description: 'Review work and make final adjustments',
          estimatedMinutes: 20,
          priority: 'medium',
          order: 3,
        },
      ],
      totalEstimatedMinutes: 110,
      reasoning: 'Standard task breakdown: plan, execute, review.',
      tips: ['Start with the planning phase to understand the full scope.'],
    };
  }
}

// GET - Get decomposition history
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const { data: history, error } = await supabase
      .from('task_decompositions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching decomposition history:', error);
      return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
    }

    return NextResponse.json({ history });
  } catch (error) {
    console.error('Get decomposition history error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

