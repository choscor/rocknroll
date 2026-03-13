---
name: mock-service-maintenance
description: "Maintain the mock services and database used for scaffold flows, keeping data shape and counters consistent. Use when adjusting mock behaviors."
---

# Mock Service Maintenance

## Workflow

1. Update mock database shape and defaults.
2. Keep counters in sync with created items.
3. Return CommandResult<T> from all methods.
4. Adjust tests when behavior changes.

## Key Files

- `src/infrastructure/mock/mock-database.ts`
- `src/infrastructure/mock/mock-services.test.ts`
- `src/infrastructure/mock/mock-auth-service.ts`
- `src/infrastructure/mock/mock-chat-service.ts`

## Notes

- Keep mock IDs deterministic for tests.
