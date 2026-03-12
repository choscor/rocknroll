import type { GitService } from '../../repository/interfaces'
import type { PullRequestSummary } from '../../domain/contracts'
import { clone, err, nowIso, ok, type MockDatabase } from './mock-database'

const shortSha = (n: number): string => n.toString(16).padStart(7, '0').slice(-7)

export class MockGitService implements GitService {
  constructor(private readonly db: MockDatabase) {}

  private resolveBranch(worktreeId: string) {
    return this.db.worktrees.find((worktree) => worktree.id === worktreeId)
  }

  async getDiff(worktreeId: string) {
    const worktree = this.resolveBranch(worktreeId)
    if (!worktree) {
      return err(
        'WORKTREE_NOT_FOUND',
        `Cannot generate diff for unknown worktree ${worktreeId}.`,
      )
    }

    const diff = [
      `diff --git a/src/features/${worktree.name}/index.ts b/src/features/${worktree.name}/index.ts`,
      'index 43e12f1..8bd220a 100644',
      '--- a/src/features/module/index.ts',
      '+++ b/src/features/module/index.ts',
      '@@ -1,4 +1,8 @@',
      "+export const featureToggle = 'agentic-flow';",
      '+export const provider = "codex";',
      '+export const mode = "mock";',
      '-export const status = "todo";',
      '+export const status = "in-progress";',
    ].join('\n')

    return ok({
      worktreeId,
      diff,
    })
  }

  async suggestCommitMessage(worktreeId: string) {
    const worktree = this.resolveBranch(worktreeId)
    if (!worktree) {
      return err('WORKTREE_NOT_FOUND', `Worktree ${worktreeId} does not exist.`)
    }

    return ok(`feat(${worktree.branch}): scaffold agent workspace actions`)
  }

  async commit(worktreeId: string, message: string) {
    const worktree = this.resolveBranch(worktreeId)
    if (!worktree) {
      return err(
        'WORKTREE_NOT_FOUND',
        `Cannot commit for unknown worktree ${worktreeId}.`,
      )
    }

    const finalMessage = message.trim()
    if (!finalMessage) {
      return err('EMPTY_COMMIT_MESSAGE', 'Commit message cannot be empty.')
    }

    this.db.counters.commit += 1

    return ok({
      sha: shortSha(this.db.counters.commit),
      message: finalMessage,
      worktreeId,
      committedAt: nowIso(),
    })
  }

  async createPullRequest(worktreeId: string, title: string, body: string) {
    const worktree = this.resolveBranch(worktreeId)
    if (!worktree) {
      return err(
        'WORKTREE_NOT_FOUND',
        `Cannot create PR for unknown worktree ${worktreeId}.`,
      )
    }

    const prTitle = title.trim()
    if (!prTitle) {
      return err('EMPTY_PR_TITLE', 'Pull request title cannot be empty.')
    }

    this.db.counters.pr += 1
    const prId = `pr-${this.db.counters.pr}`

    const pr: PullRequestSummary = {
      id: prId,
      title: prTitle,
      body: body.trim(),
      branch: worktree.branch,
      url: `https://github.com/choscor/rocknroll/pull/${this.db.counters.pr}`,
      status: 'open',
      createdAt: nowIso(),
    }

    this.db.pullRequests.unshift(pr)

    return ok(clone(pr))
  }

  async listPullRequests() {
    return ok(clone(this.db.pullRequests))
  }
}
