// ============================================================
// Clinic Growth AI — Clinics API
// src/api/clinics.ts
// ============================================================

import { supabase } from '../lib/supabase/client';
import type { ApiResult, ApiListResult } from '../types/api';
import type {
  Clinic, ClinicInsert, ClinicUpdate,
  ClinicBranch, ClinicBranchInsert, ClinicBranchUpdate,
  ClinicStaff, ClinicStaffInsert, ClinicStaffUpdate,
  ClinicFaq, ClinicFaqInsert, ClinicFaqUpdate,
} from '../types/database';

// ---- Clinic CRUD -------------------------------------------

export async function getClinic(clinicId: string): Promise<ApiResult<Clinic>> {
  try {
    const { data, error } = await supabase
      .from('clinics')
      .select('*')
      .eq('id', clinicId)
      .single();

    if (error) return { data: null, error: { message: error.message, code: error.code } };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: { message: String(err) } };
  }
}

export async function getClinicBySlug(slug: string): Promise<ApiResult<Clinic>> {
  try {
    const { data, error } = await supabase
      .from('clinics')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) return { data: null, error: { message: error.message, code: error.code } };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: { message: String(err) } };
  }
}

export async function createClinic(input: ClinicInsert): Promise<ApiResult<Clinic>> {
  try {
    const { data, error } = await supabase
      .from('clinics')
      .insert(input)
      .select()
      .single();

    if (error) return { data: null, error: { message: error.message, code: error.code } };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: { message: String(err) } };
  }
}

export async function updateClinic(clinicId: string, input: ClinicUpdate): Promise<ApiResult<Clinic>> {
  try {
    const { data, error } = await supabase
      .from('clinics')
      .update(input)
      .eq('id', clinicId)
      .select()
      .single();

    if (error) return { data: null, error: { message: error.message, code: error.code } };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: { message: String(err) } };
  }
}

// ---- Branches CRUD -----------------------------------------

export async function getBranches(clinicId: string): Promise<ApiListResult<ClinicBranch>> {
  try {
    const { data, error } = await supabase
      .from('clinic_branches')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('name');

    if (error) return { data: [], error: { message: error.message, code: error.code } };
    return { data: data ?? [], error: null };
  } catch (err) {
    return { data: [], error: { message: String(err) } };
  }
}

export async function createBranch(input: ClinicBranchInsert): Promise<ApiResult<ClinicBranch>> {
  try {
    const { data, error } = await supabase
      .from('clinic_branches')
      .insert(input)
      .select()
      .single();

    if (error) return { data: null, error: { message: error.message, code: error.code } };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: { message: String(err) } };
  }
}

export async function updateBranch(branchId: string, input: ClinicBranchUpdate): Promise<ApiResult<ClinicBranch>> {
  try {
    const { data, error } = await supabase
      .from('clinic_branches')
      .update(input)
      .eq('id', branchId)
      .select()
      .single();

    if (error) return { data: null, error: { message: error.message, code: error.code } };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: { message: String(err) } };
  }
}

export async function deleteBranch(branchId: string): Promise<ApiResult<null>> {
  try {
    const { error } = await supabase.from('clinic_branches').delete().eq('id', branchId);
    if (error) return { data: null, error: { message: error.message, code: error.code } };
    return { data: null, error: null };
  } catch (err) {
    return { data: null, error: { message: String(err) } };
  }
}

// ---- Staff CRUD --------------------------------------------

export async function getStaff(clinicId: string): Promise<ApiListResult<ClinicStaff>> {
  try {
    const { data, error } = await supabase
      .from('clinic_staff')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('name');

    if (error) return { data: [], error: { message: error.message, code: error.code } };
    return { data: data ?? [], error: null };
  } catch (err) {
    return { data: [], error: { message: String(err) } };
  }
}

export async function getStaffMember(staffId: string): Promise<ApiResult<ClinicStaff>> {
  try {
    const { data, error } = await supabase
      .from('clinic_staff')
      .select('*')
      .eq('id', staffId)
      .single();

    if (error) return { data: null, error: { message: error.message, code: error.code } };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: { message: String(err) } };
  }
}

/** Returns the clinic_staff row for the currently logged-in user */
export async function getCurrentStaffProfile(): Promise<ApiResult<ClinicStaff>> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return { data: null, error: { message: 'Not authenticated' } };

    const { data, error } = await supabase
      .from('clinic_staff')
      .select('*')
      .eq('user_id', userData.user.id)
      .eq('is_active', true)
      .single();

    if (error) return { data: null, error: { message: error.message, code: error.code } };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: { message: String(err) } };
  }
}

export async function createStaffMember(input: ClinicStaffInsert): Promise<ApiResult<ClinicStaff>> {
  try {
    const { data, error } = await supabase
      .from('clinic_staff')
      .insert(input)
      .select()
      .single();

    if (error) return { data: null, error: { message: error.message, code: error.code } };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: { message: String(err) } };
  }
}

export async function updateStaffMember(staffId: string, input: ClinicStaffUpdate): Promise<ApiResult<ClinicStaff>> {
  try {
    const { data, error } = await supabase
      .from('clinic_staff')
      .update(input)
      .eq('id', staffId)
      .select()
      .single();

    if (error) return { data: null, error: { message: error.message, code: error.code } };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: { message: String(err) } };
  }
}

export async function deactivateStaffMember(staffId: string): Promise<ApiResult<ClinicStaff>> {
  return updateStaffMember(staffId, { is_active: false });
}

// ---- FAQs CRUD ---------------------------------------------

export async function getFaqs(clinicId: string): Promise<ApiListResult<ClinicFaq>> {
  try {
    const { data, error } = await supabase
      .from('clinic_faqs')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('is_active', true)
      .order('sort_order');

    if (error) return { data: [], error: { message: error.message, code: error.code } };
    return { data: data ?? [], error: null };
  } catch (err) {
    return { data: [], error: { message: String(err) } };
  }
}

export async function createFaq(input: ClinicFaqInsert): Promise<ApiResult<ClinicFaq>> {
  try {
    const { data, error } = await supabase
      .from('clinic_faqs')
      .insert(input)
      .select()
      .single();

    if (error) return { data: null, error: { message: error.message, code: error.code } };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: { message: String(err) } };
  }
}

export async function updateFaq(faqId: string, input: ClinicFaqUpdate): Promise<ApiResult<ClinicFaq>> {
  try {
    const { data, error } = await supabase
      .from('clinic_faqs')
      .update(input)
      .eq('id', faqId)
      .select()
      .single();

    if (error) return { data: null, error: { message: error.message, code: error.code } };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: { message: String(err) } };
  }
}

export async function deleteFaq(faqId: string): Promise<ApiResult<null>> {
  try {
    const { error } = await supabase.from('clinic_faqs').delete().eq('id', faqId);
    if (error) return { data: null, error: { message: error.message, code: error.code } };
    return { data: null, error: null };
  } catch (err) {
    return { data: null, error: { message: String(err) } };
  }
}
