---
name: security-and-credentials-handling
description: "Apply secure handling for credentials and sensitive data in the Claude scaffold, including masking and storage choices. Use when touching auth, keys, or logging."
---

# Security And Credentials Handling

## Workflow

1. Avoid logging or persisting raw credentials.
2. Keep masked values in UI and state.
3. Use secure storage for any real keys.
4. Review error paths for accidental leaks.

## Key Files

- `src/infrastructure/mock/mock-auth-service.ts`
- `src/ui/settings/settings-page.tsx`
- `src/domain/contracts.ts`

## Notes

- Treat clipboard and logs as sensitive surfaces.
