// ============================================================
// Clinic Growth AI — Finance API (Owner area)
// src/api/finance.ts
// ============================================================

import { supabase } from '../lib/supabase/client';
import type { ApiResult, ApiListResult, FinanceSummary, RevenueStats } from '../types/api';
import type { FinanceRecord, FinanceRecordInsert, FinanceRecordUpdate } from '../types/database';
import type { FinanceType } from '../types/enums';

// ---- Finance Records CRUD ----------------------------------

export async function getFinanceRecords(
  options: {
    type?: FinanceType;
    customerId?: string;
    from?: string;
    to?: string;
    limit?: number;
    offset?: number;
  } = {}
): Promise<ApiListResult<FinanceRecord>> {
  try {
    let query = supabase
      .from('finance_records')
      .select('*', { count: 'exact' });

    if (options.type)       query = query.eq('type', options.type);
    if (options.customerId) query = query.eq('customer_id', options.customerId);
    if (options.from)       query = query.gte('date', options.from);
    if (options.to)         query = query.lte('date', options.to);

    query = query
      .order('date', { ascending: false })
      .range(options.offset ?? 0, (options.offset ?? 0) + (options.limit ?? 100) - 1);

    const { data, error, count } = await query;
    if (error) return { data: [], error: { message: error.message, code: error.code } };
    return { data: data ?? [], error: null, count: count ?? 0 };
  } catch (err) {
    return { data: [], error: { message: String(err) } };
  }
}

export async function createFinanceRecord(input: FinanceRecordInsert): Promise<ApiResult<FinanceRecord>> {
  try {
    const { data, error } = await supabase
      .from('finance_records')
      .insert(input)
      .select()
      .single();

    if (error) return { data: null, error: { message: error.message, code: error.code } };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: { message: String(err) } };
  }
}

export async function updateFinanceRecord(
  recordId: string,
  input: FinanceRecordUpdate
): Promise<ApiResult<FinanceRecord>> {
  try {
    const { data, error } = await supabase
      .from('finance_records')
      .update(input)
      .eq('id', recordId)
      .select()
      .single();

    if (error) return { data: null, error: { message: error.message, code: error.code } };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: { message: String(err) } };
  }
}

export async function deleteFinanceRecord(recordId: string): Promise<ApiResult<null>> {
  try {
    const { error } = await supabase.from('finance_records').delete().eq('id', recordId);
    if (error) return { data: null, error: { message: error.message, code: error.code } };
    return { data: null, error: null };
  } catch (err) {
    return { data: null, error: { message: String(err) } };
  }
}

// ---- Finance Summaries -------------------------------------

/**
 * Returns monthly P&L summary for the given period (YYYY-MM).
 */
export async function getMonthSummary(period: string): Promise<ApiResult<FinanceSummary>> {
  try {
    const [year, month] = period.split('-').map(Number);
    const from = `${year}-${String(month).padStart(2, '0')}-01`;
    const toDate = new Date(year, month, 0); // last day of month
    const to = toDate.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('finance_records')
      .select('type, amount')
      .gte('date', from)
      .lte('date', to);

    if (error) return { data: null, error: { message: error.message } };

    const records = data ?? [];
    const byType: Record<string, number> = {};
    let revenue = 0;
    let expenses = 0;

    for (const r of records) {
      byType[r.type] = (byType[r.type] ?? 0) + Number(r.amount);
      if (r.type.startsWith('revenue_')) revenue += Number(r.amount);
      else expenses += Number(r.amount);
    }

    return {
      data: { period, revenue, expenses, net: revenue - expenses, by_type: byType },
      error: null,
    };
  } catch (err) {
    return { data: null, error: { message: String(err) } };
  }
}

/**
 * Compute MRR, ARR, and revenue breakdown for owner dashboard.
 */
export async function getRevenueStats(): Promise<ApiResult<RevenueStats>> {
  try {
    const { data: customers, error: custErr } = await supabase
      .from('customers')
      .select('status, monthly_rate');

    if (custErr) return { data: null, error: { message: custErr.message } };

    const active = (customers ?? []).filter((c) => c.status === 'active');
    const trial = (customers ?? []).filter((c) => c.status === 'trial');
    const totalMRR = active.reduce((sum, c) => sum + Number(c.monthly_rate), 0);

    // This month revenue & expenses
    const now = new Date();
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const summary = await getMonthSummary(ym);

    return {
      data: {
        total_mrr: totalMRR,
        total_arr: totalMRR * 12,
        active_customers: active.length,
        trial_customers: trial.length,
        revenue_this_month: summary.data?.revenue ?? 0,
        expenses_this_month: summary.data?.expenses ?? 0,
        net_this_month: summary.data?.net ?? 0,
      },
      error: null,
    };
  } catch (err) {
    return { data: null, error: { message: String(err) } };
  }
}

/**
 * Returns monthly summaries for the last N months.
 */
export async function getRecentMonthlySummaries(months = 6): Promise<ApiListResult<FinanceSummary>> {
  const summaries: FinanceSummary[] = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const period = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const result = await getMonthSummary(period);
    if (result.data) summaries.push(result.data);
  }

  return { data: summaries, error: null };
}
