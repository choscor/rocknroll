import { useState, useRef, useEffect } from 'react'
import { ArrowUp, Mic, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { EffortLevel } from '../../domain/contracts'
import { useAppStore } from '../../state/app-store-context'

const models = [
  { id: 'claude-opus-4-6', label: 'Opus 4.6' },
  { id: 'claude-sonnet-4-6', label: 'Sonnet 4.6' },
  { id: 'claude-haiku-4-5-20251001', label: 'Haiku 4.5' },
]

const efforts: EffortLevel[] = ['low', 'medium', 'high', 'extra-high']

export const ChatInput = () => {
  const { state, actions } = useAppStore()
  const [draft, setDraft] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [draft])

  const handleSend = () => {
    const content = draft.trim()
    if (!content || !state.activeThreadId) return
    void actions.sendMessage(state.activeThreadId, content)
    setDraft('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t bg-background px-5 pb-3 pt-4">
      <div className="mx-auto w-full max-w-5xl">
        <div className="rounded-[28px] border border-border/80 bg-card px-4 py-3 shadow-[0_10px_30px_-20px_rgba(0,0,0,0.35)]">
          <div className="flex items-start gap-3">
            <Textarea
              ref={textareaRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                state.activeThreadId
                  ? 'Type a message...'
                  : 'Select a thread to start chatting'
              }
              disabled={!state.activeThreadId}
              rows={1}
              className="max-h-[180px] min-h-[56px] border-0 bg-transparent px-0 py-1 text-base shadow-none focus-visible:ring-0"
            />

            <Button
              type="button"
              onClick={handleSend}
              disabled={!draft.trim() || !state.activeThreadId}
              size="icon"
              className="mt-0.5 size-9 shrink-0 rounded-full bg-black text-white hover:bg-black/85 disabled:bg-muted disabled:text-muted-foreground"
            >
              <ArrowUp className="size-4" />
              <span className="sr-only">Send</span>
            </Button>
          </div>

          <Separator className="my-2 bg-border/70" />

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                className="rounded-lg"
                disabled={!state.activeThreadId}
                title="Add photos & files"
              >
                <Plus className="size-4" />
                <span className="sr-only">Add photos and files</span>
              </Button>

            <Select
              value={state.modelConfig.modelId}
              onValueChange={(value) => {
                if (!value) {
                  return
                }

                const selected = models.find((model) => model.id === value)
                actions.updateModelConfig({
                  ...state.modelConfig,
                  modelId: value,
                  modelDisplayName: selected?.label ?? value,
                })
              }}
            >
              <SelectTrigger size="sm" className="h-8 rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {models.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={state.modelConfig.effort}
              onValueChange={(value) => {
                if (!value) {
                  return
                }

                actions.updateModelConfig({
                  ...state.modelConfig,
                  effort: value as EffortLevel,
                })
              }}
            >
              <SelectTrigger size="sm" className="h-8 rounded-lg capitalize">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {efforts.map((level) => (
                  <SelectItem key={level} value={level} className="capitalize">
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            </div>

            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              className="rounded-full text-muted-foreground"
              title="Voice input"
            >
              <Mic className="size-4" />
              <span className="sr-only">Voice input</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
