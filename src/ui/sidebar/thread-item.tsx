import { useNavigate } from 'react-router-dom'
import { Archive } from 'lucide-react'
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

  const handleArchive = () => {
    void actions.removeThread(thread.id)
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClick}
        className={cn(
          'h-auto flex-1 justify-start gap-2 rounded-lg px-3 py-1.5 text-left',
          isActive
            ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]'
            : 'text-sidebar-foreground hover:bg-sidebar-accent/65',
        )}
      >
        <span
          className={cn(
            'truncate text-xs',
            isActive ? 'font-medium text-sidebar-accent-foreground' : 'text-sidebar-foreground',
          )}
        >
          {thread.title}
        </span>
        <Badge variant="outline" className="h-5 rounded-md px-1.5 text-[10px] uppercase">
          {thread.location}
        </Badge>
        <span
          className={cn(
            'ml-auto shrink-0 text-[11px]',
            isActive ? 'text-sidebar-accent-foreground/80' : 'text-sidebar-foreground/70',
          )}
        >
          {formatRelativeTime(thread.updatedAt)}
        </span>
      </Button>

      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        className="rounded-lg text-sidebar-foreground/75 hover:text-sidebar-foreground"
        onClick={handleArchive}
        aria-label={`Archive ${thread.title}`}
        title="Archive thread"
      >
        <Archive className="size-3.5" />
      </Button>
    </div>
  )
}
