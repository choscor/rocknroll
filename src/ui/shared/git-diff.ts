export interface DiffStats {
  added: number
  removed: number
}

export const getDiffStats = (diff: string): DiffStats => {
  if (!diff.trim()) {
    return { added: 0, removed: 0 }
  }

  return diff.split('\n').reduce<DiffStats>(
    (stats, line) => {
      if (line.startsWith('+++') || line.startsWith('---')) {
        return stats
      }

      if (line.startsWith('+')) {
        return { ...stats, added: stats.added + 1 }
      }

      if (line.startsWith('-')) {
        return { ...stats, removed: stats.removed + 1 }
      }

      return stats
    },
    { added: 0, removed: 0 },
  )
}

export type DiffLineType =
  | 'added'
  | 'removed'
  | 'hunk'
  | 'meta'
  | 'context'

export interface DiffLine {
  type: DiffLineType
  value: string
}

export const toDiffLines = (diff: string): DiffLine[] => {
  return diff.split('\n').map((line) => {
    if (line.startsWith('+++') || line.startsWith('---') || line.startsWith('diff --git') || line.startsWith('index ')) {
      return { type: 'meta' as const, value: line }
    }

    if (line.startsWith('@@')) {
      return { type: 'hunk' as const, value: line }
    }

    if (line.startsWith('+')) {
      return { type: 'added' as const, value: line }
    }

    if (line.startsWith('-')) {
      return { type: 'removed' as const, value: line }
    }

    return { type: 'context' as const, value: line }
  })
}
