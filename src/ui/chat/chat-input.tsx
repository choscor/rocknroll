import { useState, useRef, useEffect } from 'react'
import { ArrowUp, Cpu, Gauge, Mic, Plus } from 'lucide-react'
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

  const selectTriggerClass =
    'h-9 rounded-full border border-border/70 bg-muted/50 px-3 text-sm font-normal text-muted-foreground hover:bg-muted data-[popup-open]:bg-muted'

  return (
    <div className="border-t bg-background px-5 pb-3 pt-4">
      <div className="mx-auto w-full max-w-5xl">
        <div className="rounded-[28px] border border-blue-200/80 bg-[linear-gradient(180deg,rgba(235,245,255,0.95),rgba(221,236,255,0.95))] px-4 py-3 shadow-[0_10px_30px_-20px_rgba(29,78,216,0.35)]">
          <div className="flex items-start">
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
              className="max-h-[180px] min-h-[56px] border-0 bg-transparent px-0 py-1 text-base shadow-none placeholder:text-muted-foreground/80 focus-visible:ring-0 disabled:bg-transparent disabled:opacity-100"
            />
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
                <SelectTrigger size="sm" className={selectTriggerClass}>
                  <Cpu className="size-4" />
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
                <SelectTrigger size="sm" className={`${selectTriggerClass} capitalize`}>
                  <Gauge className="size-4" />
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

            <div className="flex items-center gap-1">
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
              <Button
                type="button"
                onClick={handleSend}
                disabled={!draft.trim() || !state.activeThreadId}
                size="icon-sm"
                className="rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-muted disabled:text-muted-foreground"
              >
                <ArrowUp className="size-4" />
                <span className="sr-only">Send</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
