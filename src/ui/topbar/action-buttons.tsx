import {
  ChevronDown,
  Code2,
  FileCode2,
  GitCompare,
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
              className="h-10 rounded-l-2xl rounded-r-md border-r-0 px-3"
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

      <Tooltip>
        <TooltipTrigger
          render={(
            <Button
              variant={state.diffPanelOpen ? 'secondary' : 'outline'}
              size="icon"
              className="size-10 rounded-xl"
              onClick={actions.toggleDiffPanel}
            />
          )}
        >
          <GitCompare className="size-4" />
          <span className="sr-only">Toggle diff</span>
        </TooltipTrigger>
        <TooltipContent>Toggle diff</TooltipContent>
      </Tooltip>

      <div className="inline-flex items-center gap-1 rounded-xl border bg-card px-3 py-2 text-sm">
        <span className="text-emerald-600">+{diffStats.added}</span>
        <span className="text-red-600">-{diffStats.removed}</span>
      </div>
    </>
  )
}
