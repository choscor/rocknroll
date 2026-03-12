import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'
import type { AppServices } from '../services/interfaces'
import { createMockServices } from '../services/mock'
import { desktopCommands } from '../services/tauri/desktopCommands'
import type {
  CommandResult,
  CreateWorktreeInput,
  ProviderId,
  PullRequestSummary,
  TerminalSession,
} from '../types/contracts'
import { appReducer, createInitialState, type AppState } from './appStore'

interface AppActions {
  refreshAll(): Promise<void>
  connectOAuth(provider: ProviderId): Promise<void>
  setApiKey(provider: ProviderId, apiKey: string): Promise<void>
  disconnect(provider: ProviderId): Promise<void>
  createWorktree(input: CreateWorktreeInput): Promise<void>
  switchWorktree(worktreeId: string): Promise<void>
  removeWorktree(worktreeId: string): Promise<void>
  openEditor(path: string): Promise<void>
  refreshDiff(): Promise<void>
  generateAiCommitMessage(): Promise<void>
  commitChanges(message: string): Promise<void>
  createPullRequest(title: string, body: string): Promise<void>
  createTerminalSession(): Promise<void>
  sendTerminalInput(sessionId: string, input: string): Promise<void>
  closeTerminalSession(sessionId: string): Promise<void>
  clearBanners(): void
}

interface AppStoreContextValue {
  state: AppState
  actions: AppActions
}

const AppStoreContext = createContext<AppStoreContextValue | null>(null)

const activeWorktreeRequired = (
  worktreeId: string | null,
): CommandResult<string> => {
  if (!worktreeId) {
    return {
      ok: false,
      error: {
        code: 'NO_ACTIVE_WORKTREE',
        message: 'No active worktree selected.',
      },
    }
  }

  return { ok: true, data: worktreeId }
}

const useResultHandler = (
  setError: (message: string | null) => void,
): (<T>(result: CommandResult<T>, onSuccess: (data: T) => void) => void) => {
  return useCallback(
    <T,>(result: CommandResult<T>, onSuccess: (data: T) => void) => {
      if (!result.ok) {
        setError(result.error.message)
        return
      }

      setError(null)
      onSuccess(result.data)
    },
    [setError],
  )
}

interface AppStoreProviderProps {
  children: ReactNode
  services?: AppServices
}

export const AppStoreProvider = ({
  children,
  services,
}: AppStoreProviderProps) => {
  const [state, dispatch] = useReducer(appReducer, undefined, createInitialState)

  const resolvedServices = useMemo(
    () => services ?? createMockServices(),
    [services],
  )

  const setError = useCallback(
    (message: string | null) => dispatch({ type: 'setError', payload: message }),
    [],
  )

  const setInfo = useCallback(
    (message: string | null) => dispatch({ type: 'setInfo', payload: message }),
    [],
  )

  const handleResult = useResultHandler(setError)

  const refreshAll = useCallback(async () => {
    const [providerResult, worktreeResult, pullRequestResult, terminalResult] =
      await Promise.all([
        resolvedServices.auth.listStatuses(),
        resolvedServices.worktree.list(),
        resolvedServices.git.listPullRequests(),
        resolvedServices.terminal.listSessions(),
      ])

    handleResult(providerResult, (statuses) => {
      dispatch({ type: 'setProviderStatuses', payload: statuses })
    })

    handleResult(worktreeResult, (snapshot) => {
      dispatch({ type: 'setWorktreeSnapshot', payload: snapshot })
    })

    handleResult(pullRequestResult, (pullRequests) => {
      dispatch({ type: 'setPullRequests', payload: pullRequests })
    })

    handleResult(terminalResult, (sessions) => {
      dispatch({ type: 'setTerminalSessions', payload: sessions })
    })
  }, [handleResult, resolvedServices])

  useEffect(() => {
    void refreshAll()
  }, [refreshAll])

  const actions: AppActions = useMemo(
    () => ({
      refreshAll,

      async connectOAuth(provider) {
        const result = await resolvedServices.auth.connectOAuth(provider)
        handleResult(result, (status) => {
          dispatch({ type: 'setProviderStatus', payload: status })
          setInfo(`${provider} connected via OAuth.`)
        })
      },

      async setApiKey(provider, apiKey) {
        const result = await resolvedServices.auth.setApiKey(provider, apiKey)
        handleResult(result, (status) => {
          dispatch({ type: 'setProviderStatus', payload: status })
          setInfo(`${provider} connected with API key.`)
        })
      },

      async disconnect(provider) {
        const result = await resolvedServices.auth.disconnect(provider)
        handleResult(result, (status) => {
          dispatch({ type: 'setProviderStatus', payload: status })
          setInfo(`${provider} disconnected.`)
        })
      },

      async createWorktree(input) {
        const result = await resolvedServices.worktree.create(input)
        handleResult(result, (snapshot) => {
          dispatch({ type: 'setWorktreeSnapshot', payload: snapshot })
          setInfo(`Worktree ${input.name} created.`)
        })
      },

      async switchWorktree(worktreeId) {
        const result = await resolvedServices.worktree.switch(worktreeId)
        handleResult(result, (snapshot) => {
          dispatch({ type: 'setWorktreeSnapshot', payload: snapshot })
          setInfo(`Switched to ${worktreeId}.`)
        })
      },

      async removeWorktree(worktreeId) {
        const result = await resolvedServices.worktree.remove(worktreeId)
        handleResult(result, (snapshot) => {
          dispatch({ type: 'setWorktreeSnapshot', payload: snapshot })
          setInfo(`Removed ${worktreeId}.`)
        })
      },

      async openEditor(path) {
        const result = await desktopCommands.openEditor(path)
        handleResult(result, (data) => {
          const source = data.launched ? 'native command' : 'mock browser mode'
          setInfo(`Editor request sent for ${data.path} (${source}).`)
        })
      },

      async refreshDiff() {
        const activeResult = activeWorktreeRequired(state.activeWorktreeId)
        handleResult(activeResult, async (worktreeId) => {
          const result = await resolvedServices.git.getDiff(worktreeId)
          handleResult(result, (diff) => {
            dispatch({ type: 'setDiff', payload: diff.diff })
          })
        })
      },

      async generateAiCommitMessage() {
        const activeResult = activeWorktreeRequired(state.activeWorktreeId)
        handleResult(activeResult, async (worktreeId) => {
          const result = await resolvedServices.git.suggestCommitMessage(worktreeId)
          handleResult(result, (message) => {
            dispatch({ type: 'setAiCommitMessage', payload: message })
          })
        })
      },

      async commitChanges(message) {
        const activeResult = activeWorktreeRequired(state.activeWorktreeId)
        handleResult(activeResult, async (worktreeId) => {
          const result = await resolvedServices.git.commit(worktreeId, message)
          handleResult(result, (commit) => {
            setInfo(`Committed ${commit.sha}: ${commit.message}`)
          })
        })
      },

      async createPullRequest(title, body) {
        const activeResult = activeWorktreeRequired(state.activeWorktreeId)
        handleResult(activeResult, async (worktreeId) => {
          const result = await resolvedServices.git.createPullRequest(
            worktreeId,
            title,
            body,
          )

          handleResult(result, (pullRequest: PullRequestSummary) => {
            dispatch({ type: 'addPullRequest', payload: pullRequest })
            setInfo(`Created PR: ${pullRequest.title}`)
          })
        })
      },

      async createTerminalSession() {
        const activeResult = activeWorktreeRequired(state.activeWorktreeId)
        handleResult(activeResult, async (worktreeId) => {
          const result = await resolvedServices.terminal.createSession(worktreeId)
          handleResult(result, (session: TerminalSession) => {
            dispatch({ type: 'upsertTerminalSession', payload: session })
            setInfo(`Started terminal session ${session.id}.`)
          })
        })
      },

      async sendTerminalInput(sessionId, input) {
        const result = await resolvedServices.terminal.writeToSession(sessionId, input)
        handleResult(result, (session: TerminalSession) => {
          dispatch({ type: 'upsertTerminalSession', payload: session })
        })
      },

      async closeTerminalSession(sessionId) {
        const result = await resolvedServices.terminal.closeSession(sessionId)
        handleResult(result, (session: TerminalSession) => {
          dispatch({ type: 'upsertTerminalSession', payload: session })
          setInfo(`Closed terminal session ${session.id}.`)
        })
      },

      clearBanners() {
        setError(null)
        setInfo(null)
      },
    }),
    [
      handleResult,
      refreshAll,
      resolvedServices,
      setError,
      setInfo,
      state.activeWorktreeId,
    ],
  )

  const value = useMemo(
    () => ({
      state,
      actions,
    }),
    [actions, state],
  )

  return (
    <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>
  )
}

export const useAppStore = (): AppStoreContextValue => {
  const context = useContext(AppStoreContext)
  if (!context) {
    throw new Error('useAppStore must be used inside AppStoreProvider')
  }

  return context
}
