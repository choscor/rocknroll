import {
  ChevronDown,
  Code2,
  FileCode2,
  GitBranchPlus,
  TerminalSquare,
  Wrench,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { getDiffStats } from '../shared/git-diff'
import { useAppStore } from '../../state/app-store-context'

export const ActionButtons = () => {
  const { state, actions } = useAppStore()
  const activeWorkspace = state.workspaces.find((ws) => ws.id === state.activeWorkspaceId)
  const activeThread = state.threads.find((thread) => thread.id === state.activeThreadId)
  const activeWorktree = state.worktrees.find(
    (worktree) => worktree.id === state.activeWorktreeId,
  )
  const diffStats = getDiffStats(state.diff)
  const activePath =
    activeThread?.location === 'worktree'
      ? activeWorktree?.path ?? activeWorkspace?.path
      : activeWorkspace?.path ?? activeWorktree?.path

  const editors = [
    { label: 'VS Code', icon: Code2 },
    { label: 'Cursor', icon: FileCode2 },
    { label: 'Xcode', icon: Wrench },
  ]
  const controlButtonClass =
    'h-10 rounded-2xl border border-border/70 bg-background px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] hover:bg-muted/60'

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={(
            <Button
              variant="outline"
              className={cn(controlButtonClass, 'font-medium')}
              disabled={!activePath}
            />
          )}
        >
          <span className="inline-flex items-center gap-2">
            <FileCode2 className="size-4" />
            Open
            <ChevronDown className="size-4 text-muted-foreground" />
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-56 rounded-2xl bg-card p-2">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Open in editor</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {editors.map((editor) => (
              <DropdownMenuItem
                key={editor.label}
              onClick={() => {
                  if (activePath) {
                    void actions.openEditor(activePath)
                  }
                }}
                className="rounded-xl px-3 py-2"
              >
                <editor.icon className="size-4" />
                {editor.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <Tooltip>
        <TooltipTrigger
          render={(
            <Button
              variant="outline"
              size="icon"
              className={cn(controlButtonClass, 'size-10 px-0', state.terminalPanelOpen && 'bg-muted')}
              onClick={actions.toggleTerminalPanel}
            />
          )}
        >
          <TerminalSquare className="size-4" />
          <span className="sr-only">Toggle terminal</span>
        </TooltipTrigger>
        <TooltipContent>Toggle terminal</TooltipContent>
      </Tooltip>

      <Button
        type="button"
        variant="outline"
        onClick={actions.toggleDiffPanel}
        className={cn(
          controlButtonClass,
          'gap-1.5 px-3 text-sm tracking-tight',
          state.diffPanelOpen && 'bg-muted',
        )}
        aria-label="Toggle diff"
        title="Toggle diff"
      >
        <GitBranchPlus className="size-4 text-muted-foreground" />
        <span className="text-emerald-600">+{diffStats.added}</span>
        <span className="text-red-600">-{diffStats.removed}</span>
      </Button>
    </>
  )
}
