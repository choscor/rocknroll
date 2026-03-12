import { useState } from 'react'
import { FolderOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { desktopCommands } from '../../infrastructure/tauri/desktop-commands'
import { useAppStore } from '../../state/app-store-context'

const baseNameFromPath = (path: string): string => {
  const normalized = path.trim().replace(/[\\/]+$/, '')
  if (!normalized) {
    return ''
  }

  const segments = normalized.split(/[\\/]/).filter(Boolean)
  return segments[segments.length - 1] || ''
}

export const OpenWorkspaceButton = () => {
  const { actions } = useAppStore()
  const [loading, setLoading] = useState(false)

  const handleOpenWorkspace = async () => {
    setLoading(true)
    const result = await desktopCommands.pickFolder()
    setLoading(false)

    if (!result.ok || !result.data.path) {
      return
    }

    const path = result.data.path.trim()
    if (!path) {
      return
    }

    const name = baseNameFromPath(path)
    if (!name) {
      return
    }

    void actions.createWorkspace(name, path)
  }

  return (
    <Button
      type="button"
      size="icon-sm"
      variant="ghost"
      className="rounded-lg"
      aria-label="Open workspace"
      title="Open workspace"
      onClick={() => void handleOpenWorkspace()}
      disabled={loading}
    >
      <FolderOpen className="size-4" />
    </Button>
  )
}
