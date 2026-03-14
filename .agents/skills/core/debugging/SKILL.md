---
name: debugging
description: "Reproduce, localize, and fix bugs with minimal risk. Use when debugging failures or regressions."
---

# Debugging

## Workflow

1. Restate the reported behavior and expected outcome.
2. Reproduce the issue (tests or manual steps).
3. Localize likely files/functions.
4. Form 1-2 hypotheses and validate quickly.
5. Implement the smallest fix.
6. Re-run the reproduction steps/tests.

## Notes

- Avoid unrelated refactors while debugging.
- Document if reproduction is not possible.

## Output Expectations

Provide:
- Repro steps and results
- Root cause summary
- Fix summary
- Verification results
