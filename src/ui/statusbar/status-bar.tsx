import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppStore } from '../../state/app-store-context'

export const StatusBar = () => {
  const { state, actions } = useAppStore()

  const activeWorkspace = state.workspaces.find((ws) => ws.id === state.activeWorkspaceId)

  return (
    <div className="flex items-center justify-between border-t bg-background px-6 py-2 text-xs text-muted-foreground">
      <div className="flex items-center gap-3">
        <Select
          value={state.settings.executionMode}
          onValueChange={(value) => {
            if (!value) {
              return
            }

            actions.updateSettings({
              ...state.settings,
              executionMode: value as 'local' | 'remote',
            })
          }}
        >
          <SelectTrigger size="sm" className="h-7 rounded-lg">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="local">Local</SelectItem>
            <SelectItem value="remote">Remote</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="outline" className="h-6 rounded-md px-2">
          Permissions: {state.settings.defaultPermissions}
        </Badge>
      </div>
      <div className="flex items-center gap-3">
        {activeWorkspace && (
          <span className="font-medium">⎇ {activeWorkspace.gitBranch}</span>
        )}
        <span>{state.modelConfig.modelDisplayName}</span>
      </div>
    </div>
  )
}
