import type { ChatService } from '../../repository/interfaces'
import type { ChatMessage } from '../../domain/contracts'
import { clone, err, nowIso, ok, type MockDatabase } from './mock-database'

const generateAssistantReply = (userContent: string): string => {
  if (userContent.toLowerCase().includes('hello')) {
    return 'Hello! How can I help you today? I can assist with code reviews, debugging, or writing new features.'
  }

  if (userContent.toLowerCase().includes('help')) {
    return 'I can help you with:\n- Writing and reviewing code\n- Debugging issues\n- Running terminal commands\n- Creating pull requests\n\nWhat would you like to work on?'
  }

  return `I've analyzed your request: "${userContent}"\n\nHere's what I suggest we do:\n1. Review the current implementation\n2. Identify areas for improvement\n3. Apply the changes\n\nShall I proceed?`
}

export class MockChatService implements ChatService {
  constructor(private readonly db: MockDatabase) {}

  async sendMessage(threadId: string, content: string) {
    const trimmed = content.trim()
    if (!trimmed) {
      return err('EMPTY_MESSAGE', 'Message content cannot be empty.')
    }

    const thread = this.db.threads.find((t) => t.id === threadId)
    if (!thread) {
      return err('THREAD_NOT_FOUND', `Thread ${threadId} does not exist.`)
    }

    this.db.counters.message += 1
    const userMessage: ChatMessage = {
      id: `msg-${this.db.counters.message}`,
      threadId,
      role: 'user',
      content: trimmed,
      createdAt: nowIso(),
    }
    this.db.messages.push(userMessage)

    this.db.counters.message += 1
    const assistantMessage: ChatMessage = {
      id: `msg-${this.db.counters.message}`,
      threadId,
      role: 'assistant',
      content: generateAssistantReply(trimmed),
      createdAt: nowIso(),
    }
    this.db.messages.push(assistantMessage)

    thread.updatedAt = nowIso()

    const threadMessages = this.db.messages.filter((m) => m.threadId === threadId)
    return ok(clone(threadMessages))
  }

  async listMessages(threadId: string) {
    const threadMessages = this.db.messages.filter((m) => m.threadId === threadId)
    return ok(clone(threadMessages))
  }
}
