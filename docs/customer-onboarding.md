# Clinic Growth AI — Customer Onboarding Manual & Implementation Guide

> **Audience:** Customer Success Team, Implementation Specialists, Partner Dental Clinics  
> **Target Timeline:** Day 0 through Day 7 to Go-Live, followed by 30/60/90 Day Lifecycle Management  
> **Goal:** Accelerate time-to-value (TTV), ensure 100% data fidelity, and drive verifiable lead recovery within the first 14 days.

---

## 1. Onboarding Timeline Overview

```
[Day 0: Account Setup] ➔ [Days 1–3: AI Customization & Staff] ➔ [Days 4–7: Shadow Testing & Go-Live] ➔ [Weeks 2–4: Weekly Health Check & ROI Review]
```

| Phase | Milestone | Key Deliverable | Owner |
|---|---|---|---|
| **Day 0** | Contract Execution & Account Creation | Tenant provisioned, Clinic Profile created | CSM / Ops |
| **Days 1–3** | Clinical Knowledge Ingestion & Staff Training | 30+ FAQs loaded, Staff accounts active, WhatsApp Webhook linked | CSM + Clinic Admin |
| **Days 4–7** | Simulation Testing, Call Forwarding & Go-Live | Live test checklist approved, Go-Live announced | CSM + Lead Doctor |
| **Weeks 2–4** | Early Metric Tuning & Optimization | First 50 leads audited, Missed call recovery verified | CSM |
| **Days 30/60/90**| Milestone Reviews & Expansion | Formal ROI review, Testimonial collection, Upsell to Premium | Account Exec |

---

## 2. Day-by-Day Implementation Workflow

### Phase 1: Day 0 — Account Provisioning & Clinic Configuration

#### Action Items (Completed within 4 hours of contract signing):
1. **Tenant Provisioning:**
   - Create organization and clinic record in Supabase:
     ```sql
     -- Verified configuration schema
     INSERT INTO clinics (name, slug, phone, email, city, business_hours, settings)
     VALUES ('[Clinic Name]', '[slug]', '[Phone]', '[Email]', '[City]', '{...}', '{...}');
     ```
   - Generate unique clinic onboarding token and Admin credentials.
2. **Clinic Intake Form Dispatch:**
   - Send the 10-minute digital Intake Form via WhatsApp and Email requesting:
     - Official Clinic Legal & Display Name.
     - Doctor roster (Name, Speciality, Qualification, Consulting Hours).
     - Standard Treatment Fee Schedule (Consultation, Cleaning, Root Canal, Aligners, Implants).
     - Physical location details, parking guidelines, and landmark notes.
     - Existing software details (Dentee, Practo Ray, etc.).

---

### Phase 2: Days 1–3 — Knowledge Base Ingestion, AI Training & Staff Setup

#### Step 1: AI Receptionist Customization
- Ingest standard clinical and administrative Q&A pairs into `clinic_faqs` across five standard categories:
  1. **Timings & Location:** Exact clinic hours, holiday schedule, nearest metro/landmark, parking availability.
  2. **Doctor Availability:** OPD schedules for resident dentists vs visiting implantologists/orthodontists.
  3. **Treatments & Transparent Pricing:** Consultation charges, X-ray costs, estimated ranges for cosmetic and surgical procedures.
  4. **Emergency Policies:** Clear clinical escalation instructions for acute dental emergencies.
  5. **Insurance & Payment Options:** Cash, UPI (GPay/PhonePe), Credit Cards, EMI options (Bajaj Finserv, CarePay).
- Set tone parameter: `Professional, empathetic, concise, and clinically conservative`.

#### Step 2: Staff Role Provisioning
- Invite users according to role hierarchy:
  - **Owner / Lead Doctor:** Full analytical visibility, settings control, clinical triage escalations.
  - **Clinic Manager / Receptionist:** Leads pipeline management, appointment calendar access, manual chat takeover.
  - **Associate Doctors:** Read-only calendar and patient appointment history.
- Run a 20-minute Zoom or in-person training session with front-desk staff demonstrating:
  - How to view new leads and filter by status (`New`, `Contacted`, `Appointment Confirmed`).
  - How to click "Take Over Chat" when a patient requires human interaction.
  - How 1-click WhatsApp appointment reminders operate.

---

### Phase 3: Days 4–7 — Shadow Simulation & Official Go-Live

#### Step 1: Internal Simulation & Testing Protocol
Before routing live patient traffic, the Implementation Specialist runs 10 benchmark test scenarios:
- [ ] Emergency pain inquiry (Verify high-priority doctor escalation trigger).
- [ ] Pricing inquiry for complex procedure (e.g., "Full mouth implants cost?").
- [ ] Working hours query for Sunday/Public Holiday.
- [ ] Mixed-language / Hinglish query ("Appointment chahiye kal sham ko").
- [ ] Out-of-scope query ("Do you treat heart disease?").
- [ ] Lead auto-capture check (Verify lead appears in `/dashboard/leads`).
- [ ] Appointment booking flow and calendar sync.
- [ ] WhatsApp reminder template delivery.

#### Step 2: Channel Activation
- **WhatsApp Channel:** Pair clinic's official WhatsApp Business number via Cloud API or QR-code integration.
- **Telephony Channel:** Set up conditional call-forwarding (*"Forward on busy / unanswered after 4 rings"* to Clinic Growth AI dedicated virtual number).
- **Web Widget:** Embed AI Chat widget script on clinic's homepage.

#### Step 3: Go-Live Signoff
- Conduct a 5-minute confirmation call with the clinic owner.
- Officially flip the tenant status from `Onboarding` to `Live Active`.

---

### Phase 4: Weeks 2–4 — Active Monitoring & Early Optimization

1. **Daily Lead Quality Audit (First 14 Days):**
   - CSM reviews incoming AI conversation transcripts every morning.
   - Any misinterpreted queries are added to the clinic FAQ base within 24 hours.
2. **Day 14 Check-In Call (15 Minutes):**
   - Present the **First 14-Day Performance Snapshot**:
     - Total incoming inquiries handled.
     - After-hours inquiries captured (7 PM – 8 AM).
     - Confirmed appointments booked directly by AI.
     - Estimated revenue value of recovered leads.
3. **Staff Feedback Collection:**
   - Gather front-desk staff impressions. Adjust notification sound volume, WhatsApp notification recipient groups, and reminder timing.

---

## 3. Success Criteria & Milestones (30 / 60 / 90 Days)

| Timeframe | Core Success Benchmark | Metric / Proof Point | Target Outcome |
|---|---|---|---|
| **Day 30** | Measurable Lead Recovery | ≥ 25 after-hours or missed-call leads recovered; ≥ 8 confirmed appointments | Client realizes positive net ROI over monthly subscription cost |
| **Day 60** | No-Show Reduction & Staff Habituation | Clinic no-show rate reduced by ≥ 30%; front-desk actively updates pipeline daily | Standard renewal secured; pilot client converted to regular paying contract |
| **Day 90** | Practice Expansion & Advocacy | Practice reports verifiable gross revenue increase; NPS score ≥ 9/10 | Secure written case study, video testimonial, and 1–2 doctor referrals |

---

## 4. Operational Escalation Matrix

When clinical, technical, or customer-facing issues occur, staff follow this strict escalation protocol:

```
LEVEL 1 (Front Desk / Bot) ➔ LEVEL 2 (CSM / Support Engineer) ➔ LEVEL 3 (Technical Lead / Founder)
```

| Escalation Level | Trigger Event | Action & SLA | Responsible Party |
|---|---|---|---|
| **P1 — Clinical Emergency** | Patient messages reporting trauma, uncontrolled bleeding, severe facial swelling | Bot triggers immediate automated WhatsApp/SMS alert to clinic owner; displays emergency hospital hotline. SLA: **Instant (< 30 seconds)** | Automated System / Lead Doctor |
| **P2 — System Downtime** | WhatsApp webhook disconnection or web dashboard inaccessibility | High-priority alert to engineering team; fallback SMS notification enabled. SLA: **< 15 minutes** | Technical Engineer |
| **P3 — AI Misinformation** | AI gives inaccurate price or incorrect timing to a patient | CSM intervenes, corrects FAQ repository, alerts clinic front desk to contact patient. SLA: **< 1 hour** | Customer Success Manager |
| **P4 — General Staff Query** | Receptionist needs assistance with lead filtering, export, or login reset | Resolves via dedicated Clinic Support WhatsApp Group. SLA: **< 2 hours during business hours** | Customer Support Specialist |

---

## 5. Proactive Churn Prevention System

Retaining dental clinics requires monitoring early warning indicators before the doctor considers cancelling:

### Early Warning Signals & Intervention Playbook

```
Signal: Usage Drops ➔ Warning Tagged ➔ Automated Alert ➔ Human Intervention Call within 24h
```

| Risk Level | Trigger Condition | Root Cause Analysis | Remedial Intervention Plan |
|---|---|---|---|
| 🟡 **Moderate** | Front-desk has not logged into the dashboard for 4 consecutive days | Front-desk staff forgot password or reverted to manual paper register | CSM messages clinic manager on WhatsApp: *"Noticed you haven't reviewed today's 4 new leads. Let's do a quick 5-min refresher."* |
| 🟠 **High** | Lead conversion rate drops below 10% for 2 consecutive weeks | Clinic staff calling leads too late (delay > 4 hours) or poor phone follow-up | CSM calls clinic owner: Share response-time analytics showing that leads contacted within 15 minutes convert 4x better. Provide staff coaching tips. |
| 🔴 **Critical** | Clinic submits cancellation request or expresses price dissatisfaction | Perceived lack of ROI or budget constraints | **Immediate Founder/Head of Sales Call:** Conduct a joint pipeline review. If technical setup failed, extend pilot by 14 days at zero charge with white-glove re-training. |

---

## 6. Standard Onboarding Handover Checklist

- [ ] Clinic Profile fully completed (Addresses, doctors, timings, specialties).
- [ ] At least 25 custom FAQ entries approved by lead clinician.
- [ ] WhatsApp Business number connected and template messages approved.
- [ ] Test inquiries executed across all 5 clinical categories.
- [ ] Staff user accounts created and verified by reception team.
- [ ] 20-minute staff training completed and recorded.
- [ ] Dedicated client VIP WhatsApp Support group activated.
- [ ] Day 14 and Day 30 review meetings pre-scheduled on clinic owner's calendar.
