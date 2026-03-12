import { Outlet } from 'react-router-dom'
import { useAppStore } from '../../state/app-store-context'
import { Sidebar } from '../sidebar/sidebar'
import { TopBar } from '../topbar/topbar'
import { ChatInput } from '../chat/chat-input'
import { StatusBar } from '../statusbar/status-bar'
import './app-shell.css'

export const AppShell = () => {
  const { state, actions } = useAppStore()

  return (
    <div className={`app-shell${state.sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
      <Sidebar />
      <TopBar />
      <div className="app-content">
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
      </div>
      <ChatInput />
      <StatusBar />
    </div>
  )
}
