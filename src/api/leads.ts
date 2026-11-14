// ============================================================
// Clinic Growth AI — Leads API
// src/api/leads.ts
// ============================================================

import { supabase } from '../lib/supabase/client';
import type { ApiResult, ApiListResult, LeadFilterParams } from '../types/api';
import type { Lead, LeadInsert, LeadUpdate, LeadActivity, LeadActivityInsert } from '../types/database';
import type { LeadStatus } from '../types/enums';

// ---- Leads CRUD --------------------------------------------

export async function getLeads(
  clinicId: string,
  filters: LeadFilterParams = {}
): Promise<ApiListResult<Lead>> {
  try {
    let query = supabase
      .from('leads')
      .select('*', { count: 'exact' })
      .eq('clinic_id', clinicId);

    if (filters.status)      query = query.eq('status', filters.status);
    if (filters.source)      query = query.eq('source', filters.source);
    if (filters.assigned_to) query = query.eq('assigned_to', filters.assigned_to);
    if (filters.from_date)   query = query.gte('created_at', filters.from_date);
    if (filters.to_date)     query = query.lte('created_at', filters.to_date);

    if (filters.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
      );
    }

    query = query
      .order('created_at', { ascending: false })
      .range(filters.offset ?? 0, (filters.offset ?? 0) + (filters.limit ?? 50) - 1);

    const { data, error, count } = await query;
    if (error) return { data: [], error: { message: error.message, code: error.code } };
    return { data: data ?? [], error: null, count: count ?? 0 };
  } catch (err) {
    return { data: [], error: { message: String(err) } };
  }
}

export async function getLead(leadId: string): Promise<ApiResult<Lead>> {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (error) return { data: null, error: { message: error.message, code: error.code } };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: { message: String(err) } };
  }
}

export async function createLead(input: LeadInsert): Promise<ApiResult<Lead>> {
  try {
    const { data, error } = await supabase
      .from('leads')
      .insert(input)
      .select()
      .single();

    if (error) return { data: null, error: { message: error.message, code: error.code } };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: { message: String(err) } };
  }
}

export async function updateLead(leadId: string, input: LeadUpdate): Promise<ApiResult<Lead>> {
  try {
    const { data, error } = await supabase
      .from('leads')
      .update(input)
      .eq('id', leadId)
      .select()
      .single();

    if (error) return { data: null, error: { message: error.message, code: error.code } };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: { message: String(err) } };
  }
}

export async function deleteLead(leadId: string): Promise<ApiResult<null>> {
  try {
    const { error } = await supabase.from('leads').delete().eq('id', leadId);
    if (error) return { data: null, error: { message: error.message, code: error.code } };
    return { data: null, error: null };
  } catch (err) {
    return { data: null, error: { message: String(err) } };
  }
}

/**
 * Transition a lead to a new status and log the activity.
 */
export async function transitionLeadStatus(
  leadId: string,
  newStatus: LeadStatus,
  staffId: string,
  note?: string
): Promise<ApiResult<Lead>> {
  try {
    const { data: current, error: fetchError } = await supabase
      .from('leads')
      .select('status')
      .eq('id', leadId)
      .single();

    if (fetchError) return { data: null, error: { message: fetchError.message } };

    const { data, error } = await supabase
      .from('leads')
      .update({ status: newStatus })
      .eq('id', leadId)
      .select()
      .single();

    if (error) return { data: null, error: { message: error.message, code: error.code } };

    // Log the activity
    await supabase.from('lead_activities').insert({
      lead_id: leadId,
      activity_type: 'status_change',
      description: `Status changed from ${current.status} to ${newStatus}${note ? ': ' + note : ''}`,
      created_by: staffId,
    });

    return { data, error: null };
  } catch (err) {
    return { data: null, error: { message: String(err) } };
  }
}

// ---- Lead Activities ---------------------------------------

export async function getLeadActivities(leadId: string): Promise<ApiListResult<LeadActivity>> {
  try {
    const { data, error } = await supabase
      .from('lead_activities')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false });

    if (error) return { data: [], error: { message: error.message, code: error.code } };
    return { data: data ?? [], error: null };
  } catch (err) {
    return { data: [], error: { message: String(err) } };
  }
}

export async function addLeadActivity(input: LeadActivityInsert): Promise<ApiResult<LeadActivity>> {
  try {
    const { data, error } = await supabase
      .from('lead_activities')
      .insert(input)
      .select()
      .single();

    if (error) return { data: null, error: { message: error.message, code: error.code } };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: { message: String(err) } };
  }
}

/**
 * Search leads by name, phone, or email across the clinic.
 */
export async function searchLeads(clinicId: string, term: string, limit = 10): Promise<ApiListResult<Lead>> {
  return getLeads(clinicId, { search: term, limit });
}
