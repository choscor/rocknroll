import { useAppStore } from '../../state/app-store-context'
import { ThreadHeader } from './thread-header'
import { ActionButtons } from './action-buttons'
import { CommitDropdown } from './commit-dropdown'
import './topbar.css'

export const TopBar = () => {
  const { actions } = useAppStore()

  return (
    <div className="topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="topbar-btn"
          onClick={actions.toggleSidebar}
          title="Toggle sidebar"
        >
          ☰
        </button>
        <ThreadHeader />
      </div>
      <div className="topbar-right">
        <ActionButtons />
        <CommitDropdown />
      </div>
    </div>
  )
}
