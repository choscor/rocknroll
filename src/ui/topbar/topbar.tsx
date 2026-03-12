import { PanelLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '../../state/app-store-context'
import { ThreadHeader } from './thread-header'
import { ActionButtons } from './action-buttons'
import { CommitDropdown } from './commit-dropdown'

export const TopBar = () => {
  const { actions } = useAppStore()

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur-md">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-9 rounded-xl"
          onClick={actions.toggleSidebar}
          title="Toggle sidebar"
        >
          <PanelLeft className="size-4" />
        </Button>
        <ThreadHeader />
      </div>
      <div className="flex items-center gap-2">
        <ActionButtons />
        <CommitDropdown />
      </div>
    </header>
  )
}
