import { ThreadHeader } from './thread-header'
import { ActionButtons } from './action-buttons'
import { CommitDropdown } from './commit-dropdown'

export const TopBar = () => {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur-md">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <ThreadHeader />
      </div>
      <div className="flex items-center gap-2">
        <ActionButtons />
        <CommitDropdown />
      </div>
    </header>
  )
}
