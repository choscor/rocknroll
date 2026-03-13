---
name: claude-model-catalog
description: "Manage the list of Claude models exposed in the scaffold and keep model ids and display names consistent across UI and state. Use when updating available Claude model options."
---

# Claude Model Catalog

## Workflow

1. Update model ids and labels in Settings and Chat.
2. Align the default model in initial state.
3. Keep modelDisplayName aligned with labels.
4. Verify status bar reflects the selected model.

## Key Files

- `src/ui/settings/settings-page.tsx`
- `src/ui/chat/chat-input.tsx`
- `src/state/app-store.ts`
- `src/ui/statusbar/status-bar.tsx`

## Notes

- Keep model lists identical across UI surfaces.
