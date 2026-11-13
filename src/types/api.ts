// ============================================================
// Clinic Growth AI — API Request/Response Wrapper Types
// src/types/api.ts
// ============================================================

// Generic API result wrapper
export interface ApiResult<T> {
  data: T | null;
  error: ApiError | null;
}

export interface ApiListResult<T> {
  data: T[];
  error: ApiError | null;
  count?: number;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

// ---- Auth --------------------------------------------------

export interface SignUpRequest {
  email: string;
  password: string;
  name: string;
  clinicName?: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

// ---- Clinic ------------------------------------------------

export interface UpdateClinicRequest {
  name?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  business_hours?: Record<string, unknown>;
  settings?: Record<string, unknown>;
}

// ---- Lead Filters ------------------------------------------

export interface LeadFilterParams {
  status?: string;
  source?: string;
  assigned_to?: string;
  search?: string;
  from_date?: string;
  to_date?: string;
  limit?: number;
  offset?: number;
}

// ---- Appointment Availability ------------------------------

export interface AvailabilityQuery {
  clinic_id: string;
  doctor_id?: string;
  branch_id?: string;
  date: string; // ISO date
}

export interface AvailableSlot {
  time: string;
  doctor_id: string | null;
  branch_id: string | null;
}

// ---- Dashboard / Report Stats ------------------------------

export interface DashboardStats {
  leads: {
    total: number;
    new_today: number;
    by_status: Record<string, number>;
    by_source: Record<string, number>;
  };
  appointments: {
    total: number;
    today: number;
    upcoming: number;
    by_status: Record<string, number>;
  };
  conversations: {
    active: number;
    total_this_week: number;
  };
  follow_ups: {
    pending: number;
    sent_today: number;
  };
  reviews: {
    average_rating: number | null;
    total: number;
  };
}

export interface RevenueStats {
  total_mrr: number;
  total_arr: number;
  active_customers: number;
  trial_customers: number;
  revenue_this_month: number;
  expenses_this_month: number;
  net_this_month: number;
}

// ---- Finance Summary ---------------------------------------

export interface FinanceSummary {
  period: string; // e.g. "2026-11"
  revenue: number;
  expenses: number;
  net: number;
  by_type: Record<string, number>;
}

// ---- Pagination --------------------------------------------

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}
