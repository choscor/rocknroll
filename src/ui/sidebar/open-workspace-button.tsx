import { useState } from 'react'
import { FolderOpen, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { desktopCommands } from '../../infrastructure/tauri/desktop-commands'
import { useAppStore } from '../../state/app-store-context'

const baseNameFromPath = (path: string): string => {
  const normalized = path.trim().replace(/\/+$/, '')
  if (!normalized) {
    return ''
  }

  const segments = normalized.split(/[\\/]/).filter(Boolean)
  return segments[segments.length - 1] || ''
}

export const OpenWorkspaceButton = () => {
  const { actions } = useAppStore()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [path, setPath] = useState('')
  const [loading, setLoading] = useState(false)
  const [nameEdited, setNameEdited] = useState(false)

  const handlePickFolder = async () => {
    setLoading(true)
    const result = await desktopCommands.pickFolder()
    setLoading(false)

    if (!result.ok || !result.data.path) {
      return
    }

    setPath(result.data.path)
    const inferredName = baseNameFromPath(result.data.path)
    if (inferredName && !nameEdited) {
      setName(inferredName)
    }
  }

  const handleCreate = () => {
    if (!path.trim()) {
      return
    }

    const nextName = name.trim() || baseNameFromPath(path)
    if (!nextName) {
      return
    }

    void actions.createWorkspace(nextName, path.trim())
    setOpen(false)
    setName('')
    setPath('')
    setNameEdited(false)
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) {
          setName('')
          setPath('')
          setNameEdited(false)
        }
      }}
    >
      <SheetTrigger
        render={
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            className="rounded-lg"
            aria-label="Open workspace"
            title="Open workspace"
          />
        }
      >
        <FolderOpen className="size-4" />
      </SheetTrigger>

      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Open Workspace</SheetTitle>
          <SheetDescription>
            Pick a folder, confirm workspace name, then add it to the sidebar.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 px-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Folder path</div>
            <div className="flex items-center gap-2">
              <Input
                value={path}
                onChange={(event) => {
                  const nextPath = event.target.value
                  setPath(nextPath)
                  if (!nameEdited) {
                    setName(baseNameFromPath(nextPath))
                  }
                }}
                placeholder="/Users/you/project"
                aria-label="Workspace folder path"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => void handlePickFolder()}
                disabled={loading}
              >
                Browse
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Workspace name</div>
            <Input
              value={name}
              onChange={(event) => {
                setName(event.target.value)
                setNameEdited(true)
              }}
              placeholder="project"
              aria-label="Workspace name"
            />
          </div>
        </div>

        <SheetFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleCreate}
            disabled={!path.trim() || !(name.trim() || baseNameFromPath(path))}
          >
            <Plus className="size-3.5" />
            Add workspace
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
