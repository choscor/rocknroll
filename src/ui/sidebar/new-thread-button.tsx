import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppStore } from '../../state/app-store-context'

export const NewThreadButton = () => {
  const { state, actions } = useAppStore()
  const [showInput, setShowInput] = useState(false)
  const [title, setTitle] = useState('')

  const handleCreate = () => {
    if (!state.activeWorkspaceId || !title.trim()) return
    void actions.createThread(state.activeWorkspaceId, title.trim())
    setTitle('')
    setShowInput(false)
  }

  if (showInput) {
    return (
      <div className="grid gap-2 px-1">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleCreate()
            if (e.key === 'Escape') setShowInput(false)
          }}
          placeholder="Thread title..."
          autoFocus
          className="h-9 bg-background/70"
        />
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            onClick={handleCreate}
            disabled={!title.trim() || !state.activeWorkspaceId}
          >
            Create
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => setShowInput(false)}>
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="px-1">
      <Button
        type="button"
        onClick={() => setShowInput(true)}
        disabled={!state.activeWorkspaceId}
        className="h-9 w-full justify-start rounded-xl bg-sidebar-primary px-3 text-sidebar-primary-foreground shadow-sm hover:bg-sidebar-primary/90"
      >
        + New thread
      </Button>
    </div>
  )
}
