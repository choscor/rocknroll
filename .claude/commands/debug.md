---
description: Run a structured debugging workflow to reproduce, localize, and fix issues in the current project.
model: opus
---

# Debug Command

Execute a systematic **debugging workflow** to understand, reproduce, and localize a bug or failing test, then propose or implement a fix and verify it.

## Workflow

### Step 1: Understand the Problem

- Carefully read the user’s bug description, stack trace, failing test output, or screenshots.
- If essential details are missing (e.g. exact error message, steps to reproduce), ask at most 1–2 focused questions via the normal conversation channel.

### Step 2: Reproduce or Simulate the Issue

Use the Task tool to orchestrate reproduction steps:
- subagent_type: generalPurpose
- description: Reproduce reported issue
- prompt: >
  Using the current repository, attempt to reproduce the reported issue:
  - Identify the most relevant commands (tests, dev server, specific script).
  - Run them via the appropriate tools (shell/test) and capture output.
  - Record whether the issue reproduces, under what conditions, and with what errors.
  Return a concise reproduction report including commands used and logs.
- model: haiku

Wait for the agent to complete and capture the reproduction report.

### Step 3: Localize the Root Cause

Use the Task tool again to analyze the failure:
- subagent_type: generalPurpose
- description: Localize root cause
- prompt: >
  Based on the reproduction report and error output, localize the most likely root cause:
  - Identify suspect files, functions, and code paths.
  - Cross-reference with recent changes and related tests.
  - Propose one or two hypotheses that explain the observed behaviour.
  Return a focused list of candidate locations and hypotheses to test.
- model: haiku

Wait for the agent to complete and capture the candidate causes and hypotheses.

### Step 4: Propose and Apply a Fix

- Draft a concrete fix based on the leading hypothesis.
- If allowed by the user, apply the fix using the normal coding tools (file edits).
- Keep changes minimal and well-scoped; avoid broad refactors unless the user requested them.

### Step 5: Verify the Fix

- Re-run the relevant tests or commands used in Step 2.
- If the issue is fixed:
  - Run any broader checks the project defines (e.g. `npm run check`).
- If the issue persists:
  - Update hypotheses, inspect additional logs, and iterate on the fix.

## Critical Requirements

1. **Reproduce first when possible**: Do not change code without first attempting to reproduce the issue (unless reproduction is impossible from context).
2. **Minimize changes**: Focus on the smallest change that fixes the bug; avoid “drive-by” refactors during debugging.
3. **Use project-standard commands**: Use the repository’s own scripts (e.g. `npm run test`, `npm run check`) rather than ad-hoc commands.
4. **Document hypotheses**: Make your reasoning and hypotheses explicit so the user can follow your thought process.
5. **Always re-run verification**: Never claim a bug is fixed without re-running tests or commands that previously failed.

## Output Summary

Provide a clear summary to the user showing:
- How the issue was reproduced (commands run and conditions).
- The suspected root cause (files, functions, and explanation).
- The changes made (at a high level, not full diffs).
- Verification results (tests/commands run and their outcomes).
- Any remaining follow-up or edge cases that might still need attention.

