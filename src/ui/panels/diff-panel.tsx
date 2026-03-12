import { GitCompare, RefreshCw, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useAppStore } from '../../state/app-store-context'
import { getDiffStats, toDiffLines } from '../shared/git-diff'

const lineStyles = {
  added: 'bg-emerald-50 text-emerald-700',
  removed: 'bg-red-50 text-red-700',
  hunk: 'bg-blue-50 text-blue-700',
  meta: 'text-muted-foreground',
  context: 'text-foreground',
} as const

export const DiffPanel = () => {
  const { state, actions } = useAppStore()
  const stats = getDiffStats(state.diff)
  const lines = toDiffLines(state.diff)

  return (
    <aside className="hidden w-[520px] shrink-0 border-l bg-card xl:flex xl:flex-col">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="inline-flex items-center gap-2">
          <GitCompare className="size-4 text-muted-foreground" />
          <span className="text-sm font-semibold">Branch</span>
        </div>
        <div className="inline-flex items-center gap-2">
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            onClick={() => void actions.refreshDiff()}
            title="Refresh diff"
          >
            <RefreshCw className="size-4" />
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            onClick={actions.toggleDiffPanel}
            title="Close diff panel"
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>
      <div className="px-4 pb-3">
        <div className="inline-flex items-center gap-2">
          <Badge variant="outline" className="rounded-md px-2 text-emerald-700">
            +{stats.added}
          </Badge>
          <Badge variant="outline" className="rounded-md px-2 text-red-700">
            -{stats.removed}
          </Badge>
        </div>
      </div>
      <Separator />
      <ScrollArea className="min-h-0 flex-1 p-3">
        {state.diff ? (
          <div className="overflow-x-auto rounded-xl border bg-background">
            <pre className="min-w-full font-mono text-xs leading-6">
              {lines.map((line, index) => (
                <div
                  key={`${line.value}-${index}`}
                  className={cn('px-3', lineStyles[line.type])}
                >
                  {line.value || ' '}
                </div>
              ))}
            </pre>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
            No diff available yet. Open a worktree and refresh the diff.
          </div>
        )}
      </ScrollArea>
    </aside>
  )
}
