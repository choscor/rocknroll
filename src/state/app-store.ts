import type {
  AppSettings,
  ChatMessage,
  ModelConfig,
  ProviderConnectionStatus,
  ProviderId,
  PullRequestSummary,
  Skill,
  TerminalSession,
  Thread,
  Worktree,
  Workspace,
  WorktreeSnapshot,
} from '../domain/contracts'

export interface AppState {
  providerStatuses: Record<ProviderId, ProviderConnectionStatus>
  worktrees: Worktree[]
  activeWorktreeId: string | null
  diff: string
  aiCommitMessage: string
  pullRequests: PullRequestSummary[]
  terminalSessions: TerminalSession[]
  lastError: string | null
  lastInfo: string | null
  workspaces: Workspace[]
  activeWorkspaceId: string | null
  threads: Thread[]
  activeThreadId: string | null
  messages: ChatMessage[]
  modelConfig: ModelConfig
  skills: Skill[]
  settings: AppSettings
  sidebarCollapsed: boolean
  terminalPanelOpen: boolean
  diffPanelOpen: boolean
}

const disconnectedStatus = (
  provider: ProviderId,
): ProviderConnectionStatus => ({
  provider,
  connected: false,
  authMode: null,
  maskedCredential: null,
  lastSyncedAt: null,
})

export const createInitialState = (): AppState => ({
  providerStatuses: {
    claude: disconnectedStatus('claude'),
    codex: disconnectedStatus('codex'),
  },
  worktrees: [],
  activeWorktreeId: null,
  diff: '',
  aiCommitMessage: '',
  pullRequests: [],
  terminalSessions: [],
  lastError: null,
  lastInfo: null,
  workspaces: [],
  activeWorkspaceId: null,
  threads: [],
  activeThreadId: null,
  messages: [],
  modelConfig: {
    modelId: 'claude-opus-4-6',
    modelDisplayName: 'Claude Opus 4.6',
    effort: 'high',
  },
  skills: [],
  settings: {
    executionMode: 'local',
    defaultPermissions: 'ask',
    preferredEditor: 'vscode',
  },
  sidebarCollapsed: false,
  terminalPanelOpen: false,
  diffPanelOpen: false,
})

export type AppAction =
  | {
      type: 'setProviderStatuses'
      payload: ProviderConnectionStatus[]
    }
  | {
      type: 'setProviderStatus'
      payload: ProviderConnectionStatus
    }
  | {
      type: 'setWorktreeSnapshot'
      payload: WorktreeSnapshot
    }
  | {
      type: 'setDiff'
      payload: string
    }
  | {
      type: 'setAiCommitMessage'
      payload: string
    }
  | {
      type: 'setPullRequests'
      payload: PullRequestSummary[]
    }
  | {
      type: 'addPullRequest'
      payload: PullRequestSummary
    }
  | {
      type: 'setTerminalSessions'
      payload: TerminalSession[]
    }
  | {
      type: 'upsertTerminalSession'
      payload: TerminalSession
    }
  | {
      type: 'setError'
      payload: string | null
    }
  | {
      type: 'setInfo'
      payload: string | null
    }
  | {
      type: 'setWorkspaces'
      payload: Workspace[]
    }
  | {
      type: 'setActiveWorkspace'
      payload: string | null
    }
  | {
      type: 'setThreads'
      payload: Thread[]
    }
  | {
      type: 'setActiveThread'
      payload: string | null
    }
  | {
      type: 'addThread'
      payload: Thread
    }
  | {
      type: 'setMessages'
      payload: ChatMessage[]
    }
  | {
      type: 'appendMessage'
      payload: ChatMessage
    }
  | {
      type: 'setModelConfig'
      payload: ModelConfig
    }
  | {
      type: 'setSkills'
      payload: Skill[]
    }
  | {
      type: 'setSettings'
      payload: AppSettings
    }
  | {
      type: 'toggleSidebar'
    }
  | {
      type: 'toggleTerminalPanel'
    }
  | {
      type: 'toggleDiffPanel'
    }

const providerMapFromArray = (
  statuses: ProviderConnectionStatus[],
): Record<ProviderId, ProviderConnectionStatus> => {
  const nextState = {
    claude: disconnectedStatus('claude'),
    codex: disconnectedStatus('codex'),
  }

  for (const status of statuses) {
    nextState[status.provider] = status
  }

  return nextState
}

export const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'setProviderStatuses':
      return {
        ...state,
        providerStatuses: providerMapFromArray(action.payload),
      }

    case 'setProviderStatus':
      return {
        ...state,
        providerStatuses: {
          ...state.providerStatuses,
          [action.payload.provider]: action.payload,
        },
      }

    case 'setWorktreeSnapshot':
      return {
        ...state,
        worktrees: action.payload.items,
        activeWorktreeId: action.payload.activeWorktreeId,
      }

    case 'setDiff':
      return {
        ...state,
        diff: action.payload,
      }

    case 'setAiCommitMessage':
      return {
        ...state,
        aiCommitMessage: action.payload,
      }

    case 'setPullRequests':
      return {
        ...state,
        pullRequests: action.payload,
      }

    case 'addPullRequest':
      return {
        ...state,
        pullRequests: [action.payload, ...state.pullRequests],
      }

    case 'setTerminalSessions':
      return {
        ...state,
        terminalSessions: action.payload,
      }

    case 'upsertTerminalSession': {
      const existingIndex = state.terminalSessions.findIndex(
        (item) => item.id === action.payload.id,
      )

      if (existingIndex === -1) {
        return {
          ...state,
          terminalSessions: [action.payload, ...state.terminalSessions],
        }
      }

      const nextSessions = [...state.terminalSessions]
      nextSessions[existingIndex] = action.payload

      return {
        ...state,
        terminalSessions: nextSessions,
      }
    }

    case 'setError':
      return {
        ...state,
        lastError: action.payload,
        lastInfo: action.payload ? null : state.lastInfo,
      }

    case 'setInfo':
      return {
        ...state,
        lastInfo: action.payload,
        lastError: action.payload ? null : state.lastError,
      }

    case 'setWorkspaces':
      return {
        ...state,
        workspaces: action.payload,
      }

    case 'setActiveWorkspace':
      return {
        ...state,
        activeWorkspaceId: action.payload,
      }

    case 'setThreads':
      return {
        ...state,
        threads: action.payload,
      }

    case 'setActiveThread':
      return {
        ...state,
        activeThreadId: action.payload,
      }

    case 'addThread':
      return {
        ...state,
        threads: [...state.threads, action.payload],
      }

    case 'setMessages':
      return {
        ...state,
        messages: action.payload,
      }

    case 'appendMessage':
      return {
        ...state,
        messages: [...state.messages, action.payload],
      }

    case 'setModelConfig':
      return {
        ...state,
        modelConfig: action.payload,
      }

    case 'setSkills':
      return {
        ...state,
        skills: action.payload,
      }

    case 'setSettings':
      return {
        ...state,
        settings: action.payload,
      }

    case 'toggleSidebar':
      return {
        ...state,
        sidebarCollapsed: !state.sidebarCollapsed,
      }

    case 'toggleTerminalPanel':
      return {
        ...state,
        terminalPanelOpen: !state.terminalPanelOpen,
      }

    case 'toggleDiffPanel':
      return {
        ...state,
        diffPanelOpen: !state.diffPanelOpen,
      }

    default:
      return state
  }
}
