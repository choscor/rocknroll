---
name: tauri-command-wiring
description: "Add or update Tauri command wiring between the frontend and Rust backend in this scaffold. Use when adding native commands or extending desktop behaviors."
---

# Tauri Command Wiring

## Workflow

1. Define the Rust command signature in src-tauri.
2. Add the frontend invoke wrapper in desktop-commands.
3. Update service interfaces if the API surface changes.
4. Handle the non-Tauri runtime path gracefully.

## Key Files

- `src/infrastructure/tauri/desktop-commands.ts`
- `src-tauri/src/lib.rs`
- `src/repository/interfaces.ts`

## Notes

- Preserve CommandResult<T> for all commands.
