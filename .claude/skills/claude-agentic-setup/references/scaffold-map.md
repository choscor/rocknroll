# Scaffold Map

Key locations for model and effort wiring.

## UI

- `src/ui/settings/settings-page.tsx` (model + effort dropdowns)
- `src/ui/chat/chat-input.tsx` (model + effort pills)
- `src/ui/statusbar/status-bar.tsx` (shows model display name)

## State and Contracts

- `src/domain/contracts.ts` (ModelConfig, EffortLevel, CommandResult)
- `src/state/app-store.ts` (initial modelConfig)
- `src/state/app-store-context.tsx` (updateModelConfig action)

## Services

- `src/repository/interfaces.ts` (ChatService signature)
- `src/infrastructure/mock/mock-chat-service.ts` (mock implementation)
- `src/infrastructure/tauri/desktop-commands.ts` (native command wrapper)
- `src-tauri/src/lib.rs` (native command stubs)

## Docs

- `docs/agentic-setup.md` (setup walkthrough)
