import { useAppStore } from '../../state/app-store-context'

export const ThreadHeader = () => {
  const { state } = useAppStore()

  const activeThread = state.threads.find((t) => t.id === state.activeThreadId)
  const activeWorkspace = state.workspaces.find((ws) => ws.id === state.activeWorkspaceId)

  if (!activeThread) {
    return (
      <div className="text-sm text-muted-foreground">
        Select or create a thread to begin
      </div>
    )
  }

  return (
    <div className="min-w-0">
      <div className="truncate text-base font-semibold text-foreground">
        {activeThread.title}
      </div>
      {activeWorkspace && (
        <div className="truncate text-xs text-muted-foreground">
          {activeWorkspace.name} / {activeWorkspace.gitBranch}
        </div>
      )}
    </div>
  )
}
