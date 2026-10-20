'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import type { NoteSubjectKind } from '@/domain/Note'
import { cn } from '@/lib/utils'

export interface ArchiveRow {
  id: string
  title: string
  iso: string
  /** "Oct 14" */
  day: string
  year: number
  excerpt: string
  cites: { kind: NoteSubjectKind; title: string; byline?: string }[]
}

type Filter = 'all' | NoteSubjectKind | 'none'

const FILTER_LABEL: Record<Filter, string> = {
  all: 'All',
  book: 'Books',
  game: 'Games',
  none: 'Other',
}

function matches(row: ArchiveRow, filter: Filter) {
  if (filter === 'all') return true
  if (filter === 'none') return row.cites.length === 0
  return row.cites.some(c => c.kind === filter)
}

export function Cites({ cites, className }: { cites: ArchiveRow['cites']; className?: string }) {
  if (cites.length === 0) return null
  return (
    <p className={cn('text-[13px] leading-5 text-muted-foreground', className)}>
      On{' '}
      {cites.map((c, i) => (
        <span key={`${c.kind}-${c.title}`}>
          {i > 0 && (i === cites.length - 1 ? ' and ' : ', ')}
          <span className="font-medium text-foreground">{c.title}</span>
          {c.byline && <> · {c.byline}</>}
        </span>
      ))}
    </p>
  )
}

export function NotesArchive({ rows }: { rows: ArchiveRow[] }) {
  const [filter, setFilter] = useState<Filter>('all')

  const counts = useMemo(() => {
    const out: Record<Filter, number> = { all: rows.length, book: 0, game: 0, none: 0 }
    for (const row of rows) {
      for (const f of ['book', 'game', 'none'] as const) if (matches(row, f)) out[f]++
    }
    return out
  }, [rows])

  // only offer filters that would show something, and only when there is a choice to make
  const filters = (Object.keys(FILTER_LABEL) as Filter[]).filter(f => f === 'all' || counts[f] > 0)

  const years = useMemo(() => {
    const map = new Map<number, ArchiveRow[]>()
    for (const row of rows) {
      if (!matches(row, filter)) continue
      if (!map.has(row.year)) map.set(row.year, [])
      map.get(row.year)!.push(row)
    }
    return Array.from(map, ([year, rows]) => ({ year, rows }))
  }, [rows, filter])

  return (
    <section aria-labelledby="archive-heading" className="mt-28">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 id="archive-heading" className="text-sm font-semibold">Archive</h2>
        {filters.length > 2 && (
          <div role="group" aria-label="Filter notes" className="flex flex-wrap gap-1">
            {filters.map(f => (
              <button
                key={f}
                type="button"
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
                className={cn(
                  'rounded-full px-3 py-1 text-[13px] font-medium leading-6 transition-colors',
                  filter === f
                    ? 'bg-muted text-foreground ring-1 ring-inset ring-border'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                {FILTER_LABEL[f]}
                <span className="ml-1 tabular-nums opacity-70">{counts[f]}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {years.length === 0 && <p className="mt-12 text-sm text-muted-foreground">No notes here yet.</p>}

      {years.map(({ year, rows }) => (
        <div key={year} className="mt-12 md:grid md:grid-cols-[7rem_1fr] md:gap-x-8">
          <h3 className="mb-8 text-sm font-semibold tabular-nums text-muted-foreground md:mb-0 md:pt-0.5">{year}</h3>
          <ol className="flex flex-col gap-14 md:border-l md:border-border md:pl-8">
            {rows.map(row => (
              <li key={row.id} className="hover-surface flex flex-col items-start">
                <h4 className="text-base font-semibold tracking-tight text-balance">
                  <Link href={`/notes/${row.id}`} className="stretched-link">{row.title}</Link>
                </h4>
                <time dateTime={row.iso} className="order-first mb-3 text-sm text-muted-foreground">{row.day}</time>
                <p className="mt-2 text-sm text-muted-foreground text-pretty">{row.excerpt}</p>
                <Cites cites={row.cites} className="mt-3" />
              </li>
            ))}
          </ol>
        </div>
      ))}
    </section>
  )
}
