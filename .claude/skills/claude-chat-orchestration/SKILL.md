---
name: claude-chat-orchestration
description: "Wire Claude chat requests through the service boundary with model and effort configuration, and keep mock and real implementations aligned. Use when implementing Claude chat behavior."
---

# Claude Chat Orchestration

## Workflow

1. Extend ChatService to accept modelConfig when needed.
2. Pass state.modelConfig through the app store action.
3. Implement mock and real chat service behavior.
4. Return CommandResult<T> with message arrays.
5. Update container wiring and mock service factory if signatures change.
6. Verify send and receive flows update the UI.

## Key Files

- `src/repository/interfaces.ts`
- `src/state/app-store-context.tsx`
- `src/infrastructure/mock/mock-chat-service.ts`
- `src/infrastructure/tauri/desktop-commands.ts`
- `src-tauri/src/lib.rs`
- `src/container/container.ts`
- `src/infrastructure/mock/index.ts`

## Notes

- Keep error handling consistent with other services.
