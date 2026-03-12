import { describe, expect, it } from 'vitest'
import { appReducer, createInitialState } from './appStore'

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
})
