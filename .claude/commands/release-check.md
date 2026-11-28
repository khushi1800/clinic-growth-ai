---
description: Run release-readiness gates and get a GO/NO-GO recommendation
argument-hint: [milestone e.g. M1, default current]
---

Check release readiness for $ARGUMENTS (default: the current milestone in `docs/backlog.md`).

1. Read `docs/backlog.md`. List any milestone task not `MERGED` or `VERIFIED`; those block release.
2. Delegate to `release-manager` with the milestone, the exact commit on `main` (or branch) to release, and `docs/release-checklist.md`. If the milestone changed migrations, auth, RPCs or secrets handling, run `security-reviewer` in parallel.
3. Re-run `npx tsc -b`, `npx eslint .`, `npm test`, `npm run build` yourself and quote real output.
4. Report a gate table, the Founder-must-confirm list (Vercel/Supabase dashboard items) and a GO / NO-GO recommendation.
5. Do not deploy, merge, push, change environment variables or touch production. The Founder decides.
