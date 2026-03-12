import type { WorktreeService } from '../../repository/interfaces'
import type { CreateWorktreeInput } from '../../domain/contracts'
import {
  clone,
  createWorktreeRecord,
  err,
  ok,
  persistDatabase,
  toSnapshot,
  type MockDatabase,
} from './mock-database'

export class MockWorktreeService implements WorktreeService {
  constructor(private readonly db: MockDatabase) {}

  async list() {
    return ok(clone(toSnapshot(this.db.worktrees, this.db.activeWorktreeId)))
  }

  async create(input: CreateWorktreeInput) {
    const name = input.name.trim()
    const branch = input.branch.trim()
    const path = input.path.trim()

    if (!name || !branch || !path) {
      return err(
        'INVALID_WORKTREE_INPUT',
        'Name, branch, and path are required to create a worktree.',
      )
    }

    const worktree = createWorktreeRecord(this.db, {
      name,
      branch,
      path,
    })

    this.db.activeWorktreeId = worktree.id
    persistDatabase(this.db)

    return ok(clone(toSnapshot(this.db.worktrees, this.db.activeWorktreeId)))
  }

  async switch(worktreeId: string) {
    const found = this.db.worktrees.find((worktree) => worktree.id === worktreeId)
    if (!found) {
      return err('WORKTREE_NOT_FOUND', `Worktree ${worktreeId} does not exist.`)
    }

    this.db.activeWorktreeId = worktreeId
    persistDatabase(this.db)
    return ok(clone(toSnapshot(this.db.worktrees, this.db.activeWorktreeId)))
  }

  async remove(worktreeId: string) {
    const index = this.db.worktrees.findIndex(
      (worktree) => worktree.id === worktreeId,
    )

    if (index === -1) {
      return err('WORKTREE_NOT_FOUND', `Worktree ${worktreeId} does not exist.`)
    }

    const isLinkedToThread = this.db.threads.some(
      (thread) => thread.worktreeId === worktreeId,
    )

    if (isLinkedToThread) {
      return err(
        'WORKTREE_IN_USE',
        `Cannot remove worktree ${worktreeId} because it is linked to existing threads.`,
      )
    }

    this.db.worktrees.splice(index, 1)

    if (this.db.activeWorktreeId === worktreeId) {
      this.db.activeWorktreeId = this.db.worktrees[0]?.id ?? null
    }

    persistDatabase(this.db)

    return ok(clone(toSnapshot(this.db.worktrees, this.db.activeWorktreeId)))
  }
}
