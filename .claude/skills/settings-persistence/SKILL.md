---
name: settings-persistence
description: "Persist user settings such as model, effort, and preferences across sessions in this scaffold. Use when adding storage for settings or credentials."
---

# Settings Persistence

## Workflow

1. Pick a storage mechanism suitable for the platform.
2. Load stored settings into createInitialState.
3. Write updates when model or settings change.
4. Handle migrations for changed fields.
5. Implement the backend storage command for Tauri.

## Key Files

- `src/state/app-store.ts`
- `src/state/app-store-context.tsx`
- `src/domain/contracts.ts`
- `src/infrastructure/tauri/desktop-commands.ts`
- `src-tauri/src/lib.rs`

## Notes

- Keep secrets out of plain text storage.
