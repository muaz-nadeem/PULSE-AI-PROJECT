import { supabase } from '../supabase/client';
import type { AIPlan, PlanFeedbackEvent } from '../ai/types';
import { updatePlanStats } from './personalization-service';

/**
 * Fetches today's AI plan for a user.
 */
export async function getTodaysPlan(userId: string): Promise<AIPlan | null> {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('ai_plans')
    .select('*')
    .eq('user_id', userId)
    .eq('plan_date', today)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Failed to fetch today\'s plan:', error);
    return null;
  }

  return data as AIPlan | null;
}

/**
 * Fetches an AI plan by ID.
 */
export async function getPlanById(planId: string): Promise<AIPlan | null> {
  const { data, error } = await supabase
    .from('ai_plans')
    .select('*')
    .eq('id', planId)
    .single();

  if (error) {
    console.error('Failed to fetch plan:', error);
    return null;
  }

  return data as AIPlan;
}

/**
 * Records that a user accepted the AI plan.
 */
export async function acceptPlan(planId: string, userId: string): Promise<boolean> {
  try {
    // Update plan status
    const { error: updateError } = await supabase
      .from('ai_plans')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
      })
      .eq('id', planId)
      .eq('user_id', userId);

    if (updateError) {
      console.error('Failed to update plan status:', updateError);
      return false;
    }

    // Log feedback event
    await logFeedbackEvent(planId, userId, 'accepted');

    // Update personalization stats
    await updatePlanStats(userId, 'accepted');

    return true;
  } catch (error) {
    console.error('Error accepting plan:', error);
    return false;
  }
}

/**
 * Records that a user rejected the AI plan.
 */
export async function rejectPlan(planId: string, userId: string, reason?: string): Promise<boolean> {
  try {
    // Update plan status
    const { error: updateError } = await supabase
      .from('ai_plans')
      .update({
        status: 'rejected',
        rejected_at: new Date().toISOString(),
      })
      .eq('id', planId)
      .eq('user_id', userId);

    if (updateError) {
      console.error('Failed to update plan status:', updateError);
      return false;
    }

    // Log feedback event
    await logFeedbackEvent(planId, userId, 'rejected', { reason });

    // Update personalization stats
    await updatePlanStats(userId, 'rejected');

    return true;
  } catch (error) {
    console.error('Error rejecting plan:', error);
    return false;
  }
}

/**
 * Records that a user edited the AI plan.
 */
export async function editPlan(
  planId: string,
  userId: string,
  newSchedule: unknown[]
): Promise<boolean> {
  try {
    // Fetch current plan to store original
    const currentPlan = await getPlanById(planId);
    if (!currentPlan) return false;

    // Update plan
    const { error: updateError } = await supabase
      .from('ai_plans')
      .update({
        schedule: newSchedule,
        original_schedule: currentPlan.original_schedule || currentPlan.schedule,
        status: 'edited',
        edit_count: (currentPlan.edit_count || 0) + 1,
        last_edited_at: new Date().toISOString(),
      })
      .eq('id', planId)
      .eq('user_id', userId);

    if (updateError) {
      console.error('Failed to update plan schedule:', updateError);
      return false;
    }

    // Log feedback event
    await logFeedbackEvent(planId, userId, 'edited', {
      editCount: (currentPlan.edit_count || 0) + 1,
      itemsChanged: newSchedule.length,
    });

    return true;
  } catch (error) {
    console.error('Error editing plan:', error);
    return false;
  }
}

/**
 * Records that a user completed a task from the AI plan.
 */
export async function logTaskCompletion(
  planId: string,
  userId: string,
  taskId: string
): Promise<boolean> {
  return await logFeedbackEvent(planId, userId, 'task_completed', { taskId });
}

/**
 * Records that a user skipped a task from the AI plan.
 */
export async function logTaskSkipped(
  planId: string,
  userId: string,
  taskId: string,
  reason?: string
): Promise<boolean> {
  return await logFeedbackEvent(planId, userId, 'task_skipped', { taskId, reason });
}

/**
 * Logs a feedback event to the database.
 */
async function logFeedbackEvent(
  planId: string,
  userId: string,
  eventType: PlanFeedbackEvent['event_type'],
  eventData?: Record<string, unknown>
): Promise<boolean> {
  const { error } = await supabase
    .from('plan_feedback_events')
    .insert({
      plan_id: planId,
      user_id: userId,
      event_type: eventType,
      event_data: eventData || null,
    });

  if (error) {
    console.error('Failed to log feedback event:', error);
    return false;
  }

  return true;
}

/**
 * Fetches feedback events for a plan.
 */
export async function getPlanFeedbackEvents(planId: string): Promise<PlanFeedbackEvent[]> {
  const { data, error } = await supabase
    .from('plan_feedback_events')
    .select('*')
    .eq('plan_id', planId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Failed to fetch feedback events:', error);
    return [];
  }

  return (data || []) as PlanFeedbackEvent[];
}

/**
 * Gets aggregate feedback stats for a user.
 */
export async function getUserFeedbackStats(userId: string): Promise<{
  totalPlans: number;
  acceptedPlans: number;
  rejectedPlans: number;
  editedPlans: number;
  avgEditsPerPlan: number;
}> {
  const { data: plans, error } = await supabase
    .from('ai_plans')
    .select('status, edit_count')
    .eq('user_id', userId);

  if (error || !plans) {
    return {
      totalPlans: 0,
      acceptedPlans: 0,
      rejectedPlans: 0,
      editedPlans: 0,
      avgEditsPerPlan: 0,
    };
  }

  const totalPlans = plans.length;
  const acceptedPlans = plans.filter(p => p.status === 'accepted').length;
  const rejectedPlans = plans.filter(p => p.status === 'rejected').length;
  const editedPlans = plans.filter(p => p.status === 'edited').length;
  const totalEdits = plans.reduce((sum, p) => sum + (p.edit_count || 0), 0);
  const avgEditsPerPlan = totalPlans > 0 ? totalEdits / totalPlans : 0;

  return {
    totalPlans,
    acceptedPlans,
    rejectedPlans,
    editedPlans,
    avgEditsPerPlan: Math.round(avgEditsPerPlan * 100) / 100,
  };
}

