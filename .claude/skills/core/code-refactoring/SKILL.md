---
name: code-refactoring
description: "Improve internal structure without changing behavior. Use for safe, minimal refactors."
---

# Code Refactoring

## Workflow

1. Identify the smallest refactor that improves clarity or structure.
2. Preserve external behavior and public interfaces.
3. Avoid mixing refactors with feature changes.
4. Update tests if necessary to keep them stable.
5. Validate with existing checks when possible.

## Output Expectations

Report:
- Refactor scope
- Files changed
- Tests run (or why skipped)
