---
name: workflow-execution
description: "Execute a full task lifecycle from analysis to verification. Use when running end-to-end changes."
---

# Workflow Execution

## Workflow

1. Analyze: understand the goal and locate relevant files.
2. Plan: outline steps and dependencies.
3. Implement: make minimal changes aligned with patterns.
4. Validate: run tests or manual checks.
5. Explain: summarize changes, risks, and results.

## Notes

- Keep steps small and reversible.
- Avoid unrelated edits.

## Output Expectations

Report:
- Steps completed
- Files changed
- Tests run (or why skipped)
