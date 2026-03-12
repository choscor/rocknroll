import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'
import type { AppServices } from '../repository/interfaces'
import { createContainer } from '../container/container'
import { desktopCommands } from '../infrastructure/tauri/desktop-commands'
import type {
  AppSettings,
  ChatMessage,
  CommandResult,
  CreateWorktreeInput,
  ModelConfig,
  ProviderId,
  PullRequestSummary,
  Skill,
  TerminalSession,
  Thread,
  Workspace,
} from '../domain/contracts'
import { appReducer, createInitialState, type AppState } from './app-store'

export interface AppActions {
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
  loadWorkspaces(): Promise<void>
  createWorkspace(name: string, path: string): Promise<void>
  removeWorkspace(workspaceId: string): Promise<void>
  setActiveWorkspace(workspaceId: string): void
  loadThreads(workspaceId: string): Promise<void>
  createThread(workspaceId: string, title: string): Promise<void>
  removeThread(threadId: string): Promise<void>
  setActiveThread(threadId: string): void
  sendMessage(threadId: string, content: string): Promise<void>
  loadMessages(threadId: string): Promise<void>
  loadSkills(): Promise<void>
  toggleSkill(skillId: string, enabled: boolean): Promise<void>
  updateModelConfig(config: ModelConfig): void
  updateSettings(settings: AppSettings): void
  toggleSidebar(): void
  toggleTerminalPanel(): void
  toggleDiffPanel(): void
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
    () => services ?? createContainer(),
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
    const [providerResult, worktreeResult, pullRequestResult, terminalResult, workspaceResult, skillResult] =
      await Promise.all([
        resolvedServices.auth.listStatuses(),
        resolvedServices.worktree.list(),
        resolvedServices.git.listPullRequests(),
        resolvedServices.terminal.listSessions(),
        resolvedServices.workspace.list(),
        resolvedServices.skill.list(),
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

    handleResult(workspaceResult, async (workspaces: Workspace[]) => {
      dispatch({ type: 'setWorkspaces', payload: workspaces })
      if (workspaces.length > 0) {
        dispatch({ type: 'setActiveWorkspace', payload: workspaces[0].id })
        const threadsResult = await resolvedServices.thread.list(workspaces[0].id)
        handleResult(threadsResult, (threads: Thread[]) => {
          dispatch({ type: 'setThreads', payload: threads })
        })
      }
    })

    handleResult(skillResult, (skills: Skill[]) => {
      dispatch({ type: 'setSkills', payload: skills })
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

      async loadWorkspaces() {
        const result = await resolvedServices.workspace.list()
        handleResult(result, (workspaces: Workspace[]) => {
          dispatch({ type: 'setWorkspaces', payload: workspaces })
        })
      },

      async createWorkspace(name, path) {
        const result = await resolvedServices.workspace.create(name, path)
        handleResult(result, (workspace: Workspace) => {
          dispatch({ type: 'setWorkspaces', payload: [...state.workspaces, workspace] })
          dispatch({ type: 'setActiveWorkspace', payload: workspace.id })
          setInfo(`Workspace ${workspace.name} created.`)
        })
      },

      async removeWorkspace(workspaceId) {
        const result = await resolvedServices.workspace.remove(workspaceId)
        handleResult(result, () => {
          const remaining = state.workspaces.filter((ws) => ws.id !== workspaceId)
          dispatch({ type: 'setWorkspaces', payload: remaining })
          if (state.activeWorkspaceId === workspaceId) {
            dispatch({ type: 'setActiveWorkspace', payload: remaining[0]?.id ?? null })
          }
          setInfo(`Workspace removed.`)
        })
      },

      setActiveWorkspace(workspaceId) {
        dispatch({ type: 'setActiveWorkspace', payload: workspaceId })
      },

      async loadThreads(workspaceId) {
        const result = await resolvedServices.thread.list(workspaceId)
        handleResult(result, (threads: Thread[]) => {
          dispatch({ type: 'setThreads', payload: threads })
        })
      },

      async createThread(workspaceId, title) {
        const result = await resolvedServices.thread.create(workspaceId, title)
        handleResult(result, (thread: Thread) => {
          dispatch({ type: 'addThread', payload: thread })
          dispatch({ type: 'setActiveThread', payload: thread.id })
          dispatch({ type: 'setMessages', payload: [] })
          setInfo(`Thread "${thread.title}" created.`)
        })
      },

      async removeThread(threadId) {
        const result = await resolvedServices.thread.remove(threadId)
        handleResult(result, () => {
          const remaining = state.threads.filter((t) => t.id !== threadId)
          dispatch({ type: 'setThreads', payload: remaining })
          if (state.activeThreadId === threadId) {
            dispatch({ type: 'setActiveThread', payload: remaining[0]?.id ?? null })
            dispatch({ type: 'setMessages', payload: [] })
          }
          setInfo(`Thread removed.`)
        })
      },

      setActiveThread(threadId) {
        dispatch({ type: 'setActiveThread', payload: threadId })
      },

      async sendMessage(threadId, content) {
        const result = await resolvedServices.chat.sendMessage(threadId, content)
        handleResult(result, (messages: ChatMessage[]) => {
          dispatch({ type: 'setMessages', payload: messages })
        })
      },

      async loadMessages(threadId) {
        const result = await resolvedServices.chat.listMessages(threadId)
        handleResult(result, (messages: ChatMessage[]) => {
          dispatch({ type: 'setMessages', payload: messages })
        })
      },

      async loadSkills() {
        const result = await resolvedServices.skill.list()
        handleResult(result, (skills: Skill[]) => {
          dispatch({ type: 'setSkills', payload: skills })
        })
      },

      async toggleSkill(skillId, enabled) {
        const result = await resolvedServices.skill.toggle(skillId, enabled)
        handleResult(result, (updatedSkill: Skill) => {
          const nextSkills = state.skills.map((s) =>
            s.id === updatedSkill.id ? updatedSkill : s,
          )
          dispatch({ type: 'setSkills', payload: nextSkills })
        })
      },

      updateModelConfig(config) {
        dispatch({ type: 'setModelConfig', payload: config })
      },

      updateSettings(settings) {
        dispatch({ type: 'setSettings', payload: settings })
      },

      toggleSidebar() {
        dispatch({ type: 'toggleSidebar' })
      },

      toggleTerminalPanel() {
        dispatch({ type: 'toggleTerminalPanel' })
      },

      toggleDiffPanel() {
        dispatch({ type: 'toggleDiffPanel' })
      },
    }),
    [
      handleResult,
      refreshAll,
      resolvedServices,
      setError,
      setInfo,
      state.activeWorktreeId,
      state.activeWorkspaceId,
      state.activeThreadId,
      state.workspaces,
      state.threads,
      state.skills,
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
