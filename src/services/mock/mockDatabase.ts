import type {
  CommandResult,
  ProviderConnectionStatus,
  ProviderId,
  PullRequestSummary,
  TerminalSession,
  Worktree,
  WorktreeSnapshot,
} from '../../types/contracts'

export interface MockDatabase {
  providers: Record<ProviderId, ProviderConnectionStatus>
  worktrees: Worktree[]
  activeWorktreeId: string | null
  pullRequests: PullRequestSummary[]
  terminalSessions: TerminalSession[]
  counters: {
    worktree: number
    pr: number
    terminal: number
    commit: number
  }
}

const providerDefaults = (): Record<ProviderId, ProviderConnectionStatus> => ({
  claude: {
    provider: 'claude',
    connected: false,
    authMode: null,
    maskedCredential: null,
    lastSyncedAt: null,
  },
  codex: {
    provider: 'codex',
    connected: false,
    authMode: null,
    maskedCredential: null,
    lastSyncedAt: null,
  },
})

const defaultWorktree: Worktree = {
  id: 'wt-1',
  name: 'main',
  branch: 'main',
  path: '/workspace/main',
  active: true,
  createdAt: new Date().toISOString(),
}

export const createInitialDatabase = (): MockDatabase => ({
  providers: providerDefaults(),
  worktrees: [defaultWorktree],
  activeWorktreeId: defaultWorktree.id,
  pullRequests: [],
  terminalSessions: [],
  counters: {
    worktree: 1,
    pr: 0,
    terminal: 0,
    commit: 0,
  },
})

export const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

export const ok = <T>(data: T): CommandResult<T> => ({ ok: true, data })

export const err = (code: string, message: string): CommandResult<never> => ({
  ok: false,
  error: { code, message },
})

export const nowIso = (): string => new Date().toISOString()

export const toSnapshot = (
  worktrees: Worktree[],
  activeWorktreeId: string | null,
): WorktreeSnapshot => ({
  items: worktrees.map((worktree) => ({
    ...worktree,
    active: worktree.id === activeWorktreeId,
  })),
  activeWorktreeId,
})
