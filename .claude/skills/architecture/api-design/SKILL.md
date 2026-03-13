---
name: api-design
description: "Define or refine API/contract shapes with clear inputs, outputs, and errors. Use when designing service or command interfaces."
---

# API Design

## Workflow

1. Identify consumers and use cases.
2. Define request/response shapes and types.
3. Specify error model and status handling.
4. Ensure naming consistency and versioning strategy.
5. Provide examples and update interfaces/contracts.

## Notes

- Preserve existing response envelopes (e.g., `CommandResult<T>`).
- Avoid breaking changes unless explicitly requested.

## Output Expectations

Provide:
- Proposed API shape (types or signatures)
- Error handling rules
- Files to update
