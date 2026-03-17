use std::{path::Path, sync::Mutex};

use anyhow::{anyhow, Context, Result};
use hound;
use once_cell::sync::Lazy;
use whisper_rs::{FullParams, SamplingStrategy, WhisperContext, WhisperContextParameters};

static WHISPER_CTX: Lazy<Mutex<Option<WhisperContext>>> = Lazy::new(|| Mutex::new(None));

fn ensure_model_loaded(model_path: &Path) -> Result<()> {
    let mut guard = WHISPER_CTX
        .lock()
        .map_err(|_| anyhow!("Failed to lock Whisper context"))?;

    if guard.is_none() {
        let model_path_str = model_path.to_string_lossy();
        let ctx = WhisperContext::new_with_params(&model_path_str, WhisperContextParameters::new())
            .with_context(|| format!("Failed to load Whisper model at {:?}", model_path))?;
        *guard = Some(ctx);
    }

    Ok(())
}

pub fn transcribe_wav_file<P: AsRef<Path>>(model_path: P, wav_path: P) -> Result<String> {
    let model_path = model_path.as_ref().to_path_buf();
    let wav_path = wav_path.as_ref().to_path_buf();

    ensure_model_loaded(&model_path)?;

    let mut reader = hound::WavReader::open(&wav_path)
        .with_context(|| format!("Failed to open WAV file {:?}", wav_path))?;

    let spec = reader.spec();
    if spec.channels != 1 {
        return Err(anyhow!(
            "Expected mono audio, but got {} channels",
            spec.channels
        ));
    }

    let samples: Result<Vec<f32>> = reader
        .samples::<i16>()
        .map(|s| s.map(|x| x as f32 / i16::MAX as f32).map_err(anyhow::Error::from))
        .collect();
    let audio = samples?;

    let audio = if spec.sample_rate != 16_000 {
        simple_linear_resample(&audio, spec.sample_rate, 16_000)
    } else {
        audio
    };

    let mut guard = WHISPER_CTX
        .lock()
        .map_err(|_| anyhow!("Failed to lock Whisper context"))?;

    let ctx = guard
        .as_mut()
        .ok_or_else(|| anyhow!("Whisper model not initialized"))?;

    let mut state = ctx
        .create_state()
        .context("Failed to create Whisper state")?;

    let mut params = FullParams::new(SamplingStrategy::Greedy { best_of: 1 });
    params.set_language(Some("en"));
    params.set_n_threads(num_cpus::get().max(1) as i32);

    state
        .full(params, &audio)
        .context("Failed to run Whisper full()")?;

    let num_segments = state
        .full_n_segments()
        .context("Failed to get number of segments")?;

    let mut transcript = String::new();
    for i in 0..num_segments {
        let segment = state
            .full_get_segment_text(i)
            .context("Failed to get segment text")?;
        transcript.push_str(&segment);
        transcript.push(' ');
    }

    Ok(transcript.trim().to_string())
}

fn simple_linear_resample(input: &[f32], from_rate: u32, to_rate: u32) -> Vec<f32> {
    if input.is_empty() || from_rate == to_rate {
        return input.to_vec();
    }

    let ratio = to_rate as f32 / from_rate as f32;
    let out_len = (input.len() as f32 * ratio).round() as usize;
    let mut out = Vec::with_capacity(out_len);

    for i in 0..out_len {
        let t = i as f32 / ratio;
        let idx = t.floor() as usize;
        let frac = t - idx as f32;

        if idx + 1 < input.len() {
            let a = input[idx];
            let b = input[idx + 1];
            out.push(a + (b - a) * frac);
        } else {
            out.push(*input.last().unwrap());
        }
    }

    out
}

