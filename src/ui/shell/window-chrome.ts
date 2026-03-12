import type { MouseEvent } from 'react'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { isTauriRuntime } from '../../infrastructure/tauri/desktop-commands'

const NON_DRAG_SELECTOR = [
  '[data-no-window-drag]',
  'button',
  'a',
  'input',
  'textarea',
  'select',
  '[role="button"]',
  '[role="menuitem"]',
  '[contenteditable="true"]',
].join(',')

const isDragExcludedTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  return Boolean(target.closest(NON_DRAG_SELECTOR))
}

export const handleWindowChromeMouseDown = (event: MouseEvent<HTMLElement>) => {
  if (
    event.button !== 0 ||
    event.defaultPrevented ||
    !isTauriRuntime() ||
    isDragExcludedTarget(event.target)
  ) {
    return
  }

  event.preventDefault()
  void getCurrentWindow().startDragging()
}

export const handleWindowChromeDoubleClick = (event: MouseEvent<HTMLElement>) => {
  if (
    event.button !== 0 ||
    event.defaultPrevented ||
    !isTauriRuntime() ||
    isDragExcludedTarget(event.target)
  ) {
    return
  }

  event.preventDefault()
  void getCurrentWindow().toggleMaximize()
}
