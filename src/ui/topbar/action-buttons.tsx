import {
  ChevronDown,
  Code2,
  FileCode2,
  GitBranchPlus,
  TerminalSquare,
  Wrench,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
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
  const diffStats = getDiffStats(state.diff)

  const editors = [
    { label: 'VS Code', icon: Code2 },
    { label: 'Cursor', icon: FileCode2 },
    { label: 'Xcode', icon: Wrench },
  ]

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={(
            <Button
              variant="outline"
              className="h-10 rounded-xl border border-border/80 bg-card px-4 hover:bg-muted/80"
              disabled={!activeWorkspace}
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
                  if (activeWorkspace) {
                    void actions.openEditor(activeWorkspace.path)
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
              variant={state.terminalPanelOpen ? 'secondary' : 'outline'}
              size="icon"
              className="size-10 rounded-xl"
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
        variant={state.diffPanelOpen ? 'secondary' : 'outline'}
        onClick={actions.toggleDiffPanel}
        className="h-10 rounded-xl border border-border/80 bg-card px-3 text-sm hover:bg-muted/80"
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
