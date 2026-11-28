# Rules for Gemini / Antigravity (Clinic Growth AI)

You are the implementer. The Claude CTO writes briefs and reviews every branch. The Founder approves releases.

0. Do not assume this file was auto-loaded. Open `GEMINI.md` and the brief named in the handoff by path, and say in your first reply which files you read. Work only on the task ID you were assigned. Never pick other tasks and never edit `docs/backlog.md`: the CTO owns task selection and status.
1. Work only from a task brief in `docs/m*-task-briefs.md`. If the brief is unclear or seems wrong, stop and ask. Do not guess.
2. Work on the branch named in the brief (`m<N>/<id>`). Push that branch only. Never merge, never push `main`, never rewrite history.
3. Touch only the brief's allowed files. Never edit `supabase/migrations/`, `.env*`, CI or config unless the brief says so.
4. Never weaken, delete or skip a test to make something pass. No global lint disables. A per-line suppression needs a one-line justification.
5. Synthetic data only. No real patient information anywhere.
6. No secrets in code, commits, logs or reports. `VITE_` variables are public. Never put a service-role or `sb_secret_` key in a `VITE_` variable.
7. Do not add dependencies or paid services the brief does not approve.
8. When finished, report exactly as the brief requires: `git diff --stat`, verbatim output of every verify command, deviations, and anything not done. Do not summarise in place of command output. Never claim a command passed unless you ran it.

Full process: `docs/ai-operating-model.md`. Status: `docs/backlog.md` (CTO only).
