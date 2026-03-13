# AGENTS.md

Guidelines for autonomous coding agents working in this repository.
Agents must read this file before making any code changes.

## Core Principles

1. Understand the system before making changes.
2. Prefer minimal, safe modifications.
3. Maintain consistency with existing architecture.
4. Avoid unnecessary refactors or new patterns.
5. Do not introduce new dependencies unless required.
6. Keep code readable and maintainable.
7. Check for existing implementations before creating new ones.

## Required Workflow

1. Analyze: explore the repo, identify relevant modules, understand architecture/dependencies.
2. Plan: break the task into steps, identify files to change, avoid unrelated edits.
3. Implement: apply minimal changes, follow existing patterns, keep logic clear.
4. Validate: ensure code compiles, run tests if available, avoid breaking changes.
5. Explain: summarize changes and the reason for each modification.

## Repository Structure Awareness

Respect the existing structure and layer responsibilities. Example in this repo:
`src/ui`, `src/state`, `src/infrastructure`, `src/domain`, `src-tauri`, `tests`, `docs` (when present).
Do not mix responsibilities across layers.

## Code Modification Rules

- Prefer editing existing files; avoid unnecessary new files.
- Do not duplicate validation, queries, or utility functions.
- Keep functions small and focused; avoid deep nesting.

## Architecture Consistency

Preserve the project’s architecture (MVC, Clean, Hexagonal, Service/Repository, etc.).
Do not introduce new patterns unless clearly necessary.

## Naming Conventions

Follow local conventions:
- Variables: `camelCase`
- Classes: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Files: `kebab-case` or `snake_case` (match nearby files)

## Dependency Rules

Before adding a library:
1. Check if the functionality already exists.
2. Prefer built-in language tools.
3. Ensure the dependency is stable and widely used.
If a dependency is required, explain why.

## Testing Rules

If tests exist, update or add tests when modifying logic. Prioritize:
1. Business logic
2. Critical paths
3. Edge cases
Tests must be deterministic.

## Git Behavior

Treat commits as atomic tasks. Commit message format:
`type(scope): short description` (e.g., `feat(auth): add JWT middleware`).
Common types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`.

## Security Guidelines

Never expose secrets, commit API keys, log sensitive data, or disable security checks.
Always sanitize external input.

## Performance Awareness

Avoid N+1 queries, redundant API calls, and repeated heavy computations.
Prefer batching, caching, and efficient queries.

## Documentation Responsibilities

Update README, API docs, architecture notes, or comments for complex logic as needed.
Do not over-comment obvious code.

## Multi-Agent Collaboration

Planner: breaks tasks into subtasks.
Coder: implements the solution.
Reviewer: checks correctness and quality.
Tester: runs or adds tests.
Do not overwrite others’ work without analysis.

## When Uncertain

Ask for clarification, state assumptions, and propose options. Do not guess blindly.

## Forbidden Actions

- Delete large parts of the codebase without confirmation.
- Rewrite core architecture without justification.
- Introduce breaking changes without warning.
- Modify environment or infrastructure files unnecessarily.

## Preferred Development Strategy

Read code, understand design, identify minimal change, implement safely, verify correctness.
This repository prioritizes stability and clarity over cleverness.
