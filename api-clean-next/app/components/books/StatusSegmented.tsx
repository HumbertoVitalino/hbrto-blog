'use client'

import { motion, useReducedMotion } from 'motion/react'
import { BookStatus } from '@/domain/BookStatus'
import { StatusFilter } from './libraryFilters'
import { cn } from '@/lib/utils'

const OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: BookStatus.InProgress, label: 'Reading' },
  { value: BookStatus.NotStarted, label: 'To read' },
  { value: BookStatus.Completed, label: 'Completed' },
]

/** iOS-style segmented control: one thumb that slides between segments instead of each one lighting up. */
export function StatusSegmented({ value, counts, onChange }: {
  value: StatusFilter
  counts: Record<StatusFilter, number>
  onChange: (value: StatusFilter) => void
}) {
  const reduceMotion = useReducedMotion()

  return (
    <div
      role="group"
      aria-label="Filter by status"
      className="inline-flex max-w-full self-start overflow-x-auto rounded-full bg-muted p-[3px] [scrollbar-width:none]"
    >
      {OPTIONS.map(option => {
        const active = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'relative shrink-0 rounded-full px-3.5 py-1 text-[13px] font-medium leading-6 whitespace-nowrap transition-[color,transform] duration-100 ease-out active:scale-[0.96]',
              active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {active && (
              <motion.span
                layoutId="library-status-thumb"
                aria-hidden
                className="absolute inset-0 rounded-full bg-card shadow-sm ring-1 ring-border"
                // critically damped: it arrives, it doesn't wobble
                transition={reduceMotion ? { duration: 0 } : { type: 'spring', bounce: 0, duration: 0.4 }}
              />
            )}
            <span className="relative">
              {option.label}
              <span className="ml-1.5 tabular-nums opacity-60">{counts[option.value]}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
