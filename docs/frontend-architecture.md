# Clinic Growth AI — Frontend Architecture & UX Engineering

## 1. Executive Overview

Clinic Growth AI is a modern SaaS platform designed for Indian dental clinics, empowering them with a 24/7 autonomous AI receptionist, automated WhatsApp chair booking, lead qualification pipeline, and retention workflows.

The frontend is built with high performance, clinical clarity, and rapid responsiveness in mind, supporting both clinic staff (dentists, receptionists) and executive business owners across desktop and mobile devices.

---

## 2. Tech Stack & Design System

### Technology Stack
- **Framework:** React 19 + TypeScript
- **Bundler & Tooling:** Vite with `@tailwindcss/vite`
- **Styling:** Tailwind CSS v4 using modern `@theme` CSS custom properties
- **Routing:** React Router DOM v7 (`createBrowserRouter` with nested layout trees)
- **State & Server Cache:** `@tanstack/react-query`
- **Iconography:** `lucide-react`
- **Formatting & Utilities:** `clsx`, `date-fns`

### Color Palette & Design Tokens
Defined in `src/index.css` via Tailwind v4 `@theme`:
- **Primary Blue:** `#2563eb` (Brand trust, clinical authority)
- **Secondary Teal:** `#0891b2` (Aesthetic, cleanliness, modern healthcare)
- **Accent Amber:** `#f59e0b` (Alerts, triage warnings, ratings)
- **Success Emerald:** `#10b981` (Confirmed bookings, active subscriptions)
- **Danger Red:** `#ef4444` (Emergency medical triage, cancellations)
- **Surface & Backgrounds:** Pure white `#ffffff` cards on soft slate `#f8fafc` / `#f1f5f9` backgrounds
- **Typography:** Inter (`system-ui, -apple-system, sans-serif`) with high readability contrast

---

## 3. Directory Structure & Component Taxonomy

```
src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx           # Sticky topbar with search, notifications, & profile
│   │   ├── Sidebar.tsx          # Dual-mode desktop navigation (Clinic vs. Admin)
│   │   └── MobileNav.tsx        # Responsive mobile slide-over drawer
│   └── ui/
│       ├── Avatar.tsx           # Initials and image user avatar
│       ├── Badge.tsx            # Color-coded status badges with dot indicators
│       ├── Button.tsx           # Button variants (primary, secondary, outline, danger, ghost)
│       ├── Card.tsx             # Modular card layout primitives
│       ├── EmptyState.tsx       # Meaningful zero-data states with icons and CTAs
│       ├── Input.tsx            # Form input with icon slots, error & helper states
│       ├── LoadingSpinner.tsx   # Spinners and skeleton placeholders
│       ├── Modal.tsx            # Accessible backdrop dialog with escape key support
│       ├── Select.tsx           # Styled dropdown selects
│       ├── StatCard.tsx         # Dashboard metrics with trend indicators
│       ├── Table.tsx            # Clean data table primitives
│       └── Tabs.tsx             # Accessible tabbed navigation
├── hooks/
│   └── useMockData.ts           # Realistic dental clinic mock state & CRUD methods
├── layouts/
│   ├── AdminLayout.tsx          # Executive owner/admin shell
│   ├── AuthLayout.tsx           # Centered authentication wrapper
│   ├── DashboardLayout.tsx      # Clinic operations workspace shell
│   └── MarketingLayout.tsx      # Public website header and footer shell
├── pages/
│   ├── admin/
│   │   ├── AdminOverviewPage.tsx # MRR, subscription tier breakdown, action items
│   │   ├── CustomersPage.tsx     # Paying clinic subscribers, health scores, renewals
│   │   ├── FinancePage.tsx       # Real revenue vs. expense ledger and cash flow
│   │   └── ProspectsPage.tsx     # B2B dental clinic sales pipeline & qualification
│   ├── appointments/
│   │   ├── AppointmentDetailPage.tsx # Chair booking status, actions & WhatsApp timeline
│   │   └── AppointmentsPage.tsx     # Filterable appointments list
│   ├── auth/
│   │   ├── ForgotPasswordPage.tsx    # Password recovery flow
│   │   ├── LoginPage.tsx             # 1-click clinic and owner demo credentials
│   │   └── SignupPage.tsx            # Clinic onboarding pilot registration
│   ├── dashboard/
│   │   ├── AIPlaygroundPage.tsx      # Live Gemini 1.5 Flash chat & telemetry inspector
│   │   ├── ConversationsPage.tsx     # Live WhatsApp transcripts & staff takeover
│   │   └── OverviewPage.tsx          # Main clinic dashboard & emergency triage alerts
│   ├── leads/
│   │   ├── LeadDetailPage.tsx        # Single patient profile, clinical notes, appointment conversion
│   │   └── LeadsPage.tsx             # CRM pipeline table with status/source filters
│   ├── marketing/
│   │   ├── DemoRequestPage.tsx       # 15-minute tailored demo booking with validation
│   │   ├── HomePage.tsx              # High-converting landing page with live chat simulation
│   │   └── PricingPage.tsx           # Two-tier pricing, comparison table & FAQ accordion
│   └── settings/
│       ├── ClinicSettingsPage.tsx    # Clinic branding, operating hours, branch centers
│       ├── FAQPage.tsx               # AI knowledge base configuration with CRUD
│       ├── FollowUpRulesPage.tsx     # Automated WhatsApp delay and trigger rules
│       └── StaffPage.tsx             # Clinicians and front-desk staff role assignment
├── router.tsx                        # Declarative React Router configuration
├── App.tsx                           # Root router mounting
└── main.tsx                          # QueryClientProvider & StrictMode entry
```

---

## 4. Key UX & Engineering Highlights

### 1. Dual-Persona Routing
- **Clinic Dashboard (`/dashboard`, `/leads`, `/appointments`, `/conversations`, `/settings/*`):** Designed for dental practitioners and front-desk receptionists. Prioritizes patient urgency, upcoming chair slots, and quick WhatsApp communication.
- **Owner Admin Portal (`/admin`, `/admin/prospects`, `/admin/customers`, `/admin/finance`):** Designed for SaaS business directors. Tracks MRR (₹1,19,994), unit economics, customer health scores, and regional outbound sales pipelines.

### 2. Live AI Receptionist Playground & Telemetry
Located at `/ai-playground`, this page directly runs the `handleMessage` orchestrator from `src/lib/ai/receptionist.ts`:
- Evaluates deterministic emergency triage red flags (e.g. facial swelling, traumatic bleeding).
- Extracts patient intent, preferred appointment dates, phone numbers, and treatment concerns.
- Surfaces a live **AI Telemetry Inspector** showing confidence scores, JSON actions, and fast WhatsApp suggested replies.

### 3. Realistic Demo Data Architecture (`src/hooks/useMockData.ts`)
- 7 realistic dental leads reflecting Indian dental clinic demands (Root canal treatment, dental implants, laser whitening, clear aligners).
- Color-coded status lifecycle (`new` → `contacted` → `interested` → `appointment_requested` → `appointment_confirmed` → `converted`).
- Complete clinic profile (`Smile Dental Clinic [DEMO]`) situated in Indiranagar, Bengaluru, with full business hours and multi-branch support.

### 4. Zero Fabricated Data Integrity
In adherence to commercial guidelines, all charts and statistics avoid misleading fabricated graphs. Metrics are backed by actual calculated subscription sums and categorized expense ledgers.

---

## 5. Backend Swapping Roadmap

When the backend agent completes the full Supabase API client methods (`src/api/*`), swapping from the local mock hook (`useMockData`) to live Supabase data requires:
1. Replacing `useMockData` calls with standard `@tanstack/react-query` hooks invoking `src/api/leads.ts`, `src/api/appointments.ts`, and `src/api/clinics.ts`.
2. Supabase auth session subscription in `src/layouts/DashboardLayout.tsx`.
3. Supabase Realtime subscriptions on the `conversations` and `messages` tables for instant push updates in `ConversationsPage.tsx`.
