import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Folder } from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Workspace } from '../../domain/contracts'
import { useAppStore } from '../../state/app-store-context'
import { ThreadItem } from './thread-item'

interface WorkspaceItemProps {
  workspace: Workspace
}

export const WorkspaceItem = ({ workspace }: WorkspaceItemProps) => {
  const { state, actions } = useAppStore()
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(state.activeWorkspaceId === workspace.id)

  const isActive = state.activeWorkspaceId === workspace.id
  const isExpanded = expanded || isActive
  const workspaceThreads = state.threads.filter((t) => t.workspaceId === workspace.id)

  const handleClick = () => {
    if (!isActive) {
      actions.setActiveWorkspace(workspace.id)
      void actions.loadThreads(workspace.id)
      void navigate(`/workspace/${workspace.id}`)
      setExpanded(true)
      return
    }

    setExpanded((current) => !current)
  }

  return (
    <Collapsible open={isExpanded} onOpenChange={setExpanded}>
      <CollapsibleTrigger render={<Button variant="ghost" className="h-auto w-full justify-start gap-2 rounded-xl px-3 py-2 text-left" /> } onClick={handleClick}>
        <ChevronRight
          className={cn('size-4 shrink-0 text-muted-foreground transition-transform', isExpanded && 'rotate-90')}
        />
        <Folder className={cn('size-4 shrink-0', isActive ? 'text-foreground' : 'text-muted-foreground')} />
        <span className={cn('truncate text-sm', isActive ? 'font-medium text-foreground' : 'text-muted-foreground')}>
          {workspace.name}
        </span>
        <span className="ml-auto text-xs text-muted-foreground">{workspace.gitBranch}</span>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-1 pl-5 pr-1 pt-1">
        {workspaceThreads.length === 0 ? (
          <div className="px-3 py-1 text-xs text-muted-foreground">No threads yet</div>
        ) : (
          workspaceThreads.map((thread) => (
            <ThreadItem key={thread.id} thread={thread} workspaceId={workspace.id} />
          ))
        )}
      </CollapsibleContent>
    </Collapsible>
  )
}
