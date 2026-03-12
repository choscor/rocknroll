import { useAppStore } from '../../state/app-store-context'

export const ThreadHeader = () => {
  const { state } = useAppStore()

  const activeThread = state.threads.find((t) => t.id === state.activeThreadId)
  const activeWorkspace = state.workspaces.find((ws) => ws.id === state.activeWorkspaceId)
  const title = activeThread?.title || 'New thread'

  return (
    <div className="min-w-0 flex items-baseline gap-3">
      <div className="truncate text-[1.35rem] font-semibold text-foreground">
        {title}
      </div>
      {activeWorkspace && (
        <div className="truncate text-[1.2rem] text-muted-foreground/85">
          {activeWorkspace.name}
        </div>
      )}
    </div>
  )
}
