---
name: claude-provider-connection
description: "Configure Claude provider connection flows in this repo, including OAuth or API key handling, status display, and mock or real service wiring. Use when asked to connect Claude or adjust provider auth behavior."
---

# Claude Provider Connection

## Workflow

1. Read current provider status and settings UI.
2. Confirm supported auth modes and required fields.
3. Update service interfaces and mock behavior if needed.
4. Keep masked credentials and timestamps consistent.
5. Verify connect, disconnect, and API key flows.
6. Update provider defaults in the mock database when fields change.

## Key Files

- `src/ui/settings/settings-page.tsx`
- `src/state/app-store-context.tsx`
- `src/infrastructure/mock/mock-auth-service.ts`
- `src/infrastructure/mock/mock-database.ts`
- `src/domain/contracts.ts`

## Notes

- Avoid logging raw credentials.
- Preserve CommandResult<T> responses.
