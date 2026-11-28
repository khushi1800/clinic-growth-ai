---
description: Run the independent review set on a task branch and give a CTO verdict
argument-hint: <TASK-ID or branch e.g. M1-06 or m1/m1-06>
---

Review $ARGUMENTS following `docs/ai-operating-model.md` sections 2, 5 and 6.

1. Find the branch, base and head commit (`git log`, `git diff --stat`) and the task's brief in `docs/m*-task-briefs.md`. If the branch is in another worktree, use `git` from this repo; do not check it out here.
2. Start in parallel, giving each the branch, SHAs, brief location and verify commands:
   - `code-reviewer` (always; request Opus if the diff touches SQL, auth or AI safety).
   - `security-reviewer` if the diff touches migrations, auth, guards, RPCs, secrets/env, AI prompts/provider calls, WhatsApp or personal data.
   - `qa-architect` for test-quality review if tests changed.
3. Read the actual diff yourself and re-run the verify commands. Do not accept a specialist's or Gemini's report as proof.
4. Write a verdict: ACCEPT or CHANGES REQUESTED, with blocking findings (`file:line`, evidence) and what was not checked.
5. Propose the `docs/backlog.md` update (`ACCEPTED` or `CHANGES_REQUESTED`, SHA, date). Never `VERIFIED`. Do not merge or push.
