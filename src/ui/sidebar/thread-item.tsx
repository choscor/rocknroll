import { useNavigate } from 'react-router-dom'
import type { Thread } from '../../domain/contracts'
import { useAppStore } from '../../state/app-store-context'

interface ThreadItemProps {
  thread: Thread
  workspaceId: string
}

const formatRelativeTime = (dateStr: string): string => {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const diffMin = Math.floor(diffMs / 60000)

  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`

  const diffHours = Math.floor(diffMin / 60)
  if (diffHours < 24) return `${diffHours}h ago`

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}

export const ThreadItem = ({ thread, workspaceId }: ThreadItemProps) => {
  const { state, actions } = useAppStore()
  const navigate = useNavigate()
  const isActive = state.activeThreadId === thread.id

  const handleClick = () => {
    actions.setActiveThread(thread.id)
    void actions.loadMessages(thread.id)
    void navigate(`/workspace/${workspaceId}/thread/${thread.id}`)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 20px',
        background: isActive ? '#2a2a45' : 'transparent',
        border: 'none',
        borderLeft: isActive ? '2px solid #4a9eff' : '2px solid transparent',
        color: isActive ? '#e0e0e8' : '#a0a0b8',
        cursor: 'pointer',
        fontSize: '0.8rem',
        textAlign: 'left',
        transition: 'all 150ms ease',
      }}
    >
      <span style={{
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        flex: 1,
      }}>
        {thread.title}
      </span>
      <span style={{ fontSize: '0.65rem', color: '#666', marginLeft: '8px', flexShrink: 0 }}>
        {formatRelativeTime(thread.updatedAt)}
      </span>
    </button>
  )
}
