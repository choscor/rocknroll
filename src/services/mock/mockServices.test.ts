import { describe, expect, it } from 'vitest'
import { createInitialDatabase } from './mockDatabase'
import { MockAuthService } from './mockAuthService'
import { MockGitService } from './mockGitService'
import { MockTerminalService } from './mockTerminalService'
import { MockWorktreeService } from './mockWorktreeService'

describe('mock service adapters', () => {
  it('returns connection status and validates api key failures', async () => {
    const database = createInitialDatabase()
    const auth = new MockAuthService(database)

    const connectResult = await auth.connectOAuth('claude')
    expect(connectResult.ok).toBe(true)

    const invalidKeyResult = await auth.setApiKey('codex', 'short')
    expect(invalidKeyResult.ok).toBe(false)

    if (invalidKeyResult.ok) {
      throw new Error('Expected invalid key failure')
    }

    expect(invalidKeyResult.error.code).toBe('INVALID_API_KEY')
  })

  it('supports worktree lifecycle and git/terminal flows', async () => {
    const database = createInitialDatabase()
    const worktree = new MockWorktreeService(database)
    const git = new MockGitService(database)
    const terminal = new MockTerminalService(database)

    const createResult = await worktree.create({
      name: 'agent-run',
      branch: 'feat/agent-run',
      path: '/workspace/agent-run',
    })

    expect(createResult.ok).toBe(true)
    if (!createResult.ok) {
      throw new Error('Expected successful worktree creation')
    }

    const activeWorktreeId = createResult.data.activeWorktreeId
    expect(activeWorktreeId).toBeTruthy()

    const diffResult = await git.getDiff(activeWorktreeId!)
    expect(diffResult.ok).toBe(true)

    const commitMessageResult = await git.suggestCommitMessage(activeWorktreeId!)
    expect(commitMessageResult.ok).toBe(true)

    const createSessionResult = await terminal.createSession(activeWorktreeId!)
    expect(createSessionResult.ok).toBe(true)
    if (!createSessionResult.ok) {
      throw new Error('Expected terminal session creation success')
    }

    const writeResult = await terminal.writeToSession(
      createSessionResult.data.id,
      'git status',
    )

    expect(writeResult.ok).toBe(true)
    if (!writeResult.ok) {
      throw new Error('Expected terminal write success')
    }

    expect(writeResult.data.lastOutput).toContain('On branch')
  })
})
