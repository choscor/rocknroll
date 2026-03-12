import { useAppStore } from '../../state/app-store-context'
import { NewThreadButton } from './new-thread-button'
import { SidebarNav } from './sidebar-nav'
import { WorkspaceList } from './workspace-list'
import './sidebar.css'

export const Sidebar = () => {
  const { state } = useAppStore()

  return (
    <aside className={`sidebar${state.sidebarCollapsed ? ' collapsed' : ''}`}>
      <div className="sidebar-header">
        <h1>rocknroll</h1>
        <p>Agentic Desktop Environment</p>
      </div>

      <div className="sidebar-content">
        <NewThreadButton />
        <WorkspaceList />
      </div>

      <div className="sidebar-footer">
        <SidebarNav />
      </div>
    </aside>
  )
}
