import type { WorkspaceService } from '../../repository/interfaces'
import type { Workspace } from '../../domain/contracts'
import { clone, err, nowIso, ok, type MockDatabase } from './mock-database'

export class MockWorkspaceService implements WorkspaceService {
  constructor(private readonly db: MockDatabase) {}

  async list() {
    return ok(clone(this.db.workspaces))
  }

  async create(name: string, path: string) {
    const trimmedName = name.trim()
    const trimmedPath = path.trim()

    if (!trimmedName || !trimmedPath) {
      return err('INVALID_WORKSPACE_INPUT', 'Name and path are required to create a workspace.')
    }

    this.db.counters.workspace += 1
    const workspaceId = `ws-${this.db.counters.workspace}`

    const workspace: Workspace = {
      id: workspaceId,
      name: trimmedName,
      path: trimmedPath,
      gitBranch: 'main',
      createdAt: nowIso(),
    }

    this.db.workspaces.push(workspace)
    return ok(clone(workspace))
  }

  async remove(workspaceId: string) {
    const index = this.db.workspaces.findIndex((ws) => ws.id === workspaceId)
    if (index === -1) {
      return err('WORKSPACE_NOT_FOUND', `Workspace ${workspaceId} does not exist.`)
    }

    this.db.workspaces.splice(index, 1)
    this.db.threads = this.db.threads.filter((t) => t.workspaceId !== workspaceId)
    this.db.messages = this.db.messages.filter((m) => {
      const thread = this.db.threads.find((t) => t.id === m.threadId)
      return thread !== undefined
    })

    return ok(undefined as void)
  }
}
