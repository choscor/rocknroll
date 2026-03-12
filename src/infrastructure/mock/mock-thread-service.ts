import type { ThreadService } from '../../repository/interfaces'
import type { Thread } from '../../domain/contracts'
import { clone, err, nowIso, ok, type MockDatabase } from './mock-database'

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

  async create(workspaceId: string, title: string) {
    const workspace = this.db.workspaces.find((ws) => ws.id === workspaceId)
    if (!workspace) {
      return err('WORKSPACE_NOT_FOUND', `Workspace ${workspaceId} does not exist.`)
    }

    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      return err('EMPTY_THREAD_TITLE', 'Thread title cannot be empty.')
    }

    this.db.counters.thread += 1
    const threadId = `th-${this.db.counters.thread}`

    const thread: Thread = {
      id: threadId,
      workspaceId,
      title: trimmedTitle,
      status: 'active',
      createdAt: nowIso(),
      updatedAt: nowIso(),
    }

    this.db.threads.push(thread)
    return ok(clone(thread))
  }

  async remove(threadId: string) {
    const index = this.db.threads.findIndex((t) => t.id === threadId)
    if (index === -1) {
      return err('THREAD_NOT_FOUND', `Thread ${threadId} does not exist.`)
    }

    this.db.threads.splice(index, 1)
    this.db.messages = this.db.messages.filter((m) => m.threadId !== threadId)

    return ok(undefined as void)
  }
}
