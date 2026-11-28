# AI Operating Model

How Clinic Growth AI is built by a Founder, a Claude CTO session, six Claude specialist subagents, and Gemini (Antigravity) as implementer. This file defines **process**. It does not duplicate requirements ([product-requirements.md](product-requirements.md)), plan and contracts ([engineering-roadmap.md](engineering-roadmap.md)), Gemini briefs (`m*-task-briefs.md`) or status ([backlog.md](backlog.md)).

## 1. Roles

| Role | Runs as | Model | Reads | Writes | Decides |
|---|---|---|---|---|---|
| **Founder** | Human | — | Everything | — | Scope, releases, spending, production, external communication |
| **CTO / Orchestrator** | Main Claude Code session (`CLAUDE.md`) | Session model (Sonnet default; Opus for planning and security-critical calls) | Everything | Docs, briefs, `supabase/migrations/`, `.claude/`, `backlog.md`. **Not** `src/` or `tests/` | Delegation, task order, verdicts, status |
| **Product Manager** | `.claude/agents/product-manager.md` | Sonnet | Docs, code | Docs only (stories, acceptance criteria) | Nothing; recommends scope |
| **Solution Architect** | `solution-architect.md` | Opus | Docs, code | Design docs, contract drafts | Nothing; recommends design |
| **QA Architect** | `qa-architect.md` | Sonnet | Docs, code, tests | Test plans/matrices (docs) | Nothing; judges test quality |
| **Security Reviewer** | `security-reviewer.md` | Opus | Everything | Nothing (read-only) | Nothing; rates findings |
| **Code Reviewer** | `code-reviewer.md` | Sonnet (Opus for SQL/auth/AI-safety diffs, chosen by CTO per call) | Everything | Nothing (read-only plus running checks) | Nothing; recommends ACCEPT or CHANGES REQUESTED |
| **Release Manager** | `release-manager.md` | Sonnet | Everything | Nothing (read-only plus build/test) | Nothing; recommends GO / NO-GO |
| **Gemini** | Antigravity | Founder's choice | Brief + repo | `src/`, `tests/`, task branch only | Implementation details inside the brief |

Subagents cannot start other subagents, so only the CTO delegates. Subagents start with empty context: every delegation names the file paths, branch, commit and question.

Specialists **advise; the CTO decides; the Founder approves** anything paid, destructive, external, or production.

## 2. Workflow

```
PM stories + AC → Architect contracts → [QA test matrix ∥ Security design review]
  → CTO writes handoff (docs/m*-task-briefs.md) → Gemini implements on branch m<N>/<id>
  → [Code review ∥ Security review (if triggered) ∥ QA test-quality check]
  → CTO verdict → Founder-approved merge → backlog status update
  → (milestone end) Release Manager → Founder GO/NO-GO
```

**Can run in parallel:** PM analysis of separate features; QA matrix with security design review; Code, Security and QA review of the same diff; reviews of different branches; Gemini lanes whose file sets are disjoint.

**Must be sequential:** PM → Architect → (QA, Security) → handoff; implementation before review; review before merge; merge before dependent tasks; migrations applied before RLS tests run; release check last; one writer at a time for shared files (`router.tsx`, `provider.ts`, migrations).

**Independence:** whoever wrote something never reviews it. SQL written by the CTO goes to a fresh Security Reviewer before it is applied. Gemini's work is never accepted on Gemini's own report: the CTO re-runs commands and reads the diff.

**Security Reviewer is mandatory** when a change touches migrations, auth, guards, RPCs, secrets/env handling, AI prompts or provider calls, WhatsApp, or personal data. Otherwise optional. This keeps Opus cost bounded.

## 3. Status and backlog

[backlog.md](backlog.md) is the only status record. Only the CTO edits it, and only with evidence (see its header). `VERIFIED` is never set because a diff was accepted. Milestone briefs stay one file per milestone. The roadmap keeps definitions, not status.

## 3a. Task dispatch (CTO owns selection)

Gemini never picks work. The CTO dispatches one task at a time per file set:

1. Read `docs/backlog.md`. A task is **eligible** only if: status is `READY`; every dependency is `MERGED` or `VERIFIED` as the dependency column requires (checked against `git branch --merged main`, not memory); no open Founder or architecture decision blocks it; its scope and allowed files are unambiguous.
2. Choose the highest-priority eligible task (P0 before P1; then the one that unblocks the most others). If none is eligible, say why and list what unblocks the next candidate. Do not dispatch a blocked task.
3. If the task lacks a complete brief, the relevant specialist prepares it first (stories → product-manager; contracts → solution-architect; test matrix → qa-architect; security design → security-reviewer).
4. Issue the handoff in the format below, set status `IN_PROGRESS` only when the Founder confirms Gemini started.
5. Gemini implements only that task, reports, and stops. It does not edit `docs/backlog.md`, pick another task, or merge.
6. The CTO reviews the real diff and re-runs commands (`/review`), then updates the backlog with evidence.

**Rule-file loading.** A first test (2026-11-28) ran in a worktree that did not contain `GEMINI.md` and loaded only a global plugin `AGENTS.md`. A second test, reported by the Founder from Antigravity, listed `d:\Khushbu\clinic-growth-ai\GEMINI.md` as loaded alongside that global file, so Antigravity does load the project `GEMINI.md` when it is in the workspace (Founder-reported, not independently re-run). It is still a worktree concern: `GEMINI.md` must be committed to `main` before a worktree is cut. Every handoff keeps the "open `GEMINI.md` and the brief by path and confirm" line as a safeguard.

## 4. Handoff format for Gemini

Every task brief in `docs/m*-task-briefs.md` uses this shape:

```
## <TASK-ID> — <title>
Read first (open by path, then confirm in your first reply): GEMINI.md, <brief path + section>
Branch: m<N>/<id>        Base: <commit sha>        Worktree: <path>
Assigned by CTO. Do not change docs/backlog.md or pick other tasks.
Goal (business): <one sentence>
Traces to: <US-x.x stories>, <roadmap AC ids>
Requirements: <numbered, testable>
Contracts: <API / DB / types, or link to roadmap section>
Allowed files: <paths>
Forbidden files: <paths; always includes supabase/migrations, .env*, CI config unless named>
Steps: <ordered>
Required tests: <ids from the test matrix>
Verify commands: <exact commands, run from repo root>
Standing rules: see top of the milestone brief file
Report back (required): git diff --stat; verbatim output of every verify command;
  deviations from the brief; list of anything not done; no summaries in place of output.
```

## 5. Review verdict format (Code Reviewer, Security Reviewer, CTO)

- **Verdict:** ACCEPT / CHANGES REQUESTED (code); finding list with severity Critical / High / Medium / Low / Info (security).
- Each finding: `file:line`, evidence (quoted code or command output), impact, recommended fix.
- State what was **not** checked.
- The CTO's written verdict goes in the backlog "Evidence" column with commit SHA and date.

## 6. Definition of done (per task)

Acceptance criteria met with evidence; verify commands pass on the branch when re-run by the CTO; no tests weakened or removed; no suppressions without a one-line justification; no secrets in diff or bundle; independent review recorded; backlog updated. `VERIFIED` additionally needs the check on merged `main` or in the target environment.

## 7. Guardrails

- No real patient data in dev or test environments. Synthetic only.
- No push, deploy, history rewrite, production change, paid-service change, or outside communication without Founder approval. Gemini may push its own task branches only.
- The CTO does not merge or push unless the Founder says so.
- `.claude/settings.json` denies Claude file-edit tools on `src/` and `tests/`. Shell commands must not be used to get around this.
- Secrets live in git-ignored `.env.local` and the hosting dashboards. Never print them.

## 8. Known limits

- Claude cannot invoke Gemini. Handoff is copy-paste by the Founder.
- Edit-deny rules govern Claude's file tools and simple shell redirection, not arbitrary scripts. The rule against workarounds is therefore a standing instruction as well as a permission.
- Subagent definitions load at session start; changes need a new session.
- `sonnet` / `opus` aliases track the latest model of each family. Pin full model IDs in the agent files if stability matters.
- Status can drift if anyone but the CTO edits the backlog.
