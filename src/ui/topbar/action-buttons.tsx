import { useState } from 'react'
import { useAppStore } from '../../state/app-store-context'

export const ActionButtons = () => {
  const { state, actions } = useAppStore()
  const [editorMenuOpen, setEditorMenuOpen] = useState(false)

  const activeWorkspace = state.workspaces.find((ws) => ws.id === state.activeWorkspaceId)

  return (
    <>
      <button
        type="button"
        className="topbar-btn"
        title="Run"
        disabled={!state.activeThreadId}
      >
        ▶
      </button>

      <div className="topbar-dropdown">
        <button
          type="button"
          className="topbar-btn"
          title="Open in editor"
          onClick={() => setEditorMenuOpen(!editorMenuOpen)}
        >
          Open ▾
        </button>
        {editorMenuOpen && (
          <div className="topbar-dropdown-menu">
            {['VS Code', 'Cursor', 'Xcode'].map((editor) => (
              <button
                key={editor}
                type="button"
                className="topbar-dropdown-item"
                onClick={() => {
                  if (activeWorkspace) {
                    void actions.openEditor(activeWorkspace.path)
                  }
                  setEditorMenuOpen(false)
                }}
              >
                {editor}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        className={`topbar-btn${state.terminalPanelOpen ? ' active' : ''}`}
        title="Toggle terminal"
        onClick={actions.toggleTerminalPanel}
      >
        ⌘
      </button>

      <button
        type="button"
        className={`topbar-btn${state.diffPanelOpen ? ' active' : ''}`}
        title="Toggle diff"
        onClick={actions.toggleDiffPanel}
      >
        Δ
      </button>
    </>
  )
}
