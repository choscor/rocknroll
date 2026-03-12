import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { useAppStore } from '../../state/app-store-context'
import { NewThreadButton } from './new-thread-button'
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
        <div className="space-y-4 px-3 py-3">
          <div className="flex items-center gap-2 px-1">
            <span className="size-2.5 rounded-full bg-[#ff5f57]" />
            <span className="size-2.5 rounded-full bg-[#ffbd2e]" />
            <span className="size-2.5 rounded-full bg-[#28c840]" />
          </div>
          <SidebarNav />
          <NewThreadButton />
        </div>

        <Separator />

        <div className="px-4 py-3">
          <div className="text-xs font-medium tracking-wide text-sidebar-foreground/60">
            Threads
          </div>
        </div>

        <ScrollArea className="min-h-0 flex-1 px-2 pb-3">
          <WorkspaceList />
        </ScrollArea>
      </div>
    </aside>
  )
}
