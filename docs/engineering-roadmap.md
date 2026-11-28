# Clinic Growth AI — Engineering Roadmap & Milestone 1 Execution Package

**Status:** PROPOSED — awaiting Founder approval. No implementation has started.
**Owner:** CTO (Claude). **Implementation:** Google Antigravity / Gemini. **Approver:** Founder.
**Date:** 2026-11-27

This is the single engineering plan and backlog. It does **not** replace the business documents; it links to them:

| Existing document | What it owns | Relationship |
|---|---|---|
| `product-requirements.md` | User stories, MVP must-haves | Source of requirements (US-x.x IDs are used for traceability below) |
| `six-month-roadmap.md` | Business/commercial timeline | Commercial dates; this file owns engineering sequence |
| `backend-architecture.md`, `api-contracts.md`, `ai-workflows.md` | Intended design of current code | Kept; corrections listed in §2 |
| `test-cases.md` | Manual QA catalogue | Kept; automated test strategy is §7 |
| `m1-task-briefs.md` | Per-task instructions issued to Gemini for Milestone 1 | Operational briefs; contracts stay in this file |
| `known-issues.md`, `security-review.md` | Known limitations | Kept; this file supersedes their "done" claims where §2 says so |
| `release-checklist.md` | Deployment steps | Kept; corrections listed in §2 |

---

## 1. Ground truth (verified in repo on 2026-11-27)

- Front-end only SPA (React 18, Vite, Tailwind 4). No backend code; `supabase/functions/` is empty.
- No page imports `src/api/*`. Every page uses the localStorage mock store `src/hooks/useMockData.ts`.
- Login, signup, forgot-password are timer simulations (`LoginPage.tsx`, `SignupPage.tsx`). No route guards (`router.tsx`).
- No Supabase project, `.env` or `.env.example` exists. `.gitignore` does **not** exclude `.env` files (only `*.local`).
- AI: Gemini REST provider reads `VITE_GEMINI_API_KEY` in the browser; otherwise a 1,022-line rule-based mock runs.
- Automation (follow-ups, reminders, opt-out) is in-memory only. WhatsApp/SMS/email are mock adapters.
- Baseline: `npm test` = 179 tests (177 pass, 2 todo, 0 fail); `tsc -b` clean; `eslint .` = 176 errors.
- Tooling on this machine: Node 21.5.0 (non-LTS; target Node 20 LTS in CI), npm 10.2.4. **Not installed:** Docker, Supabase CLI, psql, Vercel CLI, gh. Consequence: no local Postgres; database tests must run against the cloud **dev** Supabase project with synthetic data only.

## 2. Documentation conflicts to correct (task M1-14)

| Doc | Claim | Reality |
|---|---|---|
| `ai-workflows.md` | Gemini key read "without exposing secrets in client bundles" | `VITE_*` variables are embedded in the public bundle |
| `release-checklist.md` | Copy `.env.example` | File does not exist; also lists `SUPABASE_SERVICE_ROLE_KEY` beside `VITE_*` vars (must never be a `VITE_` var) |
| `release-checklist.md` | Supabase "captures daily point-in-time snapshots on free and paid tiers" | Unverified; do not rely on it. Backups must be confirmed against current Supabase plan terms |
| `six-month-roadmap.md` | "WhatsApp Cloud API direct" | `product-requirements.md` and the Founder decision say an approved Indian BSP. BSP is the decision of record |
| `known-issues.md` | Supabase "Local Mock Ready" | Accurate, but `src/api/*` has never run against a real database |

## 3. Planned vs existing (against PRD MVP must-haves)

| PRD must-have | State | Evidence |
|---|---|---|
| AI WhatsApp receptionist | PARTIAL — conversation logic + prompts + tests exist; no channel, no server, no persistence | `src/lib/ai/*`, `tests/components/*` |
| Missed call → WhatsApp | MISSING | — |
| Lead pipeline (Kanban) | PARTIAL — UI on mock data | `LeadsPage.tsx` |
| Auto lead creation / dedupe by phone | MISSING (logic only in mock) | — |
| 3-step follow-up sequences | PARTIAL — engine in memory, no scheduler | `followup.ts` |
| Treatment-plan follow-up, dropout alerts | MISSING | — |
| Appointment calendar + manual booking | PARTIAL — UI on mock data; no conflict check | `AppointmentsPage.tsx` |
| AI booking via WhatsApp | MISSING (needs channel + persistence) | — |
| 24h/2h reminders | PARTIAL — templates + logic; no scheduler | `reminders.ts` |
| 6-month recall, Google review request | MISSING (review_requests table only) | schema |
| Daily owner digest | MISSING | — |
| Basic dashboard | PARTIAL — mock numbers | `OverviewPage.tsx` |
| WhatsApp number onboarding wizard | MISSING | — |
| Clinic settings (hours, doctors, prices, FAQ) | PARTIAL — UI on mock data | `settings/*` |
| Real auth, onboarding, tenant isolation | MISSING / DEFECTIVE | §1, audit |

**Scope note:** the PRD "must-have" list is larger than the pilot MVP approved in the audit. The approved pilot scope ("MVP-0") is a deliberate subset: signup → own clinic → WhatsApp chat → lead → booking request → staff confirm → confirmation + 24h reminder with opt-out → simple lead/appointment lists. Everything else in the PRD must-have list is P1/P2 below. Founder to confirm in §10.

## 4. Roadmap

Priorities: **P0** = blocks any pilot. **P1** = needed for paid pilots at scale. **P2** = after first pilots.

### Milestone 1 — Secure foundation (P0, ~2 weeks) — detailed in §6
Real accounts, tenant isolation proven by tests, CI, dev environment. **Not a release:** pages still show mock data after login.

### Milestone 2 — Real data (P0, ~2 weeks)
| ID | Task | Pri | Depends |
|---|---|---|---|
| M2-01 | Clinic settings, FAQ, staff list on real API (replace mock reads/writes) | P0 | M1 |
| M2-02 | Leads: list/detail/status/notes on real API + `lead_activities` | P0 | M1 |
| M2-03 | Appointments: list/create/confirm/cancel on real API; server-side slot-conflict check | P0 | M1 |
| M2-04 | Demo mode retained as separate build (flag) | P0 | M1-11 |
| M2-05 | Staff invite flow (link invited auth user to `clinic_staff` row) — currently no way for a receptionist to get a login | P0 | M1 |
| M2-06 | Audit log writes for sensitive actions (server-side) | P1 | M1-05 |
| M2-07 | Search filter injection fix in `getLeads` (`.or()` built from raw input) | P1 | M2-02 |
| M2-08 | Cross-tenant foreign-key references: RLS checks `clinic_id` only, so a row in clinic A can reference a lead/branch/doctor of clinic B (e.g. `appointments.lead_id`, `branch_id`, `doctor_id`). Add triggers/composite keys + tests | P1 | M2-02 |

### Milestone 3 — Real AI on a server (P0, ~2 weeks)
| ID | Task | Pri | Depends |
|---|---|---|---|
| M3-01 | Edge Function `chat`: auth/clinic resolution, loads clinic context + FAQ, calls Gemini server-side, rate limit + per-clinic daily cap | P0 | M2-01 |
| M3-02 | Remove browser Gemini path; provider stays behind interface | P0 | M3-01 |
| M3-03 | Persist conversations/messages; create/dedupe lead by phone | P0 | M3-01, M2-02 |
| M3-04 | Website chat widget (public, anonymous, rate-limited) | P1 | M3-03 |
| M3-05 | Fix BUG-002 (greeting dead code) and BUG-003 ("day after tomorrow" parsed as "tomorrow") | P0 | — (can start any time) |
| M3-06 | Human-handoff flag + dashboard alert (US-1.1 AC5) | P0 | M3-03 |
| M3-07 | AI kill-switch enforced server-side (`ai_receptionist_enabled`) | P0 | M3-01 |

### Milestone 4 — WhatsApp + automation (P0, ~3 weeks)
| ID | Task | Pri | Depends |
|---|---|---|---|
| M4-01 | BSP selection (Founder decision) and sandbox account | P0 | — (start early; approvals are slow) |
| M4-02 | Inbound webhook Edge Function with signature verification | P0 | M3-03, M4-01 |
| M4-03 | Outbound `WhatsAppChannel` real adapter behind existing `MessageChannel` interface | P0 | M4-01 |
| M4-04 | Persistent opt-out/consent table, honoured by every send | P0 | M2 |
| M4-05 | `pg_cron` scheduler: 24h reminder, follow-up step 1 (idempotent, retry, failure log) | P0 | M4-03, M4-04 |
| M4-06 | Template management for BSP-approved templates | P1 | M4-03 |
| M4-07 | Staff reply-from-dashboard / takeover | P1 | M4-02 |

### Milestone 5 — Pilot hardening (P0, ~1–2 weeks)
Playwright end-to-end suite, Sentry, backup/restore drill, privacy policy + DPDP consent text (reviewed by a qualified person), production Supabase project (Mumbai), production Vercel project, load/cost test of AI path, pilot runbook.

### Later (P1/P2)
Daily digest, 2h reminder, 6-month recall, review requests, Kanban polish, missed-call trigger, treatment-plan follow-ups, dropout alerts, billing/subscriptions (manual invoicing first), multi-branch, owner-admin finance/prospects (NOT REQUIRED for MVP; spreadsheet first), Google Calendar sync, voice AI.

### Sequence at a glance
`M1 → M2 → M3 → M4 → M5`, with M3-05 and M4-01 allowed to start at any time (no code dependency).

---

## 5. Milestone 1 — Business objective

A clinic owner can create an account, get their own clinic, sign in, and see only their own data area; unauthenticated visitors and other clinics cannot reach it. A self-granted "admin" flag gives nothing. The project has CI, a clean lint baseline, a development environment holding only synthetic data, and a repeatable cross-tenant security test.

**Out of scope for M1:** wiring leads/appointments to the database (M2), real AI/WhatsApp (M3/M4), staff invites (M2-05), billing.

## 6. Milestone 1 — Technical package

### 6.1 Approach and decisions (CTO)
1. **Amend `001`/`002` in place** rather than stacking fixes: no environment has ever applied them (no Supabase project exists). Confirm the new dev project is empty before applying. After first successful apply, migrations become append-only (`003+`).
2. **Platform admin** = row in a new `platform_admins(user_id)` table, readable only through RPC `is_platform_admin()`. Never user metadata.
3. **Clinic creation** only through a SECURITY DEFINER RPC `create_clinic_with_owner`. No direct INSERT on `clinics` for clients.
4. **Helper functions** move out of the `auth` schema (hosted Supabase generally does not allow creating objects there; to be proven in the first apply) into schema `private`, with `SET search_path = ''`.
5. **Demo mode** is a build-time flag `VITE_DEMO_MODE`. Demo build = today's behaviour (mock data, no real auth). Real build = real auth. The sales demo and the product are separate Vercel projects/environments.
6. **One clinic per user** stays (matches `LIMIT 1` helpers). Multi-clinic users are out of scope.
7. M1 is **not deployed to the production domain**; real-mode pages still render mock data until M2.

### 6.2 Additional database defects found while preparing this package (to fix in M1-05)
- `staff_admin_write` / `staff_admin_update` let an `admin` insert a staff row with role `owner` or promote themselves; nothing protects the last owner. Fix: only `owner` may grant/alter `owner`/`admin`; admins limited to `doctor`/`receptionist`.
- `audit_log_authenticated_insert` does not require `user_id = auth.uid()`; any signed-in user can forge audit entries. Fix: force `user_id = auth.uid()` via WITH CHECK, or insert only server-side.
- `auth.is_app_admin()` trusts user-editable `raw_user_meta_data` (critical; see audit).
- No `GRANT/REVOKE` hygiene: confirm `anon` has no table privileges beyond what is intended.

### 6.3 Files / modules likely to change
| Area | Files |
|---|---|
| New | `src/auth/AuthProvider.tsx`, `src/auth/useAuth.ts`, `src/auth/guards.tsx`, `src/pages/auth/ResetPasswordPage.tsx`, `src/pages/onboarding/OnboardingPage.tsx`, `.env.example`, `.github/workflows/ci.yml`, `scripts/check-bundle-secrets.mjs`, `tests/rls/*.test.ts`, `tests/auth/*.test.tsx` (or `.ts`) |
| Modified | `src/router.tsx`, `src/main.tsx`/`App.tsx` (provider), `src/pages/auth/{Login,Signup,ForgotPassword}Page.tsx`, `src/api/auth.ts`, `src/api/clinics.ts`, `src/lib/supabase/client.ts`, `src/lib/ai/provider.ts`, `src/components/layout/{Header,Sidebar,MobileNav}.tsx` (real sign-out, role-aware menu), `.gitignore`, `package.json` (scripts), `supabase/migrations/001*.sql`, `002*.sql`, `docs/*` (M1-14) |
| Lint cleanup (no behaviour change) | files reported by `npx eslint .` (mock-provider, useMockData, tests, etc.) |

### 6.4 Task list

Lanes: **S** = SQL/security (Claude), **F** = front-end (Gemini), **C** = CI/hygiene (Gemini), **O** = Founder.

| ID | Lane | Pri | Task | Depends | Owner |
|---|---|---|---|---|---|
| M1-03 | C | P0 | Clear all 176 lint errors **without** disabling rules globally and without changing behaviour. Per-line suppressions need a one-line justification. | — | Gemini |
| M1-01 | C | P0 | Add `.env`, `.env.*` (except `.env.example`) to `.gitignore`; create `.env.example` with **public vars only**; browser must not read `VITE_GEMINI_API_KEY` in production builds; add `scripts/check-bundle-secrets.mjs` | M1-03 (same file `provider.ts`) | Gemini |
| M1-04 | O | P0 | Create **empty dev** Supabase project, region Mumbai (ap-south-1); share URL + anon key in chat; keep service-role key only in local `.env` / GitHub secret (never in chat or repo). Disable nothing else yet. | — | Founder |
| M1-05 | S | P0 | Migration rewrite: `private` helper functions; `platform_admins`; `is_platform_admin()`; `create_clinic_with_owner()`; staff-role escalation fix; audit_log insert fix; grants review | M1-04 (to apply) | **Claude writes**; Founder/Gemini applies via Supabase SQL editor |
| M1-06 | S | P0 | RLS/RPC test suite (`npm run test:rls`) per §6.8 | M1-05 applied | Claude designs matrix; Gemini implements; Claude reviews |
| M1-07 | F | P0 | `AuthProvider` + `useAuth` per contract §6.5 | contracts only | Gemini |
| M1-08 | F | P0 | Guards `RequireAuth`, `RequireRole`, `RequirePlatformAdmin`; wire in router | M1-07 | Gemini |
| M1-09 | F | P0 | Real login/signup/forgot/reset pages; remove prefilled credentials and "quick login" from non-demo build | M1-07 | Gemini |
| M1-10 | F | P0 | Onboarding page calling `create_clinic_with_owner` | M1-07, M1-05 | Gemini |
| M1-11 | F | P0 | `VITE_DEMO_MODE` flag: demo build keeps current behaviour; real build has no bypass path | M1-08 | Gemini |
| M1-12 | F | P0 | Real sign-out in Header; role-aware navigation; `/admin/*` behind `RequirePlatformAdmin` | M1-08 | Gemini |
| M1-02 | C | P0 | GitHub Actions: Node 20, `npm ci`, `tsc -b`, `eslint .`, `npm test`, `npm run build`, bundle-secret scan. Lint becomes a blocking step once M1-03 merged | M1-03, M1-01 | Gemini |
| M1-13 | O/C | P0 | Vercel: inspect existing project; preview deployment using dev Supabase public vars only | M1-04 | Founder provides access/info; Gemini configures per Claude's instructions |
| M1-14 | S | P1 | Correct the doc conflicts in §2 | — | Claude |
| M1-15 | F | P1 | Playwright smoke: signup→onboarding→dashboard→sign-out; guard redirects (decision in §10) | M1-09, M1-10 | Gemini |

### 6.5 Contracts (define before coding)

**Database RPCs** (schema `public`, `GRANT EXECUTE` to `authenticated` only, `REVOKE` from `anon`/`public`, `SECURITY DEFINER`, `SET search_path = ''`)

```
create_clinic_with_owner(p_name text, p_phone text default null, p_city text default null) returns uuid
```
- Uses `auth.uid()`; never accepts a user id from the client.
- Errors (raised as `RAISE EXCEPTION` with these messages): `not_authenticated`, `already_member` (user already has an active staff row), `invalid_name` (trimmed length not in 2..100).
- Effect (atomic): insert `clinics` (slug generated server-side from name + random suffix), insert `clinic_staff` (role `owner`, `user_id = auth.uid()`, name/email from auth user). Returns the new clinic id.

```
is_platform_admin() returns boolean   -- true iff auth.uid() is in platform_admins
```

**Client** (`src/auth/useAuth.ts`)
```ts
type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';
interface Membership { clinicId: string; staffId: string; role: 'owner'|'admin'|'doctor'|'receptionist' }
interface AuthState {
  status: AuthStatus;
  user: User | null;
  membership: Membership | null;     // null = signed in but no clinic yet
  isPlatformAdmin: boolean;
  signIn(p: SignInParams): Promise<ApiResult<Session>>;
  signUp(p: SignUpParams): Promise<ApiResult<User>>;
  signOut(): Promise<void>;
  refresh(): Promise<void>;
}
```
Existing `src/api/auth.ts` functions are reused (not rewritten). Add to `src/api/clinics.ts`: `createClinicWithOwner(input)` and `getMyMembership()`.

**Routing rules**
| Route | Rule |
|---|---|
| `/`, `/pricing`, `/demo`, `/login`, `/signup`, `/forgot-password`, `/reset-password` | public (auth pages redirect to `/dashboard` if already signed in) |
| `/onboarding` | signed in, `membership === null` (otherwise redirect `/dashboard`) |
| `/dashboard`, `/leads*`, `/appointments*`, `/conversations`, `/ai-playground` | signed in + membership (any role) |
| `/settings/*` | membership role `owner` or `admin` (mirrors existing RLS write policies); others see a "no access" view |
| `/admin/*` | `isPlatformAdmin` |
| Unauthenticated access to protected route | redirect `/login?returnTo=<path>`; `returnTo` must be a same-origin relative path (reject `//`, `http:`) |

**Assumptions to confirm:** password minimum 8 characters (Supabase default); email confirmation required; one clinic per user; settings = owner/admin only. Supabase's built-in email sender is rate-limited on the free tier (limit not verified), so production needs custom SMTP — tracked for M5.

### 6.6 Acceptance criteria
| ID | Criterion |
|---|---|
| AC-1 | A new user can sign up, confirm email, sign in, create a clinic once, and land on `/dashboard`. |
| AC-2 | Without a session, every protected route redirects to `/login`; `/admin/*` is unreachable for non-platform-admins. |
| AC-3 | Clinic A staff cannot read, insert, update or delete any Clinic B row in any clinic-scoped table (proven by test, including via RPC). |
| AC-4 | A user who signs up with `is_app_admin: true` in metadata gets no extra access (proven by test). |
| AC-5 | An `admin` cannot create/promote an `owner`; a `receptionist` cannot write staff/FAQ/settings. |
| AC-6 | `anon` role cannot read or write any table. |
| AC-7 | Production bundle contains no `service_role` key and no Gemini key (`scripts/check-bundle-secrets.mjs` passes). |
| AC-8 | Demo build still works as today; real build has no auth bypass and no pre-filled credentials. |
| AC-9 | `eslint .` = 0 errors; `tsc -b` clean; existing 177 pass / 2 todo unchanged (no test removed or weakened); `npm run build` succeeds. |
| AC-10 | CI runs the above on every push/PR and blocks on failure. |

### 6.7 Security considerations
- Service-role key: never in browser, repo, chat or `VITE_` variable; only local `.env` and GitHub secret.
- Test data is synthetic only (fake names, `@example.test` emails, fake numbers). No real patient data in dev/test/CI.
- RPCs are `SECURITY DEFINER` with fixed `search_path` and derive identity only from `auth.uid()`.
- `returnTo` open-redirect guard. Generic login error messages (no account enumeration beyond Supabase defaults). No tokens/PII in `console` logs.
- Front-end guards are **UX only**; real enforcement is RLS. Tests must prove the DB layer, not the UI.
- Revisit CORS/redirect URL allow-list in the Supabase dashboard (Site URL, Redirect URLs limited to localhost + Vercel preview).

### 6.8 Test scenarios

**RLS / RPC (`tests/rls`, real dev DB, two clinics A/B, users: ownerA, adminA, receptionistA, ownerB, platformAdmin, anon, user-with-no-clinic)**

| ID | Scenario | Expected |
|---|---|---|
| R-01 | anon SELECT on each of the 18 tables | zero rows / permission denied |
| R-02 | ownerA SELECT each clinic-scoped table | only clinic A rows |
| R-03 | ownerA INSERT row with `clinic_id = B` (every clinic-scoped table) | rejected |
| R-04 | ownerA UPDATE / DELETE a B row by id | 0 rows affected |
| R-05 | ownerA UPDATE own row setting `clinic_id = B` | rejected |
| R-06 | user signs up with metadata `is_app_admin:true`, reads clinics/leads/prospects/finance | nothing beyond own scope |
| R-07 | platformAdmin (in `platform_admins`) reads prospects/finance | allowed; clinic staff denied |
| R-08 | adminA inserts staff role `owner`; adminA updates self to `owner` | rejected |
| R-09 | receptionistA writes FAQ / staff / clinic settings | rejected; can read FAQs |
| R-10 | receptionistA creates/updates leads and appointments in clinic A | allowed |
| R-11 | `create_clinic_with_owner` as anon | rejected `not_authenticated` |
| R-12 | `create_clinic_with_owner` happy path | clinic + owner staff row, returned id readable by that user only |
| R-13 | `create_clinic_with_owner` second call same user | `already_member` |
| R-14 | name `''`, 1 char, 101 chars, whitespace-only | `invalid_name` |
| R-15 | name with SQL/HTML characters | stored literally, no error, no injection |
| R-16 | two clinics with identical names | distinct slugs |
| R-17 | audit_log insert with another user's `user_id` | rejected |
| R-18 | user deactivated (`is_active=false`) loses access immediately | zero rows |
| R-19 | `is_platform_admin()` for normal user / anon | false / rejected |
| R-21 | platform admin deletes a clinic that has an owner (cascade must not trip the last-owner trigger); a client deleting/demoting/deactivating the only owner | cascade OK; client attempt raises `last_owner` |
| R-22 | client updates a staff row's `user_id` or `clinic_id`; client inserts staff with a `user_id` | rejected (`staff_identity_immutable` / policy) |
| R-23 | second active staff row for the same `user_id` | unique violation |
| R-20 | **Mutation check (CTO review):** temporarily drop one policy on a table; suite must fail | proves tests are not vacuous |

**Front-end (`tests/auth`)**
| ID | Scenario | Expected |
|---|---|---|
| A-01 | unauthenticated → `/dashboard`, `/leads`, `/settings/staff`, `/admin` | redirect `/login?returnTo=…` |
| A-02 | after login with `returnTo=/leads` | lands on `/leads` |
| A-03 | `returnTo=https://evil.test`, `//evil.test`, `javascript:` | ignored → `/dashboard` |
| A-04 | signed in, no membership | any protected route → `/onboarding` |
| A-05 | signed in with membership → `/onboarding` | → `/dashboard` |
| A-06 | receptionist → `/settings/staff` | no-access view |
| A-07 | non-platform-admin → `/admin` | denied |
| A-08 | invalid email, empty password, short password, mismatched confirm | field errors, no network call |
| A-09 | wrong password | generic error, no navigation |
| A-10 | network failure / Supabase 5xx | visible error, button re-enabled |
| A-11 | double-click submit | single request |
| A-12 | sign-out | session cleared; back button cannot reveal protected page data |
| A-13 | session expiry / token refresh failure mid-session | redirect to `/login` |
| A-14 | demo build | existing behaviour preserved |
| A-15 | real build | no pre-filled credentials; no quick-login buttons |

**Hygiene / CI**
| ID | Scenario | Expected |
|---|---|---|
| H-01 | `git check-ignore .env .env.local .env.production` | all ignored; `.env.example` tracked |
| H-02 | plant fake `service_role` / `AIza…` string in a build → scanner | fails the build |
| H-03 | CI on a PR with a deliberate lint error / failing test | CI red |

**Regression guard:** existing 179 tests unchanged in count and outcome (177 pass, 2 todo).

### 6.9 Build and verification commands
Run from repo root (PowerShell or bash):
```
npm ci
npx tsc -b
npx eslint .
npm test
npm run build
node scripts/check-bundle-secrets.mjs dist
npm run test:rls          # requires dev-project env vars in local .env; synthetic data only
git check-ignore -v .env .env.local .env.production
```
Required `package.json` scripts to be added (M1-01/M1-06): `test:rls`, `check:secrets`, `typecheck`.

---

## 7. Parallelism and sequencing (M1)

```
Day 0:   [O] M1-04 create dev project
         [S] M1-05 write migrations (Claude)           ─┐
         [C] M1-03 lint baseline → M1-01 hygiene        │ three independent lanes,
         [F] M1-07 AuthProvider (contract-first)       ─┘ disjoint files
Then:    M1-05 applied → M1-06 RLS tests, M1-10 onboarding
         M1-07 → M1-08 → (M1-09, M1-11, M1-12) → M1-10
         M1-03 + M1-01 → M1-02 CI (blocking)
End:     M1-13 Vercel preview, M1-15 smoke, joint verification
```
**Safe in parallel:** SQL lane (M1-05/06) ∥ lint+hygiene lane (M1-03/01) ∥ AuthProvider (M1-07).
**Must be sequential:** M1-03 before M1-01/M1-02 (shared files, lint gate); M1-07 before M1-08/09/10/11/12; M1-05 applied before M1-06 and M1-10; `router.tsx` and `provider.ts` are single-writer files — one branch at a time.
Gemini should run **one agent per lane**, each on its own branch `m1/<task-id>`, merged to `main` only after CTO review.

## 8. Work assignment

| Gemini (Antigravity) | Claude (CTO) | Founder |
|---|---|---|
| M1-01, 02, 03, 07, 08, 09, 10, 11, 12, 15; implements M1-06 tests; Vercel config steps | Requirements, contracts (this doc), M1-05 SQL, M1-06 test matrix, M1-14, review of every branch, release sign-off | M1-04 project creation, Vercel info/access, approvals in §10 |

Each Gemini task brief will contain: task ID, files allowed to change, files forbidden, contract excerpt, acceptance criteria, exact commands to run, and "do not modify or delete existing tests; do not disable lint rules globally; no real personal data."

## 9. How Claude verifies Gemini's work (no trust in summaries)
For every task branch:
1. `git fetch` then `git diff --stat main...m1/<id>`: confirm only allowed files changed; reject out-of-scope edits.
2. Read the full diff of source, migrations and tests.
3. Test-integrity checks: no deleted/renamed tests; count of `skip`/`todo`/`only` and `eslint-disable` not increased without justification; baseline 177 pass / 2 todo preserved; assertions not loosened (diff of `tests/`).
4. Re-run §6.9 commands myself on the branch and compare output to Gemini's reported evidence.
5. Security-specific: grep diff for `service_role`, `VITE_` secrets, `console.log` of tokens; confirm guards are backed by RLS tests, not UI only.
6. Mutation check (R-20): temporarily weaken one policy in the dev DB and confirm RLS suite goes red; revert.
7. Manual walkthrough of AC-1/AC-2/AC-8 in the browser on the Vercel preview.
8. Written verdict per task: ACCEPT / CHANGES REQUESTED, with evidence (command output, file:line). Nothing merges without ACCEPT; milestone closes only when AC-1…AC-10 are all evidenced.

## 10. Decisions needed from the Founder
1. Approve this roadmap and Milestone 1 package.
2. Confirm MVP-0 pilot scope (§3 scope note) is acceptable versus the larger PRD must-have list.
3. Confirm assumptions in §6.5 (password min 8, email confirmation, one clinic per user, settings owner/admin only).
4. Confirm M1-15 Playwright smoke test is in M1 (recommended) or deferred to M5.
5. M1-04: create the dev Supabase project (Mumbai, free tier, empty) and share URL + anon key only.
6. Vercel: provide the existing project name and either screenshots of Settings → Environment Variables / Git integration, or output of `vercel ls` if you install the CLI, so I can inspect before changing anything.
7. Confirm Gemini will push task branches to the GitHub remote for review (I will not push or merge on your behalf).
8. Decide BSP shortlist for M4-01 (can wait, but approvals are slow; recommend starting inquiries during M2).
