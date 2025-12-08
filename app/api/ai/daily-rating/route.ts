import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logAIEvent, logAIError, logAIFeatureUsage } from '@/lib/ai/logger';

/**
 * Daily Rating Endpoint
 * 
 * Allows users to rate their day (1-10) for feedback collection.
 * This data is used to improve AI plan generation over time.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { date, rating } = body;

    if (!date || typeof date !== 'string') {
      return NextResponse.json({ 
        error: 'Date is required (YYYY-MM-DD format)' 
      }, { status: 400 });
    }

    if (typeof rating !== 'number' || rating < 1 || rating > 10) {
      return NextResponse.json({ 
        error: 'Rating must be a number between 1 and 10' 
      }, { status: 400 });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json({ 
        error: 'Invalid date format. Use YYYY-MM-DD' 
      }, { status: 400 });
    }

    logAIFeatureUsage('daily_rating', user.id, { date, rating });

    // Clamp rating to valid range
    const clampedRating = Math.max(1, Math.min(10, Math.round(rating)));

    // Upsert the daily aggregate with the rating
    const { error: upsertError } = await supabase
      .from('daily_aggregates')
      .upsert({
        user_id: user.id,
        date,
        daily_rating: clampedRating,
      }, { onConflict: 'user_id,date' });

    if (upsertError) {
      throw new Error(`Failed to save rating: ${upsertError.message}`);
    }

    logAIEvent('daily_rating_saved', {
      userId: user.id,
      date,
      rating: clampedRating,
    });

    return NextResponse.json({
      success: true,
      date,
      rating: clampedRating,
    });

  } catch (error) {
    logAIError(error as Error, { operation: 'daily_rating' });
    
    return NextResponse.json({ 
      error: (error as Error).message 
    }, { status: 500 });
  }
}

/**
 * GET endpoint to fetch daily rating for a specific date
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get date from query params
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json({ 
        error: 'Date parameter is required' 
      }, { status: 400 });
    }

    // Fetch the aggregate for the date
    const { data, error } = await supabase
      .from('daily_aggregates')
      .select('daily_rating')
      .eq('user_id', user.id)
      .eq('date', date)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return NextResponse.json({
      date,
      rating: data?.daily_rating || null,
    });

  } catch (error) {
    logAIError(error as Error, { operation: 'get_daily_rating' });
    
    return NextResponse.json({ 
      error: (error as Error).message 
    }, { status: 500 });
  }
}

