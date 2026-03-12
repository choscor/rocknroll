import type { TerminalService } from '../../repository/interfaces'
import type { TerminalSession } from '../../domain/contracts'
import { clone, err, nowIso, ok, type MockDatabase } from './mock-database'

const formatOutput = (input: string): string => {
  if (input.includes('git status')) {
    return 'On branch main\nChanges to be committed:\n  modified: src/features/git/GitPage.tsx'
  }

  if (input.includes('npm test')) {
    return 'PASS src/state/appStore.test.ts\nPASS src/services/mock/mockServices.test.ts'
  }

  return `Executed: ${input}`
}

export class MockTerminalService implements TerminalService {
  constructor(private readonly db: MockDatabase) {}

  async listSessions() {
    return ok(clone(this.db.terminalSessions))
  }

  async createSession(
    worktreeId: string,
    options?: { cwd?: string; shell?: string },
  ) {
    const worktree = this.db.worktrees.find((item) => item.id === worktreeId)
    if (!worktree) {
      return err(
        'WORKTREE_NOT_FOUND',
        `Cannot open terminal for unknown worktree ${worktreeId}.`,
      )
    }

    this.db.counters.terminal += 1
    const cwd = options?.cwd ?? worktree.path
    const shell = options?.shell

    const session: TerminalSession = {
      id: `term-${this.db.counters.terminal}`,
      worktreeId,
      title: `${worktree.name}-session-${this.db.counters.terminal}`,
      status: 'open',
      createdAt: nowIso(),
      history: [`$ cd ${cwd}`],
      lastOutput: `Session started in ${cwd}`,
      cwd,
      shell,
    }

    this.db.terminalSessions.unshift(session)
    return ok(clone(session))
  }

  async writeToSession(sessionId: string, input: string) {
    const session = this.db.terminalSessions.find((item) => item.id === sessionId)
    if (!session) {
      return err(
        'SESSION_NOT_FOUND',
        `Terminal session ${sessionId} does not exist.`,
      )
    }

    if (session.status === 'closed') {
      return err(
        'SESSION_CLOSED',
        `Terminal session ${sessionId} is closed.`,
      )
    }

    const command = input.trim()
    if (!command) {
      return err('EMPTY_COMMAND', 'Command cannot be empty.')
    }

    const output = formatOutput(command)
    session.history.push(`$ ${command}`)
    session.history.push(output)
    session.lastOutput = output

    return ok(clone(session))
  }

  async resizeSession(sessionId: string, cols: number, rows: number) {
    void cols
    void rows

    const session = this.db.terminalSessions.find((item) => item.id === sessionId)
    if (!session) {
      return err(
        'SESSION_NOT_FOUND',
        `Terminal session ${sessionId} does not exist.`,
      )
    }

    return ok(clone(session))
  }

  async closeSession(sessionId: string) {
    const session = this.db.terminalSessions.find((item) => item.id === sessionId)
    if (!session) {
      return err(
        'SESSION_NOT_FOUND',
        `Terminal session ${sessionId} does not exist.`,
      )
    }

    session.status = 'closed'
    session.history.push('Session closed.')
    session.lastOutput = 'Session closed.'

    return ok(clone(session))
  }
}
