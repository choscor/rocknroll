import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { useAppStore } from '../../state/app-store-context'
import { OpenWorkspaceButton } from './open-workspace-button'
import { SidebarNav } from './sidebar-nav'
import { WorkspaceList } from './workspace-list'

export const Sidebar = () => {
  const { state } = useAppStore()

  return (
    <aside
      className={cn(
        'relative z-20 hidden h-full shrink-0 border-r border-sidebar-border/70 bg-sidebar text-sidebar-foreground transition-[width] duration-200 md:block',
        'sidebar-gradient',
        state.sidebarCollapsed ? 'w-0 overflow-hidden border-r-0' : 'w-[330px]',
      )}
    >
      <div className="flex h-full flex-col">
        <div
          className="window-drag-region h-[60px] shrink-0 border-b border-sidebar-border/70"
          data-tauri-drag-region
        />

        <div className="space-y-4 px-3 py-3">
          <SidebarNav />
        </div>

        <div className="flex items-center justify-between px-4 py-3">
          <div className="text-xs font-medium tracking-wide text-sidebar-foreground/60">
            Workspaces
          </div>
          <OpenWorkspaceButton />
        </div>

        <ScrollArea className="min-h-0 flex-1 px-2 pb-3">
          <WorkspaceList />
        </ScrollArea>
      </div>
    </aside>
  )
}
