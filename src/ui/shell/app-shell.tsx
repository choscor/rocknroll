import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { DiffPanel } from '../panels/diff-panel'
import { TerminalPanel } from '../panels/terminal-panel'
import { useAppStore } from '../../state/app-store-context'
import { Sidebar } from '../sidebar/sidebar'
import { TopBar } from '../topbar/topbar'
import { ChatInput } from '../chat/chat-input'
import { StatusBar } from '../statusbar/status-bar'
import { isTauriRuntime } from '../../infrastructure/tauri/desktop-commands'

export const AppShell = () => {
  const { state, actions } = useAppStore()
  const location = useLocation()
  const wasDiffOpen = useRef(false)
  const wasTerminalOpen = useRef(false)

  const isChatRoute =
    location.pathname === '/chat' || location.pathname.startsWith('/workspace/')

  useEffect(() => {
    if (state.diffPanelOpen && !wasDiffOpen.current) {
      void actions.refreshDiff()
    }

    wasDiffOpen.current = state.diffPanelOpen
  }, [actions, state.diffPanelOpen])

  useEffect(() => {
    if (
      isTauriRuntime() &&
      state.terminalPanelOpen &&
      !wasTerminalOpen.current &&
      state.terminalSessions.length === 0
    ) {
      void actions.createTerminalSession()
    }

    wasTerminalOpen.current = state.terminalPanelOpen
  }, [actions, state.terminalPanelOpen, state.terminalSessions.length])

  return (
    <div className="h-screen bg-background text-foreground">
      <div className="flex h-full overflow-hidden">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar />

          {(state.lastError || state.lastInfo) && (
            <div className="space-y-2 px-4 pt-3">
              {state.lastError && (
                <div
                  className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                  role="alert"
                >
                  <div>{state.lastError}</div>
                  <Button onClick={actions.clearBanners} type="button" variant="ghost" size="sm">
                    Dismiss
                  </Button>
                </div>
              )}
              {state.lastInfo && (
                <div
                  className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
                  role="status"
                >
                  <div>{state.lastInfo}</div>
                  <Button onClick={actions.clearBanners} type="button" variant="ghost" size="sm">
                    Dismiss
                  </Button>
                </div>
              )}
            </div>
          )}

          <div className="flex min-h-0 flex-1">
            <div className="flex min-w-0 flex-1 flex-col">
              <main className="min-h-0 flex-1 overflow-hidden bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),rgba(249,250,252,1)_45%)]">
                <Outlet />
              </main>

              {isChatRoute && <ChatInput />}
              <StatusBar />
              <TerminalPanel />
            </div>

            {state.diffPanelOpen && <DiffPanel />}
          </div>
        </div>
      </div>
    </div>
  )
}
