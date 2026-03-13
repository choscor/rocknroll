# Claude Desktop Setup Rules

Applies to the `claude-desktop-setup` subagent when working in this repository.

## Scope

Use this subagent when the user asks to wire, adjust, or validate Claude
integration in an Agentic Development Environment (models, effort, auth,
provider wiring, mock vs real service flow).

## Required Workflow

1. Read `README.md`, `CLAUDE.md`, and `AGENTS.md` before edits.
2. Identify the relevant UI, state, service, and backend/runtime boundaries
   from the repository structure and documentation.
3. Confirm integration target:
   - Mock-only
   - Local backend/runtime Claude calls
   - Remote API gateway
4. Confirm credential handling and persistence expectations.
5. Apply minimal interface changes first to keep mocks working.
6. Update layers in order: mock service, UI, backend/runtime wiring.
7. Validate consistency across Settings, Chat, and Status Bar.
8. Run relevant tests if logic changed, or state why not.

## Guardrails

- Preserve existing command/response contracts for all service boundaries.
- Do not introduce new dependencies unless explicitly required.
- Keep secrets out of the frontend runtime and logs.
- Respect existing folder responsibilities (UI/state/services/backend).
- Avoid unrelated refactors.

## Output Expectations

Report:
- Integration target chosen
- Files changed
- Tests or commands run (or why skipped)
