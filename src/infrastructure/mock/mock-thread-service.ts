import type { ThreadService } from '../../repository/interfaces'
import type { CreateThreadInput, Thread } from '../../domain/contracts'
import {
  buildThreadBranch,
  buildThreadWorktreePath,
  clone,
  createWorktreeRecord,
  err,
  nowIso,
  ok,
  persistDatabase,
  type MockDatabase,
} from './mock-database'

export class MockThreadService implements ThreadService {
  constructor(private readonly db: MockDatabase) {}

  async list(workspaceId: string) {
    const workspace = this.db.workspaces.find((ws) => ws.id === workspaceId)
    if (!workspace) {
      return err('WORKSPACE_NOT_FOUND', `Workspace ${workspaceId} does not exist.`)
    }

    const threads = this.db.threads.filter((t) => t.workspaceId === workspaceId)
    return ok(clone(threads))
  }

  async create(workspaceId: string, input: CreateThreadInput) {
    const workspace = this.db.workspaces.find((ws) => ws.id === workspaceId)
    if (!workspace) {
      return err('WORKSPACE_NOT_FOUND', `Workspace ${workspaceId} does not exist.`)
    }

    const trimmedTitle = input.title.trim()
    if (!trimmedTitle) {
      return err('EMPTY_THREAD_TITLE', 'Thread title cannot be empty.')
    }

    this.db.counters.thread += 1
    const threadId = `th-${this.db.counters.thread}`
    const location = input.location === 'worktree' ? 'worktree' : 'local'

    let worktreeId = workspace.localWorktreeId
    if (location === 'worktree') {
      const worktree = createWorktreeRecord(this.db, {
        name: `${workspace.name}-${threadId}`,
        branch: buildThreadBranch(threadId, trimmedTitle),
        path: buildThreadWorktreePath(workspace.name, threadId, trimmedTitle),
      })
      worktreeId = worktree.id
    }

    const thread: Thread = {
      id: threadId,
      workspaceId,
      location,
      worktreeId,
      title: trimmedTitle,
      status: 'active',
      createdAt: nowIso(),
      updatedAt: nowIso(),
    }

    this.db.threads.push(thread)
    persistDatabase(this.db)
    return ok(clone(thread))
  }

  async remove(threadId: string) {
    const index = this.db.threads.findIndex((t) => t.id === threadId)
    if (index === -1) {
      return err('THREAD_NOT_FOUND', `Thread ${threadId} does not exist.`)
    }

    const [thread] = this.db.threads.splice(index, 1)
    this.db.messages = this.db.messages.filter((m) => m.threadId !== threadId)

    if (thread.location === 'worktree') {
      const stillUsed = this.db.threads.some((item) => item.worktreeId === thread.worktreeId)
      if (!stillUsed) {
        this.db.worktrees = this.db.worktrees.filter(
          (worktree) => worktree.id !== thread.worktreeId,
        )
        this.db.terminalSessions = this.db.terminalSessions.filter(
          (session) => session.worktreeId !== thread.worktreeId,
        )
        if (this.db.activeWorktreeId === thread.worktreeId) {
          const workspace = this.db.workspaces.find((item) => item.id === thread.workspaceId)
          this.db.activeWorktreeId =
            workspace?.localWorktreeId ?? this.db.worktrees[0]?.id ?? null
        }
      }
    }

    persistDatabase(this.db)

    return ok(undefined as void)
  }
}
