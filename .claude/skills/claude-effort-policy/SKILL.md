---
name: claude-effort-policy
description: "Define or adjust Claude effort levels and ensure effort selection is consistent across UI, state, and request payloads. Use when changing effort options or behavior."
---

# Claude Effort Policy

## Workflow

1. Update EffortLevel enum and defaults.
2. Sync effort selectors in Settings and Chat.
3. Pass effort through the send message path.
4. Verify effort labels remain user friendly.

## Key Files

- `src/domain/contracts.ts`
- `src/ui/settings/settings-page.tsx`
- `src/ui/chat/chat-input.tsx`
- `src/state/app-store.ts`

## Notes

- Avoid mismatched effort labels between UI surfaces.
