import { useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { useAppStore } from '../../state/app-store-context'
import { ChatMessage } from './chat-message'

export const ChatView = () => {
  const { state, actions } = useAppStore()
  const { workspaceId, threadId } = useParams()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (workspaceId && workspaceId !== state.activeWorkspaceId) {
      actions.setActiveWorkspace(workspaceId)
      void actions.loadThreads(workspaceId)
    }
  }, [workspaceId, state.activeWorkspaceId, actions])

  useEffect(() => {
    if (threadId && threadId !== state.activeThreadId) {
      actions.setActiveThread(threadId)
      void actions.loadMessages(threadId)
    }
  }, [threadId, state.activeThreadId, actions])

  useEffect(() => {
    if (typeof bottomRef.current?.scrollIntoView === 'function') {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [state.messages])

  if (!state.activeThreadId || state.messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center px-8">
        <div className="grid justify-items-center gap-2 text-center">
          <div className="inline-flex size-14 items-center justify-center rounded-2xl border bg-card shadow-sm">
            <Sparkles className="size-8" />
          </div>
          <h2 className="text-5xl font-semibold tracking-tight text-foreground">
            Let&apos;s build
          </h2>
          <p className="text-5xl text-muted-foreground">rocknroll</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto px-6 py-6">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-5">
        {state.messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
