// ============================================================
// Clinic Growth AI — Appointments API
// src/api/appointments.ts
// ============================================================

import { supabase } from '../lib/supabase/client';
import type { ApiResult, ApiListResult, AvailabilityQuery, AvailableSlot } from '../types/api';
import type {
  Appointment, AppointmentInsert, AppointmentUpdate,
  AppointmentSlot, AppointmentSlotInsert, AppointmentSlotUpdate,
} from '../types/database';

// ---- Appointments CRUD -------------------------------------

export async function getAppointments(
  clinicId: string,
  options: { date?: string; doctorId?: string; branchId?: string; limit?: number } = {}
): Promise<ApiListResult<Appointment>> {
  try {
    let query = supabase
      .from('appointments')
      .select('*', { count: 'exact' })
      .eq('clinic_id', clinicId);

    if (options.date)      query = query.eq('appointment_date', options.date);
    if (options.doctorId)  query = query.eq('doctor_id', options.doctorId);
    if (options.branchId)  query = query.eq('branch_id', options.branchId);

    query = query
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true })
      .limit(options.limit ?? 100);

    const { data, error, count } = await query;
    if (error) return { data: [], error: { message: error.message, code: error.code } };
    return { data: data ?? [], error: null, count: count ?? 0 };
  } catch (err) {
    return { data: [], error: { message: String(err) } };
  }
}

export async function getAppointment(appointmentId: string): Promise<ApiResult<Appointment>> {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .single();

    if (error) return { data: null, error: { message: error.message, code: error.code } };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: { message: String(err) } };
  }
}

export async function getAppointmentsForLead(leadId: string): Promise<ApiListResult<Appointment>> {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('lead_id', leadId)
      .order('appointment_date', { ascending: false });

    if (error) return { data: [], error: { message: error.message, code: error.code } };
    return { data: data ?? [], error: null };
  } catch (err) {
    return { data: [], error: { message: String(err) } };
  }
}

export async function createAppointment(input: AppointmentInsert): Promise<ApiResult<Appointment>> {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .insert(input)
      .select()
      .single();

    if (error) return { data: null, error: { message: error.message, code: error.code } };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: { message: String(err) } };
  }
}

export async function updateAppointment(
  appointmentId: string,
  input: AppointmentUpdate
): Promise<ApiResult<Appointment>> {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .update(input)
      .eq('id', appointmentId)
      .select()
      .single();

    if (error) return { data: null, error: { message: error.message, code: error.code } };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: { message: String(err) } };
  }
}

export async function cancelAppointment(appointmentId: string, notes?: string): Promise<ApiResult<Appointment>> {
  return updateAppointment(appointmentId, { status: 'cancelled', notes });
}

export async function confirmAppointment(appointmentId: string): Promise<ApiResult<Appointment>> {
  return updateAppointment(appointmentId, { status: 'confirmed' });
}

// ---- Appointment Slots -------------------------------------

export async function getSlots(
  clinicId: string,
  options: { doctorId?: string; branchId?: string; dayOfWeek?: number } = {}
): Promise<ApiListResult<AppointmentSlot>> {
  try {
    let query = supabase
      .from('appointment_slots')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('is_active', true);

    if (options.doctorId)   query = query.eq('doctor_id', options.doctorId);
    if (options.branchId)   query = query.eq('branch_id', options.branchId);
    if (options.dayOfWeek !== undefined) query = query.eq('day_of_week', options.dayOfWeek);

    query = query.order('day_of_week').order('start_time');

    const { data, error } = await query;
    if (error) return { data: [], error: { message: error.message, code: error.code } };
    return { data: data ?? [], error: null };
  } catch (err) {
    return { data: [], error: { message: String(err) } };
  }
}

export async function createSlot(input: AppointmentSlotInsert): Promise<ApiResult<AppointmentSlot>> {
  try {
    const { data, error } = await supabase
      .from('appointment_slots')
      .insert(input)
      .select()
      .single();

    if (error) return { data: null, error: { message: error.message, code: error.code } };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: { message: String(err) } };
  }
}

export async function updateSlot(
  slotId: string,
  input: AppointmentSlotUpdate
): Promise<ApiResult<AppointmentSlot>> {
  try {
    const { data, error } = await supabase
      .from('appointment_slots')
      .update(input)
      .eq('id', slotId)
      .select()
      .single();

    if (error) return { data: null, error: { message: error.message, code: error.code } };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: { message: String(err) } };
  }
}

export async function deleteSlot(slotId: string): Promise<ApiResult<null>> {
  try {
    const { error } = await supabase.from('appointment_slots').delete().eq('id', slotId);
    if (error) return { data: null, error: { message: error.message, code: error.code } };
    return { data: null, error: null };
  } catch (err) {
    return { data: null, error: { message: String(err) } };
  }
}

// ---- Availability ------------------------------------------

/**
 * Compute available time slots for a given date.
 * Returns slot times that don't have an existing confirmed/requested appointment.
 */
export async function getAvailableSlots(query: AvailabilityQuery): Promise<ApiListResult<AvailableSlot>> {
  try {
    const date = new Date(query.date);
    const dayOfWeek = date.getDay(); // 0=Sunday

    // Get slot templates for this day
    let slotsQuery = supabase
      .from('appointment_slots')
      .select('*')
      .eq('clinic_id', query.clinic_id)
      .eq('day_of_week', dayOfWeek)
      .eq('is_active', true);

    if (query.doctor_id) slotsQuery = slotsQuery.eq('doctor_id', query.doctor_id);
    if (query.branch_id) slotsQuery = slotsQuery.eq('branch_id', query.branch_id);

    const { data: slots, error: slotsError } = await slotsQuery;
    if (slotsError) return { data: [], error: { message: slotsError.message } };

    // Get booked appointments for that date
    let apptQuery = supabase
      .from('appointments')
      .select('appointment_time, doctor_id, branch_id')
      .eq('clinic_id', query.clinic_id)
      .eq('appointment_date', query.date)
      .in('status', ['requested', 'confirmed']);

    if (query.doctor_id) apptQuery = apptQuery.eq('doctor_id', query.doctor_id);
    if (query.branch_id) apptQuery = apptQuery.eq('branch_id', query.branch_id);

    const { data: booked } = await apptQuery;
    const bookedTimes = new Set((booked ?? []).map((a) => a.appointment_time));

    // Generate 30-minute increments within each slot template
    const available: AvailableSlot[] = [];
    for (const slot of slots ?? []) {
      const [sh, sm] = slot.start_time.split(':').map(Number);
      const [eh, em] = slot.end_time.split(':').map(Number);
      let cur = sh * 60 + sm;
      const end = eh * 60 + em;

      while (cur + 30 <= end) {
        const h = String(Math.floor(cur / 60)).padStart(2, '0');
        const m = String(cur % 60).padStart(2, '0');
        const timeStr = `${h}:${m}:00`;

        if (!bookedTimes.has(timeStr)) {
          available.push({
            time: timeStr,
            doctor_id: slot.doctor_id,
            branch_id: slot.branch_id,
          });
        }
        cur += 30;
      }
    }

    return { data: available, error: null };
  } catch (err) {
    return { data: [], error: { message: String(err) } };
  }
}

/**
 * Get today's appointment schedule for a clinic.
 */
export async function getTodayAppointments(clinicId: string): Promise<ApiListResult<Appointment>> {
  const today = new Date().toISOString().split('T')[0];
  return getAppointments(clinicId, { date: today });
}
