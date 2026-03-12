import { describe, expect, it } from 'vitest'
import { createInitialDatabase } from './mock-database'
import { MockAuthService } from './mock-auth-service'
import { MockGitService } from './mock-git-service'
import { MockTerminalService } from './mock-terminal-service'
import { MockWorktreeService } from './mock-worktree-service'
import { MockChatService } from './mock-chat-service'
import { MockWorkspaceService } from './mock-workspace-service'
import { MockThreadService } from './mock-thread-service'
import { MockSkillService } from './mock-skill-service'

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

  it('supports workspace and thread CRUD', async () => {
    const database = createInitialDatabase()
    const workspace = new MockWorkspaceService(database)
    const thread = new MockThreadService(database)

    const listResult = await workspace.list()
    expect(listResult.ok).toBe(true)
    if (!listResult.ok) throw new Error('Expected workspace list success')
    expect(listResult.data.length).toBeGreaterThan(0)

    const createResult = await workspace.create('test-project', '/workspace/test')
    expect(createResult.ok).toBe(true)
    if (!createResult.ok) throw new Error('Expected workspace creation success')
    expect(createResult.data.localWorktreeId).toBeTruthy()

    const wsId = createResult.data.id

    const localThreadResult = await thread.create(wsId, {
      title: 'Test thread',
      location: 'local',
    })
    expect(localThreadResult.ok).toBe(true)
    if (!localThreadResult.ok) throw new Error('Expected thread creation success')
    expect(localThreadResult.data.location).toBe('local')
    expect(localThreadResult.data.worktreeId).toBe(createResult.data.localWorktreeId)

    const worktreeThreadResult = await thread.create(wsId, {
      title: 'Feature branch thread',
      location: 'worktree',
    })
    expect(worktreeThreadResult.ok).toBe(true)
    if (!worktreeThreadResult.ok) throw new Error('Expected worktree thread creation success')
    expect(worktreeThreadResult.data.location).toBe('worktree')
    expect(worktreeThreadResult.data.worktreeId).not.toBe(createResult.data.localWorktreeId)

    const threadListResult = await thread.list(wsId)
    expect(threadListResult.ok).toBe(true)
    if (!threadListResult.ok) throw new Error('Expected thread list success')
    expect(threadListResult.data.length).toBe(2)

    const duplicateWorkspaceResult = await workspace.create(
      'test-project-duplicate',
      '/workspace/test',
    )
    expect(duplicateWorkspaceResult.ok).toBe(true)
    if (!duplicateWorkspaceResult.ok) {
      throw new Error('Expected duplicate workspace handling success')
    }
    expect(duplicateWorkspaceResult.data.id).toBe(wsId)

    const removeThreadResult = await thread.remove(localThreadResult.data.id)
    expect(removeThreadResult.ok).toBe(true)
  })

  it('supports chat message flow', async () => {
    const database = createInitialDatabase()
    const chat = new MockChatService(database)

    const sendResult = await chat.sendMessage('th-1', 'hello')
    expect(sendResult.ok).toBe(true)
    if (!sendResult.ok) throw new Error('Expected send message success')
    expect(sendResult.data.length).toBe(2)
    expect(sendResult.data[0].role).toBe('user')
    expect(sendResult.data[1].role).toBe('assistant')

    const listResult = await chat.listMessages('th-1')
    expect(listResult.ok).toBe(true)
    if (!listResult.ok) throw new Error('Expected list messages success')
    expect(listResult.data.length).toBe(2)
  })

  it('supports skill list and toggle', async () => {
    const database = createInitialDatabase()
    const skill = new MockSkillService(database)

    const listResult = await skill.list()
    expect(listResult.ok).toBe(true)
    if (!listResult.ok) throw new Error('Expected skill list success')
    expect(listResult.data.length).toBe(3)

    const toggleResult = await skill.toggle('sk-2', true)
    expect(toggleResult.ok).toBe(true)
    if (!toggleResult.ok) throw new Error('Expected skill toggle success')
    expect(toggleResult.data.enabled).toBe(true)
  })

  it('persists workspace and thread records when persistence is enabled', async () => {
    const database = createInitialDatabase({ persist: true })
    const workspace = new MockWorkspaceService(database)
    const thread = new MockThreadService(database)

    const workspaceResult = await workspace.create('persisted-project', '/workspace/persisted')
    expect(workspaceResult.ok).toBe(true)
    if (!workspaceResult.ok) throw new Error('Expected workspace creation success')

    const threadResult = await thread.create(workspaceResult.data.id, {
      title: 'Persisted thread',
      location: 'worktree',
    })
    expect(threadResult.ok).toBe(true)
    if (!threadResult.ok) throw new Error('Expected thread creation success')

    const restored = createInitialDatabase({ persist: true })
    const restoredWorkspace = restored.workspaces.find(
      (item) => item.id === workspaceResult.data.id,
    )
    const restoredThread = restored.threads.find(
      (item) => item.id === threadResult.data.id,
    )

    expect(restoredWorkspace).toBeTruthy()
    expect(restoredThread?.location).toBe('worktree')
    expect(restoredThread?.worktreeId).toBe(threadResult.data.worktreeId)
  })
})
