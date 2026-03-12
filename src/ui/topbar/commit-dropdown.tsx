import { useState } from 'react'
import { useAppStore } from '../../state/app-store-context'

export const CommitDropdown = () => {
  const { state, actions } = useAppStore()
  const [open, setOpen] = useState(false)

  const disabled = !state.activeWorktreeId

  return (
    <div className="topbar-dropdown">
      <button
        type="button"
        className="topbar-btn"
        onClick={() => setOpen(!open)}
        disabled={disabled}
        style={{
          background: disabled ? undefined : '#4a9eff',
          color: disabled ? undefined : '#fff',
          borderColor: disabled ? undefined : '#3a8adf',
        }}
      >
        Commit ▾
      </button>
      {open && (
        <div className="topbar-dropdown-menu">
          <button
            type="button"
            className="topbar-dropdown-item"
            onClick={() => {
              void actions.commitChanges(state.aiCommitMessage || 'auto commit')
              setOpen(false)
            }}
          >
            Commit
          </button>
          <button
            type="button"
            className="topbar-dropdown-item"
            onClick={() => {
              void actions.commitChanges(state.aiCommitMessage || 'auto commit')
              setOpen(false)
            }}
          >
            Commit + Push
          </button>
          <button
            type="button"
            className="topbar-dropdown-item"
            onClick={() => {
              void actions.createPullRequest(
                state.aiCommitMessage || 'New PR',
                'Auto-generated PR',
              )
              setOpen(false)
            }}
          >
            Create PR
          </button>
        </div>
      )}
    </div>
  )
}
