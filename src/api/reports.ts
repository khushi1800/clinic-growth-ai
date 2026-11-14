// ============================================================
// Clinic Growth AI — Reports / Dashboard Stats API
// src/api/reports.ts
// ============================================================

import { supabase } from '../lib/supabase/client';
import type { ApiResult } from '../types/api';
import type { DashboardStats } from '../types/api';

/**
 * Aggregates key metrics for the clinic's main dashboard.
 * All queries respect RLS — only data for the user's clinic is returned.
 */
export async function getDashboardStats(clinicId: string): Promise<ApiResult<DashboardStats>> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const [
      leadsResult,
      leadsNewTodayResult,
      appointmentsResult,
      appointmentsTodayResult,
      conversationsActiveResult,
      conversationsWeekResult,
      followUpsPendingResult,
      followUpsSentTodayResult,
      reviewsResult,
    ] = await Promise.all([
      supabase.from('leads').select('status', { count: 'exact' }).eq('clinic_id', clinicId),
      supabase.from('leads').select('id', { count: 'exact' }).eq('clinic_id', clinicId).gte('created_at', today),
      supabase.from('appointments').select('status', { count: 'exact' }).eq('clinic_id', clinicId),
      supabase.from('appointments').select('id', { count: 'exact' }).eq('clinic_id', clinicId).eq('appointment_date', today),
      supabase.from('conversations').select('id', { count: 'exact' }).eq('clinic_id', clinicId).eq('status', 'active'),
      supabase.from('conversations').select('id', { count: 'exact' }).eq('clinic_id', clinicId).gte('started_at', weekAgo),
      supabase.from('follow_up_tasks').select('id', { count: 'exact' }).eq('clinic_id', clinicId).eq('status', 'pending'),
      supabase.from('follow_up_tasks').select('id', { count: 'exact' }).eq('clinic_id', clinicId).eq('status', 'sent').gte('executed_at', today),
      supabase.from('review_requests').select('rating').eq('clinic_id', clinicId).not('rating', 'is', null),
    ]);

    // Aggregate leads by status and source
    const leadsByStatus: Record<string, number> = {};
    const leadsBySource: Record<string, number> = {};
    for (const lead of leadsResult.data ?? []) {
      const s = (lead as { status: string; source?: string }).status;
      leadsByStatus[s] = (leadsByStatus[s] ?? 0) + 1;
    }

    // Aggregate appointments by status
    const appointmentsByStatus: Record<string, number> = {};
    for (const appt of appointmentsResult.data ?? []) {
      const s = (appt as { status: string }).status;
      appointmentsByStatus[s] = (appointmentsByStatus[s] ?? 0) + 1;
    }

    // Calculate upcoming appointments (future dates)
    const { count: upcomingCount } = await supabase
      .from('appointments')
      .select('id', { count: 'exact', head: true })
      .eq('clinic_id', clinicId)
      .gt('appointment_date', today)
      .in('status', ['requested', 'confirmed']);

    // Reviews average
    const ratings = (reviewsResult.data ?? []).map((r: { rating: number }) => r.rating).filter(Boolean);
    const averageRating = ratings.length > 0
      ? ratings.reduce((s: number, r: number) => s + r, 0) / ratings.length
      : null;

    return {
      data: {
        leads: {
          total: leadsResult.count ?? 0,
          new_today: leadsNewTodayResult.count ?? 0,
          by_status: leadsByStatus,
          by_source: leadsBySource,
        },
        appointments: {
          total: appointmentsResult.count ?? 0,
          today: appointmentsTodayResult.count ?? 0,
          upcoming: upcomingCount ?? 0,
          by_status: appointmentsByStatus,
        },
        conversations: {
          active: conversationsActiveResult.count ?? 0,
          total_this_week: conversationsWeekResult.count ?? 0,
        },
        follow_ups: {
          pending: followUpsPendingResult.count ?? 0,
          sent_today: followUpsSentTodayResult.count ?? 0,
        },
        reviews: {
          average_rating: averageRating ? Math.round(averageRating * 10) / 10 : null,
          total: ratings.length,
        },
      },
      error: null,
    };
  } catch (err) {
    return { data: null, error: { message: String(err) } };
  }
}

/**
 * Returns lead conversion funnel data for a clinic.
 */
export async function getLeadFunnel(clinicId: string): Promise<ApiResult<Record<string, number>>> {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('status')
      .eq('clinic_id', clinicId);

    if (error) return { data: null, error: { message: error.message } };

    const funnel: Record<string, number> = {};
    for (const lead of data ?? []) {
      const s = (lead as { status: string }).status;
      funnel[s] = (funnel[s] ?? 0) + 1;
    }

    return { data: funnel, error: null };
  } catch (err) {
    return { data: null, error: { message: String(err) } };
  }
}

/**
 * Returns appointment volume grouped by date for a date range.
 */
export async function getAppointmentVolume(
  clinicId: string,
  from: string,
  to: string
): Promise<ApiResult<Record<string, number>>> {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('appointment_date')
      .eq('clinic_id', clinicId)
      .gte('appointment_date', from)
      .lte('appointment_date', to);

    if (error) return { data: null, error: { message: error.message } };

    const volume: Record<string, number> = {};
    for (const a of data ?? []) {
      const d = (a as { appointment_date: string }).appointment_date;
      volume[d] = (volume[d] ?? 0) + 1;
    }

    return { data: volume, error: null };
  } catch (err) {
    return { data: null, error: { message: String(err) } };
  }
}

/**
 * Returns lead source breakdown for the past N days.
 */
export async function getLeadSourceBreakdown(
  clinicId: string,
  days = 30
): Promise<ApiResult<Record<string, number>>> {
  try {
    const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('leads')
      .select('source')
      .eq('clinic_id', clinicId)
      .gte('created_at', from);

    if (error) return { data: null, error: { message: error.message } };

    const breakdown: Record<string, number> = {};
    for (const lead of data ?? []) {
      const src = (lead as { source: string }).source;
      breakdown[src] = (breakdown[src] ?? 0) + 1;
    }

    return { data: breakdown, error: null };
  } catch (err) {
    return { data: null, error: { message: String(err) } };
  }
}
