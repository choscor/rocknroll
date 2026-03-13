---
name: claude-token-and-cost-guardrails
description: "Add token and cost guardrails for Claude requests, including client-side limits, warnings, and model-specific caps. Use when adding usage controls."
---

# Claude Token And Cost Guardrails

## Workflow

1. Define per-model limits and warning thresholds.
2. Add client-side checks for prompt size.
3. Surface warnings or disables in the chat UI.
4. Enforce guardrails in the service layer.

## Key Files

- `src/ui/chat/chat-input.tsx`
- `src/state/app-store-context.tsx`
- `src/domain/contracts.ts`
- `src/ui/statusbar/status-bar.tsx`

## Notes

- Do not block the UI without a clear reason message.
- Prefer provider or backend usage data over client-only heuristics.
