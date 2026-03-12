export type ProviderId = 'claude' | 'codex'

export type AuthMode = 'oauth' | 'api_key'

export interface ProviderConnectionStatus {
  provider: ProviderId
  connected: boolean
  authMode: AuthMode | null
  maskedCredential: string | null
  lastSyncedAt: string | null
}

export interface CommandError {
  code: string
  message: string
}

export type CommandResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: CommandError }

export interface Worktree {
  id: string
  name: string
  branch: string
  path: string
  active: boolean
  createdAt: string
}

export interface WorktreeSnapshot {
  items: Worktree[]
  activeWorktreeId: string | null
}

export interface CreateWorktreeInput {
  name: string
  branch: string
  path: string
}

export interface GitDiffResult {
  worktreeId: string
  diff: string
}

export interface GitCommitResult {
  sha: string
  message: string
  worktreeId: string
  committedAt: string
}

export interface PullRequestSummary {
  id: string
  title: string
  body: string
  url: string
  branch: string
  status: 'open' | 'merged' | 'closed'
  createdAt: string
}

export interface TerminalSession {
  id: string
  worktreeId: string
  title: string
  status: 'open' | 'closed'
  createdAt: string
  history: string[]
  lastOutput: string
}

export interface Workspace {
  id: string
  name: string
  path: string
  gitBranch: string
  localWorktreeId: string
  createdAt: string
}

export type ThreadStatus = 'active' | 'completed' | 'failed' | 'paused'
export type ThreadLocation = 'local' | 'worktree'

export interface Thread {
  id: string
  workspaceId: string
  location: ThreadLocation
  worktreeId: string
  title: string
  status: ThreadStatus
  createdAt: string
  updatedAt: string
}

export interface CreateThreadInput {
  title: string
  location: ThreadLocation
}

export type ChatRole = 'user' | 'assistant' | 'system'

export interface ChatMessage {
  id: string
  threadId: string
  role: ChatRole
  content: string
  createdAt: string
}

export type EffortLevel = 'low' | 'medium' | 'high' | 'extra-high'

export interface ModelConfig {
  modelId: string
  modelDisplayName: string
  effort: EffortLevel
}

export interface Skill {
  id: string
  name: string
  description: string
  enabled: boolean
}

export type ExecutionMode = 'local' | 'remote'

export interface AppSettings {
  executionMode: ExecutionMode
  defaultPermissions: string
  preferredEditor: string
}
