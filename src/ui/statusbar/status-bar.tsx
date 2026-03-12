import { Check, ChevronDown, Cloud, GitBranch, Laptop, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAppStore } from '../../state/app-store-context'

export const StatusBar = () => {
  const { state, actions } = useAppStore()

  const activeWorkspace = state.workspaces.find((ws) => ws.id === state.activeWorkspaceId)

  const permissionLabel = state.settings.defaultPermissions === 'ask'
    ? 'Default permissions'
    : state.settings.defaultPermissions === 'auto'
      ? 'Full access'
      : 'Deny by default'

  return (
    <div className="flex items-center justify-between bg-background px-6 py-2 text-xs text-muted-foreground">
      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={(
              <Button
                variant="ghost"
                size="sm"
                className="h-9 rounded-full border border-border/70 bg-muted/50 px-3 text-sm font-normal text-muted-foreground hover:bg-muted"
              />
            )}
          >
            <Laptop className="size-4" />
            {state.settings.executionMode === 'local' ? 'Local' : 'Cloud'}
            <ChevronDown className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-60 rounded-2xl bg-card p-3">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="mb-1 text-base font-medium text-muted-foreground">
                Continue in
              </DropdownMenuLabel>
              <DropdownMenuItem
                className="rounded-xl px-3 py-2 text-base"
                onClick={() =>
                  actions.updateSettings({
                    ...state.settings,
                    executionMode: 'local',
                  })
                }
              >
                <Laptop className="size-4" />
                Local project
                {state.settings.executionMode === 'local' && (
                  <Check className="ml-auto size-4" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="rounded-xl px-3 py-2 text-base"
                onClick={() =>
                  actions.updateSettings({
                    ...state.settings,
                    executionMode: 'remote',
                  })
                }
              >
                <Cloud className="size-4" />
                Cloud
                {state.settings.executionMode === 'remote' && (
                  <Check className="ml-auto size-4" />
                )}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={(
              <Button
                variant="ghost"
                size="sm"
                className="h-9 rounded-full border border-border/70 bg-muted/50 px-3 text-sm font-normal text-muted-foreground hover:bg-muted"
              />
            )}
          >
            <Shield className="size-4" />
            {permissionLabel}
            <ChevronDown className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-64 rounded-2xl bg-card p-2">
            <DropdownMenuGroup>
              <DropdownMenuItem
                className="rounded-xl px-3 py-2 text-base"
                onClick={() =>
                  actions.updateSettings({
                    ...state.settings,
                    defaultPermissions: 'ask',
                  })
                }
              >
                <Shield className="size-4" />
                Default permissions
                {state.settings.defaultPermissions === 'ask' && (
                  <Check className="ml-auto size-4" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="rounded-xl px-3 py-2 text-base"
                onClick={() =>
                  actions.updateSettings({
                    ...state.settings,
                    defaultPermissions: 'auto',
                  })
                }
              >
                <Shield className="size-4" />
                Full access
                {state.settings.defaultPermissions === 'auto' && (
                  <Check className="ml-auto size-4" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="rounded-xl px-3 py-2 text-base"
                onClick={() =>
                  actions.updateSettings({
                    ...state.settings,
                    defaultPermissions: 'deny',
                  })
                }
              >
                <Shield className="size-4" />
                Deny by default
                {state.settings.defaultPermissions === 'deny' && (
                  <Check className="ml-auto size-4" />
                )}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex items-center gap-4 text-sm">
        {activeWorkspace && (
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <GitBranch className="size-4" />
            {activeWorkspace.gitBranch}
          </span>
        )}
        <span className="text-muted-foreground">{state.modelConfig.modelDisplayName}</span>
      </div>
    </div>
  )
}
