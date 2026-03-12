import { useState } from 'react'
import type { ChatMessage as ChatMessageType } from '../../domain/contracts'

interface ChatMessageProps {
  message: ChatMessageType
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const [copied, setCopied] = useState(false)

  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start',
        animation: 'messageSlideUp 200ms ease',
      }}
    >
      <div style={{
        fontSize: '0.7rem',
        color: '#666',
        marginBottom: '4px',
        padding: '0 4px',
      }}>
        {isUser ? 'You' : isSystem ? 'System' : 'Assistant'}
      </div>
      <div
        style={{
          maxWidth: '80%',
          padding: '10px 14px',
          borderRadius: isUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
          background: isUser ? '#4a9eff' : isSystem ? '#2a2a45' : '#1e1e38',
          color: '#e0e0e8',
          fontSize: '0.85rem',
          lineHeight: 1.5,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          position: 'relative',
        }}
      >
        {message.content}
        {!isUser && (
          <button
            type="button"
            onClick={() => void handleCopy()}
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              background: 'transparent',
              border: 'none',
              color: '#666',
              cursor: 'pointer',
              fontSize: '0.7rem',
              padding: '2px 4px',
              borderRadius: '4px',
              opacity: 0.6,
            }}
            title="Copy"
          >
            {copied ? '✓' : '⧉'}
          </button>
        )}
      </div>
    </div>
  )
}
