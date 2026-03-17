use std::{
    path::PathBuf,
    sync::{mpsc, Arc, Mutex},
    thread,
    time::{Duration, Instant},
};

use anyhow::{anyhow, Context, Result};
use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use hound::{SampleFormat, WavSpec, WavWriter};

struct RecordingHandle {
    stop_tx: mpsc::Sender<()>,
    finished_rx: mpsc::Receiver<Result<PathBuf, String>>,
}

pub struct RecorderManager {
    inner: Mutex<Option<RecordingHandle>>,
}

impl RecorderManager {
    pub fn new() -> Self {
        Self {
            inner: Mutex::new(None),
        }
    }

    pub fn start_recording(
        &self,
        output_path: PathBuf,
        level_tx: Option<mpsc::SyncSender<f32>>,
    ) -> Result<()> {
        let mut guard = self
            .inner
            .lock()
            .map_err(|_| anyhow!("Failed to lock recorder manager"))?;

        if guard.is_some() {
            return Ok(());
        }

        let (stop_tx, stop_rx) = mpsc::channel::<()>();
        let (finished_tx, finished_rx) = mpsc::channel::<Result<PathBuf, String>>();

        thread::spawn(move || {
            let result =
                run_recording(stop_rx, output_path, level_tx).map_err(|err| err.to_string());
            let _ = finished_tx.send(result);
        });

        *guard = Some(RecordingHandle {
            stop_tx,
            finished_rx,
        });

        Ok(())
    }

    pub fn stop_and_save(&self) -> Result<PathBuf> {
        let handle = {
            let mut guard = self
                .inner
                .lock()
                .map_err(|_| anyhow!("Failed to lock recorder manager"))?;
            guard.take().ok_or_else(|| anyhow!("Not recording"))?
        };

        handle
            .stop_tx
            .send(())
            .map_err(|_| anyhow!("Failed to signal stop to recorder"))?;

        let result = handle
            .finished_rx
            .recv()
            .map_err(|_| anyhow!("Failed to receive recording result"))?;

        result.map_err(|err| anyhow!(err))
    }
}

fn run_recording(
    stop_rx: mpsc::Receiver<()>,
    out_path: PathBuf,
    level_tx: Option<mpsc::SyncSender<f32>>,
) -> Result<PathBuf> {
    let host = cpal::default_host();
    let device = host
        .default_input_device()
        .ok_or_else(|| anyhow!("No default input device available"))?;

    let supported_config = device
        .default_input_config()
        .context("Failed to get default input config")?;

    let sample_format = supported_config.sample_format();
    let config: cpal::StreamConfig = supported_config.into();

    let sample_rate = config.sample_rate.0;
    let channels = config.channels;

    let samples: Arc<Mutex<Vec<i16>>> = Arc::new(Mutex::new(Vec::new()));
    let last_level_emit = Arc::new(Mutex::new(
        Instant::now()
            .checked_sub(Duration::from_millis(100))
            .unwrap_or_else(Instant::now),
    ));

    let stream = match sample_format {
        cpal::SampleFormat::I16 => {
            let samples_clone = samples.clone();
            let level_tx = level_tx.clone();
            let last_level_emit = last_level_emit.clone();
            device.build_input_stream(
                &config,
                move |data: &[i16], _| {
                    if let Ok(mut buf) = samples_clone.lock() {
                        buf.extend_from_slice(data);
                    }
                    try_emit_level_i16(data, &level_tx, &last_level_emit);
                },
                move |err| {
                    eprintln!("[Recorder] Stream error: {err}");
                },
                None,
            )?
        }
        cpal::SampleFormat::U16 => {
            let samples_clone = samples.clone();
            let level_tx = level_tx.clone();
            let last_level_emit = last_level_emit.clone();
            device.build_input_stream(
                &config,
                move |data: &[u16], _| {
                    if let Ok(mut buf) = samples_clone.lock() {
                        buf.extend(data.iter().map(|s| {
                            let v = *s as i32 - i16::MAX as i32;
                            v.max(i16::MIN as i32).min(i16::MAX as i32) as i16
                        }));
                    }
                    try_emit_level_u16(data, &level_tx, &last_level_emit);
                },
                move |err| {
                    eprintln!("[Recorder] Stream error: {err}");
                },
                None,
            )?
        }
        cpal::SampleFormat::F32 => {
            let samples_clone = samples.clone();
            let level_tx = level_tx.clone();
            let last_level_emit = last_level_emit.clone();
            device.build_input_stream(
                &config,
                move |data: &[f32], _| {
                    if let Ok(mut buf) = samples_clone.lock() {
                        buf.extend(data.iter().map(|s| {
                            let v = (s * i16::MAX as f32) as i32;
                            v.max(i16::MIN as i32).min(i16::MAX as i32) as i16
                        }));
                    }
                    try_emit_level_f32(data, &level_tx, &last_level_emit);
                },
                move |err| {
                    eprintln!("[Recorder] Stream error: {err}");
                },
                None,
            )?
        }
        _ => {
            return Err(anyhow!(
                "Unsupported input sample format: {:?}",
                sample_format
            ));
        }
    };

    stream.play()?;

    let _ = stop_rx.recv();

    drop(stream);

    let recorded_samples = {
        let mut guard = samples
            .lock()
            .map_err(|_| anyhow!("Failed to lock samples buffer"))?;
        std::mem::take(&mut *guard)
    };

    let out_dir = out_path
        .parent()
        .ok_or_else(|| anyhow!("Recording output path has no parent directory"))?;
    std::fs::create_dir_all(out_dir)?;

    let spec = WavSpec {
        channels,
        sample_rate,
        bits_per_sample: 16,
        sample_format: SampleFormat::Int,
    };

    let mut writer = WavWriter::create(&out_path, spec)?;
    for sample in recorded_samples {
        writer.write_sample(sample)?;
    }
    writer.finalize()?;

    Ok(out_path)
}

fn should_emit_level(last_level_emit: &Arc<Mutex<Instant>>) -> bool {
    if let Ok(mut last_emit) = last_level_emit.lock() {
        if last_emit.elapsed() < Duration::from_millis(45) {
            return false;
        }
        *last_emit = Instant::now();
        return true;
    }
    false
}

fn try_send_level(level_tx: &Option<mpsc::SyncSender<f32>>, level: f32) {
    if let Some(tx) = level_tx {
        let clamped = level.clamp(0.0, 1.0);
        let _ = tx.try_send(clamped);
    }
}

fn rms_from_f32(data: &[f32]) -> f32 {
    if data.is_empty() {
        return 0.0;
    }
    let sum: f32 = data.iter().map(|s| s * s).sum();
    (sum / data.len() as f32).sqrt()
}

fn rms_from_i16(data: &[i16]) -> f32 {
    if data.is_empty() {
        return 0.0;
    }
    let sum: f32 = data
        .iter()
        .map(|s| {
            let v = *s as f32 / i16::MAX as f32;
            v * v
        })
        .sum();
    (sum / data.len() as f32).sqrt()
}

fn rms_from_u16(data: &[u16]) -> f32 {
    if data.is_empty() {
        return 0.0;
    }
    let sum: f32 = data
        .iter()
        .map(|s| {
            let v = ((*s as f32 / u16::MAX as f32) * 2.0) - 1.0;
            v * v
        })
        .sum();
    (sum / data.len() as f32).sqrt()
}

fn try_emit_level_i16(
    data: &[i16],
    level_tx: &Option<mpsc::SyncSender<f32>>,
    last_level_emit: &Arc<Mutex<Instant>>,
) {
    if !should_emit_level(last_level_emit) || data.is_empty() {
        return;
    }
    try_send_level(level_tx, rms_from_i16(data));
}

fn try_emit_level_u16(
    data: &[u16],
    level_tx: &Option<mpsc::SyncSender<f32>>,
    last_level_emit: &Arc<Mutex<Instant>>,
) {
    if !should_emit_level(last_level_emit) || data.is_empty() {
        return;
    }
    try_send_level(level_tx, rms_from_u16(data));
}

fn try_emit_level_f32(
    data: &[f32],
    level_tx: &Option<mpsc::SyncSender<f32>>,
    last_level_emit: &Arc<Mutex<Instant>>,
) {
    if !should_emit_level(last_level_emit) || data.is_empty() {
        return;
    }
    try_send_level(level_tx, rms_from_f32(data));
}


