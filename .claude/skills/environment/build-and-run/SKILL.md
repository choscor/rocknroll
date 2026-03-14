---
name: build-and-run
description: "Run build and dev commands safely. Use when compiling or running the app."
---

# Build And Run

## Workflow

1. Prefer project scripts (`npm run ...`, `cargo ...`).
2. Use the smallest command that validates the change.
3. Capture errors and summarize them.
4. Avoid destructive or long-running commands unless needed.

## Output Expectations

Report:
- Commands run
- Result summaries
- Follow-up actions
