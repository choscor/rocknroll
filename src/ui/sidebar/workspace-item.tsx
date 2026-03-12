import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Workspace } from '../../domain/contracts'
import { useAppStore } from '../../state/app-store-context'
import { ThreadItem } from './thread-item'

interface WorkspaceItemProps {
  workspace: Workspace
}

export const WorkspaceItem = ({ workspace }: WorkspaceItemProps) => {
  const { state, actions } = useAppStore()
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(state.activeWorkspaceId === workspace.id)

  const isActive = state.activeWorkspaceId === workspace.id
  const workspaceThreads = state.threads.filter((t) => t.workspaceId === workspace.id)

  const handleClick = () => {
    if (!isActive) {
      actions.setActiveWorkspace(workspace.id)
      void actions.loadThreads(workspace.id)
      void navigate(`/workspace/${workspace.id}`)
    }
    setExpanded(!expanded)
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 20px',
          background: isActive ? '#1e1e38' : 'transparent',
          border: 'none',
          color: isActive ? '#e0e0e8' : '#a0a0b8',
          cursor: 'pointer',
          fontSize: '0.85rem',
          textAlign: 'left',
          transition: 'all 150ms ease',
        }}
      >
        <span style={{
          display: 'inline-block',
          transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
          transition: 'transform 200ms ease',
          fontSize: '0.7rem',
        }}>
          ▶
        </span>
        <span style={{ fontWeight: isActive ? 600 : 400 }}>{workspace.name}</span>
        <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: '#666' }}>
          {workspace.gitBranch}
        </span>
      </button>

      {expanded && (
        <div style={{ paddingLeft: '12px', overflow: 'hidden', transition: 'all 200ms ease' }}>
          {workspaceThreads.length === 0 ? (
            <div style={{ padding: '6px 20px', color: '#666', fontSize: '0.75rem' }}>
              No threads yet
            </div>
          ) : (
            workspaceThreads.map((thread) => (
              <ThreadItem key={thread.id} thread={thread} workspaceId={workspace.id} />
            ))
          )}
        </div>
      )}
    </div>
  )
}
