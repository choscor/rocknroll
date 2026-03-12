import { useState } from 'react'
import { ArrowUp, Check, ChevronDown, Cpu, Gauge, Mic, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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

  const selectorTriggerClass =
    'h-9 rounded-full border border-border/70 bg-muted/50 px-3 text-sm font-normal text-muted-foreground hover:bg-muted data-[popup-open]:bg-muted'

  const selectedModel =
    models.find((model) => model.id === state.modelConfig.modelId)?.label ??
    state.modelConfig.modelDisplayName

  const formatEffort = (level: EffortLevel) =>
    level
      .split('-')
      .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
      .join(' ')

  return (
    <div className="bg-background px-5 pb-3 pt-4">
      <div className="mx-auto w-full max-w-5xl lg:max-w-[80%]">
        <div className="rounded-[28px] border border-border/80 bg-card px-4 py-3 shadow-[0_10px_30px_-20px_rgba(0,0,0,0.35)]">
          <div className="flex items-start">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                state.activeThreadId
                  ? 'Type a message...'
                  : 'Select a thread to start chatting'
              }
              disabled={!state.activeThreadId}
              rows={2}
              className="field-sizing-fixed min-h-[68px] resize-none border-0 bg-transparent px-1 py-2 text-base shadow-none placeholder:text-muted-foreground/80 focus-visible:ring-0 disabled:bg-transparent disabled:opacity-100"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                size="icon-lg"
                variant="ghost"
                className="rounded-full"
                disabled={!state.activeThreadId}
                title="Add photos & files"
              >
                <Plus className="size-5" />
                <span className="sr-only">Add photos and files</span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger
                  render={(
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className={selectorTriggerClass}
                    />
                  )}
                >
                  <Cpu className="size-4" />
                  {selectedModel}
                  <ChevronDown className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="min-w-64 rounded-2xl bg-card p-2">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="mb-1 text-base font-medium text-muted-foreground">
                      Choose model
                    </DropdownMenuLabel>
                    {models.map((model) => (
                      <DropdownMenuItem
                        key={model.id}
                        className="rounded-xl px-3 py-2 text-base"
                        onClick={() =>
                          actions.updateModelConfig({
                            ...state.modelConfig,
                            modelId: model.id,
                            modelDisplayName: model.label,
                          })
                        }
                      >
                        <Cpu className="size-4" />
                        {model.label}
                        {state.modelConfig.modelId === model.id && (
                          <Check className="ml-auto size-4" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger
                  render={(
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className={selectorTriggerClass}
                    />
                  )}
                >
                  <Gauge className="size-4" />
                  {formatEffort(state.modelConfig.effort)}
                  <ChevronDown className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="min-w-64 rounded-2xl bg-card p-2">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="mb-1 text-base font-medium text-muted-foreground">
                      Choose effort
                    </DropdownMenuLabel>
                    {efforts.map((level) => (
                      <DropdownMenuItem
                        key={level}
                        className="rounded-xl px-3 py-2 text-base"
                        onClick={() =>
                          actions.updateModelConfig({
                            ...state.modelConfig,
                            effort: level,
                          })
                        }
                      >
                        <Gauge className="size-4" />
                        {formatEffort(level)}
                        {state.modelConfig.effort === level && (
                          <Check className="ml-auto size-4" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center gap-1">
              <Button
                type="button"
                size="icon-lg"
                variant="ghost"
                className="rounded-full text-muted-foreground"
                title="Voice input"
              >
                <Mic className="size-5" />
                <span className="sr-only">Voice input</span>
              </Button>
              <Button
                type="button"
                onClick={handleSend}
                disabled={!draft.trim() || !state.activeThreadId}
                size="icon-lg"
                className="rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-muted disabled:text-muted-foreground"
              >
                <ArrowUp className="size-5" />
                <span className="sr-only">Send</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
