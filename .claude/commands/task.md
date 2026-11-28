---
description: Prepare a Gemini handoff for a backlog task (CTO workflow)
argument-hint: <TASK-ID e.g. M1-08>
---

Prepare the Gemini handoff for task $ARGUMENTS. Follow `docs/ai-operating-model.md` sections 2 and 4.

1. Read `docs/backlog.md` for the task's status and dependencies, and `docs/engineering-roadmap.md` for its definition, contracts and acceptance criteria. If the task is not `READY` or `PROPOSED`, say so and stop.
2. If the task has no brief in `docs/m*-task-briefs.md`: delegate as needed (product-manager for stories/AC, solution-architect for contracts, qa-architect for the test matrix, security-reviewer for design review if it touches a mandatory area), running independent specialists in parallel. Give each the file paths and the exact question.
3. Draft the brief in the handoff format. Show it to me before writing it into the brief file, because that changes project documentation.
4. After approval, add it to the milestone brief file, then update `docs/backlog.md` (`READY`) with evidence. Do not edit `src/` or `tests/`.
5. End with: base commit SHA, branch name, and the one thing the Founder must paste into Antigravity.
