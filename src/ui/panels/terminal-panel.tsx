import { useEffect, useMemo, useRef } from 'react'
import { listen, type UnlistenFn } from '@tauri-apps/api/event'
import type { IDisposable, Terminal as XTerm } from 'xterm'
import type { FitAddon } from 'xterm-addon-fit'
import 'xterm/css/xterm.css'
import { cn } from '@/lib/utils'
import { isTauriRuntime } from '../../infrastructure/tauri/desktop-commands'
import { useAppStore } from '../../state/app-store-context'

interface TerminalOutputPayload {
  sessionId: string
  data: string
}

const MIN_COLS = 20
const MIN_ROWS = 6

export const TerminalPanel = () => {
  const { state, actions } = useAppStore()
  const panelRef = useRef<HTMLDivElement | null>(null)
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const terminalRef = useRef<XTerm | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const sessionIdRef = useRef<string | null>(null)
  const previousSessionIdRef = useRef<string | null>(null)
  const sendTerminalInputRef = useRef(actions.sendTerminalInput)
  const resizeTerminalRef = useRef(actions.resizeTerminalSession)
  const tauriRuntime = isTauriRuntime()

  const activeSession = useMemo(
    () =>
      state.terminalSessions.find((session) => session.status === 'open') ??
      state.terminalSessions[0] ??
      null,
    [state.terminalSessions],
  )

  useEffect(() => {
    sessionIdRef.current = activeSession?.id ?? null
  }, [activeSession?.id])

  useEffect(() => {
    sendTerminalInputRef.current = actions.sendTerminalInput
    resizeTerminalRef.current = actions.resizeTerminalSession
  }, [actions.resizeTerminalSession, actions.sendTerminalInput])

  useEffect(() => {
    if (!tauriRuntime || !viewportRef.current || terminalRef.current) {
      return
    }

    let disposed = false
    let dataDisposable: IDisposable | null = null
    let unlisten: UnlistenFn | null = null

    void (async () => {
      const [{ Terminal }, { FitAddon }] = await Promise.all([
        import('xterm'),
        import('xterm-addon-fit'),
      ])

      if (disposed || !viewportRef.current || terminalRef.current) {
        return
      }

      const terminal = new Terminal({
        fontFamily:
          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        fontSize: 12,
        lineHeight: 1.4,
        cursorBlink: true,
        convertEol: false,
        scrollback: 3000,
        theme: {
          background: '#0b0f14',
          foreground: '#d6deeb',
          cursor: '#8fd3ff',
        },
      })
      const fitAddon = new FitAddon()

      terminal.loadAddon(fitAddon)
      terminal.open(viewportRef.current)
      fitAddon.fit()

      dataDisposable = terminal.onData((data) => {
        const sessionId = sessionIdRef.current
        if (!sessionId) {
          return
        }

        void sendTerminalInputRef.current(sessionId, data)
      })

      unlisten = await listen<TerminalOutputPayload>('terminal-output', (event) => {
        if (event.payload.sessionId !== sessionIdRef.current) {
          return
        }

        terminalRef.current?.write(event.payload.data)
      })

      terminalRef.current = terminal
      fitAddonRef.current = fitAddon
    })()

    return () => {
      disposed = true
      dataDisposable?.dispose()
      if (unlisten) {
        unlisten()
      }
      terminalRef.current?.dispose()
      terminalRef.current = null
      fitAddonRef.current = null
    }
  }, [tauriRuntime])

  useEffect(() => {
    if (!tauriRuntime) {
      return
    }

    const nextSessionId = activeSession?.id ?? null
    if (nextSessionId && previousSessionIdRef.current !== nextSessionId) {
      terminalRef.current?.reset()
      previousSessionIdRef.current = nextSessionId
    } else if (!nextSessionId) {
      previousSessionIdRef.current = null
    }
  }, [activeSession?.id, tauriRuntime])

  useEffect(() => {
    if (!tauriRuntime || !state.terminalPanelOpen) {
      return
    }

    const syncSize = () => {
      const terminal = terminalRef.current
      const fitAddon = fitAddonRef.current
      const sessionId = sessionIdRef.current
      if (!terminal || !fitAddon || !sessionId) {
        return
      }

      fitAddon.fit()
      const cols = Math.max(MIN_COLS, terminal.cols)
      const rows = Math.max(MIN_ROWS, terminal.rows)
      void resizeTerminalRef.current(sessionId, cols, rows)
    }

    const animationFrame = window.requestAnimationFrame(() => {
      syncSize()
      terminalRef.current?.focus()
    })

    const resizeObserver =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(() => {
            syncSize()
          })

    if (resizeObserver && panelRef.current) {
      resizeObserver.observe(panelRef.current)
    }

    window.addEventListener('resize', syncSize)

    return () => {
      window.cancelAnimationFrame(animationFrame)
      window.removeEventListener('resize', syncSize)
      resizeObserver?.disconnect()
    }
  }, [state.terminalPanelOpen, tauriRuntime])

  return (
    <section
      ref={panelRef}
      className={cn(
        'shrink-0 overflow-hidden bg-[#0b0f14] transition-[height,border-color] duration-150',
        state.terminalPanelOpen ? 'h-72 border-t border-border' : 'h-0 border-t border-transparent',
      )}
      aria-hidden={!state.terminalPanelOpen}
    >
      {!tauriRuntime && state.terminalPanelOpen ? (
        <div className="flex h-full items-center px-4 font-mono text-xs text-zinc-300">
          Native terminal requires Tauri runtime (`npm run tauri:dev`).
        </div>
      ) : (
        <div
          ref={viewportRef}
          className={cn(
            'h-full w-full px-2 py-2',
            !state.terminalPanelOpen && 'pointer-events-none opacity-0',
          )}
        />
      )}
    </section>
  )
}
