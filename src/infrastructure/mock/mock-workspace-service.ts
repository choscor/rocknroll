import type { WorkspaceService } from '../../repository/interfaces'
import type { Workspace } from '../../domain/contracts'
import {
  clone,
  createWorktreeRecord,
  err,
  normalizePath,
  nowIso,
  ok,
  pathBaseName,
  persistDatabase,
  type MockDatabase,
} from './mock-database'

export class MockWorkspaceService implements WorkspaceService {
  constructor(private readonly db: MockDatabase) {}

  async list() {
    return ok(clone(this.db.workspaces))
  }

  async create(name: string, path: string) {
    const trimmedPath = normalizePath(path)
    const trimmedName = name.trim() || pathBaseName(trimmedPath)

    if (!trimmedName || !trimmedPath) {
      return err('INVALID_WORKSPACE_INPUT', 'Name and path are required to create a workspace.')
    }

    const existing = this.db.workspaces.find(
      (workspace) => normalizePath(workspace.path) === trimmedPath,
    )

    if (existing) {
      return ok(clone(existing))
    }

    this.db.counters.workspace += 1
    const workspaceId = `ws-${this.db.counters.workspace}`
    const localWorktree = createWorktreeRecord(this.db, {
      name: `${trimmedName}-local`,
      branch: 'main',
      path: trimmedPath,
    })

    const workspace: Workspace = {
      id: workspaceId,
      name: trimmedName,
      path: trimmedPath,
      gitBranch: 'main',
      localWorktreeId: localWorktree.id,
      createdAt: nowIso(),
    }

    this.db.workspaces.push(workspace)
    if (!this.db.activeWorktreeId) {
      this.db.activeWorktreeId = localWorktree.id
    }
    persistDatabase(this.db)
    return ok(clone(workspace))
  }

  async remove(workspaceId: string) {
    const index = this.db.workspaces.findIndex((ws) => ws.id === workspaceId)
    if (index === -1) {
      return err('WORKSPACE_NOT_FOUND', `Workspace ${workspaceId} does not exist.`)
    }

    const [workspace] = this.db.workspaces.splice(index, 1)
    const removedThreadIds = this.db.threads
      .filter((thread) => thread.workspaceId === workspaceId)
      .map((thread) => thread.id)
    const removedWorktreeIds = new Set(
      this.db.threads
        .filter((thread) => thread.workspaceId === workspaceId)
        .map((thread) => thread.worktreeId),
    )

    removedWorktreeIds.add(workspace.localWorktreeId)

    this.db.threads = this.db.threads.filter((thread) => thread.workspaceId !== workspaceId)
    this.db.messages = this.db.messages.filter(
      (message) => !removedThreadIds.includes(message.threadId),
    )
    this.db.worktrees = this.db.worktrees.filter(
      (worktree) => !removedWorktreeIds.has(worktree.id),
    )
    this.db.terminalSessions = this.db.terminalSessions.filter(
      (session) => !removedWorktreeIds.has(session.worktreeId),
    )

    if (
      this.db.activeWorktreeId &&
      removedWorktreeIds.has(this.db.activeWorktreeId)
    ) {
      this.db.activeWorktreeId = this.db.worktrees[0]?.id ?? null
    }

    persistDatabase(this.db)

    return ok(undefined as void)
  }
}
