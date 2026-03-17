import { useEffect, useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { listen, type UnlistenFn } from '@tauri-apps/api/event'

export function useVoice() {
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [voiceLevel, setVoiceLevel] = useState(0)
  const [transcript, setTranscript] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let unlistenResult: UnlistenFn | null = null
    let unlistenLevel: UnlistenFn | null = null

    const setup = async () => {
      try {
        unlistenResult = await listen<string>('voice_result', (event) => {
          setTranscript(event.payload)
          setIsTranscribing(false)
          setVoiceLevel(0)
        })
        unlistenLevel = await listen<number>('voice_level', (event) => {
          setVoiceLevel(event.payload ?? 0)
        })
      } catch (e) {
        console.error('Failed to listen to voice events', e)
      }
    }

    void setup()

    return () => {
      unlistenResult?.()
      unlistenLevel?.()
    }
  }, [])

  const startRecording = async () => {
    setError(null)
    try {
      await invoke('start_recording')
      setIsRecording(true)
      setVoiceLevel(0)
      setTranscript(null)
    } catch (e: any) {
      console.error('Failed to start recording', e)
      setError(e?.toString?.() ?? 'Failed to start recording')
    }
  }

  const stopRecording = async () => {
    setError(null)
    try {
      await invoke('stop_recording')
      setIsRecording(false)
      setIsTranscribing(true)
      setVoiceLevel(0)
      await invoke('transcribe_audio')
    } catch (e: any) {
      console.error('Failed to stop or transcribe', e)
      setError(e?.toString?.() ?? 'Failed to stop or transcribe')
      setIsRecording(false)
      setIsTranscribing(false)
      setVoiceLevel(0)
    }
  }

  return {
    isRecording,
    isTranscribing,
    voiceLevel,
    transcript,
    error,
    startRecording,
    stopRecording,
  }
}

