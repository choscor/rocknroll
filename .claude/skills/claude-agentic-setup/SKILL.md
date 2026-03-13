---
name: claude-agentic-setup
description: "Set up or extend Claude integration for the rocknroll desktop agentic scaffold, including model selection, effort levels, provider connection flows, and preference persistence. Use when asked to wire Claude into this repo, expose model/effort choices, or make the agentic coding tool configurable."
---

# Claude Agentic Setup

Follow this workflow to wire Claude into the scaffold while preserving the existing
UI and state patterns.

## Workflow

1. Read the scaffold map in `references/scaffold-map.md` to locate the relevant
   UI, state, and service boundaries.
2. Confirm the integration target:
   - Mock-only (no network calls)
   - Real Claude calls via Tauri backend
   - Remote API gateway
3. Confirm secrets handling and persistence:
   - Where API keys should live
   - Whether to persist model and effort defaults
4. Make the minimal interface changes first:
   - Add `modelConfig` to chat service inputs
   - Pass `state.modelConfig` through the app store action
5. Update the implementation:
   - Keep the mock chat service compatible
   - Add the real Claude-backed service or Tauri command
6. Verify UI consistency:
   - Settings and chat pills reflect the same model list
   - Status bar shows `modelDisplayName`
7. Validate behavior:
   - Ensure send flow still works
   - Update or add tests only if logic changed

## Notes

- Keep provider credentials out of the frontend runtime.
- Use `CommandResult<T>` for all service responses.
- Prefer minimal, incremental changes that match existing patterns.
- Keep model ids and labels in sync across UI surfaces.

## Output Expectations

- User can select model and effort.
- Chosen values are applied when sending messages.
- Integration path is explicit and secure.
