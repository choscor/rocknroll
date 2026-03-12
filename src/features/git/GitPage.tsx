import { useState } from 'react'
import { useAppStore } from '../../state/AppStoreContext'

export const GitPage = () => {
  const { state, actions } = useAppStore()
  const [draftCommitMessage, setDraftCommitMessage] = useState('')
  const [prTitle, setPrTitle] = useState('')
  const [prBody, setPrBody] = useState('')

  const disabled = !state.activeWorktreeId
  const commitMessage = draftCommitMessage || state.aiCommitMessage

  return (
    <section className="page">
      <h2>Git Diff + AI Commit + PR</h2>
      <p>
        Review diff, generate a mock AI commit message, commit, and create a PR
        summary.
      </p>

      <div className="card">
        <div className="row">
          <button
            className="button-primary"
            type="button"
            disabled={disabled}
            onClick={() => void actions.refreshDiff()}
          >
            Refresh Diff
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={async () => {
              await actions.generateAiCommitMessage()
              setDraftCommitMessage('')
            }}
          >
            Generate AI Commit Message
          </button>
        </div>

        <div className="history">{state.diff || 'No diff loaded yet.'}</div>
      </div>

      <div className="card">
        <h3>Commit</h3>
        <label htmlFor="commit-message">Commit message</label>
        <textarea
          id="commit-message"
          value={commitMessage}
          onChange={(event) => setDraftCommitMessage(event.target.value)}
          placeholder="feat(workspace): ..."
        />
        <button
          className="button-primary"
          type="button"
          disabled={disabled}
          onClick={() => void actions.commitChanges(commitMessage)}
        >
          Commit
        </button>
      </div>

      <div className="card">
        <h3>Create Pull Request</h3>

        <label htmlFor="pr-title">Title</label>
        <input
          id="pr-title"
          value={prTitle}
          onChange={(event) => setPrTitle(event.target.value)}
          placeholder="feat: ship worktree terminal integration"
        />

        <label htmlFor="pr-body">Body</label>
        <textarea
          id="pr-body"
          value={prBody}
          onChange={(event) => setPrBody(event.target.value)}
          placeholder="Describe behavior changes and verification"
        />

        <button
          className="button-primary"
          type="button"
          disabled={disabled}
          onClick={() => {
            void actions.createPullRequest(prTitle, prBody)
            setPrTitle('')
            setPrBody('')
          }}
        >
          Create PR
        </button>

        <div className="grid">
          {state.pullRequests.length === 0 && (
            <small>No PRs created in this session.</small>
          )}
          {state.pullRequests.map((pullRequest) => (
            <article className="card" key={pullRequest.id}>
              <h4>{pullRequest.title}</h4>
              <small>Branch: {pullRequest.branch}</small>
              <small>Status: {pullRequest.status}</small>
              <a href={pullRequest.url} target="_blank" rel="noreferrer">
                {pullRequest.url}
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
