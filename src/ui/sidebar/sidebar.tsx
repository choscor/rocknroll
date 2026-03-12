import { useEffect, useRef, useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Settings2 } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAppStore } from '../../state/app-store-context'
import { OpenWorkspaceButton } from './open-workspace-button'
import { WorkspaceList } from './workspace-list'

export const Sidebar = () => {
  const { state } = useAppStore()
  const [sidebarWidth, setSidebarWidth] = useState(330)
  const resizingRef = useRef(false)

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!resizingRef.current) {
        return
      }

      const minWidth = 260
      const maxWidth = 560
      const nextWidth = Math.min(Math.max(event.clientX, minWidth), maxWidth)
      setSidebarWidth(nextWidth)
    }

    const handleMouseUp = () => {
      if (!resizingRef.current) {
        return
      }

      resizingRef.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  return (
    <aside
      className={cn(
        'relative z-20 hidden h-full shrink-0 border-r border-sidebar-border/70 bg-sidebar text-sidebar-foreground transition-[width] duration-200 md:block',
        'sidebar-gradient',
        state.sidebarCollapsed ? 'w-0 overflow-hidden border-r-0' : 'overflow-hidden',
      )}
      style={state.sidebarCollapsed ? undefined : { width: `${sidebarWidth}px` }}
    >
      <div className="flex h-full flex-col">
        <div
          className="window-drag-region h-[52px] shrink-0"
          data-tauri-drag-region
        />

        <div className="flex items-center justify-between px-4 py-3">
          <div className="text-sm font-semibold tracking-wide text-sidebar-foreground">
            Workspaces
          </div>
          <OpenWorkspaceButton />
        </div>

        <ScrollArea className="min-h-0 flex-1 px-2 pb-3">
          <WorkspaceList />
        </ScrollArea>

        <div className="p-3">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                isActive && 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm',
              )
            }
          >
            <Settings2 className="size-4" />
            Settings
          </NavLink>
        </div>
      </div>

      {!state.sidebarCollapsed && (
        <div
          className="absolute bottom-0 right-0 top-0 w-1.5 cursor-col-resize bg-transparent transition-colors hover:bg-blue-400/35"
          onMouseDown={(event) => {
            event.preventDefault()
            resizingRef.current = true
            document.body.style.cursor = 'col-resize'
            document.body.style.userSelect = 'none'
          }}
          aria-label="Resize sidebar"
          role="separator"
        />
      )}
    </aside>
  )
}
