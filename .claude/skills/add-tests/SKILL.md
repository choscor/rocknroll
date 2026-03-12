---
name: add-tests
description: >
  Help the agent discover the project's languages and testing tools from the
  source tree, then design, implement, and run automated tests that match the
  repo's own conventions (for example in this rocknroll desktop app scaffold
  with React + TypeScript + Vitest + Testing Library + Tauri). Trigger when the
  user asks to add, improve, or debug tests for components, state, services, or
  flows in the current repository.
---

## Purpose

This skill teaches an AI coding agent how to **add and evolve tests** in the
user's current project by:

- Detecting what languages, frameworks, and test tools are actually present in
  the source tree.
- Mirroring the **existing test layout and naming conventions** instead of
  inventing new ones.
- Using the project's own test commands and configuration.

In this specific repository (rocknroll), the app is a **React 19 + Vite 7 +
TypeScript 5.9 + Vitest 4** frontend with mocked services and a Tauri v2 shell,
serving as a concrete example of how to apply the skill.

Use this skill whenever the user asks for:

- New tests (unit, integration, or smoke) for existing code.
- Improving coverage or robustness of current tests.
- Fixing failing tests or flaky behaviour.
- Verifying that a new feature is properly exercised by tests.

Keep the focus on **fast, reliable, deterministic tests** that match the
existing testing stack and project conventions inferred from the current
workspace.

## Language and test-stack detection

Before adding or modifying tests, the agent should infer the stack from the
repository itself instead of assuming a particular language or framework.

### 1. Detect primary languages

Scan the source tree and config files to determine which languages are in use:

- TypeScript / JavaScript:
  - File extensions: `*.ts`, `*.tsx`, `*.js`, `*.jsx`.
  - Config: `tsconfig.json`, `package.json`, `vite.config.*`, `jest.config.*`.
- Python:
  - Files: `*.py`.
  - Config: `pyproject.toml`, `requirements.txt`, `setup.cfg`, `tox.ini`.
- Rust:
  - Files: `*.rs`.
  - Config: `Cargo.toml`, `Cargo.lock`.
- Go:
  - Files: `*.go`.
  - Config: `go.mod`, `go.sum`.
- Other languages:
  - Detect using their typical file extensions and config files present in the
    repo.

Assume **multiple languages** may coexist (e.g. TypeScript frontend + Rust
backend). Choose the relevant language(s) based on the files the user is
modifying or referencing.

### 2. Detect existing test tooling and patterns

For each detected language, look for:

- **Test frameworks and runners:**
  - JavaScript/TypeScript: Vitest, Jest, Playwright, Cypress, etc.
  - Python: pytest, unittest, nose.
  - Rust: built-in `cargo test`.
  - Go: built-in `go test`.
- **Config and scripts:**
  - `package.json` scripts (`test`, `lint`, `check`, `ci`).
  - Language-specific configs (`pytest.ini`, `jest.config.*`, `vitest.config.*`,
    `go.mod`, `Cargo.toml`).
- **Test file layout and naming:**
  - Co-located tests: `*.test.*`, `*.spec.*`.
  - Dedicated test folders: `tests/`, `__tests__/`, `src/test/`.
  - Integration vs unit naming conventions, if present.

Always **follow the existing patterns** instead of inventing new folder
structures, naming schemes, or frameworks.

### 3. Use the repo’s own test commands

When running tests, prefer the **project’s scripts** over bare commands:

- For Node-based projects, read `package.json` and use:
  - `"test"`, `"test:unit"`, `"test:integration"`, `"check"`, etc.
- For Python, check for:
  - `pytest` or `python -m pytest` in `pyproject.toml` or docs.
- For Rust, default to `cargo test` unless docs specify otherwise.
- For Go, default to `go test ./...` unless overridden.

Only introduce a new framework or tool if the user explicitly asks for it and it
is not already present.

---

The following sections describe **how this works in this specific repository**
(rocknroll) using React + TypeScript + Vitest as a concrete example. When
working in a different project, apply the same detection and convention-following
process with that project’s stack.

## Testing stack overview

- **Test runner:** Vitest 4 (configured in `vite.config.ts`).
- **Environment:** jsdom, with globals enabled.
- **Frontend:** React 19, React Router 7.
- **Helpers:** React Testing Library + custom `renderWithProviders`.
- **Location:** tests live next to source (`*.test.ts(x)`) and in `src/test/`.
- **Scripts:** use `npm run test` and `npm run check`, not raw `vitest`.

Key references to read when adding tests:

- `vite.config.ts` — confirms Vitest and setup file configuration.
- `src/test/setup.ts` — shared test setup (jsdom, matchers, etc.).
- `src/test/render-with-providers.tsx` — standard way to render components.
- Existing tests under:
  - `src/state/app-store.test.ts`
  - `src/infrastructure/mock/mock-services.test.ts`
  - `src/ui/shell/app-shell.integration.test.tsx`

## When to use this skill

Trigger this skill when:

- The user asks to **add tests** for:
  - A React component (e.g. sidebar, chat, topbar, settings).
  - A store or reducer (e.g. `app-store`).
  - Mock infrastructure or services.
  - A UI flow (e.g. creating threads, switching worktrees).
- The user says things like:
  - "Add tests for this component/service/store."
  - "Increase test coverage around X."
  - "Make sure this flow is covered by tests."
  - "Help debug this failing/flaky test."
- You are implementing/reworking behaviour and there are:
  - No existing tests in that area.
  - Existing tests that obviously no longer match the new behaviour.

If the user explicitly asks for test work in this repo, **assume this skill
should be applied.**

## When NOT to use this skill

Avoid or de-prioritize this skill when:

- The request is purely about **runtime debugging** or **production errors**
  where there are already good tests; focus on fixing the bug first, then
  optionally use this skill to add regression coverage.
- The user is asking for **manual QA instructions** or **exploratory testing**
  (click paths, UI test plans) rather than automated tests.
- The user wants to change CI configuration or GitHub workflows (those are
  build/infra tasks, not test design tasks).
- The change is trivial and clearly covered by existing tests (e.g. renaming a
  prop where tests are already exercising the usage path).

If in doubt, favour **at least one small, focused test** over no tests.

## Testing workflow for this repo

Follow this workflow when adding or modifying tests.

### 1. Understand the target behaviour

1. Read the implementation the user is concerned with (component, store,
   service, or flow).
2. Identify:
   - Inputs: props, state changes, events, service responses.
   - Observable outputs: rendered UI, state, callbacks, command results.
   - Edges: error paths, loading states, empty data, multiple items.

### 2. Find or create the right test file

Use these conventions:

- **Component tests:**
  - File lives next to the component, e.g.:
    - `src/ui/sidebar/sidebar.tsx` → `src/ui/sidebar/sidebar.test.tsx`
    - `src/ui/chat/chat-input.tsx` → `src/ui/chat/chat-input.test.tsx`
- **Store / logic tests:**
  - File next to source:
    - `src/state/app-store.ts` → `src/state/app-store.test.ts`
- **Integration / shell tests:**
  - Under `src/ui/shell/` or relevant feature folder:
    - `src/ui/shell/app-shell.tsx` → `src/ui/shell/app-shell.integration.test.tsx`
- **Shared helpers / glue:**
  - Tests in the same folder or under `src/test/` if they are utilities used by
    many tests.

If a suitable test file exists:

- Extend it with new `describe` / `it` blocks.

If it does not exist:

- Create a new `*.test.ts` or `*.test.tsx` using the existing tests as
  templates.

### 3. Use Vitest + Testing Library conventions

- Vitest globals are enabled, so you can write:

  ```ts
  describe('MyComponent', () => {
    it('does something', () => {
      // ...
    })
  })
  ```

- Use React Testing Library via `renderWithProviders` when testing UI:
  - Import `renderWithProviders` from `src/test/render-with-providers.tsx`.
  - Pass in any required providers (store, router) using its API.
  - Rely on `screen`, `userEvent`, and queries like `getByRole`,
    `findByText`, etc.
- Prefer **user-facing queries** (role, text, label) over implementation
  details like CSS classes or test IDs, unless the component is purely
  structural.

### 4. Design high-value test cases

For each unit or flow, aim for a small set of **representative** tests:

- **Happy path:**
  - The most common successful behaviour the user cares about.
- **Important edge cases:**
  - Empty data (no threads, no workspaces, empty diffs).
  - Error states returned via `CommandResult<T>` where `ok: false`.
  - Loading / in-progress indicators where relevant.
- **Interaction behaviour:**
  - Button clicks, form submissions, keyboard events.
  - Navigation events (changing routes, switching worktrees or threads).

Avoid overfitting to implementation details:

- Do not assert on private helper functions if their behaviour is observable via
  public components or store APIs.
- Prefer asserting **what the user sees** and **what commands are invoked**
  (when mocks are available) over low-level internals.

### 5. Use `CommandResult<T>` patterns correctly

Most services in this project return:

```ts
type CommandResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } }
```

Tests that interact with services or mocks should:

- Cover at least:
  - One `ok: true` path with realistic `data`.
  - One `ok: false` path with a representative `error`.
- Assert that:
  - UI shows appropriate success or error feedback.
  - Stores update correctly on success and remain stable (or show errors) on
    failure.

### 6. Run and fix tests

After editing or adding tests:

1. Run:
   - `npm run test` for fast feedback.
   - `npm run check` when close to completion (lint + test + build).
2. Read any failures carefully:
   - If a test is brittle (timing / network assumptions), refactor to use
     proper async helpers (e.g. `findBy*`, `waitFor`).
   - If the behaviour has changed, fix the test to match the new contract or
     adjust the implementation if the test is the source of truth.
3. Re-run until tests are green before reporting success to the user.

## Common mistakes to avoid

- **Creating tests without reading existing ones:**
  - Always inspect `app-store.test.ts`, `mock-services.test.ts`, and shell
    integration tests before inventing new patterns.
- **Using raw `render` instead of `renderWithProviders`:**
  - Leads to missing context (store, router) and fragile tests.
- **Asserting on implementation details:**
  - Avoid brittle selectors (CSS classes, DOM structure) that will change with
    refactors.
- **Skipping error and edge cases:**
  - Only testing happy paths misses the main value of tests in an agentic
    environment.
- **Not running tests after changes:**
  - Always use `npm run test` (and eventually `npm run check`) before claiming
    success.
- **Overusing mocks:**
  - Mock at the service boundary; avoid deep mocking of React internals or
    hooks unless absolutely necessary.

## Notes for AI agents

- Treat tests as **first-class deliverables**, not an afterthought; for any
  non-trivial change, propose and implement at least one new or updated test.
- When the user asks for a feature, explicitly plan:
  - Which test file(s) to modify or add.
  - Which scenarios to cover.
  - How to run tests to validate the work.
- Use existing tests as **style and pattern references**; keep naming,
  structure, and utilities consistent.
- Prefer **fewer, clearer tests** that document behaviour over many tiny ones
  that are hard to reason about.
- For bugs, always add or update a test that would have failed before the fix
  and passes after; this is critical for regression safety in an agentic IDE.

