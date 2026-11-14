# Product Requirements Document: Clinic Growth AI MVP

**Version:** 1.0 | **Prepared:** November 2026

---

## Executive Summary

The smallest commercially useful MVP must demonstrate clear ROI to dental clinics within the first 30 days. ROI comes from two measurable outcomes:
1. **More patients booked** (AI captures missed leads + reduces no-shows)
2. **Less staff time** (automated follow-ups, reminders, billing)

The MVP focuses on the **AI Receptionist + Lead CRM + Basic Appointment Management** stack. Full clinic management (charting, prescriptions, inventory) are Phase 2.

---

## Customer Personas

### Persona 1: Dr. Priya Mehta — "The Busy Solo Dentist"
**Background:**
- 32-year-old BDS + MDS (Prosthodontics), runs her own clinic in Pune
- 2 dental chairs, 1 receptionist, 10–15 patients/day
- Runs Google/Meta ads; spending ₹15,000–₹25,000/month on marketing

**Goals:**
- Grow patient base without hiring a second receptionist
- Not lose ad leads who WhatsApp after hours
- Reduce the 25% no-show rate that's killing her revenue

**Frustrations:**
- During a crown procedure (60 min), she can't answer her phone
- By the time her receptionist calls back, the patient has booked elsewhere
- Manual WhatsApp follow-ups are inconsistent — relies on staff memory
- No visibility into which Google keywords or ads bring revenue

**Quote:** *"I spend ₹20,000 a month on ads but I have no idea how many calls I miss. I know I'm losing patients but I can't fix it."*

**Key needs:** AI that answers WhatsApp instantly, books appointments, reminds patients, shows her marketing ROI

---

### Persona 2: Dr. Ramesh Nair — "The Growth-Stage Multi-Chair Owner"
**Background:**
- 42-year-old BDS, owns a 4-chair clinic in Bengaluru with 2 associate dentists
- Monthly revenue: ₹5–8 lakhs; employs 1 receptionist + 1 dental assistant
- Has used Practo Ray before but found it "too generic"

**Goals:**
- Keep track of which patients are in mid-treatment (RCT sitting 2, braces adjustment 4)
- Get notified when high-value treatment plans (implants, full-mouth rehab) are pending acceptance
- Generate monthly reports to understand his clinic's growth

**Frustrations:**
- Associates book on separate WhatsApp chats — he has no central view
- Patients start implant consultations, never return — no follow-up system
- Month-end accounting is a 3-day manual exercise in spreadsheets
- Receptionist leaves at 7pm; evening WhatsApp leads go unanswered

**Quote:** *"I know I have 40 patients who consulted for implants in the last 6 months. I have no idea who I followed up with or not."*

**Key needs:** Centralized patient timeline, treatment plan follow-up sequences, revenue analytics, AI that covers after hours

---

### Persona 3: Meena Sharma — "The Front Desk Receptionist"
**Background:**
- 26-year-old receptionist at a 3-chair dental clinic in Jaipur
- Manages phone calls, WhatsApp, appointment book, billing, and patient reminders — solo
- Overwhelmed during peak hours (10am–1pm, 5pm–8pm)

**Goals:**
- Not miss a single new patient inquiry
- Confirm appointments without calling each patient manually
- Generate a quick billing invoice without data entry errors

**Frustrations:**
- Phone rings while she's handling billing — she can't do both
- WhatsApp is chaotic: 50+ messages/day across new inquiries and existing patients
- Doctor asks her for monthly reports; she has no system to generate them
- Patients sometimes show up for appointments she doesn't have on record

**Quote:** *"I need something that handles the WhatsApp while I handle the in-clinic patients. I can't be in two places at once."*

**Key needs:** AI handles incoming WhatsApp, automatic appointment reminders, easy one-screen billing

---

### Persona 4: Dr. Vikram Khanna — "The Aspirational Chain Builder"
**Background:**
- 48-year-old MDS (Oral Surgery), owns 2 clinics in Ahmedabad, planning a 3rd
- Combined monthly revenue: ₹15–20 lakhs; has a clinic manager at each location
- Currently uses different software at each location — data is siloed

**Goals:**
- Single dashboard to see both clinics' revenue, patients, and performance
- Standardize patient intake and follow-up process across locations
- Reduce dependency on individual clinic managers

**Frustrations:**
- Has to WhatsApp clinic managers every day to get revenue numbers
- If a patient starts treatment at Clinic A and comes to Clinic B, records don't follow
- One location's Google reviews are great; the other's are mediocre — no idea why

**Quote:** *"I need a system that shows me both clinics from one screen. Right now it's like running two businesses."*

**Key needs:** Multi-location dashboard, centralized patient records, automated review collection, comparative analytics

---

## MVP Scope Definition

### The Smallest Commercially Useful MVP

**Core principle:** A clinic should be able to sign up, connect their WhatsApp number, and within 48 hours have an AI responding to patient inquiries and booking appointments.

**MVP = 3 Modules:**
1. ✅ **AI Receptionist** (WhatsApp + phone lead capture + booking)
2. ✅ **Lead Management CRM** (pipeline, follow-ups, treatment tracking)
3. ✅ **Appointment Management** (calendar, reminders, no-show reduction)

**Phase 2 (Months 4–8):**
- Clinic Management: EMR, dental charting, prescriptions
- Billing & invoicing (GST-compliant)
- Reporting & analytics dashboard

**Phase 3 (Months 9–18):**
- Multi-location support
- Inventory management
- Lab order tracking
- Advanced AI: predictive no-show, treatment acceptance optimization

---

## User Stories & Acceptance Criteria

### MODULE 1: AI Receptionist

**US-1.1: Instant WhatsApp Response**
> *As a dental clinic owner, I want an AI to instantly respond to any new WhatsApp message from a patient, so that no lead goes unanswered even when I'm treating patients.*

**Acceptance Criteria:**
- AC1: AI responds to any new message within 30 seconds (99th percentile)
- AC2: AI correctly identifies: new patient inquiry vs. existing patient vs. appointment confirmation
- AC3: AI asks for name, dental concern, and preferred appointment time in a natural conversational flow
- AC4: AI supports Hinglish and English (Hindi transliteration in English script)
- AC5: AI escalates to human (via dashboard alert) for: emergencies, complex queries, unhappy patients
- AC6: Conversation is logged with full transcript in the CRM
- AC7: If clinic is marked "closed" (outside business hours), AI still responds and schedules callback

**Priority:** MUST HAVE

---

**US-1.2: AI Handles FAQ Without Human**
> *As a clinic receptionist, I want the AI to answer common questions automatically, so I don't have to respond to repetitive messages.*

**Acceptance Criteria:**
- AC1: AI correctly answers: clinic timings, location, pricing (from configured price list), doctor availability, treatment types offered
- AC2: Clinic owner can configure FAQ answers via settings dashboard (no coding)
- AC3: AI tracks which FAQs are asked most frequently (shown in analytics)
- AC4: Fallback to human when confidence is below threshold (< 70%)

**Priority:** MUST HAVE

---

**US-1.3: Phone Call AI Receptionist**
> *As a clinic owner, I want missed calls to trigger an automatic WhatsApp message to the caller, so they don't book elsewhere.*

**Acceptance Criteria:**
- AC1: When a registered clinic number receives a missed call, within 60 seconds a WhatsApp message is sent to the caller
- AC2: Message introduces the clinic, offers to help, and captures their dental concern
- AC3: Missed call log is visible in the dashboard with status (responded / not responded)

**Priority:** MUST HAVE

---

**US-1.4: Voice AI Receptionist (IVR + Transcription)**
> *As a clinic owner, I want calls to be answered by an AI voice, transcribed, and the patient details added to the CRM.*

**Acceptance Criteria:**
- AC1: Incoming calls are answered by AI voice (Indian English accent option)
- AC2: AI collects: name, concern, preferred timing
- AC3: Call is transcribed and saved to patient lead record
- AC4: Clinic owner can configure a callback mode (AI books vs. collects & human calls back)

**Priority:** NICE TO HAVE (Phase 2)

---

### MODULE 2: Lead Management

**US-2.1: Automatic Lead Creation**
> *As a clinic manager, I want every new patient inquiry (WhatsApp, phone, Google Form) to automatically create a lead in the CRM, so nothing slips through the cracks.*

**Acceptance Criteria:**
- AC1: New WhatsApp conversation from unknown number creates a Lead record automatically
- AC2: Lead record includes: name, phone, concern, source channel, timestamp
- AC3: Google Ads / Meta Ads webhook creates lead automatically when configured
- AC4: Google Form integration creates lead automatically
- AC5: Duplicate detection: if same phone number reaches out again, it's linked to existing lead/patient

**Priority:** MUST HAVE

---

**US-2.2: Lead Pipeline Management**
> *As a clinic owner, I want to see all my leads in a Kanban-style pipeline, so I know which stage each potential patient is at.*

**Acceptance Criteria:**
- AC1: Pipeline stages: New Inquiry → Appointment Booked → Visited → Treatment Quoted → Treatment Accepted → Active Patient → Lost
- AC2: Leads can be manually moved between stages via drag-and-drop or status button
- AC3: AI automatically advances leads (e.g., "Appointment Booked" when appointment is created)
- AC4: Filter by: time period, source channel, assigned staff, treatment type
- AC5: Pipeline shows value estimate (based on treatment type × average price)

**Priority:** MUST HAVE

---

**US-2.3: Automated Lead Follow-Up Sequences**
> *As a clinic owner, I want the system to automatically follow up with leads who haven't booked, so I don't lose potential patients.*

**Acceptance Criteria:**
- AC1: If a lead doesn't respond within 24 hours, system sends a WhatsApp follow-up automatically
- AC2: Follow-up sequence: Day 1 (immediate response) → Day 3 (gentle nudge) → Day 7 (last attempt) → Mark as Cold
- AC3: Clinic owner can customize message content and timing for each stage
- AC4: Follow-ups stop immediately if patient books or responds
- AC5: Follow-up activity is logged in lead timeline

**Priority:** MUST HAVE

---

**US-2.4: Treatment Plan Follow-Up**
> *As a dentist, I want to track patients who received a treatment quote but haven't started, so I can follow up and convert them.*

**Acceptance Criteria:**
- AC1: Dentist/receptionist can mark a patient as "Treatment Quoted" with the treatment type and estimated cost
- AC2: System automatically sends follow-up WhatsApp messages at: 3 days, 7 days, 14 days
- AC3: Messages are treatment-specific (e.g., "We noticed you were considering dental implants — here's what to expect")
- AC4: Patient can reply to book; reply triggers AI handling
- AC5: Conversion tracked in dashboard: "Quoted → Accepted" rate

**Priority:** MUST HAVE

---

**US-2.5: Multi-Visit Treatment Dropout Prevention**
> *As a dentist, I want to be alerted when a patient misses their follow-up appointment for an ongoing treatment (RCT, braces), so I can reach out before they drop out.*

**Acceptance Criteria:**
- AC1: When a patient with an active treatment plan (RCT, orthodontics, implants) has no appointment scheduled, system flags them after 14 days
- AC2: Automated WhatsApp reminder sent at 7 days and 14 days
- AC3: Dashboard shows "At-risk patients" count
- AC4: Dentist/staff can mark patient as "On Hold" to suppress alerts

**Priority:** MUST HAVE

---

### MODULE 3: Appointment Management

**US-3.1: AI Appointment Booking**
> *As a patient, I want to book a dental appointment through WhatsApp without calling the clinic, so I can book at any time of day.*

**Acceptance Criteria:**
- AC1: AI presents available slots to patient in WhatsApp conversation
- AC2: Patient confirms slot; appointment is created in calendar
- AC3: Clinic receives notification (WhatsApp + app) for each new booking
- AC4: Patient receives confirmation with appointment details and clinic address
- AC5: Double-booking is prevented — slot is marked unavailable immediately upon booking
- AC6: Clinic can configure: available hours, slot duration (15/20/30/45/60 min), chairs/doctors

**Priority:** MUST HAVE

---

**US-3.2: Automated Appointment Reminders**
> *As a clinic owner, I want the system to automatically remind patients of upcoming appointments, so no-show rates drop below 10%.*

**Acceptance Criteria:**
- AC1: WhatsApp reminder sent 24 hours before appointment: "Confirm, Reschedule, or Cancel" buttons
- AC2: WhatsApp reminder sent 2 hours before appointment
- AC3: If patient replies "Reschedule," AI presents alternative slots and books the new time
- AC4: If patient cancels, slot is marked available and notification sent to clinic
- AC5: No-show rate tracked in dashboard (appointments vs. actual visits)

**Priority:** MUST HAVE

---

**US-3.3: Appointment Calendar View**
> *As a receptionist, I want to see all appointments in a daily/weekly calendar view, so I can manage the clinic schedule at a glance.*

**Acceptance Criteria:**
- AC1: Calendar shows appointments by time slot, color-coded by doctor/chair
- AC2: Can view: Day, Week, Month
- AC3: Can create/edit/cancel appointments manually from calendar
- AC4: Shows patient name, treatment type, booking source (walk-in, WhatsApp, online)
- AC5: Loads within 2 seconds

**Priority:** MUST HAVE

---

**US-3.4: 6-Month Recall Reminders**
> *As a dentist, I want the system to automatically remind past patients for their 6-month check-up or scaling, so they return for preventive care.*

**Acceptance Criteria:**
- AC1: System records "last scaling date" per patient
- AC2: Automated WhatsApp reminder sent 6 months after last cleaning/scaling
- AC3: Message is personalized with patient name and suggests booking
- AC4: Reminder can be configured: 3 months, 6 months, 12 months per treatment type
- AC5: Reminder activity tracked in patient timeline

**Priority:** MUST HAVE

---

**US-3.5: Automated Google Review Requests**
> *As a clinic owner, I want to automatically ask satisfied patients for a Google Review after their appointment, so my online rating improves.*

**Acceptance Criteria:**
- AC1: 2 hours after appointment end time, WhatsApp message is sent with Google Review link
- AC2: Message is warm and personalized (not generic)
- AC3: Clinic owner can enable/disable this feature
- AC4: Review request NOT sent if appointment was cancelled or patient complained

**Priority:** MUST HAVE

---

### MODULE 4: Reporting (Lightweight MVP)

**US-4.1: Daily/Weekly Digest**
> *As a clinic owner, I want to receive a daily summary of my clinic's performance on WhatsApp every morning, so I stay informed without logging into the app.*

**Acceptance Criteria:**
- AC1: Daily WhatsApp message at 9am: new leads, appointments today, yesterday's revenue (if billing enabled)
- AC2: Weekly WhatsApp message on Mondays: week summary, top metrics vs. prior week
- AC3: Can disable via settings

**Priority:** MUST HAVE

---

**US-4.2: Dashboard Overview**
> *As a clinic owner, I want a simple dashboard showing key metrics, so I can understand my clinic's health in 60 seconds.*

**Acceptance Criteria:**
- AC1: Dashboard shows: Total leads (this month), Appointments booked, No-show rate, Conversion rate (lead → patient)
- AC2: Trend arrows (up/down) vs. prior period
- AC3: Loads within 3 seconds

**Priority:** MUST HAVE

---

## Must-Have vs. Nice-to-Have

### MUST HAVE (MVP Launch)
| Feature | Module |
|---|---|
| AI WhatsApp receptionist (auto-response + booking) | AI Receptionist |
| Missed call → WhatsApp auto-trigger | AI Receptionist |
| Lead pipeline (Kanban view) | Lead Management |
| Automated lead follow-up sequences (3-step) | Lead Management |
| Treatment plan follow-up | Lead Management |
| Multi-visit dropout alerts | Lead Management |
| Appointment calendar + manual booking | Appointments |
| AI appointment booking via WhatsApp | Appointments |
| 24hr + 2hr automated reminders | Appointments |
| 6-month recall campaigns | Appointments |
| Google Review auto-request | Appointments |
| Daily WhatsApp digest for owner | Reporting |
| Basic dashboard (leads, bookings, no-show rate) | Reporting |
| WhatsApp number onboarding wizard | Onboarding |
| Clinic settings (hours, doctors, prices, FAQ) | Config |

### NICE TO HAVE (Phase 2)
| Feature | Reason |
|---|---|
| Voice AI receptionist | Complex, requires IVR integration |
| FDI dental charting | Requires complex UI; PMS territory |
| Digital prescriptions | Regulatory nuance |
| GST billing & invoicing | Phase 2 for established clinics |
| Inventory management | Not in AI-first MVP |
| Multi-location dashboard | Small segment; Phase 2 |
| Advanced analytics (cost-per-lead, LTV) | Need data to build |
| Instagram DM integration | Nice, but WhatsApp is primary |
| Hindi/regional language UI | Phase 2; Hinglish supported in AI |

---

## Technical Requirements

### Non-Functional Requirements
- **Uptime:** 99.5% minimum (WhatsApp API dependent)
- **Response time:** AI replies within 30 seconds (target: 10 seconds)
- **WhatsApp compliance:** Use official WhatsApp Business API (Meta-approved BSP)
- **Data privacy:** DPDP Act compliant; patient data encrypted at rest and in transit
- **Onboarding:** Clinic should be live within 48 hours of signup
- **Mobile-first dashboard:** Works on Android Chrome (primary device of clinic owners)

### Integrations (MVP)
- WhatsApp Business API (via approved BSP: Interakt, AiSensy, or similar)
- Google Calendar (appointment sync)
- Google Business Profile (review link generation)
- Meta Ads webhook (lead import)
- Google Ads conversion tracking

---

## Success Metrics (MVP)

| Metric | Target (Month 3) |
|---|---|
| AI response rate | >95% of messages responded within 30s |
| No-show rate reduction | From baseline 25–35% → <15% |
| Lead conversion rate | >20% of captured leads → first appointment |
| Treatment follow-up conversion | >10% of quoted patients → started treatment |
| Customer NPS | >50 |
| Churn rate | <5%/month |
