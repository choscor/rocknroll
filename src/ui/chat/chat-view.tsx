import { useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useAppStore } from '../../state/app-store-context'
import { ChatMessage } from './chat-message'
import './chat-view.css'

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
      <div className="chat-view">
        <div className="chat-empty">
          <h2>Welcome to rocknroll</h2>
          <p>
            Select a thread from the sidebar or create a new one to start a conversation
            with your AI assistant.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="chat-view">
      {state.messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
