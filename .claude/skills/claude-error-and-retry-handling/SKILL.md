---
name: claude-error-and-retry-handling
description: "Standardize Claude error responses and retry behavior across the app store and services. Use when adding retry logic or mapping errors to UI banners."
---

# Claude Error And Retry Handling

## Workflow

1. Define error codes and messages in CommandResult<T>.
2. Map failures to lastError banners in state.
3. Add retry behavior with bounded attempts.
4. Avoid overwriting messages on failure.

## Key Files

- `src/state/app-store-context.tsx`
- `src/domain/contracts.ts`
- `src/infrastructure/mock/mock-chat-service.ts`

## Notes

- Keep retries deterministic and short.
