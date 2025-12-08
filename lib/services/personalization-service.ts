import { supabase } from '../supabase/client';
import type { UserAIProfile } from '../ai/types';
import { getDefaultProfile } from '../ai/types';

/**
 * Updates or creates a user's AI profile based on their historical data.
 * This profile is used to personalize AI-generated schedules.
 */
export async function updateUserAIProfile(userId: string): Promise<UserAIProfile | null> {
  try {
    // Fetch recent aggregates (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

    const { data: aggregates, error: aggregatesError } = await supabase
      .from('daily_aggregates')
      .select('*')
      .eq('user_id', userId)
      .gte('date', thirtyDaysAgoStr)
      .order('date', { ascending: false });

    if (aggregatesError) {
      console.error('Failed to fetch aggregates for profile update:', aggregatesError);
      return null;
    }

    if (!aggregates || aggregates.length === 0) {
      // No data yet, create default profile
      return await ensureUserProfile(userId);
    }

    // Compute hourly performance scores (0-1)
    // Score = weighted combination of focus time and completion rate
    const hourlyScores = new Array(24).fill(0);
    const hourlyCounts = new Array(24).fill(0);

    aggregates.forEach(agg => {
      const hourlyActivity = (agg.hourly_activity as number[]) || [];
      hourlyActivity.forEach((minutes: number, hour: number) => {
        if (minutes > 0) {
          // Normalize focus time (max 60 min/hour) and combine with completion rate
          const normalizedFocus = Math.min(minutes / 60, 1);
          const completionRate = agg.completion_rate || 0;
          const score = normalizedFocus * 0.6 + completionRate * 0.4;
          hourlyScores[hour] += score;
          hourlyCounts[hour]++;
        }
      });
    });

    // Average the scores
    const normalizedScores = hourlyScores.map((sum, i) =>
      hourlyCounts[i] > 0 ? Math.round((sum / hourlyCounts[i]) * 100) / 100 : 0
    );

    // Find most productive hours (top 3 with score > 0.3)
    const mostProductiveHours = normalizedScores
      .map((score, hour) => ({ hour, score }))
      .filter(item => item.score > 0.3)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.hour);

    // Find common distraction times (hours with high distraction counts)
    const hourlyDistractions = new Array(24).fill(0);
    // Note: We'd need distraction timestamps to compute this properly
    // For now, identify hours with low focus but high activity days
    const commonDistractionTimes = normalizedScores
      .map((score, hour) => ({ hour, score }))
      .filter(item => item.score > 0 && item.score < 0.3) // Low performance hours
      .sort((a, b) => a.score - b.score)
      .slice(0, 3)
      .map(item => item.hour);

    // Compute optimal focus duration (median of successful sessions)
    const focusDurations = aggregates
      .filter(a => a.avg_focus_duration && a.completion_rate > 0.5)
      .map(a => a.avg_focus_duration);
    
    const optimalFocusDuration = focusDurations.length > 0
      ? Math.round(focusDurations.sort((a, b) => a - b)[Math.floor(focusDurations.length / 2)])
      : 25;

    // Determine preferred work hours from activity patterns
    const activeHours = normalizedScores
      .map((score, hour) => ({ hour, score }))
      .filter(item => item.score > 0.2)
      .map(item => item.hour);
    
    const preferredWorkStartHour = activeHours.length > 0 ? Math.min(...activeHours) : 9;
    const preferredWorkEndHour = activeHours.length > 0 ? Math.max(...activeHours) + 1 : 17;

    // Fetch plan acceptance stats
    const { data: plans, error: plansError } = await supabase
      .from('ai_plans')
      .select('status')
      .eq('user_id', userId)
      .gte('plan_date', thirtyDaysAgoStr);

    const totalPlans = plans?.length || 0;
    const acceptedPlans = plans?.filter(p => p.status === 'accepted').length || 0;
    const rejectedPlans = plans?.filter(p => p.status === 'rejected').length || 0;
    const acceptanceRate = totalPlans > 0 ? acceptedPlans / totalPlans : 0;

    // Upsert profile
    const profileData = {
      user_id: userId,
      optimal_focus_duration: optimalFocusDuration,
      preferred_work_start_hour: preferredWorkStartHour,
      preferred_work_end_hour: preferredWorkEndHour,
      preferred_break_duration: Math.max(5, Math.round(optimalFocusDuration / 5)), // ~20% of focus time
      hourly_performance_scores: normalizedScores,
      most_productive_hours: mostProductiveHours,
      common_distraction_times: commonDistractionTimes,
      total_plans_generated: totalPlans,
      total_plans_accepted: acceptedPlans,
      total_plans_rejected: rejectedPlans,
      avg_plan_acceptance_rate: Math.round(acceptanceRate * 100) / 100,
      last_analyzed_date: new Date().toISOString().split('T')[0],
    };

    const { data, error } = await supabase
      .from('user_ai_profiles')
      .upsert(profileData, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      console.error('Failed to upsert user AI profile:', error);
      return null;
    }

    return data as UserAIProfile;
  } catch (error) {
    console.error('Error updating user AI profile:', error);
    return null;
  }
}

/**
 * Ensures a user has an AI profile, creating a default one if not.
 */
export async function ensureUserProfile(userId: string): Promise<UserAIProfile | null> {
  // Check if profile exists
  const { data: existing, error: fetchError } = await supabase
    .from('user_ai_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (existing && !fetchError) {
    return existing as UserAIProfile;
  }

  // Create default profile
  const defaultProfile = getDefaultProfile();
  const { data, error } = await supabase
    .from('user_ai_profiles')
    .insert({
      user_id: userId,
      ...defaultProfile,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create default AI profile:', error);
    return null;
  }

  return data as UserAIProfile;
}

/**
 * Fetches a user's AI profile.
 */
export async function getUserAIProfile(userId: string): Promise<UserAIProfile | null> {
  const { data, error } = await supabase
    .from('user_ai_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Failed to fetch user AI profile:', error);
    return null;
  }

  if (!data) {
    // Profile doesn't exist, create default
    return await ensureUserProfile(userId);
  }

  return data as UserAIProfile;
}

/**
 * Increments plan statistics when a plan is generated/accepted/rejected.
 */
export async function updatePlanStats(
  userId: string,
  action: 'generated' | 'accepted' | 'rejected'
): Promise<void> {
  const profile = await getUserAIProfile(userId);
  if (!profile) return;

  const updates: Partial<UserAIProfile> = {};

  if (action === 'generated') {
    updates.total_plans_generated = (profile.total_plans_generated || 0) + 1;
  } else if (action === 'accepted') {
    updates.total_plans_accepted = (profile.total_plans_accepted || 0) + 1;
  } else if (action === 'rejected') {
    updates.total_plans_rejected = (profile.total_plans_rejected || 0) + 1;
  }

  // Recalculate acceptance rate
  const totalPlans = (updates.total_plans_generated || profile.total_plans_generated || 0);
  const acceptedPlans = (updates.total_plans_accepted || profile.total_plans_accepted || 0);
  updates.avg_plan_acceptance_rate = totalPlans > 0
    ? Math.round((acceptedPlans / totalPlans) * 100) / 100
    : 0;

  await supabase
    .from('user_ai_profiles')
    .update(updates)
    .eq('user_id', userId);
}

