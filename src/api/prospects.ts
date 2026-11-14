// ============================================================
// Clinic Growth AI — Prospects API (Owner area)
// src/api/prospects.ts
// ============================================================

import { supabase } from '../lib/supabase/client';
import type { ApiResult, ApiListResult } from '../types/api';
import type {
  Prospect, ProspectInsert, ProspectUpdate,
  ProspectActivity, ProspectActivityInsert,
} from '../types/database';
import type { SalesStatus } from '../types/enums';

// ---- Prospects CRUD ----------------------------------------

export async function getProspects(
  options: { status?: SalesStatus; search?: string; limit?: number; offset?: number } = {}
): Promise<ApiListResult<Prospect>> {
  try {
    let query = supabase
      .from('prospects')
      .select('*', { count: 'exact' });

    if (options.status) query = query.eq('sales_status', options.status);
    if (options.search) {
      query = query.or(
        `clinic_name.ilike.%${options.search}%,contact_email.ilike.%${options.search}%,location.ilike.%${options.search}%`
      );
    }

    query = query
      .order('created_at', { ascending: false })
      .range(options.offset ?? 0, (options.offset ?? 0) + (options.limit ?? 50) - 1);

    const { data, error, count } = await query;
    if (error) return { data: [], error: { message: error.message, code: error.code } };
    return { data: data ?? [], error: null, count: count ?? 0 };
  } catch (err) {
    return { data: [], error: { message: String(err) } };
  }
}

export async function getProspect(prospectId: string): Promise<ApiResult<Prospect>> {
  try {
    const { data, error } = await supabase
      .from('prospects')
      .select('*')
      .eq('id', prospectId)
      .single();

    if (error) return { data: null, error: { message: error.message, code: error.code } };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: { message: String(err) } };
  }
}

export async function createProspect(input: ProspectInsert): Promise<ApiResult<Prospect>> {
  try {
    const { data, error } = await supabase
      .from('prospects')
      .insert(input)
      .select()
      .single();

    if (error) return { data: null, error: { message: error.message, code: error.code } };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: { message: String(err) } };
  }
}

export async function updateProspect(
  prospectId: string,
  input: ProspectUpdate
): Promise<ApiResult<Prospect>> {
  try {
    const { data, error } = await supabase
      .from('prospects')
      .update(input)
      .eq('id', prospectId)
      .select()
      .single();

    if (error) return { data: null, error: { message: error.message, code: error.code } };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: { message: String(err) } };
  }
}

export async function deleteProspect(prospectId: string): Promise<ApiResult<null>> {
  try {
    const { error } = await supabase.from('prospects').delete().eq('id', prospectId);
    if (error) return { data: null, error: { message: error.message, code: error.code } };
    return { data: null, error: null };
  } catch (err) {
    return { data: null, error: { message: String(err) } };
  }
}

export async function advanceProspectStatus(
  prospectId: string,
  newStatus: SalesStatus,
  nextAction?: string
): Promise<ApiResult<Prospect>> {
  return updateProspect(prospectId, {
    sales_status: newStatus,
    last_interaction_at: new Date().toISOString(),
    next_action: nextAction,
  });
}

// ---- Prospect Activities -----------------------------------

export async function getProspectActivities(
  prospectId: string
): Promise<ApiListResult<ProspectActivity>> {
  try {
    const { data, error } = await supabase
      .from('prospect_activities')
      .select('*')
      .eq('prospect_id', prospectId)
      .order('created_at', { ascending: false });

    if (error) return { data: [], error: { message: error.message, code: error.code } };
    return { data: data ?? [], error: null };
  } catch (err) {
    return { data: [], error: { message: String(err) } };
  }
}

export async function addProspectActivity(
  input: ProspectActivityInsert
): Promise<ApiResult<ProspectActivity>> {
  try {
    const { data, error } = await supabase
      .from('prospect_activities')
      .insert(input)
      .select()
      .single();

    if (error) return { data: null, error: { message: error.message, code: error.code } };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: { message: String(err) } };
  }
}
