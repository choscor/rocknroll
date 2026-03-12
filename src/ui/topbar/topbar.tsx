import { ThreadHeader } from './thread-header'
import { ActionButtons } from './action-buttons'
import { CommitDropdown } from './commit-dropdown'

export const TopBar = () => {
  return (
    <header
      className="window-drag-region flex h-[52px] items-center justify-between border-b border-border/80 bg-background px-4 select-none"
      data-tauri-drag-region
    >
      <div className="flex min-w-0 flex-1 items-center gap-2.5" data-tauri-drag-region>
        <ThreadHeader />
      </div>
      <div className="window-no-drag flex items-center gap-1.5 pl-2" data-no-window-drag>
        <ActionButtons />
        <div className="mx-1 h-5 w-px bg-border/70" aria-hidden />
        <CommitDropdown />
      </div>
    </header>
  )
}
