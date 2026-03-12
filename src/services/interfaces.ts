import type {
  CommandResult,
  CreateWorktreeInput,
  GitCommitResult,
  GitDiffResult,
  ProviderConnectionStatus,
  ProviderId,
  PullRequestSummary,
  TerminalSession,
  WorktreeSnapshot,
} from '../types/contracts'

export interface AuthService {
  listStatuses(): Promise<CommandResult<ProviderConnectionStatus[]>>
  connectOAuth(provider: ProviderId): Promise<CommandResult<ProviderConnectionStatus>>
  setApiKey(
    provider: ProviderId,
    apiKey: string,
  ): Promise<CommandResult<ProviderConnectionStatus>>
  disconnect(provider: ProviderId): Promise<CommandResult<ProviderConnectionStatus>>
}

export interface WorktreeService {
  list(): Promise<CommandResult<WorktreeSnapshot>>
  create(input: CreateWorktreeInput): Promise<CommandResult<WorktreeSnapshot>>
  switch(worktreeId: string): Promise<CommandResult<WorktreeSnapshot>>
  remove(worktreeId: string): Promise<CommandResult<WorktreeSnapshot>>
}

export interface GitService {
  getDiff(worktreeId: string): Promise<CommandResult<GitDiffResult>>
  suggestCommitMessage(worktreeId: string): Promise<CommandResult<string>>
  commit(worktreeId: string, message: string): Promise<CommandResult<GitCommitResult>>
  createPullRequest(
    worktreeId: string,
    title: string,
    body: string,
  ): Promise<CommandResult<PullRequestSummary>>
  listPullRequests(): Promise<CommandResult<PullRequestSummary[]>>
}

export interface TerminalService {
  listSessions(): Promise<CommandResult<TerminalSession[]>>
  createSession(worktreeId: string): Promise<CommandResult<TerminalSession>>
  writeToSession(
    sessionId: string,
    input: string,
  ): Promise<CommandResult<TerminalSession>>
  closeSession(sessionId: string): Promise<CommandResult<TerminalSession>>
}

export interface AppServices {
  auth: AuthService
  worktree: WorktreeService
  git: GitService
  terminal: TerminalService
}
