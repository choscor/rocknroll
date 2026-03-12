import { useAppStore } from '../../state/app-store-context'

export const ThreadHeader = () => {
  const { state } = useAppStore()

  const activeThread = state.threads.find((t) => t.id === state.activeThreadId)
  const activeWorkspace = state.workspaces.find((ws) => ws.id === state.activeWorkspaceId)

  if (!activeThread) {
    return (
      <div style={{ color: '#a0a0b8', fontSize: '0.85rem' }}>
        Select or create a thread to begin
      </div>
    )
  }

  return (
    <div style={{ minWidth: 0 }}>
      <div style={{
        fontSize: '0.9rem',
        fontWeight: 600,
        color: '#e0e0e8',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {activeThread.title}
      </div>
      {activeWorkspace && (
        <div style={{ fontSize: '0.7rem', color: '#a0a0b8' }}>
          {activeWorkspace.name} / {activeWorkspace.gitBranch}
        </div>
      )}
    </div>
  )
}
