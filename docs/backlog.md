# Backlog — single source of truth for task status

**Only the CTO edits this file.** Task *definitions* live in [engineering-roadmap.md](engineering-roadmap.md) (tasks, contracts, acceptance criteria) and the milestone brief files (instructions issued to Gemini). This file holds **status only**. If this file and any other document disagree about status, this file wins.

**Evidence rule:** a status may change only when the "Evidence" column can point to something checkable (commit SHA, command output reviewed by the CTO, a review verdict, a Founder statement marked as such). `VERIFIED` requires the CTO to have re-run the verification commands on the merged result, or the Founder to have confirmed the behaviour in the target environment. Acceptance of a diff is never `VERIFIED`.

**Statuses:** `PROPOSED` → `READY` (brief exists, dependencies met) → `IN_PROGRESS` → `IN_REVIEW` → `ACCEPTED` / `CHANGES_REQUESTED` → `MERGED` → `VERIFIED`.
Non-code tasks (Founder/ops): `DONE-REPORTED` (Founder says it is done, not independently checked) → `VERIFIED`. `BLOCKED` is allowed from any state and must name the blocker.

Last updated: 2026-11-28 (CTO).

## Milestone 1 — Secure foundation

| ID | Title | Pri | Status | Owner | Depends | Branch | Evidence / last verdict | Brief |
|---|---|---|---|---|---|---|---|---|
| M1-03 | Clear all lint errors, no rule disabling | P0 | ACCEPTED (not merged) | Gemini | — | `m1/m1-03` | e1b047d. CTO diff review: 36 files, no suppressions, no config/test-assertion changes. ACCEPT 2026-11-27. Founder approved merge 2026-11-28; merge pending. Not re-run on merged main. | m1-task-briefs |
| M1-07 | AuthProvider + useAuth | P0 | ACCEPTED (not merged) | Gemini | — | `m1/m1-07` | b64460d. CTO diff review; 12 tests. ACCEPT with follow-ups (membershipError → M1-08; `tests/auth` in `npm test` → M1-01). Founder approved merge 2026-11-28; merge pending. | m1-task-briefs |
| M1-01 | Secrets hygiene, `.env.example`, bundle scanner, auth tests in `npm test` | P0 | BLOCKED (M1-03 not merged) | Gemini | M1-03 merged; Founder sets `VITE_DEMO_MODE=true` in Vercel Production | — | Brief issued. Founder says Vercel env vars created; Production-only scope unconfirmed. | m1-task-briefs |
| M1-08 | Route guards + membershipError + returnTo | P0 | BLOCKED (M1-07 not merged) | Gemini | M1-07 merged | — | Brief issued. | m1-task-briefs |
| M1-06 | RLS/RPC test suite (`tests/rls`) | P0 | BLOCKED (M1-16, M1-17) | Gemini | M1-05 applied, M1-16 applied, M1-17 accepted | — | Brief issued. Needs `.env.local` copied into the worktree. | m1-task-briefs |
| M1-05 | SQL migrations 001/002 (RLS, private helpers, RPCs) | P0 | IN_REVIEW | CTO writes; Founder applied | M1-04 | `main` | Committed 715a99b. Founder reports both ran without error (not independently verified). Independent security review (fresh Opus agent, read-only, at 76f5645) 2026-11-28: 0 Critical/High, 2 Medium (M-1 no RLS between applying 001 and 002; M-2 cross-tenant FKs = M2-08), 8 Low, Info. CTO spot-checked M-1, M-2 and the audit policy against the SQL. Fixes pending Founder decision; behaviour unproven until M1-06 passes. | roadmap §6 |
| M1-04 | Dev Supabase project (Mumbai, synthetic data) | P0 | DONE-REPORTED | Founder | — | — | Founder supplied URL and publishable key; `.env.local` created. No connectivity test run. | roadmap §6 |
| M1-14 | Fix doc conflicts | P1 | MERGED | CTO | — | `main` | Committed in 715a99b. | roadmap §2 |
| M1-09 | Real login/signup/forgot/reset pages | P0 | PROPOSED | Gemini | M1-07, M1-08 merged | — | | — |
| M1-10 | Onboarding page (`create_clinic_with_owner`) | P0 | PROPOSED | Gemini | M1-07, M1-05 verified, M1-16 applied | — | | — |
| M1-11 | `VITE_DEMO_MODE` flag | P0 | PROPOSED | Gemini | M1-08 | — | | — |
| M1-12 | Sign-out, role-aware nav, `/admin` guard | P0 | PROPOSED | Gemini | M1-08 | — | | — |
| M1-02 | GitHub Actions CI | P0 | PROPOSED | Gemini | M1-03, M1-01 merged | — | | — |
| M1-13 | Vercel preview on dev Supabase | P0 | PROPOSED | Founder + Gemini | M1-04 | — | Preview deployment protection unchecked. | — |
| M1-15 | Playwright smoke | P1 | PROPOSED | Gemini | M1-09, M1-10 | — | | — |
| M1-16 | Security hardening migration `003_security_hardening.sql` from review findings M-1, L-1…L-8, I-3, I-6 (forward migration; 001/002 stay append-only). Followed by independent Security Reviewer pass before apply | P0 | BLOCKED (Founder decisions D1-D3) | CTO writes; Founder applies in ONE transaction | M1-05 | `main` | Review report 2026-11-28 (see M1-05 row). No SQL written yet. | roadmap §6 (to amend) |
| M1-17 | Amend RLS test matrix (§6.8): R-01 → 19 tables + `relrowsecurity` check; R-11 → permission denied (anon has no EXECUTE); add last-owner placeholder/race, audit-log, anonymous-JWT, grants/default-ACL, constraint-specific error tests; decide how catalog checks are run (manual SQL verify script vs RPC) | P0 | BLOCKED (needs D2, D3 outcomes) | qa-architect drafts; CTO approves | M1-16 design | — | | roadmap §6.8 |
| M1-18 | Founder dashboard checks: Anonymous Sign-ins OFF; exposed schemas = `public` only (not `private`); email confirmation ON; confirm dev project `public` schema was empty before first apply of 001 | P0 | PROPOSED | Founder | — | — | Not checkable from the repo. | review report |
| M1-R20 | Mutation check of RLS suite (R-20) | P0 | PROPOSED | CTO | M1-06 accepted | — | | roadmap §6 |

## Milestone 2 — Real data

| ID | Title | Pri | Status | Owner | Depends |
|---|---|---|---|---|---|
| M2-01 | Settings, FAQ, staff on real API | P0 | PROPOSED | Gemini | M1 |
| M2-02 | Leads on real API + `lead_activities` | P0 | PROPOSED | Gemini | M1 |
| M2-03 | Appointments on real API, server-side conflict check | P0 | PROPOSED | Gemini | M1 |
| M2-04 | Demo mode as separate build | P0 | PROPOSED | Gemini | M1-11 |
| M2-05 | Staff invite flow | P0 | PROPOSED | Gemini | M1 |
| M2-06 | Audit log writes (server-side) | P1 | PROPOSED | Gemini | M1-05 |
| M2-07 | Fix `getLeads` `.or()` filter injection | P1 | PROPOSED | Gemini | M2-02 |
| M2-08 | Cross-tenant FK reference protection (confirmed Medium M-2). **Must be MERGED before M3-01 and M4-05** (service-role jobs bypass RLS) | P1 | PROPOSED | CTO (SQL) / Gemini (tests) | M2-02 |

## Milestone 3 — Real AI on a server

| ID | Title | Pri | Status | Owner | Depends |
|---|---|---|---|---|---|
| M3-01 | Edge Function `chat` | P0 | PROPOSED | Gemini | M2-01 |
| M3-02 | Remove browser Gemini path | P0 | PROPOSED | Gemini | M3-01 |
| M3-03 | Persist conversations, lead dedupe | P0 | PROPOSED | Gemini | M3-01, M2-02 |
| M3-04 | Website chat widget | P1 | PROPOSED | Gemini | M3-03 |
| M3-05 | Fix BUG-002, BUG-003 | P0 | PROPOSED | Gemini | — |
| M3-06 | Human-handoff flag + alert | P0 | PROPOSED | Gemini | M3-03 |
| M3-07 | Server-side AI kill-switch | P0 | PROPOSED | Gemini | M3-01 |

## Milestone 4 — WhatsApp + automation

| ID | Title | Pri | Status | Owner | Depends |
|---|---|---|---|---|---|
| M4-01 | BSP selection + sandbox | P0 | PROPOSED | Founder | — |
| M4-02 | Inbound webhook, signature verification | P0 | PROPOSED | Gemini | M3-03, M4-01 |
| M4-03 | Outbound `WhatsAppChannel` adapter | P0 | PROPOSED | Gemini | M4-01 |
| M4-04 | Persistent opt-out/consent | P0 | PROPOSED | Gemini | M2 |
| M4-05 | `pg_cron` reminders and follow-ups | P0 | PROPOSED | Gemini | M4-03, M4-04 |
| M4-06 | BSP template management | P1 | PROPOSED | Gemini | M4-03 |
| M4-07 | Staff reply / takeover | P1 | PROPOSED | Gemini | M4-02 |

## Milestone 5 — Pilot hardening

Scope is defined in roadmap §4 (Playwright suite, Sentry, backup/restore drill, privacy/DPDP text, production Supabase and Vercel, load/cost test, runbook). Task IDs will be assigned when M4 nears completion.

## Open Founder items (not tasks)

- Confirm `VITE_DEMO_MODE=true` is scoped to Production only.
- Verify Vercel preview deployment protection.
- Set Supabase Auth Site URL and Redirect URLs.
- Bootstrap platform admin (SQL snippet at the end of `002_rls_policies.sql`), after the Security Reviewer pass.
- Shortlist WhatsApp BSPs (M4-01).

## Change log

- 2026-11-28: M1-01, M1-08 set BLOCKED (their dependency branches are not merged: `git branch` shows `m1/m1-03`, `m1/m1-07` unmerged); M1-06 BLOCKED on remediation; added M1-16, M1-17, M1-18 from the security review. Dispatch workflow: no task is currently dispatchable.
- 2026-11-28: file created from roadmap §4/§6 and review verdicts to date.
