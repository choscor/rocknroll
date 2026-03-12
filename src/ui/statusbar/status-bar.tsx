import { useAppStore } from '../../state/app-store-context'
import './status-bar.css'

export const StatusBar = () => {
  const { state, actions } = useAppStore()

  const activeWorkspace = state.workspaces.find((ws) => ws.id === state.activeWorkspaceId)

  return (
    <div className="status-bar">
      <div className="status-bar-left">
        <div className="status-bar-toggle">
          <button
            type="button"
            className={state.settings.executionMode === 'local' ? 'active' : ''}
            onClick={() => actions.updateSettings({ ...state.settings, executionMode: 'local' })}
          >
            Local
          </button>
          <button
            type="button"
            className={state.settings.executionMode === 'remote' ? 'active' : ''}
            onClick={() => actions.updateSettings({ ...state.settings, executionMode: 'remote' })}
          >
            Remote
          </button>
        </div>
        <span>Permissions: {state.settings.defaultPermissions}</span>
      </div>
      <div className="status-bar-right">
        {activeWorkspace && (
          <span>⎇ {activeWorkspace.gitBranch}</span>
        )}
        <span>{state.modelConfig.modelDisplayName}</span>
      </div>
    </div>
  )
}
