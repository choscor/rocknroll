import { NavLink, Outlet } from 'react-router-dom'
import { useAppStore } from '../state/AppStoreContext'
import './AppShell.css'

const navigationItems = [
  { to: '/connections', label: 'Connections' },
  { to: '/workspace', label: 'Workspace' },
  { to: '/git', label: 'Git + PR' },
  { to: '/terminal', label: 'Terminal' },
  { to: '/automation', label: 'Automation' },
]

export const AppShell = () => {
  const { state, actions } = useAppStore()

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <h1>rocknroll</h1>
        <p>Agentic Desktop Environment</p>

        <nav>
          {navigationItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? 'nav-link nav-link-active' : 'nav-link'
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-meta">
          <span>Active Worktree</span>
          <strong>{state.activeWorktreeId ?? 'None selected'}</strong>
        </div>
      </aside>

      <main className="app-main">
        {(state.lastError || state.lastInfo) && (
          <div className="banner-stack">
            {state.lastError && (
              <div className="banner banner-error" role="alert">
                <div>{state.lastError}</div>
                <button onClick={actions.clearBanners} type="button">
                  Dismiss
                </button>
              </div>
            )}
            {state.lastInfo && (
              <div className="banner banner-info" role="status">
                <div>{state.lastInfo}</div>
                <button onClick={actions.clearBanners} type="button">
                  Dismiss
                </button>
              </div>
            )}
          </div>
        )}
        <Outlet />
      </main>
    </div>
  )
}
