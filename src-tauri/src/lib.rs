use serde::Serialize;
use serde_json::{json, Value};
use std::collections::HashMap;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Mutex;

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
}

#[derive(Default)]
struct NativeState {
    sessions: Mutex<HashMap<String, TerminalSession>>,
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
fn create_terminal_session(worktree_id: String, state: tauri::State<'_, NativeState>) -> Value {
    let next_id = state.terminal_counter.fetch_add(1, Ordering::SeqCst) + 1;
    let session_id = format!("native-term-{}", next_id);
    let title = format!("{}-session", worktree_id);
    let created_at = unix_now();

    let session = TerminalSession {
        id: session_id.clone(),
        worktree_id,
        title,
        status: "open".to_string(),
        created_at,
        history: vec!["$ echo native terminal connected".to_string()],
        last_output: "native terminal connected".to_string(),
    };

    let lock = state.sessions.lock();
    let mut sessions = match lock {
        Ok(value) => value,
        Err(_) => return command_err("STATE_LOCK_FAILED", "Could not lock session state."),
    };

    sessions.insert(session_id, session.clone());
    command_ok(json!(session))
}

#[tauri::command]
fn list_terminal_sessions(state: tauri::State<'_, NativeState>) -> Value {
    let lock = state.sessions.lock();
    let sessions = match lock {
        Ok(value) => value,
        Err(_) => return command_err("STATE_LOCK_FAILED", "Could not lock session state."),
    };

    let mut output: Vec<TerminalSession> = sessions.values().cloned().collect();
    output.sort_by(|a, b| b.id.cmp(&a.id));

    command_ok(json!(output))
}

#[tauri::command]
fn write_terminal_session(
    session_id: String,
    input: String,
    state: tauri::State<'_, NativeState>,
) -> Value {
    let command = input.trim();
    if command.is_empty() {
        return command_err("EMPTY_COMMAND", "Terminal command cannot be empty.");
    }

    let lock = state.sessions.lock();
    let mut sessions = match lock {
        Ok(value) => value,
        Err(_) => return command_err("STATE_LOCK_FAILED", "Could not lock session state."),
    };

    let Some(session) = sessions.get_mut(&session_id) else {
        return command_err("SESSION_NOT_FOUND", "Terminal session does not exist.");
    };

    if session.status == "closed" {
        return command_err("SESSION_CLOSED", "Terminal session is closed.");
    }

    let output = format!("executed (native): {}", command);
    session.history.push(format!("$ {}", command));
    session.history.push(output.clone());
    session.last_output = output;

    command_ok(json!(session.clone()))
}

#[tauri::command]
fn close_terminal_session(session_id: String, state: tauri::State<'_, NativeState>) -> Value {
    let lock = state.sessions.lock();
    let mut sessions = match lock {
        Ok(value) => value,
        Err(_) => return command_err("STATE_LOCK_FAILED", "Could not lock session state."),
    };

    let Some(session) = sessions.get_mut(&session_id) else {
        return command_err("SESSION_NOT_FOUND", "Terminal session does not exist.");
    };

    session.status = "closed".to_string();
    session.history.push("Session closed.".to_string());
    session.last_output = "Session closed.".to_string();

    command_ok(json!(session.clone()))
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
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            open_editor,
            git_diff,
            git_commit,
            create_pull_request,
            create_terminal_session,
            list_terminal_sessions,
            write_terminal_session,
            close_terminal_session
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
