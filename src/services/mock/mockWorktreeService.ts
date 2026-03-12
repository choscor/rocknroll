import type { WorktreeService } from '../interfaces'
import type { CreateWorktreeInput } from '../../types/contracts'
import {
  clone,
  err,
  nowIso,
  ok,
  toSnapshot,
  type MockDatabase,
} from './mockDatabase'

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

    this.db.counters.worktree += 1
    const worktreeId = `wt-${this.db.counters.worktree}`

    this.db.worktrees.push({
      id: worktreeId,
      name,
      branch,
      path,
      active: false,
      createdAt: nowIso(),
    })

    this.db.activeWorktreeId = worktreeId

    return ok(clone(toSnapshot(this.db.worktrees, this.db.activeWorktreeId)))
  }

  async switch(worktreeId: string) {
    const found = this.db.worktrees.find((worktree) => worktree.id === worktreeId)
    if (!found) {
      return err('WORKTREE_NOT_FOUND', `Worktree ${worktreeId} does not exist.`)
    }

    this.db.activeWorktreeId = worktreeId
    return ok(clone(toSnapshot(this.db.worktrees, this.db.activeWorktreeId)))
  }

  async remove(worktreeId: string) {
    const index = this.db.worktrees.findIndex(
      (worktree) => worktree.id === worktreeId,
    )

    if (index === -1) {
      return err('WORKTREE_NOT_FOUND', `Worktree ${worktreeId} does not exist.`)
    }

    this.db.worktrees.splice(index, 1)

    if (this.db.activeWorktreeId === worktreeId) {
      this.db.activeWorktreeId = this.db.worktrees[0]?.id ?? null
    }

    return ok(clone(toSnapshot(this.db.worktrees, this.db.activeWorktreeId)))
  }
}
