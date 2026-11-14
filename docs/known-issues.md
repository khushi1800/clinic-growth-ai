# Known Issues & Technical Limitations: Clinic Growth AI

**Date:** November 14, 2026  
**Auditor:** QA & Technical Architecture Lead  
**Scope:** MVP Milestone Review  

---

## 1. Overview

This document transparently catalogs current technical constraints, intentional architectural trade-offs, mocked third-party integrations, and known edge-case behaviors in the Clinic Growth AI MVP.

---

## 2. Mock Integrations & External Credentials

| Integration | Current MVP State | Mock Implementation Details | Production Activation Requirement |
|---|---|---|---|
| **WhatsApp Business API** | 🟡 Mock Adapter | `src/lib/automation/channels.ts` (`MockWhatsAppChannel`) logs outbound payloads to console and internal audit buffer; returns simulated message IDs. | Meta Business Manager verification, approved WABA phone number, and official Cloud API or BSP credentials (e.g. Gupshup, Aisensy, Wati). |
| **Email Dispatch (SMTP/SES)** | 🟡 Mock Adapter | `src/lib/automation/channels.ts` (`MockEmailChannel`) validates RFC-compliant email structure and records dispatch simulation. | Production transactional provider credentials (Resend, SendGrid, or AWS SES) and SPF/DKIM DNS records. |
| **SMS Gateway (DLT/TRAI)** | 🟡 Mock Adapter | `src/lib/automation/channels.ts` (`MockSMSChannel`) validates 10-digit Indian MSISDN and enforces 160-character GSM-7 truncation checks. | Approved Entity Registration with Indian Telecom DLT portal (Jio/Airtel/Vil) and approved commercial SMS headers/templates. |
| **Supabase Managed Cloud** | 🟡 Local Mock Ready | All SQL migrations (`supabase/migrations/`) are written and validated for PostgreSQL 15+. In the absence of live cloud keys, client falls back to local memory mock. | Free-tier Supabase project creation, database provisioning, and copying URL/anon key to `.env`. |
| **Razorpay Payment Gateway** | 🟡 Deferred / Mock | Database supports financial ledger entries (`finance_records`); payment collection is manual or invoiced for MVP. | Razorpay Merchant account activation, Webhook secret configuration, and client SDK integration. |

---

## 3. Known Technical Limitations & Constraints

### 3.1 Node.js Version Runtime Warning
- **Issue:** Node v21.5.0 outputs npm `EBADENGINE` warnings during package installations because certain modern packages prefer Node `>=20.19.0 || >=22.12.0`.
- **Impact:** Non-breaking. Build (`npm run build`) and test execution (`npm test`) compile and pass with 0 errors.
- **Recommended Remediation:** Upgrade production staging server or container image to Node.js 22 LTS.

### 3.2 Realtime WebSocket in Headless Testing
- **Issue:** Node.js v21 without the `--experimental-websocket` flag lacks native global `WebSocket` support required by Supabase's Realtime client.
- **Mitigation Implemented:** `src/lib/supabase/client.ts` detects non-browser headless testing environments and supplies `HeadlessMockWebSocket` transport, allowing all test suites to execute without warnings.

### 3.3 Large Chunk Warning on Production Bundle
- **Issue:** `dist/assets/index-BDkYfGzN.js` is ~506 kB minified (141 kB gzip). Vite flags a warning recommending chunk size < 500 kB.
- **Root Cause:** All administrative portals, clinic CRM pages, Lucide icon barrels, and TanStack Query are bundled in a single vendor chunk for the MVP.
- **Remediation for Phase 2:** Implement React lazy-loading (`React.lazy` and `Suspense`) across routes in `src/router.tsx` to split the public marketing site from authenticated clinic dashboard chunks.

### 3.4 Calendar Integration & Double-Booking Prevention
- **Constraint:** Current MVP appointment scheduling calculates open slots based on the clinic's configured weekly schedule (`appointment_slots`) and existing database bookings.
- **Limitation:** It does not bi-directionally sync with external doctor personal calendars (e.g., Google Calendar, Apple Calendar, Practo Ray).
- **Rule:** As mandated by Section 5 (Module D), real appointments must be reviewed or confirmed by clinic staff before treating slots as locked against external clinic walk-ins.

### 3.5 Demo Booking Form Phone Sanitization & Button Propagation (Resolved)
- **Resolved Issue:** The demo booking form on `/demo` previously had an over-aggressive regex character class `[\s\-\+91]` that inadvertently stripped literal digits `9` and `1` from Indian phone numbers. Additionally, `<Button>` components lacked an explicit `type="button"`, causing secondary clicks to submit forms unexpectedly.
- **Resolution:** Replaced phone validation with strict prefix-aware sanitization (`/^[6-9]\d{9}$/`), defaulted all `Button` primitives to `type="button"`, added real-time error clearing on keystroke, and established direct route aliases for `/dashboard/ai-playground` and `/dashboard/conversations`.

---

## 4. Workarounds in Place

1. **AI Receptionist Telemetry Inspector:**
   - In `src/pages/dashboard/AIPlaygroundPage.tsx`, if no live Google Gemini API key is provided, the UI seamlessly engages `MockAIProvider`, delivering high-fidelity conversational simulation with simulated typing delay and structured action parsing.
2. **One-Click Demo Credentials:**
   - In `src/pages/auth/LoginPage.tsx`, quick-action buttons allow instant switching between "Demo Clinic Staff" and "Demo Platform Owner" views without requiring email verification.
