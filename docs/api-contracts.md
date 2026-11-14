# Clinic Growth AI — API Contracts

This document specifies all TypeScript API service functions implemented in `src/api/`. Each module interfaces with Supabase and returns standard `ApiResult<T>` or `ApiListResult<T>` containers with typed payload or error details.

```typescript
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
```

---

## 1. Authentication (`src/api/auth.ts`)

### `signUp(params: SignUpParams): Promise<ApiResult<User>>`
Registers a new user with Supabase Auth and attaches display metadata.
- **Parameters:**
  ```typescript
  interface SignUpParams {
    email: string;
    password: string;
    name: string;
  }
  ```
- **Returns:** Authenticated Supabase `User` object.

### `signIn(params: SignInParams): Promise<ApiResult<Session>>`
Signs in an existing user with email and password credentials.
- **Parameters:**
  ```typescript
  interface SignInParams {
    email: string;
    password: string;
  }
  ```
- **Returns:** Active Supabase `Session` object.

### `signOut(): Promise<ApiResult<null>>`
Terminates current session and clears local storage session state.
- **Parameters:** None.
- **Returns:** `{ data: null, error: null }` on success.

### `getCurrentUser(): Promise<ApiResult<User>>`
Fetches the currently authenticated user identity.
- **Parameters:** None.
- **Returns:** Current `User` or `null` if unauthenticated.

### `getSession(): Promise<ApiResult<Session>>`
Fetches active auth session including JWT tokens.
- **Parameters:** None.
- **Returns:** Current `Session` or `null`.

### `resetPassword(email: string): Promise<ApiResult<null>>`
Dispatches a password reset email via Supabase Auth.
- **Parameters:** `email: string`
- **Returns:** `{ data: null, error: null }`.

### `updatePassword(newPassword: string): Promise<ApiResult<User>>`
Updates password for an active session.
- **Parameters:** `newPassword: string`
- **Returns:** Updated `User`.

---

## 2. Clinic & Staff Management (`src/api/clinics.ts`)

### `getClinic(clinicId: string): Promise<ApiResult<Clinic>>`
Retrieves a clinic record by its primary key UUID.

### `getClinicBySlug(slug: string): Promise<ApiResult<Clinic>>`
Retrieves a clinic record by unique URL slug.

### `createClinic(input: ClinicInsert): Promise<ApiResult<Clinic>>`
Creates a new tenant clinic entry.

### `updateClinic(clinicId: string, input: ClinicUpdate): Promise<ApiResult<Clinic>>`
Updates settings, business hours, or contact info of a clinic.

### `getBranches(clinicId: string): Promise<ApiListResult<ClinicBranch>>`
Fetches all physical branch facilities belonging to a clinic.

### `createBranch(input: ClinicBranchInsert): Promise<ApiResult<ClinicBranch>>`
Adds a new physical branch location.

### `updateBranch(branchId: string, input: ClinicBranchUpdate): Promise<ApiResult<ClinicBranch>>`
Updates branch address, phone, or active status.

### `deleteBranch(branchId: string): Promise<ApiResult<null>>`
Removes a branch location.

### `getStaff(clinicId: string): Promise<ApiListResult<ClinicStaff>>`
Returns all registered staff members of a clinic.

### `getStaffMember(staffId: string): Promise<ApiResult<ClinicStaff>>`
Fetches single staff member profile.

### `getCurrentStaffProfile(): Promise<ApiResult<ClinicStaff>>`
Looks up the authenticated user's corresponding `clinic_staff` record.

### `createStaffMember(input: ClinicStaffInsert): Promise<ApiResult<ClinicStaff>>`
Registers a new staff member (doctor, receptionist, admin).

### `updateStaffMember(staffId: string, input: ClinicStaffUpdate): Promise<ApiResult<ClinicStaff>>`
Modifies role, phone, or active status of staff.

### `deactivateStaffMember(staffId: string): Promise<ApiResult<ClinicStaff>>`
Soft-deactivates staff member by setting `is_active: false`.

### `getFaqs(clinicId: string): Promise<ApiListResult<ClinicFaq>>`
Returns all active FAQ knowledge-base questions and answers.

### `createFaq(input: ClinicFaqInsert): Promise<ApiResult<ClinicFaq>>`
Creates a knowledge-base question and answer.

### `updateFaq(faqId: string, input: ClinicFaqUpdate): Promise<ApiResult<ClinicFaq>>`
Edits question, answer, or ordering index.

### `deleteFaq(faqId: string): Promise<ApiResult<null>>`
Deletes an FAQ entry.

---

## 3. Leads & Activities (`src/api/leads.ts`)

### `getLeads(clinicId: string, filters?: LeadFilterParams): Promise<ApiListResult<Lead>>`
Retrieves paginated, filtered leads for a clinic.
- **Parameters:**
  ```typescript
  interface LeadFilterParams {
    status?: LeadStatus;
    source?: LeadSource;
    assigned_to?: string;
    search?: string;
    from_date?: string;
    to_date?: string;
    limit?: number;
    offset?: number;
  }
  ```
- **Returns:** Array of matching `Lead` records and total `count`.

### `getLead(leadId: string): Promise<ApiResult<Lead>>`
Fetches a single lead by UUID.

### `createLead(input: LeadInsert): Promise<ApiResult<Lead>>`
Creates a new inbound patient lead.

### `updateLead(leadId: string, input: LeadUpdate): Promise<ApiResult<Lead>>`
Modifies lead details or notes.

### `deleteLead(leadId: string): Promise<ApiResult<null>>`
Deletes a lead record (admin/owner only).

### `transitionLeadStatus(leadId: string, newStatus: LeadStatus, staffId: string, note?: string): Promise<ApiResult<Lead>>`
Transitions status and writes an audit event to `lead_activities`.

### `getLeadActivities(leadId: string): Promise<ApiListResult<LeadActivity>>`
Returns chronologically ordered activity log for a specific lead.

### `addLeadActivity(input: LeadActivityInsert): Promise<ApiResult<LeadActivity>>`
Logs a phone call, WhatsApp conversation, or manual note.

### `searchLeads(clinicId: string, term: string, limit?: number): Promise<ApiListResult<Lead>>`
Fuzzy searches leads across name, email, and phone number.

---

## 4. Appointments & Scheduling (`src/api/appointments.ts`)

### `getAppointments(clinicId: string, options?: { date?: string; doctorId?: string; branchId?: string; limit?: number }): Promise<ApiListResult<Appointment>>`
Fetches scheduled appointments matching criteria.

### `getAppointment(appointmentId: string): Promise<ApiResult<Appointment>>`
Retrieves an appointment by UUID.

### `getAppointmentsForLead(leadId: string): Promise<ApiListResult<Appointment>>`
Retrieves appointment history for a patient.

### `createAppointment(input: AppointmentInsert): Promise<ApiResult<Appointment>>`
Creates an appointment booking.

### `updateAppointment(appointmentId: string, input: AppointmentUpdate): Promise<ApiResult<Appointment>>`
Modifies appointment date, time, doctor, or status.

### `cancelAppointment(appointmentId: string, notes?: string): Promise<ApiResult<Appointment>>`
Cancels an appointment with optional cancellation reason.

### `confirmAppointment(appointmentId: string): Promise<ApiResult<Appointment>>`
Sets appointment status to `confirmed`.

### `getSlots(clinicId: string, options?: { doctorId?: string; branchId?: string; dayOfWeek?: number }): Promise<ApiListResult<AppointmentSlot>>`
Fetches recurring clinic operating hour templates.

### `createSlot(input: AppointmentSlotInsert): Promise<ApiResult<AppointmentSlot>>`
Defines an availability window for doctor or branch.

### `updateSlot(slotId: string, input: AppointmentSlotUpdate): Promise<ApiResult<AppointmentSlot>>`
Modifies an existing slot template.

### `deleteSlot(slotId: string): Promise<ApiResult<null>>`
Deletes an availability slot template.

### `getAvailableSlots(query: AvailabilityQuery): Promise<ApiListResult<AvailableSlot>>`
Dynamically calculates available 30-minute booking increments for a specific calendar date by checking doctor shift templates against existing bookings.
- **Parameters:**
  ```typescript
  interface AvailabilityQuery {
    clinic_id: string;
    doctor_id?: string;
    branch_id?: string;
    date: string; // ISO date 'YYYY-MM-DD'
  }
  ```
- **Returns:**
  ```typescript
  interface AvailableSlot {
    time: string; // 'HH:MM:SS'
    doctor_id: string | null;
    branch_id: string | null;
  }
  ```

### `getTodayAppointments(clinicId: string): Promise<ApiListResult<Appointment>>`
Convenience helper to fetch today's full appointment roster.

---

## 5. Conversations & Realtime Chat (`src/api/conversations.ts`)

### `getConversations(clinicId: string, options?: { leadId?: string; status?: string; limit?: number }): Promise<ApiListResult<Conversation>>`
Fetches conversation threads across WhatsApp, web chat, and phone.

### `getConversation(conversationId: string): Promise<ApiResult<Conversation>>`
Fetches a single conversation thread.

### `createConversation(input: ConversationInsert): Promise<ApiResult<Conversation>>`
Starts a new communication session.

### `updateConversation(conversationId: string, input: ConversationUpdate): Promise<ApiResult<Conversation>>`
Updates conversation status.

### `closeConversation(conversationId: string): Promise<ApiResult<Conversation>>`
Marks conversation as `closed` and sets `ended_at`.

### `escalateConversation(conversationId: string): Promise<ApiResult<Conversation>>`
Marks conversation as `escalated` for human receptionist intervention.

### `getMessages(conversationId: string, limit?: number): Promise<ApiListResult<Message>>`
Fetches message log for a thread in ascending order.

### `addMessage(input: MessageInsert): Promise<ApiResult<Message>>`
Appends a message (from user, assistant, or system) to the thread.

### `getConversationHistory(conversationId: string): Promise<ApiResult<Array<{ role: string; content: string }>>>`
Formats conversation history into flat OpenAI/Gemini chat schema `[{ role, content }]`.

### `subscribeToMessages(conversationId: string, onMessage: (message: Message) => void): RealtimeChannel`
Subscribes to Supabase Realtime WebSocket changes to receive new incoming chat messages instantly.

---

## 6. Follow-up Engine (`src/api/followups.ts`)

### `getFollowUpRules(clinicId: string): Promise<ApiListResult<FollowUpRule>>`
Retrieves cadence rules configured for the clinic.

### `getFollowUpRule(ruleId: string): Promise<ApiResult<FollowUpRule>>`
Fetches single rule by UUID.

### `createFollowUpRule(input: FollowUpRuleInsert): Promise<ApiResult<FollowUpRule>>`
Creates a trigger rule (e.g. 24h post-lead creation reminder).

### `updateFollowUpRule(ruleId: string, input: FollowUpRuleUpdate): Promise<ApiResult<FollowUpRule>>`
Updates delay hours, message template, or channel.

### `deleteFollowUpRule(ruleId: string): Promise<ApiResult<null>>`
Deletes a follow-up rule.

### `getFollowUpTasks(clinicId: string, options?: { status?: string; leadId?: string; limit?: number }): Promise<ApiListResult<FollowUpTask>>`
Fetches queued follow-up executions.

### `getPendingFollowUpTasks(clinicId: string): Promise<ApiListResult<FollowUpTask>>`
Fetches all currently overdue or upcoming pending tasks.

### `createFollowUpTask(input: FollowUpTaskInsert): Promise<ApiResult<FollowUpTask>>`
Queues a follow-up task.

### `updateFollowUpTask(taskId: string, input: FollowUpTaskUpdate): Promise<ApiResult<FollowUpTask>>`
Modifies execution timestamp or attempt counter.

### `markFollowUpSent(taskId: string, response?: string): Promise<ApiResult<FollowUpTask>>`
Sets task status to `sent` and logs response message.

### `markFollowUpFailed(taskId: string, reason?: string): Promise<ApiResult<FollowUpTask>>`
Sets task status to `failed` and records error reason.

### `cancelFollowUpTask(taskId: string): Promise<ApiResult<FollowUpTask>>`
Cancels pending task (e.g., when patient converts early).

### `scheduleFollowUp(clinicId: string, leadId: string, ruleId: string, attemptNumber?: number): Promise<ApiResult<FollowUpTask>>`
Calculates execution timestamp based on rule delay and inserts new pending task.

---

## 7. Reports & Analytics (`src/api/reports.ts`)

### `getDashboardStats(clinicId: string): Promise<ApiResult<DashboardStats>>`
Aggregates full clinic overview KPI payload:
```typescript
interface DashboardStats {
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
```

### `getLeadFunnel(clinicId: string): Promise<ApiResult<Record<string, number>>>`
Returns count of leads grouped by current pipeline status.

### `getAppointmentVolume(clinicId: string, from: string, to: string): Promise<ApiResult<Record<string, number>>>`
Returns appointment counts grouped by calendar date.

### `getLeadSourceBreakdown(clinicId: string, days?: number): Promise<ApiResult<Record<string, number>>>`
Returns acquisition channel breakdown over recent window.

---

## 8. B2B Sales & Platform Admin (`src/api/prospects.ts`, `customers.ts`, `finance.ts`)

### Prospects API (`src/api/prospects.ts`)
- `getProspects(options?: { status?: SalesStatus; search?: string; limit?: number; offset?: number })`: Lists B2B leads.
- `getProspect(prospectId: string)`: Retrieves single clinic prospect.
- `createProspect(input: ProspectInsert)`: Inserts new researched clinic.
- `updateProspect(prospectId: string, input: ProspectUpdate)`: Updates qualification score and stage.
- `deleteProspect(prospectId: string)`: Removes prospect.
- `advanceProspectStatus(prospectId: string, newStatus: SalesStatus, nextAction?: string)`: Advances pipeline state.
- `getProspectActivities(prospectId: string)`: Lists sales touchpoints.
- `addProspectActivity(input: ProspectActivityInsert)`: Logs demo or sales call.

### Customers API (`src/api/customers.ts`)
- `getCustomers(options?: { status?: CustomerStatus; limit?: number; offset?: number })`: Lists subscribed dental clinics.
- `getCustomer(customerId: string)`: Fetches clinic subscription profile.
- `getCustomerByClinic(clinicId: string)`: Looks up customer record by clinic UUID.
- `createCustomer(input: CustomerInsert)`: Enrolls clinic into paid plan or trial.
- `updateCustomer(customerId: string, input: CustomerUpdate)`: Modifies plan, MRR, or dates.
- `updateHealthScore(customerId: string, score: number)`: Updates clinical retention health score (0-100).
- `activateCustomer(customerId: string)`: Marks subscription `active`.
- `churnCustomer(customerId: string)`: Marks subscription `churned`.
- `getActiveCustomers()`: Filters all active paying clinics.
- `getTrialCustomers()`: Filters all clinics on active trial.

### Finance API (`src/api/finance.ts`)
- `getFinanceRecords(options?: { type?: FinanceType; customerId?: string; from?: string; to?: string; limit?: number })`: Transaction ledger.
- `createFinanceRecord(input: FinanceRecordInsert)`: Records revenue or expense item.
- `updateFinanceRecord(recordId: string, input: FinanceRecordUpdate)`: Edits transaction item.
- `deleteFinanceRecord(recordId: string)`: Deletes transaction.
- `getMonthSummary(period: string)`: Calculates monthly P&L and net margin (`YYYY-MM`).
- `getRevenueStats()`: Computes MRR, ARR, active subscriber count, and monthly net cash flow.
- `getRecentMonthlySummaries(months?: number)`: Generates historical monthly financial comparisons.

---

## 9. Demo Seeding Engine (`src/api/seed.ts`)

### `seedDemoData(): Promise<{ success: boolean; message: string }>`
Seeds a comprehensive synthetic Indian dental clinic environment:
- Clinic: `[DEMO] SmileCare Dental Clinic` (Bengaluru)
- Branches, 4 standard dental FAQs
- 6 Realistic dental patient leads (root canal, teeth cleaning, dental implants)
- Appointments and available slots across Monday–Friday
- WhatsApp conversation history
- Configured automated follow-up cadences
- B2B customer record with MRR revenue ledger entries

### `clearDemoData(): Promise<{ success: boolean; message: string }>`
Purges all synthetic demo entities tagged with `[DEMO]` or `demo-smilecare`.
