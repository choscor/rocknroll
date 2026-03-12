# rocknroll

Desktop app scaffold for an agentic development environment (Codex-Desktop style), built with Tauri v2 + Vite + React + TypeScript.

## What is included

- Desktop shell with Tauri (`src-tauri`) and Vite frontend (`src`)
- Routed feature modules:
  - `Connections` (Claude + Codex via OAuth/API key mock flows)
  - `Workspace` (worktree create/switch/remove + open editor stub)
  - `Git + PR` (diff, AI commit message, commit, create PR mock)
  - `Terminal` (session create/write/close)
  - `Automation` (placeholder surface)
- Typed command envelope used across FE and Tauri commands:
  - `CommandResult<T> = { ok: true; data: T } | { ok: false; error: { code: string; message: string } }`
- Mock service adapters and state store for clickable end-to-end flows
- CI workflow for PR validation and tag-based release workflow for macOS/Windows/Linux

## Prerequisites

### Required

- Node.js 22+
- npm 10+
- Rust 1.77+

### Tauri system dependencies

- macOS: Xcode Command Line Tools
- Windows: Visual Studio Build Tools + WebView2
- Linux (Ubuntu/Debian):

```bash
sudo apt-get update
sudo apt-get install -y \
  libwebkit2gtk-4.1-dev \
  libappindicator3-dev \
  librsvg2-dev \
  patchelf
```

## Quick start

```bash
npm i
npm run tauri:dev
```

Alternative web-only UI run:

```bash
npm run dev
```

## Scripts

- `npm run dev`: start Vite on `http://localhost:1420`
- `npm run build`: type-check + build frontend
- `npm run lint`: run ESLint
- `npm run test`: run Vitest tests
- `npm run check`: lint + test + build
- `npm run tauri:dev`: run desktop app in development
- `npm run tauri:build`: create desktop bundles

## Architecture map

- `src/types/contracts.ts`: public FE contracts (`ProviderId`, `AuthMode`, `ProviderConnectionStatus`, `CommandResult`, worktree/git/terminal models)
- `src/services/interfaces.ts`: service interfaces (`AuthService`, `WorktreeService`, `GitService`, `TerminalService`)
- `src/services/mock/*`: in-memory implementations powering scaffold flows
- `src/services/tauri/desktopCommands.ts`: native command wrappers via `@tauri-apps/api`
- `src/state/*`: app store + context/actions
- `src/features/*`: page-level feature modules
- `src-tauri/src/lib.rs`: native command stubs and Tauri setup

## Environment variables

This scaffold does not require secrets to run. Suggested variables for future integration:

- `VITE_CLAUDE_OAUTH_CLIENT_ID`
- `VITE_CODEX_OAUTH_CLIENT_ID`
- `VITE_GITHUB_REPO`
- `VITE_DEFAULT_EDITOR`

None of these are used for real auth in this scaffold yet.

## CI/CD

### PR / main checks

`.github/workflows/ci.yml` runs on pull requests and pushes to `main`:

- `npm ci`
- `npm run check`
- `cargo check --manifest-path src-tauri/Cargo.toml`

### Releases

`.github/workflows/release.yml` runs on tags matching `v*` (example: `v0.1.0`):

- Builds Tauri artifacts on macOS, Windows, and Linux
- Publishes artifacts to a GitHub Release via `tauri-apps/tauri-action`

## Current limitations (intentional)

- OAuth/API key flows are mocked, not real provider integrations
- Terminal sessions are mocked in-memory
- Git commit/PR behavior is mocked (no real GitHub API calls)
- Native commands are stubs for future implementation
