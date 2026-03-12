import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, ChevronUp, Folder, Plus } from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { ThreadLocation, Workspace } from '../../domain/contracts'
import { useAppStore } from '../../state/app-store-context'
import { ThreadItem } from './thread-item'

interface WorkspaceItemProps {
  workspace: Workspace
}

export const WorkspaceItem = ({ workspace }: WorkspaceItemProps) => {
  const { state, actions } = useAppStore()
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(state.activeWorkspaceId === workspace.id)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState<ThreadLocation>('local')

  const isActive = state.activeWorkspaceId === workspace.id
  const isExpanded = expanded
  const workspaceThreads = state.threads.filter((thread) => thread.workspaceId === workspace.id)

  const handleWorkspaceClick = () => {
    if (!isActive) {
      actions.setActiveWorkspace(workspace.id)
      void actions.loadThreads(workspace.id)
      void navigate(`/workspace/${workspace.id}`)
      setExpanded(true)
      return
    }

    setExpanded((current) => !current)
  }

  const handleCreateThread = () => {
    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      return
    }

    void actions.createThread(workspace.id, {
      title: trimmedTitle,
      location,
    })

    setTitle('')
    setLocation('local')
    setShowCreateForm(false)
    setExpanded(true)
  }

  return (
    <Collapsible open={isExpanded} onOpenChange={setExpanded}>
      <div className="flex items-center gap-1">
        <CollapsibleTrigger
          render={
            <Button
              variant="ghost"
              className={cn(
                'h-auto flex-1 justify-start gap-2 rounded-xl px-3 py-2 text-left',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/65',
              )}
            />
          }
          onClick={handleWorkspaceClick}
        >
          {isExpanded ? (
            <ChevronUp
              className={cn(
                'size-4 shrink-0',
                isActive ? 'text-sidebar-accent-foreground/80' : 'text-sidebar-foreground/75',
              )}
            />
          ) : (
            <ChevronDown
              className={cn(
                'size-4 shrink-0',
                isActive ? 'text-sidebar-accent-foreground/80' : 'text-sidebar-foreground/75',
              )}
            />
          )}
          <Folder
            className={cn(
              'size-4 shrink-0',
              isActive ? 'text-sidebar-accent-foreground' : 'text-sidebar-foreground/80',
            )}
          />
          <span
            className={cn(
              'truncate text-sm',
              isActive
                ? 'font-semibold text-sidebar-accent-foreground'
                : 'font-medium text-sidebar-foreground',
            )}
          >
            {workspace.name}
          </span>
          <span
            className={cn(
              'ml-auto text-xs',
              isActive
                ? 'text-sidebar-accent-foreground/80'
                : 'text-sidebar-foreground/70',
            )}
          >
            {workspace.gitBranch}
          </span>
        </CollapsibleTrigger>

        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          className="shrink-0 rounded-lg text-sidebar-foreground/85 hover:text-sidebar-foreground"
          onClick={(event) => {
            event.stopPropagation()
            if (!isExpanded) {
              setExpanded(true)
            }
            if (!isActive) {
              actions.setActiveWorkspace(workspace.id)
            }
            setShowCreateForm((current) => !current)
          }}
          title="Create thread"
          aria-label={`Create thread in ${workspace.name}`}
        >
          <Plus className="size-3.5" />
        </Button>
      </div>

      <CollapsibleContent className="space-y-1 pl-5 pr-1 pt-1">
        {showCreateForm && (
          <div className="space-y-2 rounded-lg border border-sidebar-border/85 bg-white/85 p-2">
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handleCreateThread()
                }
                if (event.key === 'Escape') {
                  setShowCreateForm(false)
                }
              }}
              placeholder="Thread title..."
              autoFocus
              className="h-8"
            />
            <div className="flex items-center gap-2">
              <Select
                value={location}
                onValueChange={(value) => {
                  if (value === 'local' || value === 'worktree') {
                    setLocation(value)
                  }
                }}
              >
                <SelectTrigger size="sm" className="h-8 min-w-[124px] rounded-lg capitalize">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="local" className="capitalize">
                    Local
                  </SelectItem>
                  <SelectItem value="worktree" className="capitalize">
                    Worktree
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button
                type="button"
                size="sm"
                onClick={handleCreateThread}
                disabled={!title.trim()}
              >
                Create
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

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
