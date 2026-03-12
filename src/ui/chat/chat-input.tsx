import { useState, useRef, useEffect } from 'react'
import type { EffortLevel } from '../../domain/contracts'
import { useAppStore } from '../../state/app-store-context'
import './chat-input.css'

const models = [
  { id: 'claude-opus-4-6', label: 'Opus 4.6' },
  { id: 'claude-sonnet-4-6', label: 'Sonnet 4.6' },
  { id: 'claude-haiku-4-5-20251001', label: 'Haiku 4.5' },
]

const efforts: EffortLevel[] = ['low', 'medium', 'high', 'extra-high']

export const ChatInput = () => {
  const { state, actions } = useAppStore()
  const [draft, setDraft] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [draft])

  const handleSend = () => {
    const content = draft.trim()
    if (!content || !state.activeThreadId) return
    void actions.sendMessage(state.activeThreadId, content)
    setDraft('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="chat-input">
      <div className="chat-input-row">
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={state.activeThreadId ? 'Type a message...' : 'Select a thread to start chatting'}
          disabled={!state.activeThreadId}
          rows={1}
        />
        <button
          type="button"
          className="chat-input-send"
          onClick={handleSend}
          disabled={!draft.trim() || !state.activeThreadId}
        >
          Send
        </button>
      </div>
      <div className="chat-input-selectors">
        {models.map((model) => (
          <button
            key={model.id}
            type="button"
            className={`chat-input-pill${state.modelConfig.modelId === model.id ? ' selected' : ''}`}
            onClick={() => actions.updateModelConfig({
              ...state.modelConfig,
              modelId: model.id,
              modelDisplayName: model.label,
            })}
          >
            {model.label}
          </button>
        ))}
        <span style={{ width: '1px', background: '#2a2a45', margin: '0 4px' }} />
        {efforts.map((level) => (
          <button
            key={level}
            type="button"
            className={`chat-input-pill${state.modelConfig.effort === level ? ' selected' : ''}`}
            onClick={() => actions.updateModelConfig({
              ...state.modelConfig,
              effort: level,
            })}
          >
            {level}
          </button>
        ))}
      </div>
    </div>
  )
}
