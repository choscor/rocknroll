import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ChatMessage as ChatMessageType } from '../../domain/contracts'

interface ChatMessageProps {
  message: ChatMessageType
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const [copied, setCopied] = useState(false)

  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className={cn(
        'animate-in slide-in-from-bottom-2 flex flex-col gap-1 duration-200',
        isUser ? 'items-end' : 'items-start',
      )}
    >
      <div className="px-1 text-xs text-muted-foreground">
        {isUser ? 'You' : isSystem ? 'System' : 'Assistant'}
      </div>
      <div
        className={cn(
          'relative max-w-[80%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm',
          isUser && 'rounded-br-md bg-primary text-primary-foreground',
          isSystem && 'rounded-bl-md border bg-muted/80 text-foreground',
          !isUser && !isSystem && 'rounded-bl-md border bg-card text-card-foreground',
        )}
      >
        {message.content}
        {!isUser && (
          <Button
            size="icon-xs"
            variant="ghost"
            onClick={() => void handleCopy()}
            className="absolute right-2 top-2 opacity-70 hover:opacity-100"
            title="Copy"
          >
            {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
          </Button>
        )}
      </div>
    </div>
  )
}
