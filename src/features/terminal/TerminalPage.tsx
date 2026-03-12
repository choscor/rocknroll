import { useMemo, useState } from 'react'
import { useAppStore } from '../../state/AppStoreContext'

export const TerminalPage = () => {
  const { state, actions } = useAppStore()
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [command, setCommand] = useState('')

  const effectiveSessionId = selectedSessionId ?? state.terminalSessions[0]?.id ?? null

  const selectedSession = useMemo(
    () =>
      state.terminalSessions.find((session) => session.id === effectiveSessionId) ??
      null,
    [effectiveSessionId, state.terminalSessions],
  )

  return (
    <section className="page">
      <h2>Terminal Sessions</h2>
      <p>
        Open terminal sessions per worktree, run commands, and inspect in-session
        history.
      </p>

      <div className="row">
        <button
          className="button-primary"
          type="button"
          disabled={!state.activeWorktreeId}
          onClick={() => void actions.createTerminalSession()}
        >
          New Session
        </button>
        <small>{state.terminalSessions.length} sessions</small>
      </div>

      <div className="grid grid-two">
        <div className="card">
          <h3>Session List</h3>
          <div className="grid">
            {state.terminalSessions.length === 0 && (
              <small>No session started yet.</small>
            )}
            {state.terminalSessions.map((session) => (
              <button
                key={session.id}
                type="button"
                onClick={() => setSelectedSessionId(session.id)}
                className={session.id === effectiveSessionId ? 'button-primary' : ''}
              >
                {session.id} ({session.status})
              </button>
            ))}
          </div>
        </div>

        <div className="card">
          <h3>Session Console</h3>
          {!selectedSession && <small>Select a session to inspect logs.</small>}

          {selectedSession && (
            <>
              <small>Worktree: {selectedSession.worktreeId}</small>
              <div className="history">{selectedSession.history.join('\n')}</div>
              <div className="row">
                <input
                  value={command}
                  onChange={(event) => setCommand(event.target.value)}
                  placeholder="git status"
                />
                <button
                  type="button"
                  onClick={() => {
                    void actions.sendTerminalInput(selectedSession.id, command)
                    setCommand('')
                  }}
                  disabled={selectedSession.status === 'closed'}
                >
                  Send
                </button>
                <button
                  type="button"
                  onClick={() => void actions.closeTerminalSession(selectedSession.id)}
                  disabled={selectedSession.status === 'closed'}
                >
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
