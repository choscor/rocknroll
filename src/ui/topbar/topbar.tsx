import { ThreadHeader } from './thread-header'
import { ActionButtons } from './action-buttons'
import { CommitDropdown } from './commit-dropdown'
import {
  handleWindowChromeDoubleClick,
  handleWindowChromeMouseDown,
} from '../shell/window-chrome'

export const TopBar = () => {
  return (
    <header
      className="flex h-[60px] items-center justify-between border-b border-border/80 bg-background px-5 select-none"
      onMouseDown={handleWindowChromeMouseDown}
      onDoubleClick={handleWindowChromeDoubleClick}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <ThreadHeader />
      </div>
      <div className="flex items-center gap-2 pl-3" data-no-window-drag>
        <ActionButtons />
        <div className="mx-1 h-6 w-px bg-border/70" aria-hidden />
        <CommitDropdown />
      </div>
    </header>
  )
}
