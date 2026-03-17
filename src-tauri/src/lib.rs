use portable_pty::{native_pty_system, CommandBuilder, MasterPty, PtySize};
use serde::Serialize;
use serde_json::{json, Value};
use std::collections::HashMap;
use std::io::{Read, Write};
use std::path::PathBuf;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Mutex;
use tauri::{Emitter, Manager};

mod audio;
mod commands;
mod stt;

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct TerminalSession {
    id: String,
    worktree_id: String,
    title: String,
    status: String,
    created_at: String,
    history: Vec<String>,
    last_output: String,
    cwd: String,
    shell: String,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct TerminalOutputEvent {
    session_id: String,
    data: String,
}

struct RuntimeTerminalSession {
    snapshot: TerminalSession,
    writer: Box<dyn Write + Send>,
    master: Box<dyn MasterPty + Send>,
    child: Box<dyn portable_pty::Child + Send>,
}

#[derive(Default)]
struct NativeState {
    sessions: Mutex<HashMap<String, RuntimeTerminalSession>>,
    terminal_counter: AtomicU64,
    commit_counter: AtomicU64,
    pull_request_counter: AtomicU64,
}

fn command_ok(data: Value) -> Value {
    json!({
      "ok": true,
      "data": data,
    })
}

fn command_err(code: &str, message: &str) -> Value {
    json!({
      "ok": false,
      "error": {
        "code": code,
        "message": message,
      },
    })
}

fn unix_now() -> String {
    match std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH) {
        Ok(value) => value.as_secs().to_string(),
        Err(_) => "0".to_string(),
    }
}

fn resolve_shell(shell: Option<String>) -> String {
    if let Some(override_shell) = shell {
        let trimmed = override_shell.trim();
        if !trimmed.is_empty() {
            return trimmed.to_string();
        }
    }

    if let Ok(system_shell) = std::env::var("SHELL") {
        let trimmed = system_shell.trim();
        if !trimmed.is_empty() {
            return trimmed.to_string();
        }
    }

    #[cfg(target_os = "windows")]
    {
        "cmd.exe".to_string()
    }

    #[cfg(not(target_os = "windows"))]
    {
        if PathBuf::from("/bin/zsh").exists() {
            "/bin/zsh".to_string()
        } else {
            "/bin/bash".to_string()
        }
    }
}

fn fallback_cwd() -> PathBuf {
    std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."))
}

fn resolve_cwd(cwd: Option<String>) -> PathBuf {
    let Some(raw_cwd) = cwd else {
        return fallback_cwd();
    };

    let trimmed = raw_cwd.trim();
    if trimmed.is_empty() {
        return fallback_cwd();
    }

    let path = PathBuf::from(trimmed);
    if !path.exists() || !path.is_dir() {
        return fallback_cwd();
    }

    path.canonicalize().unwrap_or(path)
}

#[tauri::command]
fn pick_folder() -> Value {
    let selected = rfd::FileDialog::new().pick_folder();
    let path = selected.map(|folder| folder.to_string_lossy().to_string());

    command_ok(json!({
      "path": path,
    }))
}

#[tauri::command]
fn open_editor(path: String) -> Value {
    command_ok(json!({
      "path": path,
      "launched": false,
    }))
}

#[tauri::command]
fn git_diff(worktree_id: String) -> Value {
    let diff = format!(
    "diff --git a/src/session.rs b/src/session.rs\nindex 9f1e230..d0c4de1 100644\n--- a/src/session.rs\n+++ b/src/session.rs\n@@ -1,4 +1,7 @@\n+// mock diff for {}\n+pub const MODE: &str = \"agentic\";\n pub fn bootstrap() {{}}\n",
    worktree_id
  );

    command_ok(json!({
      "worktreeId": worktree_id,
      "diff": diff,
    }))
}

#[tauri::command]
fn git_commit(worktree_id: String, message: String, state: tauri::State<'_, NativeState>) -> Value {
    let trimmed = message.trim();
    if trimmed.is_empty() {
        return command_err("EMPTY_COMMIT_MESSAGE", "Commit message cannot be empty.");
    }

    let next_id = state.commit_counter.fetch_add(1, Ordering::SeqCst) + 1;

    command_ok(json!({
      "sha": format!("{:07x}", next_id),
      "message": trimmed,
      "worktreeId": worktree_id,
      "committedAt": unix_now(),
    }))
}

#[tauri::command]
fn create_pull_request(
    worktree_id: String,
    title: String,
    body: String,
    state: tauri::State<'_, NativeState>,
) -> Value {
    let trimmed = title.trim();
    if trimmed.is_empty() {
        return command_err("EMPTY_PR_TITLE", "Pull request title cannot be empty.");
    }

    let next_id = state.pull_request_counter.fetch_add(1, Ordering::SeqCst) + 1;

    command_ok(json!({
      "id": format!("pr-{}", next_id),
      "title": trimmed,
      "body": body,
      "url": format!("https://github.com/choscor/rocknroll/pull/{}", next_id),
      "branch": worktree_id,
      "status": "open",
      "createdAt": unix_now(),
    }))
}

#[tauri::command]
fn create_terminal_session(
    worktree_id: String,
    cwd: Option<String>,
    shell: Option<String>,
    state: tauri::State<'_, NativeState>,
    app: tauri::AppHandle,
) -> Value {
    let next_id = state.terminal_counter.fetch_add(1, Ordering::SeqCst) + 1;
    let session_id = format!("native-term-{}", next_id);
    let created_at = unix_now();
    let shell_command = resolve_shell(shell);
    let cwd_path = resolve_cwd(cwd);
    let cwd_value = cwd_path.to_string_lossy().to_string();

    let pty_system = native_pty_system();
    let pty_pair = match pty_system.openpty(PtySize {
        rows: 24,
        cols: 120,
        pixel_width: 0,
        pixel_height: 0,
    }) {
        Ok(pair) => pair,
        Err(error) => {
            return command_err(
                "TERMINAL_PTY_CREATE_FAILED",
                &format!("Could not create PTY: {}", error),
            )
        }
    };

    let mut cmd = CommandBuilder::new(shell_command.clone());
    cmd.cwd(cwd_path);

    let child = match pty_pair.slave.spawn_command(cmd) {
        Ok(value) => value,
        Err(error) => {
            return command_err(
                "TERMINAL_SPAWN_FAILED",
                &format!("Could not spawn shell: {}", error),
            )
        }
    };
    drop(pty_pair.slave);

    let mut reader = match pty_pair.master.try_clone_reader() {
        Ok(value) => value,
        Err(error) => {
            return command_err(
                "TERMINAL_READER_FAILED",
                &format!("Could not attach terminal reader: {}", error),
            )
        }
    };

    let writer = match pty_pair.master.take_writer() {
        Ok(value) => value,
        Err(error) => {
            return command_err(
                "TERMINAL_WRITER_FAILED",
                &format!("Could not attach terminal writer: {}", error),
            )
        }
    };

    let session = TerminalSession {
        id: session_id.clone(),
        worktree_id: worktree_id.clone(),
        title: format!("{}-terminal", worktree_id),
        status: "open".to_string(),
        created_at,
        history: vec![],
        last_output: String::new(),
        cwd: cwd_value,
        shell: shell_command,
    };

    let runtime = RuntimeTerminalSession {
        snapshot: session.clone(),
        writer,
        master: pty_pair.master,
        child,
    };

    let lock = state.sessions.lock();
    let mut sessions = match lock {
        Ok(value) => value,
        Err(_) => return command_err("STATE_LOCK_FAILED", "Could not lock session state."),
    };
    sessions.insert(session_id.clone(), runtime);
    drop(sessions);

    std::thread::spawn(move || {
        let mut buffer = [0_u8; 4096];
        loop {
            let bytes_read = match reader.read(&mut buffer) {
                Ok(0) => break,
                Ok(size) => size,
                Err(_) => break,
            };

            let data = String::from_utf8_lossy(&buffer[..bytes_read]).to_string();
            if app
                .emit(
                    "terminal-output",
                    TerminalOutputEvent {
                        session_id: session_id.clone(),
                        data,
                    },
                )
                .is_err()
            {
                break;
            }
        }
    });

    command_ok(json!(session))
}

#[tauri::command]
fn list_terminal_sessions(state: tauri::State<'_, NativeState>) -> Value {
    let lock = state.sessions.lock();
    let sessions = match lock {
        Ok(value) => value,
        Err(_) => return command_err("STATE_LOCK_FAILED", "Could not lock session state."),
    };

    let mut output: Vec<TerminalSession> = sessions
        .values()
        .map(|session| session.snapshot.clone())
        .collect();
    output.sort_by(|a, b| b.id.cmp(&a.id));

    command_ok(json!(output))
}

#[tauri::command]
fn write_terminal_session(
    session_id: String,
    input: String,
    state: tauri::State<'_, NativeState>,
) -> Value {
    let lock = state.sessions.lock();
    let mut sessions = match lock {
        Ok(value) => value,
        Err(_) => return command_err("STATE_LOCK_FAILED", "Could not lock session state."),
    };

    let Some(session) = sessions.get_mut(&session_id) else {
        return command_err("SESSION_NOT_FOUND", "Terminal session does not exist.");
    };

    if session.snapshot.status == "closed" {
        return command_err("SESSION_CLOSED", "Terminal session is closed.");
    }

    if input.is_empty() {
        return command_ok(json!(session.snapshot.clone()));
    }

    if let Err(error) = session.writer.write_all(input.as_bytes()) {
        return command_err(
            "TERMINAL_WRITE_FAILED",
            &format!("Could not write to terminal: {}", error),
        );
    }

    if let Err(error) = session.writer.flush() {
        return command_err(
            "TERMINAL_FLUSH_FAILED",
            &format!("Could not flush terminal input: {}", error),
        );
    }

    command_ok(json!(session.snapshot.clone()))
}

#[tauri::command]
fn resize_terminal_session(
    session_id: String,
    cols: u16,
    rows: u16,
    state: tauri::State<'_, NativeState>,
) -> Value {
    if cols == 0 || rows == 0 {
        return command_err(
            "INVALID_TERMINAL_SIZE",
            "Terminal rows and columns must be positive.",
        );
    }

    let lock = state.sessions.lock();
    let mut sessions = match lock {
        Ok(value) => value,
        Err(_) => return command_err("STATE_LOCK_FAILED", "Could not lock session state."),
    };

    let Some(session) = sessions.get_mut(&session_id) else {
        return command_err("SESSION_NOT_FOUND", "Terminal session does not exist.");
    };

    if let Err(error) = session.master.resize(PtySize {
        rows,
        cols,
        pixel_width: 0,
        pixel_height: 0,
    }) {
        return command_err(
            "TERMINAL_RESIZE_FAILED",
            &format!("Could not resize terminal: {}", error),
        );
    }

    command_ok(json!(session.snapshot.clone()))
}

#[tauri::command]
fn close_terminal_session(session_id: String, state: tauri::State<'_, NativeState>) -> Value {
    let lock = state.sessions.lock();
    let mut sessions = match lock {
        Ok(value) => value,
        Err(_) => return command_err("STATE_LOCK_FAILED", "Could not lock session state."),
    };

    let Some(mut session) = sessions.remove(&session_id) else {
        return command_err("SESSION_NOT_FOUND", "Terminal session does not exist.");
    };

    session.snapshot.status = "closed".to_string();
    let _ = session.child.kill();
    let _ = session.child.wait();

    command_ok(json!(session.snapshot))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(NativeState::default())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            let model_path = app
                .path()
                .app_data_dir()?
                .join(crate::stt::model_download::VOICE_DIR_NAME)
                .join(crate::stt::model_download::MODEL_FILE_NAME);
            tauri::async_runtime::spawn_blocking(move || {
                if let Err(err) = crate::stt::model_download::ensure_model_exists_at(&model_path) {
                    eprintln!("[voice] Failed to ensure Whisper model: {err}");
                }
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            pick_folder,
            open_editor,
            git_diff,
            git_commit,
            create_pull_request,
            create_terminal_session,
            list_terminal_sessions,
            write_terminal_session,
            resize_terminal_session,
            close_terminal_session,
            crate::commands::voice::start_recording,
            crate::commands::voice::stop_recording,
            crate::commands::voice::transcribe_audio,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
