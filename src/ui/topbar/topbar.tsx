import { ThreadHeader } from './thread-header'
import { ActionButtons } from './action-buttons'
import { CommitDropdown } from './commit-dropdown'

export const TopBar = () => {
  return (
    <header
      className="window-drag-region flex h-[60px] items-center justify-between border-b border-border/80 bg-background px-5 select-none"
      data-tauri-drag-region
    >
      <div className="flex min-w-0 flex-1 items-center gap-3" data-tauri-drag-region>
        <ThreadHeader />
      </div>
      <div className="window-no-drag flex items-center gap-2 pl-3" data-no-window-drag>
        <ActionButtons />
        <div className="mx-1 h-6 w-px bg-border/70" aria-hidden />
        <CommitDropdown />
      </div>
    </header>
  )
}
