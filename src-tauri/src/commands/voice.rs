use std::path::PathBuf;

use tauri::{AppHandle, Emitter, Manager};

use crate::audio::recorder::RecorderManager;
use crate::stt::model_download::{
    ensure_model_exists_at, MODEL_FILE_NAME, RECORDING_FILE_NAME, VOICE_DIR_NAME,
};
use crate::stt::whisper::transcribe_wav_file;

static RECORDER_MANAGER: once_cell::sync::Lazy<RecorderManager> =
    once_cell::sync::Lazy::new(RecorderManager::new);

fn resolve_voice_dir(app: &AppHandle) -> Result<PathBuf, String> {
    let base_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to resolve app data directory: {e}"))?;
    Ok(base_dir.join(VOICE_DIR_NAME))
}

fn resolve_recording_path(app: &AppHandle) -> Result<PathBuf, String> {
    Ok(resolve_voice_dir(app)?.join(RECORDING_FILE_NAME))
}

fn resolve_model_path(app: &AppHandle) -> Result<PathBuf, String> {
    Ok(resolve_voice_dir(app)?.join(MODEL_FILE_NAME))
}

#[tauri::command]
pub async fn start_recording(app: AppHandle) -> Result<(), String> {
    let recording_path = resolve_recording_path(&app)?;
    let (level_tx, level_rx) = std::sync::mpsc::sync_channel::<f32>(8);
    let app_clone = app.clone();
    tauri::async_runtime::spawn_blocking(move || {
        for level in level_rx {
            if let Err(err) = app_clone.emit("voice_level", level) {
                eprintln!("[voice] Failed to emit voice_level: {err}");
                break;
            }
        }
        let _ = app_clone.emit("voice_level", 0.0_f32);
    });

    RECORDER_MANAGER
        .start_recording(recording_path, Some(level_tx))
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn stop_recording() -> Result<(), String> {
    RECORDER_MANAGER
        .stop_and_save()
        .map(|_| ())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn transcribe_audio(app: AppHandle) -> Result<(), String> {
    let model_path = resolve_model_path(&app)?;
    let recording_path = resolve_recording_path(&app)?;

    let app_clone = app.clone();

    tauri::async_runtime::spawn_blocking(move || {
        if let Err(err) = ensure_model_exists_at(&model_path) {
            eprintln!("[voice] Failed to ensure model exists: {err}");
            let _ = app_clone.emit("voice_result", format!("(transcription error: {err})"));
            return;
        }

        match transcribe_wav_file(model_path, recording_path) {
            Ok(transcript) => {
                if let Err(err) = app_clone.emit("voice_result", transcript) {
                    eprintln!("[voice] Failed to emit voice_result: {err}");
                }
            }
            Err(err) => {
                eprintln!("[voice] Transcription failed: {err}");
                let _ = app_clone.emit(
                    "voice_result",
                    format!("(transcription error: {err})"),
                );
            }
        }
    });

    Ok(())
}

