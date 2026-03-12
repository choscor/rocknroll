import { ChevronDown, CloudUpload, GitCommitHorizontal, Github } from 'lucide-react'
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
import { useAppStore } from '../../state/app-store-context'

export const CommitDropdown = () => {
  const { state, actions } = useAppStore()

  const disabled = !state.activeWorktreeId

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={(
          <Button
            variant="outline"
            className="h-10 rounded-l-md rounded-r-2xl px-3"
            disabled={disabled}
          />
        )}
      >
        <span className="inline-flex items-center gap-2">
          <GitCommitHorizontal className="size-4" />
          Commit
          <ChevronDown className="size-4 text-muted-foreground" />
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-56 rounded-2xl bg-card p-2">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Git actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="rounded-xl px-3 py-2"
            onClick={() => {
              void actions.commitChanges(state.aiCommitMessage || 'auto commit')
            }}
          >
            <GitCommitHorizontal className="size-4" />
            Commit
          </DropdownMenuItem>
          <DropdownMenuItem
            className="rounded-xl px-3 py-2"
            onClick={() => {
              void actions.commitChanges(state.aiCommitMessage || 'auto commit')
            }}
          >
            <CloudUpload className="size-4" />
            Commit + Push
          </DropdownMenuItem>
          <DropdownMenuItem
            className="rounded-xl px-3 py-2"
            onClick={() => {
              void actions.createPullRequest(
                state.aiCommitMessage || 'New PR',
                'Auto-generated PR',
              )
            }}
          >
            <Github className="size-4" />
            Create PR
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
