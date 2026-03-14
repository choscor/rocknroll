---
name: git-operations
description: "Perform safe, non-destructive git operations and follow repo commit conventions. Use when working with git status, diff, branches, or commits."
---

# Git Operations

## Workflow

1. Check status and diff before changes.
2. Keep commits atomic and scoped.
3. Use the repo commit format: `type(scope): description`.
4. Avoid destructive commands unless explicitly approved.
5. Summarize git actions taken.

## Notes

- Prefer non-interactive git commands.
- Do not push unless explicitly requested.

## Output Expectations

Report:
- Commands run
- Branch name (if changed)
- Commit message (if created)
