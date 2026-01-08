# PromptLab Development Workflow

This document describes the workflow for implementing features using Claude Code with Superpowers.

## Overview

```
[Vague idea] → brainstorming → writing-plans → subagent-driven-development → finishing-a-development-branch
[Clear spec] → writing-plans → subagent-driven-development → finishing-a-development-branch
```

---

## Step 1: Start with Requirements

### If requirements are VAGUE:
```
User: "Add a notification system"
```
Use `superpowers:brainstorming` first:
- Clarifies intent through questions
- Explores options and trade-offs
- Outputs a clear spec document
- Then proceeds to Step 2

### If requirements are CLEAR:
```
User: [Provides detailed spec with tasks, constraints, acceptance criteria]
```
Skip to Step 2.

---

## Step 2: Write Implementation Plan

**Skill:** `superpowers:writing-plans`

**What happens:**
1. Claude explores the codebase (uses `Explore` agents)
2. Asks clarifying questions via `AskUserQuestion`
3. Writes detailed plan to `~/.claude/plans/<name>.md`

**Plan includes:**
- Task breakdown (bite-sized, 2-5 min each)
- Exact file paths to create/modify
- Code snippets for each step
- Test commands
- Commit messages

**Output:** Plan file saved to disk

---

## Step 3: Execute the Plan

**Skill:** `superpowers:subagent-driven-development`

**What happens:**
1. Creates TodoWrite with all tasks
2. For each task:
   - Dispatches fresh **implementer subagent**
   - Subagent: reads files → implements → tests → commits
   - Marks task complete
3. Runs independent tasks in parallel when possible
4. Tracks progress in TodoWrite

**Key principles:**
- Fresh subagent per task (no context pollution)
- Each subagent commits its own work
- Tests must pass before moving on

---

## Step 4: Finish the Branch

**Skill:** `superpowers:finishing-a-development-branch`

**What happens:**
1. Verifies all tests pass
2. Presents 4 options:
   - Merge to main locally
   - Push and create PR
   - Keep branch as-is
   - Discard work
3. Executes chosen option
4. Cleans up worktree if needed

---

## Quick Reference

| Situation | Skills to Use |
|-----------|---------------|
| Vague idea | `brainstorming` → `writing-plans` → `subagent-driven-development` |
| Clear spec | `writing-plans` → `subagent-driven-development` |
| Bug to fix | `systematic-debugging` → (fix) → `verification-before-completion` |
| Code review needed | `requesting-code-review` |
| After implementation | `finishing-a-development-branch` |

---

## Example: PromptLab Dashboard & Versioning (Jan 2026)

**Input:** User provided "Expert Edit Plan" spec with:
- 12 tasks (P0 and P1 priority)
- Safety constraints (v2 patch)
- Acceptance criteria

**Execution:**
1. `writing-plans` - Explored codebase, asked 3 clarifying questions, wrote plan
2. `subagent-driven-development` - Executed 12 tasks over 2 sessions
   - Tasks 1-4 in session 1
   - Tasks 5-12 in session 2
   - Parallel execution: Tasks 7+8, Tasks 9+10+11
3. `finishing-a-development-branch` - Verified 184 tests, kept branch for more work

**Result:** 17 commits, all features implemented, ready for continued development

---

## Tips

- **Use TodoWrite** to track progress visibly
- **Run tasks in parallel** when they don't share files
- **Commit after each task** for clean history
- **Verify tests pass** before moving to next task
- **Save plans to disk** so they survive context limits

---

## Related Files

- Plans: `~/.claude/plans/`
- This workflow: `/WORKFLOW.md`
