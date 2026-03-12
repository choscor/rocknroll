import { invoke } from '@tauri-apps/api/core'
import type {
  CommandResult,
  GitCommitResult,
  GitDiffResult,
  PullRequestSummary,
  TerminalSession,
} from '../../types/contracts'

interface OpenEditorResult {
  path: string
  launched: boolean
}

const runtimeUnavailableError = <T>(): CommandResult<T> => ({
  ok: false,
  error: {
    code: 'TAURI_RUNTIME_UNAVAILABLE',
    message:
      'Tauri runtime is not available. Run this command from `npm run tauri:dev`.',
  },
})

const isTauriRuntime = (): boolean =>
  typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window

const invokeCommand = async <T>(
  command: string,
  args?: Record<string, unknown>,
): Promise<CommandResult<T>> => {
  if (!isTauriRuntime()) {
    return runtimeUnavailableError<T>()
  }

  try {
    return await invoke<CommandResult<T>>(command, args)
  } catch (error) {
    return {
      ok: false,
      error: {
        code: 'TAURI_COMMAND_FAILED',
        message: error instanceof Error ? error.message : 'Unknown native command error',
      },
    }
  }
}

export const desktopCommands = {
  openEditor(path: string): Promise<CommandResult<OpenEditorResult>> {
    if (!isTauriRuntime()) {
      return Promise.resolve({ ok: true, data: { path, launched: false } })
    }

    return invokeCommand<OpenEditorResult>('open_editor', { path })
  },

  gitDiff(worktreeId: string): Promise<CommandResult<GitDiffResult>> {
    return invokeCommand<GitDiffResult>('git_diff', { worktreeId })
  },

  gitCommit(
    worktreeId: string,
    message: string,
  ): Promise<CommandResult<GitCommitResult>> {
    return invokeCommand<GitCommitResult>('git_commit', { worktreeId, message })
  },

  createPullRequest(
    worktreeId: string,
    title: string,
    body: string,
  ): Promise<CommandResult<PullRequestSummary>> {
    return invokeCommand<PullRequestSummary>('create_pull_request', {
      worktreeId,
      title,
      body,
    })
  },

  createTerminalSession(worktreeId: string): Promise<CommandResult<TerminalSession>> {
    return invokeCommand<TerminalSession>('create_terminal_session', { worktreeId })
  },

  listTerminalSessions(): Promise<CommandResult<TerminalSession[]>> {
    return invokeCommand<TerminalSession[]>('list_terminal_sessions')
  },

  writeTerminalSession(
    sessionId: string,
    input: string,
  ): Promise<CommandResult<TerminalSession>> {
    return invokeCommand<TerminalSession>('write_terminal_session', {
      sessionId,
      input,
    })
  },

  closeTerminalSession(sessionId: string): Promise<CommandResult<TerminalSession>> {
    return invokeCommand<TerminalSession>('close_terminal_session', { sessionId })
  },
}
