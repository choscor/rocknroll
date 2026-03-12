import { describe, expect, it } from 'vitest'
import { appReducer, createInitialState } from './app-store'

describe('app store reducer', () => {
  it('updates provider metadata', () => {
    const initial = createInitialState()

    const next = appReducer(initial, {
      type: 'setProviderStatus',
      payload: {
        provider: 'claude',
        connected: true,
        authMode: 'oauth',
        maskedCredential: 'oauth-linked',
        lastSyncedAt: '2026-03-12T00:00:00.000Z',
      },
    })

    expect(next.providerStatuses.claude.connected).toBe(true)
    expect(next.providerStatuses.claude.authMode).toBe('oauth')
  })

  it('keeps terminal sessions up to date', () => {
    const initial = createInitialState()

    const withSession = appReducer(initial, {
      type: 'upsertTerminalSession',
      payload: {
        id: 'term-1',
        worktreeId: 'wt-1',
        title: 'main-session',
        status: 'open',
        createdAt: '2026-03-12T00:00:00.000Z',
        history: ['hello'],
        lastOutput: 'hello',
      },
    })

    const updated = appReducer(withSession, {
      type: 'upsertTerminalSession',
      payload: {
        id: 'term-1',
        worktreeId: 'wt-1',
        title: 'main-session',
        status: 'closed',
        createdAt: '2026-03-12T00:00:00.000Z',
        history: ['hello', 'closed'],
        lastOutput: 'closed',
      },
    })

    expect(updated.terminalSessions).toHaveLength(1)
    expect(updated.terminalSessions[0].status).toBe('closed')
  })

  it('manages workspaces', () => {
    const initial = createInitialState()

    const withWorkspaces = appReducer(initial, {
      type: 'setWorkspaces',
      payload: [
        { id: 'ws-1', name: 'test', path: '/test', gitBranch: 'main', createdAt: '2026-03-12T00:00:00.000Z' },
      ],
    })

    expect(withWorkspaces.workspaces).toHaveLength(1)
    expect(withWorkspaces.workspaces[0].name).toBe('test')

    const withActive = appReducer(withWorkspaces, {
      type: 'setActiveWorkspace',
      payload: 'ws-1',
    })

    expect(withActive.activeWorkspaceId).toBe('ws-1')
  })

  it('manages threads', () => {
    const initial = createInitialState()

    const withThread = appReducer(initial, {
      type: 'addThread',
      payload: {
        id: 'th-1',
        workspaceId: 'ws-1',
        title: 'Test thread',
        status: 'active',
        createdAt: '2026-03-12T00:00:00.000Z',
        updatedAt: '2026-03-12T00:00:00.000Z',
      },
    })

    expect(withThread.threads).toHaveLength(1)

    const withActive = appReducer(withThread, {
      type: 'setActiveThread',
      payload: 'th-1',
    })

    expect(withActive.activeThreadId).toBe('th-1')
  })

  it('manages messages', () => {
    const initial = createInitialState()

    const withMessages = appReducer(initial, {
      type: 'setMessages',
      payload: [
        { id: 'msg-1', threadId: 'th-1', role: 'user', content: 'hello', createdAt: '2026-03-12T00:00:00.000Z' },
      ],
    })

    expect(withMessages.messages).toHaveLength(1)

    const withAppended = appReducer(withMessages, {
      type: 'appendMessage',
      payload: { id: 'msg-2', threadId: 'th-1', role: 'assistant', content: 'hi', createdAt: '2026-03-12T00:00:00.000Z' },
    })

    expect(withAppended.messages).toHaveLength(2)
  })

  it('toggles UI panels', () => {
    const initial = createInitialState()

    const toggled = appReducer(initial, { type: 'toggleSidebar' })
    expect(toggled.sidebarCollapsed).toBe(true)

    const toggledBack = appReducer(toggled, { type: 'toggleSidebar' })
    expect(toggledBack.sidebarCollapsed).toBe(false)

    const withTerminal = appReducer(initial, { type: 'toggleTerminalPanel' })
    expect(withTerminal.terminalPanelOpen).toBe(true)

    const withDiff = appReducer(initial, { type: 'toggleDiffPanel' })
    expect(withDiff.diffPanelOpen).toBe(true)
  })

  it('updates model config and settings', () => {
    const initial = createInitialState()

    const withModel = appReducer(initial, {
      type: 'setModelConfig',
      payload: { modelId: 'claude-sonnet-4-6', modelDisplayName: 'Claude Sonnet 4.6', effort: 'medium' },
    })

    expect(withModel.modelConfig.modelId).toBe('claude-sonnet-4-6')

    const withSettings = appReducer(initial, {
      type: 'setSettings',
      payload: { executionMode: 'remote', defaultPermissions: 'auto', preferredEditor: 'cursor' },
    })

    expect(withSettings.settings.executionMode).toBe('remote')
  })
})
