# Milestone 1 — Task Briefs for Google Antigravity / Gemini

Authority: `docs/engineering-roadmap.md` (§6 contracts, §6.6 acceptance criteria, §9 review protocol). If a brief and the roadmap disagree, stop and ask the CTO.
Wave 0 (M1-03, M1-07, M1-01) and the Wave 1 briefs (M1-08, M1-06) are below. Briefs for M1-09…M1-12, M1-02 and M1-15 are issued after Wave 1 is reviewed, so they build on accepted code.

## Rules for every task
1. Work on branch `m1/<task-id>` from current `main`. Push the branch; **never merge to `main`, never force-push, never rewrite history.**
2. Touch only the files listed under "Allowed". Anything else needs CTO approval first.
3. Do **not** delete, rename, skip, `.only`, `todo` or weaken any existing test. Baseline: `npm test` = 179 tests, 177 pass, 2 todo, 0 fail. Count must not drop.
4. Do **not** disable lint rules globally or edit `eslint.config.js` to hide errors. A per-line suppression needs a one-line reason comment.
5. No real personal data anywhere (code, tests, fixtures, screenshots). Synthetic only: fake names, `@example.test` emails, fake phone numbers.
6. Never put secrets in the repo, in logs, in chat, or behind a `VITE_` name. Never commit `.env`.
7. Do not edit `supabase/migrations/*` (CTO-owned) or existing docs.
8. Do not add new dependencies without asking; if essential, name the package, version and reason in the PR.
9. Final report must include: `git diff --stat main...HEAD`, the **verbatim output** of each command listed under "Verify", and a list of anything you could not do. Do not summarise results you did not run.

## M1-03 — Clear the lint baseline (no behaviour change)
**Goal:** `npx eslint .` reports 0 errors (today: 176).
**Allowed:** any file under `src/` and `tests/` that eslint reports. Nothing else.
**Method:** replace `any` with real types (`unknown` + narrowing where needed), remove unused imports/variables, fix hook-dependency issues properly. Behaviour must not change.
**Forbidden:** changing runtime logic to satisfy a type; changing assertions or expected values in tests (types/imports only).
**Verify:**
```
npx eslint .
npx tsc -b
npm test
npm run build
```
**Done when:** eslint 0 errors; tsc clean; tests 177 pass / 2 todo / 0 fail; build succeeds. Report the count of per-line suppressions added (target: 0–5, each justified).

## M1-01 — Secrets hygiene (starts after M1-03 is merged)
**Goal:** no secret can be committed or shipped to the browser by accident.
**Allowed:** `.gitignore`, new `.env.example`, `src/lib/ai/provider.ts`, `src/lib/supabase/client.ts`, new `scripts/check-bundle-secrets.mjs`, `package.json` (scripts only).
**Extra requirement (from M1-07 review):** change the `test` script so `npm test` ALSO runs `tests/auth/*.test.ts` and `tests/auth/*.test.tsx` (today those tests are silently excluded). After the change `npm test` must show the existing 177 passing / 2 todo plus all 12 auth tests passing, 0 failures (assuming M1-07 is merged first); report the exact totals.
**Tasks:**
1. `.gitignore`: ignore `.env` and `.env.*` but keep `.env.example` tracked (`!.env.example`).
2. `.env.example`: **public variables only** — `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_DEMO_MODE` (default `false`), with one-line comments. No `service_role`, no Gemini/AI key, no `VITE_GEMINI_API_KEY`.
3. `provider.ts`: in a production build (`import.meta.env.PROD`) the browser must never read `VITE_GEMINI_API_KEY` or call Google directly; `getAIProvider()` returns the mock provider. Keep the `AIProvider` interface and existing tests passing. (The real server-side path is Milestone 3.)
4. `client.ts` (**Founder must first set `VITE_DEMO_MODE=true` in the Vercel Production environment, or the live demo site will fail to start**): keep the mock fallback URL/key for demo/tests only; in a production build with `VITE_DEMO_MODE !== 'true'` and missing Supabase vars, throw a clear startup error instead of silently using the mock URL.
5. `scripts/check-bundle-secrets.mjs <dir>`: scans files in `dist/` and exits non-zero if it finds `service_role`, a JWT whose payload has `"role":"service_role"`, an `AIza[0-9A-Za-z_-]{35}` key, or a Supabase secret key matching `sb_secret_[A-Za-z0-9_-]+`. Print which file and pattern. Add `npm run check:secrets` (runs the script on `dist`).
**Verify:**
```
git check-ignore -v .env .env.local .env.production      # all three ignored
git ls-files .env.example                                 # tracked
npx eslint . ; npx tsc -b ; npm test ; npm run build
npm run check:secrets                                     # passes on the real build
```
Also prove the scanner works: temporarily put a fake `AIza` + 35-char string in a copy of a built file (not the repo), show it fails, then show the output; do not commit the fake.
**Done when:** all of the above pass and the PR shows no behaviour change in demo mode.

## M1-07 — AuthProvider and `useAuth` (may start now; contract-first)
**Goal:** one source of truth for session, clinic membership and platform-admin status.
**Allowed:** new `src/auth/AuthProvider.tsx`, `src/auth/useAuth.ts`, new `tests/auth/auth-provider.test.ts*`, `src/api/clinics.ts` (add two functions only), `src/main.tsx` or `src/App.tsx` (mount provider only).
**Contract (do not change without CTO approval):**
```ts
type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';
interface Membership { clinicId: string; staffId: string; role: 'owner'|'admin'|'doctor'|'receptionist' }
interface AuthState {
  status: AuthStatus; user: User | null; membership: Membership | null;
  isPlatformAdmin: boolean;
  signIn(p: SignInParams): Promise<ApiResult<Session>>;
  signUp(p: SignUpParams): Promise<ApiResult<User>>;
  signOut(): Promise<void>; refresh(): Promise<void>;
}
```
**Behaviour:**
- Reuse existing `src/api/auth.ts`; do not rewrite it.
- On mount: `getSession()`; subscribe to `supabase.auth.onAuthStateChange` and unsubscribe on unmount.
- When a session exists: load membership with `getMyMembership()` (new, in `src/api/clinics.ts`): select the caller's own active row from `clinic_staff` where `user_id = auth user id`; return `null` if none. Load `isPlatformAdmin` via `supabase.rpc('is_platform_admin')`; on any error treat as `false`.
- Also add `createClinicWithOwner({ name, phone?, city? })` in `src/api/clinics.ts` calling `supabase.rpc('create_clinic_with_owner', { p_name, p_phone, p_city })`; map error messages `not_authenticated`, `already_member`, `invalid_name` to stable `ApiError.code` values of the same names.
- `status` is `'loading'` until the first session check finishes. On sign-out, clear all state. Never log tokens or emails.
- `useAuth()` throws a clear error if used outside the provider.
**Tests (mock the Supabase client; no network):** loading→unauthenticated; loading→authenticated with membership; authenticated without membership; membership fetch error handled (state stays authenticated, membership `null`, error not thrown); `is_platform_admin` error → `false`; sign-out clears state; auth-state-change event updates state; listener unsubscribed on unmount; `createClinicWithOwner` maps the three errors.
**Verify:** `npx eslint . ; npx tsc -b ; npm test ; npm run build`.
**Done when:** all pass, existing tests unchanged, new tests cover every behaviour above.

---

# Wave 1 briefs (issued after M1-03 and M1-07 were accepted)

## M1-08 — Route guards (requires M1-07 merged)
**Goal:** protected routes are unreachable without the right session/role. Guards are UX only; RLS is the real enforcement.
**Allowed:** new `src/auth/guards.tsx`, new `src/auth/returnTo.ts`, `src/auth/AuthProvider.tsx`, `src/auth/useAuth.ts`, `src/router.tsx`, new `tests/auth/*`, `package.json` (**devDependencies only**: `jsdom`, `@testing-library/react`; approved by CTO for tests; no runtime dependencies).
**1. Contract amendment (found in M1-07 review):** a failed membership fetch must not look like "no clinic" (that would push a signed-in clinic owner to `/onboarding`).
- Add `membershipError: boolean` to `AuthState`.
- On fetch error: if a previous membership exists keep it; set `membershipError = true`. Clear it on the next success. Never convert an error into `membership = null` when one was already known.
- Existing M1-07 tests must keep passing; add tests for this behaviour.
**2. `returnTo.ts`:** `sanitizeReturnTo(raw: string | null): string` returns a same-origin relative path starting with a single `/`; otherwise `/dashboard`. Reject `//x`, `\x`, `http:`, `https:`, `javascript:`, `data:`, empty, anything containing control characters or `://`. Pure function, table-driven unit tests with at least 20 hostile and benign inputs.
**3. Guards (`guards.tsx`):**
- `RequireAuth`: `loading` → full-page spinner (no flash of protected content). `unauthenticated` → `<Navigate to="/login?returnTo=<encoded current path+search>" replace />`. Authenticated with `membershipError` → friendly "could not load your account" screen with a Retry button calling `refresh()`. Authenticated with `membership === null` → `/onboarding`.
- `RequireRole roles={[...]}`: inside `RequireAuth`; role not allowed → a "You don't have access" view (not a redirect loop).
- `RequirePlatformAdmin`: requires `status==='authenticated'` and `isPlatformAdmin`; else "no access" view (unauthenticated → login).
- `PublicOnly`: for `/login`, `/signup`, `/forgot-password`: authenticated users go to `/dashboard` (or `/onboarding` if no membership).
- `/onboarding` rule: needs a session; with a membership redirect to `/dashboard`.
**4. Router:** apply exactly the table in `docs/engineering-roadmap.md` §6.5 (`/settings/*` = owner/admin; `/admin/*` = platform admin; `/dashboard`, `/leads*`, `/appointments*`, `/conversations`, `/ai-playground` = any member). Do **not** create the onboarding or reset-password pages; add placeholder routes only if needed to compile, and say so. Do **not** implement demo-mode bypass (that is M1-11), but do not hard-code anything that prevents it.
**Tests (tests A-01…A-07, A-13 from the roadmap):** unauthenticated redirects for `/dashboard`, `/leads`, `/settings/staff`, `/admin`; `returnTo` is preserved and then honoured; hostile `returnTo` ignored; no-membership → `/onboarding`; membership → `/onboarding` redirects to `/dashboard`; receptionist and doctor blocked from `/settings/*`; owner and admin allowed; non-platform-admin blocked from `/admin`; loading state shows spinner and **never** renders protected children; `membershipError` shows retry, not onboarding; session lost mid-use → redirect to login.
**Verify:** `npx eslint . ; npx tsc -b ; npm test ; npm run build` (all must be green; M1-03 and M1-07 are already merged into the base).
**Done when:** all pass, no existing test touched, and the report lists every route and the guard applied to it.

## M1-06 — RLS and RPC security test suite (database is live; migrations 001+002 applied)
**Goal:** prove tenant isolation against the real dev database. This is the most important test suite in Milestone 1.
**Allowed:** new `tests/rls/**`, `package.json` (scripts only: `test:rls`). Read-only access to `supabase/migrations/*`; do **not** edit them. If a test exposes a real defect, **stop and report it to the CTO** instead of weakening the test or editing SQL.
**Safety (mandatory):**
- Load config from `.env.local` with `node --env-file=.env.local --import tsx --test tests/rls/*.test.ts` (Node 21).
- The suite must **abort before any write** unless `VITE_SUPABASE_URL === RLS_ALLOWED_PROJECT_URL` (both are in `.env.local`).
- Never print or log keys. Use the service-role key (`SUPABASE_SERVICE_ROLE_KEY`, server-side only) solely to create/delete test users and seed rows.
- Synthetic data only: users `rls-<role>-<random>@example.com`, clinic names prefixed `RLS-TEST `. Create users with `auth.admin.createUser({ email_confirm: true })`. All created users, clinics and rows are removed in `after()` even when tests fail; a leftover-sweep deletes anything prefixed `RLS-TEST ` / `rls-` at start.
**Fixtures:** clinics A and B (created through the real RPC `create_clinic_with_owner` by ownerA and ownerB); adminA, doctorA, receptionistA (staff rows inserted by the service client with `user_id` set, since clinic invite flow does not exist yet); a user with no clinic; a platform admin (service client inserts into `platform_admins`; removed afterwards); an anon client. Each persona is a separate supabase-js client signed in with the **publishable/anon key** via `signInWithPassword` (never the service key). Seed at least one row per clinic-scoped table in each clinic with the service client.
**Test matrix:** implement every row R-01 … R-23 from `docs/engineering-roadmap.md` §6.8 **except R-20** (CTO runs the mutation check). One `test()` per row, named with the ID. Cover all clinic-scoped tables for R-01…R-05 (loop over a table list; a failure message must name the table). Positive controls are mandatory: for each negative assertion include a matching positive one proving the same persona *can* do the allowed thing, so a broken fixture cannot make a test pass vacuously.
**Assertions must be precise:** for "0 rows affected", check returned row counts via `.select()`; for rejections, assert on the error (code or message), not just "no data".
**Verify:** `npm run test:rls` (paste the full output), then `npm run test:rls` a second time to prove cleanup (no `RLS-TEST` rows or `rls-` users remain; show the query/API output), then `npx eslint . ; npx tsc -b ; npm test`.
**Done when:** all rows pass, or each failure is reported as a suspected defect with the exact reproduction. Do not mark a failing test as todo/skip.
