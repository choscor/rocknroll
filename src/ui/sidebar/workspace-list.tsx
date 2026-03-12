import { useAppStore } from '../../state/app-store-context'
import { WorkspaceItem } from './workspace-item'

export const WorkspaceList = () => {
  const { state } = useAppStore()

  if (state.workspaces.length === 0) {
    return (
      <div style={{ padding: '12px 20px', color: '#a0a0b8', fontSize: '0.8rem' }}>
        No workspaces yet.
      </div>
    )
  }

  return (
    <div style={{ padding: '4px 0' }}>
      {state.workspaces.map((workspace) => (
        <WorkspaceItem key={workspace.id} workspace={workspace} />
      ))}
    </div>
  )
}
