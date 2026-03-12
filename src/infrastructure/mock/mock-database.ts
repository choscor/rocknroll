import type {
  ChatMessage,
  CommandResult,
  ProviderConnectionStatus,
  ProviderId,
  PullRequestSummary,
  Skill,
  TerminalSession,
  Thread,
  Worktree,
  Workspace,
  WorktreeSnapshot,
} from '../../domain/contracts'

export interface MockDatabase {
  providers: Record<ProviderId, ProviderConnectionStatus>
  worktrees: Worktree[]
  activeWorktreeId: string | null
  pullRequests: PullRequestSummary[]
  terminalSessions: TerminalSession[]
  workspaces: Workspace[]
  threads: Thread[]
  messages: ChatMessage[]
  skills: Skill[]
  counters: {
    worktree: number
    pr: number
    terminal: number
    commit: number
    workspace: number
    thread: number
    message: number
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

const defaultWorkspace: Workspace = {
  id: 'ws-1',
  name: 'rocknroll',
  path: '/workspace/rocknroll',
  gitBranch: 'main',
  createdAt: new Date().toISOString(),
}

const defaultThread: Thread = {
  id: 'th-1',
  workspaceId: 'ws-1',
  title: 'Initial setup',
  status: 'active',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

const defaultSkills: Skill[] = [
  { id: 'sk-1', name: 'Code Review', description: 'Automated code review', enabled: true },
  { id: 'sk-2', name: 'Test Generation', description: 'Generate unit tests', enabled: false },
  { id: 'sk-3', name: 'Documentation', description: 'Generate documentation', enabled: true },
]

export const createInitialDatabase = (): MockDatabase => ({
  providers: providerDefaults(),
  worktrees: [defaultWorktree],
  activeWorktreeId: defaultWorktree.id,
  pullRequests: [],
  terminalSessions: [],
  workspaces: [defaultWorkspace],
  threads: [defaultThread],
  messages: [],
  skills: [...defaultSkills],
  counters: {
    worktree: 1,
    pr: 0,
    terminal: 0,
    commit: 0,
    workspace: 1,
    thread: 1,
    message: 0,
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
