import { useAppStore } from '../../state/app-store-context'
import { WorkspaceItem } from './workspace-item'

export const WorkspaceList = () => {
  const { state } = useAppStore()

  if (state.workspaces.length === 0) {
    return (
      <div className="rounded-lg px-3 py-2 text-sm text-muted-foreground">
        No workspaces yet.
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {state.workspaces.map((workspace) => (
        <WorkspaceItem key={workspace.id} workspace={workspace} />
      ))}
    </div>
  )
}
