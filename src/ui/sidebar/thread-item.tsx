import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Thread } from '../../domain/contracts'
import { useAppStore } from '../../state/app-store-context'
import { formatRelativeTime } from '../shared/format-relative-time'

interface ThreadItemProps {
  thread: Thread
  workspaceId: string
}

export const ThreadItem = ({ thread, workspaceId }: ThreadItemProps) => {
  const { state, actions } = useAppStore()
  const navigate = useNavigate()
  const isActive = state.activeThreadId === thread.id

  const handleClick = () => {
    actions.setActiveThread(thread.id)
    void actions.loadMessages(thread.id)
    void navigate(`/workspace/${workspaceId}/thread/${thread.id}`)
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className={cn(
        'h-auto w-full justify-start gap-2 rounded-lg px-3 py-1.5 text-left',
        isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground/70',
      )}
    >
      <span className={cn('truncate text-xs', isActive ? 'text-foreground' : 'text-muted-foreground')}>
        {thread.title}
      </span>
      <span className="ml-auto shrink-0 text-[11px] text-muted-foreground">
        {formatRelativeTime(thread.updatedAt)}
      </span>
    </Button>
  )
}
