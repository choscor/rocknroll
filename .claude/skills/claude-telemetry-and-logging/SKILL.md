---
name: claude-telemetry-and-logging
description: "Add telemetry for Claude requests, including timing, model, and outcome metrics, without leaking secrets. Use when adding instrumentation."
---

# Claude Telemetry And Logging

## Workflow

1. Define the minimal telemetry fields to capture.
2. Log events at the service boundary or backend.
3. Redact or exclude any secrets and prompts.
4. Surface high-level status if the UI needs it.

## Key Files

- `src/infrastructure/tauri/desktop-commands.ts`
- `src-tauri/src/lib.rs`
- `src/state/app-store-context.tsx`

## Notes

- Keep telemetry opt-in if required by policy.
