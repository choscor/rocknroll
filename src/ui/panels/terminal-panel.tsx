import { useMemo, useState } from 'react'
import { Plus, TerminalSquare, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useAppStore } from '../../state/app-store-context'

export const TerminalPanel = () => {
  const { state, actions } = useAppStore()
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [command, setCommand] = useState('')

  const activeSession = useMemo(() => {
    return (
      state.terminalSessions.find((session) => session.id === selectedSessionId) ??
      state.terminalSessions[0] ??
      null
    )
  }, [selectedSessionId, state.terminalSessions])

  const handleSubmit = () => {
    if (!activeSession || !command.trim()) {
      return
    }

    void actions.sendTerminalInput(activeSession.id, command.trim())
    setCommand('')
  }

  return (
    <div className="flex h-72 min-h-72 flex-col border-t bg-card">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="inline-flex items-center gap-2">
          <TerminalSquare className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium">Terminal</span>
        </div>
        <div className="inline-flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => void actions.createTerminalSession()}
          >
            <Plus className="size-3.5" />
            New session
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            onClick={actions.toggleTerminalPanel}
          >
            <X className="size-4" />
            <span className="sr-only">Close terminal</span>
          </Button>
        </div>
      </div>
      <Separator />

      {state.terminalSessions.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <Button type="button" variant="outline" onClick={() => void actions.createTerminalSession()}>
            Create terminal session
          </Button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 overflow-x-auto border-b px-3 py-2">
            {state.terminalSessions.map((session) => (
              <Button
                key={session.id}
                type="button"
                size="sm"
                variant={activeSession?.id === session.id ? 'secondary' : 'ghost'}
                className={cn('rounded-lg', session.status === 'closed' && 'opacity-70')}
                onClick={() => setSelectedSessionId(session.id)}
              >
                {session.title}
              </Button>
            ))}
          </div>

          <div className="grid min-h-0 flex-1 grid-rows-[1fr_auto]">
            <ScrollArea className="min-h-0 bg-[#fafafa] px-3 py-3">
              <pre className="font-mono text-xs leading-6 text-foreground">
                {(activeSession?.history ?? []).join('\n')}
                {activeSession?.history.length ? '\n' : ''}
                {activeSession?.lastOutput ?? ''}
              </pre>
            </ScrollArea>

            <form
              className="flex items-center gap-2 border-t px-3 py-2"
              onSubmit={(event) => {
                event.preventDefault()
                handleSubmit()
              }}
            >
              <Input
                value={command}
                onChange={(event) => setCommand(event.target.value)}
                placeholder="$ echo hello"
                disabled={!activeSession || activeSession.status === 'closed'}
                className="font-mono text-xs"
              />
              <Button
                type="submit"
                size="sm"
                disabled={!command.trim() || !activeSession || activeSession.status === 'closed'}
              >
                Send
              </Button>
              {activeSession && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={activeSession.status === 'closed'}
                  onClick={() => void actions.closeTerminalSession(activeSession.id)}
                >
                  Close
                </Button>
              )}
            </form>
          </div>
        </>
      )}
    </div>
  )
}
