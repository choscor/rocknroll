import { useState } from 'react'
import { useAppStore } from '../../state/app-store-context'

export const NewThreadButton = () => {
  const { state, actions } = useAppStore()
  const [showInput, setShowInput] = useState(false)
  const [title, setTitle] = useState('')

  const handleCreate = () => {
    if (!state.activeWorkspaceId || !title.trim()) return
    void actions.createThread(state.activeWorkspaceId, title.trim())
    setTitle('')
    setShowInput(false)
  }

  if (showInput) {
    return (
      <div className="new-thread-input" style={{ padding: '8px 16px' }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleCreate()
            if (e.key === 'Escape') setShowInput(false)
          }}
          placeholder="Thread title..."
          autoFocus
          style={{
            width: '100%',
            padding: '6px 10px',
            background: '#1e1e38',
            border: '1px solid #3a3a55',
            borderRadius: '6px',
            color: '#e0e0e8',
            fontSize: '0.85rem',
            outline: 'none',
          }}
        />
      </div>
    )
  }

  return (
    <div style={{ padding: '8px 16px' }}>
      <button
        type="button"
        onClick={() => setShowInput(true)}
        disabled={!state.activeWorkspaceId}
        style={{
          width: '100%',
          padding: '8px 12px',
          background: '#4a9eff',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '0.85rem',
        }}
      >
        + New thread
      </button>
    </div>
  )
}
