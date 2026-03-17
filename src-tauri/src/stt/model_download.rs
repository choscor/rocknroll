use std::{fs, io::Write, path::Path};

use anyhow::{Context, Result};

const MODEL_URL: &str =
    "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.en.bin";
pub const VOICE_DIR_NAME: &str = "voice";
pub const MODEL_FILE_NAME: &str = "ggml-base.en.bin";
pub const RECORDING_FILE_NAME: &str = "latest.wav";

pub fn ensure_model_exists_at(path: &Path) -> Result<()> {

    if path.exists() {
        return Ok(());
    }

    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)
            .with_context(|| format!("Failed to create model dir {:?}", parent))?;
    }

    let resp = reqwest::blocking::get(MODEL_URL)
        .context("Failed to download Whisper model")?;

    if !resp.status().is_success() {
        return Err(anyhow::anyhow!(
            "Failed to download model, status: {}",
            resp.status()
        ));
    }

    let bytes = resp.bytes().context("Failed to read model bytes")?;
    let mut file =
        fs::File::create(path).with_context(|| format!("Failed to create model file at {:?}", path))?;
    file.write_all(&bytes)
        .context("Failed to write model file")?;

    Ok(())
}

