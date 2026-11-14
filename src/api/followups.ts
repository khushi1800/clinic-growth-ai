// ============================================================
// Clinic Growth AI — Follow-ups API
// src/api/followups.ts
// ============================================================

import { supabase } from '../lib/supabase/client';
import type { ApiResult, ApiListResult } from '../types/api';
import type {
  FollowUpRule, FollowUpRuleInsert, FollowUpRuleUpdate,
  FollowUpTask, FollowUpTaskInsert, FollowUpTaskUpdate,
} from '../types/database';

// ---- Follow-up Rules ---------------------------------------

export async function getFollowUpRules(clinicId: string): Promise<ApiListResult<FollowUpRule>> {
  try {
    const { data, error } = await supabase
      .from('follow_up_rules')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('name');

    if (error) return { data: [], error: { message: error.message, code: error.code } };
    return { data: data ?? [], error: null };
  } catch (err) {
    return { data: [], error: { message: String(err) } };
  }
}

export async function getFollowUpRule(ruleId: string): Promise<ApiResult<FollowUpRule>> {
  try {
    const { data, error } = await supabase
      .from('follow_up_rules')
      .select('*')
      .eq('id', ruleId)
      .single();

    if (error) return { data: null, error: { message: error.message, code: error.code } };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: { message: String(err) } };
  }
}

export async function createFollowUpRule(input: FollowUpRuleInsert): Promise<ApiResult<FollowUpRule>> {
  try {
    const { data, error } = await supabase
      .from('follow_up_rules')
      .insert(input)
      .select()
      .single();

    if (error) return { data: null, error: { message: error.message, code: error.code } };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: { message: String(err) } };
  }
}

export async function updateFollowUpRule(
  ruleId: string,
  input: FollowUpRuleUpdate
): Promise<ApiResult<FollowUpRule>> {
  try {
    const { data, error } = await supabase
      .from('follow_up_rules')
      .update(input)
      .eq('id', ruleId)
      .select()
      .single();

    if (error) return { data: null, error: { message: error.message, code: error.code } };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: { message: String(err) } };
  }
}

export async function deleteFollowUpRule(ruleId: string): Promise<ApiResult<null>> {
  try {
    const { error } = await supabase.from('follow_up_rules').delete().eq('id', ruleId);
    if (error) return { data: null, error: { message: error.message, code: error.code } };
    return { data: null, error: null };
  } catch (err) {
    return { data: null, error: { message: String(err) } };
  }
}

// ---- Follow-up Tasks ---------------------------------------

export async function getFollowUpTasks(
  clinicId: string,
  options: { status?: string; leadId?: string; limit?: number } = {}
): Promise<ApiListResult<FollowUpTask>> {
  try {
    let query = supabase
      .from('follow_up_tasks')
      .select('*', { count: 'exact' })
      .eq('clinic_id', clinicId);

    if (options.status) query = query.eq('status', options.status);
    if (options.leadId) query = query.eq('lead_id', options.leadId);

    query = query
      .order('scheduled_at', { ascending: true })
      .limit(options.limit ?? 100);

    const { data, error, count } = await query;
    if (error) return { data: [], error: { message: error.message, code: error.code } };
    return { data: data ?? [], error: null, count: count ?? 0 };
  } catch (err) {
    return { data: [], error: { message: String(err) } };
  }
}

export async function getPendingFollowUpTasks(clinicId: string): Promise<ApiListResult<FollowUpTask>> {
  return getFollowUpTasks(clinicId, { status: 'pending' });
}

export async function createFollowUpTask(input: FollowUpTaskInsert): Promise<ApiResult<FollowUpTask>> {
  try {
    const { data, error } = await supabase
      .from('follow_up_tasks')
      .insert(input)
      .select()
      .single();

    if (error) return { data: null, error: { message: error.message, code: error.code } };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: { message: String(err) } };
  }
}

export async function updateFollowUpTask(
  taskId: string,
  input: FollowUpTaskUpdate
): Promise<ApiResult<FollowUpTask>> {
  try {
    const { data, error } = await supabase
      .from('follow_up_tasks')
      .update(input)
      .eq('id', taskId)
      .select()
      .single();

    if (error) return { data: null, error: { message: error.message, code: error.code } };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: { message: String(err) } };
  }
}

export async function markFollowUpSent(
  taskId: string,
  response?: string
): Promise<ApiResult<FollowUpTask>> {
  return updateFollowUpTask(taskId, {
    status: 'sent',
    executed_at: new Date().toISOString(),
    response,
  });
}

export async function markFollowUpFailed(
  taskId: string,
  reason?: string
): Promise<ApiResult<FollowUpTask>> {
  return updateFollowUpTask(taskId, {
    status: 'failed',
    executed_at: new Date().toISOString(),
    response: reason,
  });
}

export async function cancelFollowUpTask(taskId: string): Promise<ApiResult<FollowUpTask>> {
  return updateFollowUpTask(taskId, { status: 'cancelled' });
}

/**
 * Schedule a follow-up for a lead based on a rule.
 */
export async function scheduleFollowUp(
  clinicId: string,
  leadId: string,
  ruleId: string,
  attemptNumber = 1
): Promise<ApiResult<FollowUpTask>> {
  const rule = await getFollowUpRule(ruleId);
  if (rule.error || !rule.data) return { data: null, error: rule.error ?? { message: 'Rule not found' } };

  const scheduledAt = new Date();
  scheduledAt.setHours(scheduledAt.getHours() + rule.data.delay_hours);

  return createFollowUpTask({
    clinic_id: clinicId,
    lead_id: leadId,
    rule_id: ruleId,
    scheduled_at: scheduledAt.toISOString(),
    executed_at: null,
    status: 'pending',
    attempt_number: attemptNumber,
    response: null,
  });
}
