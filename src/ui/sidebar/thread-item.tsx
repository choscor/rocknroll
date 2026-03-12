import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
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
    void actions.activateThread(workspaceId, thread.id)
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
      <Badge variant="outline" className="h-5 rounded-md px-1.5 text-[10px] uppercase">
        {thread.location}
      </Badge>
      <span className="ml-auto shrink-0 text-[11px] text-muted-foreground">
        {formatRelativeTime(thread.updatedAt)}
      </span>
    </Button>
  )
}
