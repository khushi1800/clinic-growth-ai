// ============================================================
// Clinic Growth AI — Customers API (Owner area)
// src/api/customers.ts
// ============================================================

import { supabase } from '../lib/supabase/client';
import type { ApiResult, ApiListResult } from '../types/api';
import type { Customer, CustomerInsert, CustomerUpdate } from '../types/database';
import type { CustomerStatus } from '../types/enums';

export async function getCustomers(
  options: { status?: CustomerStatus; limit?: number; offset?: number } = {}
): Promise<ApiListResult<Customer>> {
  try {
    let query = supabase
      .from('customers')
      .select('*', { count: 'exact' });

    if (options.status) query = query.eq('status', options.status);

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

export async function getCustomer(customerId: string): Promise<ApiResult<Customer>> {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .single();

    if (error) return { data: null, error: { message: error.message, code: error.code } };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: { message: String(err) } };
  }
}

export async function getCustomerByClinic(clinicId: string): Promise<ApiResult<Customer>> {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('clinic_id', clinicId)
      .single();

    if (error) return { data: null, error: { message: error.message, code: error.code } };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: { message: String(err) } };
  }
}

export async function createCustomer(input: CustomerInsert): Promise<ApiResult<Customer>> {
  try {
    const { data, error } = await supabase
      .from('customers')
      .insert(input)
      .select()
      .single();

    if (error) return { data: null, error: { message: error.message, code: error.code } };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: { message: String(err) } };
  }
}

export async function updateCustomer(
  customerId: string,
  input: CustomerUpdate
): Promise<ApiResult<Customer>> {
  try {
    const { data, error } = await supabase
      .from('customers')
      .update(input)
      .eq('id', customerId)
      .select()
      .single();

    if (error) return { data: null, error: { message: error.message, code: error.code } };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: { message: String(err) } };
  }
}

export async function updateHealthScore(
  customerId: string,
  score: number
): Promise<ApiResult<Customer>> {
  return updateCustomer(customerId, { health_score: Math.min(100, Math.max(0, score)) });
}

export async function activateCustomer(customerId: string): Promise<ApiResult<Customer>> {
  return updateCustomer(customerId, { status: 'active' });
}

export async function churnCustomer(customerId: string): Promise<ApiResult<Customer>> {
  return updateCustomer(customerId, { status: 'churned' });
}

export async function getActiveCustomers(): Promise<ApiListResult<Customer>> {
  return getCustomers({ status: 'active' });
}

export async function getTrialCustomers(): Promise<ApiListResult<Customer>> {
  return getCustomers({ status: 'trial' });
}
