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
              className="h-auto flex-1 justify-start gap-2 rounded-xl px-3 py-2 text-left"
            />
          }
          onClick={handleWorkspaceClick}
        >
          {isExpanded ? (
            <ChevronUp className="size-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
          )}
          <Folder
            className={
              isActive ? 'size-4 shrink-0 text-foreground' : 'size-4 shrink-0 text-muted-foreground'
            }
          />
          <span
            className={
              isActive
                ? 'truncate text-sm font-medium text-foreground'
                : 'truncate text-sm text-muted-foreground'
            }
          >
            {workspace.name}
          </span>
          <span className="ml-auto text-xs text-muted-foreground">{workspace.gitBranch}</span>
        </CollapsibleTrigger>

        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          className="shrink-0 rounded-lg"
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
          <div className="space-y-2 rounded-lg border border-border/70 bg-background/70 p-2">
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
