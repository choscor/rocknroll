---
name: claude-response-formatting
description: "Define how Claude responses render in the UI, including plain text or markdown, copy behavior, and safety considerations. Use when changing response presentation."
---

# Claude Response Formatting

## Workflow

1. Decide the response format to support.
2. Update chat message rendering to match.
3. Preserve copy behavior for assistant messages.
4. Sanitize or escape content if rendering rich text.

## Key Files

- `src/ui/chat/chat-message.tsx`
- `src/ui/chat/chat-view.tsx`
- `src/infrastructure/mock/mock-chat-service.ts`

## Notes

- Keep white-space behavior consistent for code blocks.
