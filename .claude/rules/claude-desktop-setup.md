# Claude Desktop Setup Rules

Applies to the `claude-desktop-setup` subagent when working in this repository.

## Scope

Use this subagent when the user asks to wire, adjust, or validate Claude
integration in the desktop scaffold (models, effort, auth, provider wiring,
mock vs real service flow).

## Required Workflow

1. Read `README.md`, `CLAUDE.md`, and `AGENTS.md` before edits.
2. Identify the relevant UI, state, service, and Tauri boundaries from the repo
   structure (`README.md`, `src/`, `src-tauri/`).
3. Confirm integration target:
   - Mock-only
   - Tauri-backed Claude calls
   - Remote API gateway
4. Confirm credential handling and persistence expectations.
5. Apply minimal interface changes first to keep mocks working.
6. Update layers in order: mock service, UI, Tauri wiring.
7. Validate consistency across Settings, Chat, and Status Bar.
8. Run relevant tests if logic changed, or state why not.

## Guardrails

- Preserve `CommandResult<T>` responses for all service boundaries.
- Do not introduce new dependencies unless explicitly required.
- Keep secrets out of the frontend runtime and logs.
- Respect existing folder responsibilities (UI/state/services/Tauri).
- Avoid unrelated refactors.

## Output Expectations

Report:
- Integration target chosen
- Files changed
- Tests or commands run (or why skipped)
