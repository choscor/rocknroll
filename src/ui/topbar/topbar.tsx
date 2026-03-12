import type { MouseEvent } from 'react'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { ThreadHeader } from './thread-header'
import { ActionButtons } from './action-buttons'
import { CommitDropdown } from './commit-dropdown'
import { isTauriRuntime } from '../../infrastructure/tauri/desktop-commands'

const isDoubleClickExcludedTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  return Boolean(
    target.closest(
      '[data-no-window-drag],button,a,input,textarea,select,[role="button"],[role="menuitem"]',
    ),
  )
}

export const TopBar = () => {
  const handleHeaderDoubleClick = (event: MouseEvent<HTMLElement>) => {
    if (
      event.button !== 0 ||
      event.defaultPrevented ||
      !isTauriRuntime() ||
      isDoubleClickExcludedTarget(event.target)
    ) {
      return
    }

    event.preventDefault()
    void getCurrentWindow().toggleMaximize().catch((error) => {
      console.warn('Window maximize toggle failed', error)
    })
  }

  return (
    <header
      className="window-drag-region flex h-[60px] items-center justify-between border-b border-border/80 bg-background px-5 select-none"
      data-tauri-drag-region
      onDoubleClick={handleHeaderDoubleClick}
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
