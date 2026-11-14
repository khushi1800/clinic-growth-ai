# Security, Privacy & Compliance Review: Clinic Growth AI

**Date:** November 14, 2026  
**Auditor:** QA, Security & Architecture Lead  
**Classification:** Internal Confidential / SaaS Security Audit  
**Status:** Approved for Staging & Pilot Deployments  

---

## 1. Executive Summary

Clinic Growth AI is designed as a multi-tenant B2B SaaS platform serving dental healthcare practices in India. Because dental clinics handle patient names, phone numbers, treatment inquiries, and appointment schedules, strict technical isolation and statutory compliance with India's **Digital Personal Data Protection Act (DPDP Act 2023)** and **Digital Information Security in Healthcare Act (DISHA guidelines)** are fundamental design requirements.

This independent review audits the database security architecture, tenant isolation mechanisms, authentication workflows, AI boundary guardrails, API security, and mock adapter safety.

---

## 2. Threat Modeling & Attack Surface Analysis

| Threat Surface | Potential Threat | Implemented Mitigation | Verification Status |
|---|---|---|---|
| **Multi-Tenant Data Leakage** | Clinic A queries or updates Clinic B's patient leads or appointments | PostgreSQL Row-Level Security (RLS) enforced at the engine layer; queries filtered through `auth.user_clinic_id()` | ✅ Verified via automated test suite `tests/api/tenant-isolation.test.ts` |
| **Medical Advice Liability** | AI Receptionist hallucinates diagnostic claims, prescribes antibiotics, or contradicts clinical protocols | Deterministic keyword screening (`checkEmergencySymptoms`) + system prompt boundaries + hard-coded escalation hooks before AI generation | ✅ Verified via automated test suite `tests/components/receptionist-safety.test.ts` |
| **Credential & Secret Exposure** | Service keys or API tokens committed to Git repository | Zero hard-coded credentials; `.env.example` template used; `.gitignore` covers all `.env` files; client code reads runtime environment variables | ✅ Verified via repository grep and Git audit |
| **Administrative Privilege Escalation** | Receptionist or doctor staff alters subscription plan or views other clinics' finances | Role-Based Access Control (RBAC) via `clinic_staff.role` enum (`owner`, `admin`, `receptionist`, `doctor`) + separate platform admin tables (`prospects`, `customers`, `finance_records`) | ✅ Verified via database migration schema and RLS policies |
| **Spam & Anti-Harassment** | Automated follow-up messages sent after patient opt-out or conversion | Global opt-out registry (`OptOutRegistry`) + strict suppression checks for DND, STOP, patient conversion, and manual staff takeover | ✅ Verified via automated test suite `tests/components/followup-engine.test.ts` |
| **Denial of Service / Quota Burn** | Bot floods public AI web chat triggering expensive LLM token consumption | Configurable rate limiting + lightweight Mock AI Provider fallback + 1024 token generation ceilings | ✅ Tested & operational |

---

## 3. Database Security & Row Level Security (RLS) Audit

### 3.1 Policy Enforcement Architecture
All 16 tables across the system have `ALTER TABLE <table_name> ENABLE ROW LEVEL SECURITY;` enabled in `supabase/migrations/002_rls_policies.sql`.

1. **Tenant Context Resolution:**
   The session identity is evaluated via helper functions in the database:
   - `auth.user_clinic_id()`: Retrieves the current authenticated user's assigned `clinic_id`.
   - `auth.user_clinic_role()`: Extracts staff role (`owner`, `admin`, `receptionist`, `doctor`).
   - `auth.is_app_admin()`: Verifies whether the caller is a platform owner/operator.

2. **Clinic-Level Isolation:**
   Every select, insert, update, and delete operation on `leads`, `lead_activities`, `appointments`, `appointment_slots`, `conversations`, `messages`, `follow_up_rules`, and `review_requests` enforces:
   ```sql
   USING (clinic_id = auth.user_clinic_id())
   WITH CHECK (clinic_id = auth.user_clinic_id());
   ```
   No clinic staff member can view or modify records belonging to another clinic identifier, even if crafting raw SQL or direct Supabase REST requests.

3. **Platform Owner Isolation:**
   Platform B2B sales leads (`prospects`), commercial subscriptions (`customers`), and platform ledger (`finance_records`) have zero `clinic_id` columns and are strictly restricted to users with `auth.is_app_admin() = true`. Clinic end-users receive HTTP 403 / empty rowsets when attempting access.

4. **Immutable Audit Logging:**
   The `audit_log` table allows `INSERT` operations for tracking system modifications but explicitly prohibits `UPDATE` and `DELETE` queries by any non-superuser role.

---

## 4. AI Guardrails & Clinical Boundary Audit

### 4.1 Non-Diagnostic Regulatory Boundary
Under Section 5 of the project charter, the AI Receptionist must **never** diagnose conditions, prescribe medications, or invent clinical policies.

The implementation in `src/lib/ai/receptionist.ts` and `src/lib/ai/prompts.ts` enforces:
- **Red-Flag Emergency Interception:** Deterministic regex scans for severe bleeding, maxillofacial trauma, breathing obstruction, acute cellulitis, or knocked-out teeth. When detected, the system circumvents normal conversation, triggers an urgent hospital/hotline advisory, and marks `shouldEscalate: true`.
- **Prescription Rejection:** Inquiries mentioning antibiotics (Amoxicillin, Augmentin), analgesics (Ibuprofen, Ketorolac), or requesting diagnoses are met with an explicit refusal explaining that medications require in-person clinical examination by a licensed practitioner.
- **Identity Disclosure:** The system explicitly identifies itself as an AI digital receptionist on behalf of the specific dental clinic.

---

## 5. Privacy, DPDP Act 2023 & Healthcare Compliance

1. **Consent & Purpose Limitation:**
   - Patient contact details are collected strictly for appointment coordination, clinic inquiries, and approved follow-ups.
   - Follow-up messages support immediate opt-out keywords (`STOP`, `UNSUBSCRIBE`, `DND`).
2. **Data Minimization:**
   - No unnecessary medical history or sensitive genetic/biological data is collected by the receptionist.
   - Lead forms request solely: Full Name, 10-digit Phone, Inquiry Concern, and Time Preference.
3. **Auditability:**
   - Every lead status transition (`new` ➔ `contacted` ➔ `appointment_requested` ➔ `confirmed`) writes an immutable activity entry in `lead_activities`.
4. **Synthetic Demo Data Hygiene:**
   - All sample leads, appointments, and clinics in `src/hooks/useMockData.ts` and `src/api/seed.ts` are synthetic and prominently labeled `[DEMO]`. Zero real patient data exists in the codebase.

---

## 6. Secrets Management & Codebase Cleanliness

1. **Repository Audit:**
   - Zero hardcoded passwords, JWT secrets, or live API tokens were detected in Git history or source files.
   - `.env.example` clearly lists all configurable integration variables with dummy placeholders.
   - All client connections gracefully fall back to mock adapters when runtime credentials are empty.

---

## 7. QA Sign-Off

The system meets all security and data isolation requirements for MVP staging deployment. No critical vulnerabilities or data leakage vectors were identified during automated and static analysis.
