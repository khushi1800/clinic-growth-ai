# Staging & Production Release Checklist: Clinic Growth AI

**Date:** November 14, 2026  
**Auditor:** QA & Operations Release Lead  
**Scope:** Pilot & Commercial Launch Gate Review  

---

## 1. Release Readiness Gate

| Verification Category | Requirement | Staging Status | Production Gate |
|---|---|---|---|
| **Compilation & Bundle** | TypeScript check (`tsc -b`) and Vite production bundle (`vite build`) exit 0 | ✅ Verified (8.47s build, 0 errors) | Automated CI Pipeline Gate |
| **Automated Test Suite** | 100% of unit, safety, API contract, and tenant tests pass | ✅ Verified (12/12 pass, 0 fail) | Pre-commit & PR merge check |
| **Public Web Presence** | Marketing landing page, pricing tiers, and demo booking form operational | ✅ Complete and responsive | Custom domain DNS verification |
| **Clinic Tenant CRM** | Lead pipeline, appointment calendar, and clinic settings operational | ✅ Complete with demo dataset | Supabase cloud credentials applied |
| **AI Receptionist** | FAQ answers, lead capture, appointment booking, and emergency escalation | ✅ Complete with safety boundaries | Gemini / OpenAI API key configured |
| **Owner Business OS** | Prospect CRM, customer subscriptions, and finance ledger functional | ✅ Complete with unit economics | Restrict access to founder email only |
| **Secrets & Privacy** | Zero production credentials committed to version control | ✅ Verified (.env.example in place) | Cloud secrets manager / Vercel env |

---

## 2. Step-by-Step Staging Deployment Guide

### Phase 1: Environment & Repository Setup
1. Clone the repository to the deployment host:
   ```bash
   git clone <repo-url> clinic-growth-ai
   cd clinic-growth-ai
   ```
2. Verify runtime environment:
   ```bash
   node --version  # Recommended: Node 20.x or 22.x LTS
   npm --version
   ```
3. Install production dependencies:
   ```bash
   npm ci
   ```

### Phase 2: Supabase Database Provisioning
1. Create a free-tier project at [Supabase.com](https://supabase.com).
2. Open the **SQL Editor** in the Supabase Dashboard.
3. Execute `supabase/migrations/001_initial_schema.sql` to establish:
   - 16 relational tables
   - Enums, performance indexes, and automatic timestamp triggers
4. Execute `supabase/migrations/002_rls_policies.sql` to establish:
   - Row Level Security (RLS) policies
   - Multi-tenant clinic scoping helper functions
   - Platform admin isolation rules
5. (Optional) Run `src/api/seed.ts` or execute the seed SQL block if demo data is desired for training staff.

### Phase 3: Environment Variable Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Populate the production values:
```env
# Supabase Cloud Project Settings
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-public-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key-admin-only>

# AI Engine
AI_PROVIDER=google
AI_API_KEY=<your-gemini-api-key>
AI_MODEL=gemini-1.5-flash

# WhatsApp Business / Communications (Keep 'mock' until Meta verification)
WHATSAPP_PROVIDER=mock
EMAIL_PROVIDER=mock

# Application Base
APP_URL=https://clinicgrowthai.in
NODE_ENV=production
```

### Phase 4: Build & Host
1. Generate the static distribution assets:
   ```bash
   npm run build
   ```
2. Deploy the `dist/` folder to any low-cost/free CDN host:
   - **Vercel / Cloudflare Pages / Netlify / Render:** Free tier covers all MVP traffic.
   - Configure Single Page Application (SPA) rewrite rule: `/* -> /index.html`.

---

## 3. Rollback & Disaster Recovery Protocol

1. **Frontend Rollback:**
   - On Vercel / Cloudflare Pages: One-click instant rollback to the previous production deployment commit.
   - On custom Nginx/S3 host: Retain the previous build directory (`dist_previous/`) and switch symlink.
2. **Database Schema Rollback:**
   - Supabase automatically captures daily point-in-time snapshots on free and paid tiers.
   - Individual migration undo scripts should be tested against staging before schema modifications.
3. **Emergency Kill-Switch for AI Receptionist:**
   - Clinic owners can immediately toggle `ai_receptionist_enabled: false` in `ClinicSettingsPage`.
   - The system instantly pauses automated inbound replies and routes all WhatsApp messages to clinic front desk staff.
