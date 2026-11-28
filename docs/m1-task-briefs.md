# Milestone 1 — Task Briefs for Google Antigravity / Gemini

Authority: `docs/engineering-roadmap.md` (§6 contracts, §6.6 acceptance criteria, §9 review protocol). If a brief and the roadmap disagree, stop and ask the CTO.
Wave 0 briefs are below. Briefs for M1-08…M1-12, M1-02, M1-06 and M1-15 are issued after Wave 0 is reviewed, so they build on accepted code.

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
**Tasks:**
1. `.gitignore`: ignore `.env` and `.env.*` but keep `.env.example` tracked (`!.env.example`).
2. `.env.example`: **public variables only** — `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_DEMO_MODE` (default `false`), with one-line comments. No `service_role`, no Gemini/AI key, no `VITE_GEMINI_API_KEY`.
3. `provider.ts`: in a production build (`import.meta.env.PROD`) the browser must never read `VITE_GEMINI_API_KEY` or call Google directly; `getAIProvider()` returns the mock provider. Keep the `AIProvider` interface and existing tests passing. (The real server-side path is Milestone 3.)
4. `client.ts` (**Founder must first set `VITE_DEMO_MODE=true` in the Vercel Production environment, or the live demo site will fail to start**): keep the mock fallback URL/key for demo/tests only; in a production build with `VITE_DEMO_MODE !== 'true'` and missing Supabase vars, throw a clear startup error instead of silently using the mock URL.
5. `scripts/check-bundle-secrets.mjs <dir>`: scans files in `dist/` and exits non-zero if it finds `service_role`, a JWT whose payload has `"role":"service_role"`, or an `AIza[0-9A-Za-z_-]{35}` key. Print which file and pattern. Add `npm run check:secrets` (runs the script on `dist`).
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
