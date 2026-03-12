import type {
  ChatMessage,
  CommandResult,
  ProviderConnectionStatus,
  ProviderId,
  PullRequestSummary,
  Skill,
  TerminalSession,
  Thread,
  ThreadLocation,
  ThreadStatus,
  Worktree,
  Workspace,
  WorktreeSnapshot,
} from '../../domain/contracts'

const MOCK_DATABASE_STORAGE_KEY = 'rocknroll.mock_database.v1'

interface MockCounters {
  worktree: number
  pr: number
  terminal: number
  commit: number
  workspace: number
  thread: number
  message: number
}

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
  counters: MockCounters
  persistenceEnabled: boolean
}

interface PersistedMockDatabase {
  providers: Record<ProviderId, ProviderConnectionStatus>
  worktrees: Worktree[]
  activeWorktreeId: string | null
  pullRequests: PullRequestSummary[]
  terminalSessions: TerminalSession[]
  workspaces: Workspace[]
  threads: Thread[]
  messages: ChatMessage[]
  skills: Skill[]
  counters: MockCounters
}

export interface CreateInitialDatabaseOptions {
  persist?: boolean
}

interface CreateWorktreeRecordInput {
  name: string
  branch: string
  path: string
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

const defaultSkills: Skill[] = [
  {
    id: 'sk-1',
    name: 'Code Review',
    description: 'Automated code review',
    enabled: true,
  },
  {
    id: 'sk-2',
    name: 'Test Generation',
    description: 'Generate unit tests',
    enabled: false,
  },
  {
    id: 'sk-3',
    name: 'Documentation',
    description: 'Generate documentation',
    enabled: true,
  },
]

const supportedThreadStatuses: ThreadStatus[] = [
  'active',
  'completed',
  'failed',
  'paused',
]

const normalizedStatus = (value: unknown): ThreadStatus => {
  if (typeof value !== 'string') {
    return 'active'
  }

  return supportedThreadStatuses.includes(value as ThreadStatus)
    ? (value as ThreadStatus)
    : 'active'
}

const toRecord = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  return value as Record<string, unknown>
}

const toArray = <T>(value: unknown): T[] => {
  if (!Array.isArray(value)) {
    return []
  }

  return value as T[]
}

const numericSuffix = (value: string, prefix: string): number => {
  if (!value.startsWith(prefix)) {
    return 0
  }

  const parsed = Number.parseInt(value.slice(prefix.length), 10)
  return Number.isFinite(parsed) ? parsed : 0
}

const maxCounterFromIds = (
  values: Array<{ id: string }>,
  prefix: string,
): number => {
  return values.reduce((max, item) => {
    return Math.max(max, numericSuffix(item.id, prefix))
  }, 0)
}

const numberOrZero = (value: unknown): number => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 0
  }

  return Math.max(0, Math.floor(value))
}

const isStorageAvailable = (): boolean => {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

export const normalizePath = (path: string): string => {
  const trimmed = path.trim()
  if (!trimmed) {
    return ''
  }

  const normalized = trimmed.replace(/\\+$/, '')
  return normalized || '/'
}

export const pathBaseName = (path: string): string => {
  const normalized = normalizePath(path)
  if (!normalized || normalized === '/') {
    return 'workspace'
  }

  const segments = normalized.split(/[\\/]/).filter(Boolean)
  return segments[segments.length - 1] || 'workspace'
}

export const slugify = (value: string): string => {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return slug || 'thread'
}

export const buildThreadWorktreePath = (
  workspaceName: string,
  threadId: string,
  threadTitle: string,
): string => {
  const workspaceSlug = slugify(workspaceName)
  const threadSlug = slugify(threadTitle)
  return `~/.rocknroll/worktree/${workspaceSlug}/${threadId}-${threadSlug}`
}

export const buildThreadBranch = (threadId: string, threadTitle: string): string => {
  const threadSlug = slugify(threadTitle)
  return `thread/${threadSlug}-${threadId}`
}

const withDefaultDatabase = (): PersistedMockDatabase => {
  const createdAt = new Date().toISOString()

  const defaultWorktree: Worktree = {
    id: 'wt-1',
    name: 'rocknroll-local',
    branch: 'main',
    path: '/workspace/rocknroll',
    active: true,
    createdAt,
  }

  const defaultWorkspace: Workspace = {
    id: 'ws-1',
    name: 'rocknroll',
    path: '/workspace/rocknroll',
    gitBranch: 'main',
    localWorktreeId: defaultWorktree.id,
    createdAt,
  }

  const defaultThread: Thread = {
    id: 'th-1',
    workspaceId: defaultWorkspace.id,
    location: 'local',
    worktreeId: defaultWorktree.id,
    title: 'Initial setup',
    status: 'active',
    createdAt,
    updatedAt: createdAt,
  }

  return {
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
  }
}

const addOrUpdateWorktree = (
  worktrees: Worktree[],
  counters: MockCounters,
  input: CreateWorktreeRecordInput,
): Worktree => {
  const existing = worktrees.find((item) => normalizePath(item.path) === normalizePath(input.path))
  if (existing) {
    return existing
  }

  counters.worktree += 1

  const created: Worktree = {
    id: `wt-${counters.worktree}`,
    name: input.name,
    branch: input.branch,
    path: input.path,
    active: false,
    createdAt: nowIso(),
  }

  worktrees.push(created)
  return created
}

const migratePersistedDatabase = (raw: unknown): PersistedMockDatabase | null => {
  const source = toRecord(raw)
  if (!source) {
    return null
  }

  const hasWorkspaceArray = Array.isArray(source.workspaces)
  const rawWorktrees = toArray<Record<string, unknown>>(source.worktrees)
  const worktrees: Worktree[] = rawWorktrees.map((item, index) => {
    const id = typeof item.id === 'string' ? item.id : `wt-${index + 1}`
    const name = typeof item.name === 'string' ? item.name : `worktree-${index + 1}`
    const branch = typeof item.branch === 'string' ? item.branch : 'main'
    const path = typeof item.path === 'string' ? item.path : `/workspace/${name}`
    const createdAt = typeof item.createdAt === 'string' ? item.createdAt : nowIso()

    return {
      id,
      name,
      branch,
      path,
      active: false,
      createdAt,
    }
  })

  const countersRaw = toRecord(source.counters)
  const counters: MockCounters = {
    worktree: Math.max(
      numberOrZero(countersRaw?.worktree),
      maxCounterFromIds(worktrees, 'wt-'),
    ),
    pr: numberOrZero(countersRaw?.pr),
    terminal: numberOrZero(countersRaw?.terminal),
    commit: numberOrZero(countersRaw?.commit),
    workspace: numberOrZero(countersRaw?.workspace),
    thread: numberOrZero(countersRaw?.thread),
    message: numberOrZero(countersRaw?.message),
  }

  const rawWorkspaces = toArray<Record<string, unknown>>(source.workspaces)
  const workspaces: Workspace[] = rawWorkspaces.map((item, index) => {
    const id = typeof item.id === 'string' ? item.id : `ws-${index + 1}`
    const name = typeof item.name === 'string' ? item.name : `workspace-${index + 1}`
    const path = typeof item.path === 'string' ? item.path : `/workspace/${name}`
    const gitBranch = typeof item.gitBranch === 'string' ? item.gitBranch : 'main'
    const createdAt = typeof item.createdAt === 'string' ? item.createdAt : nowIso()
    const localWorktreeId =
      typeof item.localWorktreeId === 'string' ? item.localWorktreeId : ''

    return {
      id,
      name,
      path,
      gitBranch,
      localWorktreeId,
      createdAt,
    }
  })

  for (const workspace of workspaces) {
    const localWorktreeExists = worktrees.some(
      (worktree) => worktree.id === workspace.localWorktreeId,
    )

    if (localWorktreeExists) {
      continue
    }

    const localWorktree = addOrUpdateWorktree(worktrees, counters, {
      name: `${workspace.name}-local`,
      branch: workspace.gitBranch,
      path: workspace.path,
    })

    workspace.localWorktreeId = localWorktree.id
  }

  counters.workspace = Math.max(
    counters.workspace,
    maxCounterFromIds(workspaces, 'ws-'),
  )

  const workspaceById = new Map(workspaces.map((workspace) => [workspace.id, workspace]))
  const rawThreads = toArray<Record<string, unknown>>(source.threads)
  const threads: Thread[] = []

  for (let index = 0; index < rawThreads.length; index += 1) {
    const item = rawThreads[index]
    const workspaceId = typeof item.workspaceId === 'string' ? item.workspaceId : ''
    const workspace = workspaceById.get(workspaceId)

    if (!workspace) {
      continue
    }

    const id = typeof item.id === 'string' ? item.id : `th-${index + 1}`
    const location: ThreadLocation = item.location === 'worktree' ? 'worktree' : 'local'
    const title = typeof item.title === 'string' ? item.title : `Thread ${index + 1}`
    const status = normalizedStatus(item.status)
    const createdAt = typeof item.createdAt === 'string' ? item.createdAt : nowIso()
    const updatedAt = typeof item.updatedAt === 'string' ? item.updatedAt : createdAt

    const desiredWorktreeId =
      typeof item.worktreeId === 'string' ? item.worktreeId : workspace.localWorktreeId

    const worktreeExists = worktrees.some((worktree) => worktree.id === desiredWorktreeId)

    threads.push({
      id,
      workspaceId,
      location: location === 'worktree' && worktreeExists ? 'worktree' : 'local',
      worktreeId: worktreeExists ? desiredWorktreeId : workspace.localWorktreeId,
      title,
      status,
      createdAt,
      updatedAt,
    })
  }

  counters.thread = Math.max(counters.thread, maxCounterFromIds(threads, 'th-'))

  const threadById = new Set(threads.map((thread) => thread.id))
  const rawMessages = toArray<Record<string, unknown>>(source.messages)
  const messages: ChatMessage[] = rawMessages
    .map((item, index) => {
      const id = typeof item.id === 'string' ? item.id : `msg-${index + 1}`
      const threadId = typeof item.threadId === 'string' ? item.threadId : ''
      const role: ChatMessage['role'] =
        item.role === 'assistant' || item.role === 'system' ? item.role : 'user'
      const content = typeof item.content === 'string' ? item.content : ''
      const createdAt = typeof item.createdAt === 'string' ? item.createdAt : nowIso()

      return { id, threadId, role, content, createdAt }
    })
    .filter((message) => threadById.has(message.threadId))

  counters.message = Math.max(counters.message, maxCounterFromIds(messages, 'msg-'))

  const rawPullRequests = toArray<Record<string, unknown>>(source.pullRequests)
  const pullRequests: PullRequestSummary[] = rawPullRequests.map((item, index) => ({
    id: typeof item.id === 'string' ? item.id : `pr-${index + 1}`,
    title: typeof item.title === 'string' ? item.title : `PR ${index + 1}`,
    body: typeof item.body === 'string' ? item.body : '',
    url:
      typeof item.url === 'string'
        ? item.url
        : `https://github.com/choscor/rocknroll/pull/${index + 1}`,
    branch: typeof item.branch === 'string' ? item.branch : 'main',
    status:
      item.status === 'merged' || item.status === 'closed' ? item.status : 'open',
    createdAt: typeof item.createdAt === 'string' ? item.createdAt : nowIso(),
  }))

  counters.pr = Math.max(counters.pr, maxCounterFromIds(pullRequests, 'pr-'))

  const worktreeById = new Set(worktrees.map((worktree) => worktree.id))
  const rawTerminalSessions = toArray<Record<string, unknown>>(source.terminalSessions)
  const terminalSessions: TerminalSession[] = rawTerminalSessions
    .map((item, index) => {
      const id = typeof item.id === 'string' ? item.id : `term-${index + 1}`
      const worktreeId = typeof item.worktreeId === 'string' ? item.worktreeId : ''
      const title = typeof item.title === 'string' ? item.title : `session-${index + 1}`
      const status: TerminalSession['status'] =
        item.status === 'closed' ? 'closed' : 'open'
      const createdAt = typeof item.createdAt === 'string' ? item.createdAt : nowIso()
      const history = Array.isArray(item.history)
        ? item.history.filter((entry): entry is string => typeof entry === 'string')
        : []
      const lastOutput = typeof item.lastOutput === 'string' ? item.lastOutput : ''

      return {
        id,
        worktreeId,
        title,
        status,
        createdAt,
        history,
        lastOutput,
      }
    })
    .filter((session) => worktreeById.has(session.worktreeId))

  counters.terminal = Math.max(
    counters.terminal,
    maxCounterFromIds(terminalSessions, 'term-'),
  )

  const rawProviders = toRecord(source.providers)
  const providers = providerDefaults()

  for (const provider of ['claude', 'codex'] as const) {
    const value = toRecord(rawProviders?.[provider])
    if (!value) {
      continue
    }

    providers[provider] = {
      provider,
      connected: value.connected === true,
      authMode: value.authMode === 'oauth' || value.authMode === 'api_key' ? value.authMode : null,
      maskedCredential:
        typeof value.maskedCredential === 'string' ? value.maskedCredential : null,
      lastSyncedAt: typeof value.lastSyncedAt === 'string' ? value.lastSyncedAt : null,
    }
  }

  const rawSkills = toArray<Record<string, unknown>>(source.skills)
  const skills: Skill[] = rawSkills.length
    ? rawSkills.map((item, index) => ({
        id: typeof item.id === 'string' ? item.id : `sk-${index + 1}`,
        name: typeof item.name === 'string' ? item.name : `Skill ${index + 1}`,
        description:
          typeof item.description === 'string'
            ? item.description
            : 'No description available.',
        enabled: item.enabled === true,
      }))
    : [...defaultSkills]

  if (!hasWorkspaceArray && workspaces.length === 0) {
    const fallback = withDefaultDatabase()
    return {
      ...fallback,
      providers,
      skills,
    }
  }

  const activeWorktreeId =
    typeof source.activeWorktreeId === 'string' &&
    worktrees.some((worktree) => worktree.id === source.activeWorktreeId)
      ? source.activeWorktreeId
      : workspaces[0]?.localWorktreeId ?? worktrees[0]?.id ?? null

  return {
    providers,
    worktrees,
    activeWorktreeId,
    pullRequests,
    terminalSessions,
    workspaces,
    threads,
    messages,
    skills,
    counters,
  }
}

const readPersistedDatabase = (): PersistedMockDatabase | null => {
  if (!isStorageAvailable()) {
    return null
  }

  try {
    const raw = window.localStorage.getItem(MOCK_DATABASE_STORAGE_KEY)
    if (!raw) {
      return null
    }

    return migratePersistedDatabase(JSON.parse(raw))
  } catch {
    return null
  }
}

const toPersistedDatabase = (db: MockDatabase): PersistedMockDatabase => ({
  providers: db.providers,
  worktrees: db.worktrees,
  activeWorktreeId: db.activeWorktreeId,
  pullRequests: db.pullRequests,
  terminalSessions: db.terminalSessions,
  workspaces: db.workspaces,
  threads: db.threads,
  messages: db.messages,
  skills: db.skills,
  counters: db.counters,
})

export const createInitialDatabase = (
  options: CreateInitialDatabaseOptions = {},
): MockDatabase => {
  const persist = options.persist === true
  const persistedDatabase = persist ? readPersistedDatabase() : null
  const base = persistedDatabase ?? withDefaultDatabase()

  const database: MockDatabase = {
    ...clone(base),
    persistenceEnabled: persist,
  }

  if (persist && !persistedDatabase) {
    persistDatabase(database)
  }

  return database
}

export const persistDatabase = (db: MockDatabase): void => {
  if (!db.persistenceEnabled || !isStorageAvailable()) {
    return
  }

  try {
    window.localStorage.setItem(
      MOCK_DATABASE_STORAGE_KEY,
      JSON.stringify(toPersistedDatabase(db)),
    )
  } catch {
    // Ignore quota/storage failures in mock mode.
  }
}

export const createWorktreeRecord = (
  db: MockDatabase,
  input: CreateWorktreeRecordInput,
): Worktree => {
  db.counters.worktree += 1

  const worktree: Worktree = {
    id: `wt-${db.counters.worktree}`,
    name: input.name.trim(),
    branch: input.branch.trim(),
    path: input.path.trim(),
    active: false,
    createdAt: nowIso(),
  }

  db.worktrees.push(worktree)
  return worktree
}

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
