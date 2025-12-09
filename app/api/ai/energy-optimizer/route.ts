import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { callGeminiJSON } from '@/lib/ai/gemini-client';

interface EnergyEntry {
  energy_level: number;
  recorded_at: string;
  hour_of_day: number;
  notes?: string;
}

interface EnergyAnalysis {
  peakHours: number[];
  moderateHours: number[];
  lowHours: number[];
  hourlyAverages: { hour: number; average: number }[];
  insights: string[];
  recommendations: {
    focusStart: number;
    focusEnd: number;
    breakFrequency: number;
    taskScheduling: string[];
  };
}

// POST - Record new energy entry
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { energyLevel, notes, context } = body;

    if (!energyLevel || energyLevel < 1 || energyLevel > 5) {
      return NextResponse.json(
        { error: 'Energy level must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Insert energy entry
    const { data: entry, error } = await supabase
      .from('energy_entries')
      .insert({
        user_id: user.id,
        energy_level: energyLevel,
        notes: notes || null,
        context: context || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving energy entry:', error);
      return NextResponse.json({ error: 'Failed to save energy entry' }, { status: 500 });
    }

    return NextResponse.json({ success: true, entry });
  } catch (error) {
    console.error('Energy entry error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET - Get energy analysis and suggestions
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const analyze = searchParams.get('analyze') === 'true';
    const days = parseInt(searchParams.get('days') || '14');

    // Get recent energy entries
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const { data: entries, error: entriesError } = await supabase
      .from('energy_entries')
      .select('*')
      .eq('user_id', user.id)
      .gte('recorded_at', cutoffDate.toISOString())
      .order('recorded_at', { ascending: false });

    if (entriesError) {
      console.error('Error fetching energy entries:', entriesError);
      return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 });
    }

    // Get existing patterns
    const { data: patterns } = await supabase
      .from('user_energy_patterns')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!analyze) {
      return NextResponse.json({
        entries: entries || [],
        patterns: patterns || null,
        todayEntries: (entries || []).filter(e => {
          const today = new Date().toDateString();
          return new Date(e.recorded_at).toDateString() === today;
        }),
      });
    }

    // Analyze patterns with AI
    if (!entries || entries.length < 3) {
      return NextResponse.json({
        entries: entries || [],
        patterns: null,
        message: 'Need at least 3 energy entries for analysis',
      });
    }

    const analysis = await analyzeEnergyPatterns(entries, user.id);

    // Save updated patterns
    const { error: updateError } = await supabase
      .from('user_energy_patterns')
      .upsert({
        user_id: user.id,
        hourly_averages: analysis.hourlyAverages,
        peak_hours: analysis.peakHours,
        moderate_hours: analysis.moderateHours,
        low_hours: analysis.lowHours,
        insights: analysis.insights,
        recommended_focus_start: analysis.recommendations.focusStart,
        recommended_focus_end: analysis.recommendations.focusEnd,
        recommended_break_frequency: analysis.recommendations.breakFrequency,
        total_entries_analyzed: entries.length,
        last_analyzed_at: new Date().toISOString(),
        confidence_score: Math.min(entries.length / 30, 1),
      });

    if (updateError) {
      console.error('Error updating patterns:', updateError);
    }

    return NextResponse.json({
      entries,
      analysis,
      patterns: {
        ...patterns,
        ...analysis,
      },
    });
  } catch (error) {
    console.error('Energy analysis error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function analyzeEnergyPatterns(entries: EnergyEntry[], userId: string): Promise<EnergyAnalysis> {
  // Calculate hourly averages
  const hourlyData: { [hour: number]: number[] } = {};
  
  for (const entry of entries) {
    const hour = entry.hour_of_day;
    if (!hourlyData[hour]) {
      hourlyData[hour] = [];
    }
    hourlyData[hour].push(entry.energy_level);
  }

  const hourlyAverages = Object.entries(hourlyData).map(([hour, levels]) => ({
    hour: parseInt(hour),
    average: levels.reduce((a, b) => a + b, 0) / levels.length,
  })).sort((a, b) => a.hour - b.hour);

  // Categorize hours
  const sortedByEnergy = [...hourlyAverages].sort((a, b) => b.average - a.average);
  const peakHours = sortedByEnergy.slice(0, 4).map(h => h.hour).sort((a, b) => a - b);
  const lowHours = sortedByEnergy.slice(-4).map(h => h.hour).sort((a, b) => a - b);
  const moderateHours = hourlyAverages
    .map(h => h.hour)
    .filter(h => !peakHours.includes(h) && !lowHours.includes(h))
    .sort((a, b) => a - b);

  // Use AI to generate insights
  const prompt = `Analyze this user's energy patterns and provide productivity recommendations.

Energy data (hourly averages, 1=very low, 5=peak):
${hourlyAverages.map(h => `${h.hour}:00 - ${h.average.toFixed(1)}`).join('\n')}

Peak energy hours: ${peakHours.join(', ')}
Low energy hours: ${lowHours.join(', ')}

Based on this data, provide a JSON response with:
1. "insights": Array of 3-4 short, actionable insights about their energy patterns
2. "taskScheduling": Array of 3-4 specific recommendations for scheduling different types of tasks
3. "focusStart": Best hour to start focused work (integer 0-23)
4. "focusEnd": Best hour to end focused work (integer 0-23)
5. "breakFrequency": Recommended minutes between breaks (integer)

Example response:
{
  "insights": ["Your energy peaks between 9-11am", "Consider a power nap around 2pm"],
  "taskScheduling": ["Schedule creative work before 11am", "Save emails for after lunch"],
  "focusStart": 9,
  "focusEnd": 12,
  "breakFrequency": 45
}

Return ONLY valid JSON.`;

  const systemInstruction = `You are an energy and productivity optimization AI. Analyze energy patterns and provide practical, specific recommendations. Be concise and actionable. Always return valid JSON.`;

  try {
    const aiAnalysis = await callGeminiJSON<{
      insights: string[];
      taskScheduling: string[];
      focusStart: number;
      focusEnd: number;
      breakFrequency: number;
    }>(prompt, systemInstruction);

    return {
      peakHours,
      moderateHours,
      lowHours,
      hourlyAverages,
      insights: aiAnalysis.insights,
      recommendations: {
        focusStart: aiAnalysis.focusStart,
        focusEnd: aiAnalysis.focusEnd,
        breakFrequency: aiAnalysis.breakFrequency,
        taskScheduling: aiAnalysis.taskScheduling,
      },
    };
  } catch (error) {
    console.error('AI analysis failed, using fallback:', error);
    
    // Fallback analysis without AI
    const firstPeak = peakHours[0] || 9;
    const lastPeak = peakHours[peakHours.length - 1] || 12;
    
    return {
      peakHours,
      moderateHours,
      lowHours,
      hourlyAverages,
      insights: [
        `Your peak energy hours are around ${peakHours.slice(0, 2).join('-')}:00`,
        `Energy tends to dip around ${lowHours[0]}:00 - consider a break`,
        `You have ${entries.length} energy records in the analysis period`,
      ],
      recommendations: {
        focusStart: firstPeak,
        focusEnd: Math.min(lastPeak + 2, 18),
        breakFrequency: 45,
        taskScheduling: [
          `Schedule important tasks during your peak hours (${peakHours.slice(0, 2).join('-')}:00)`,
          'Take breaks during low energy periods',
          'Save routine tasks for moderate energy times',
        ],
      },
    };
  }
}

