import { useState } from 'react'
import { useAppStore } from '../../state/AppStoreContext'

const emptyDraft = {
  name: '',
  branch: '',
  path: '',
}

export const WorkspacePage = () => {
  const { state, actions } = useAppStore()
  const [draft, setDraft] = useState(emptyDraft)

  return (
    <section className="page">
      <h2>Workspace + Worktrees</h2>
      <p>
        Create and switch worktrees for isolated agent sessions. Opening the editor
        calls a Tauri command stub.
      </p>

      <form
        className="card"
        onSubmit={(event) => {
          event.preventDefault()
          void actions.createWorktree(draft)
          setDraft(emptyDraft)
        }}
      >
        <h3>Create Worktree</h3>
        <div className="grid grid-two">
          <label>
            Name
            <input
              value={draft.name}
              onChange={(event) =>
                setDraft((previous) => ({ ...previous, name: event.target.value }))
              }
              placeholder="feature-auth"
            />
          </label>

          <label>
            Branch
            <input
              value={draft.branch}
              onChange={(event) =>
                setDraft((previous) => ({ ...previous, branch: event.target.value }))
              }
              placeholder="feat/auth-flow"
            />
          </label>
        </div>

        <label>
          Local path
          <input
            value={draft.path}
            onChange={(event) =>
              setDraft((previous) => ({ ...previous, path: event.target.value }))
            }
            placeholder="/workspace/feature-auth"
          />
        </label>

        <div className="row">
          <button className="button-primary" type="submit">
            Create + Activate
          </button>
          <small>
            Active worktree: <strong>{state.activeWorktreeId ?? 'none'}</strong>
          </small>
        </div>
      </form>

      <div className="grid">
        {state.worktrees.map((worktree) => (
          <article className="card" key={worktree.id}>
            <div className="row">
              <h3>{worktree.name}</h3>
              <span
                className={`pill ${
                  worktree.active ? 'pill-connected' : 'pill-disconnected'
                }`}
              >
                {worktree.active ? 'Active' : 'Inactive'}
              </span>
            </div>

            <small>Branch: {worktree.branch}</small>
            <small>Path: {worktree.path}</small>

            <div className="row">
              <button
                className="button-primary"
                type="button"
                onClick={() => void actions.switchWorktree(worktree.id)}
                disabled={worktree.active}
              >
                Switch
              </button>
              <button
                type="button"
                onClick={() => void actions.openEditor(worktree.path)}
              >
                Open Editor
              </button>
              <button
                type="button"
                onClick={() => void actions.removeWorktree(worktree.id)}
              >
                Remove
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
