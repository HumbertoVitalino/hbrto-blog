'use client'

import { motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils'

export interface SegmentedOption<T extends string> {
  value: T
  label: string
  /** shown dimmed after the label */
  count?: number
}

/**
 * iOS-style segmented control: one thumb slides between segments instead of each one
 * lighting up. `id` names the thumb, so two controls on one page never trade it.
 */
export function Segmented<T extends string>({ id, label, options, value, onChange, className }: {
  id: string
  label: string
  options: SegmentedOption<T>[]
  value: T
  onChange: (value: T) => void
  className?: string
}) {
  const reduceMotion = useReducedMotion()

  return (
    <div
      role="group"
      aria-label={label}
      className={cn('inline-flex max-w-full self-start overflow-x-auto rounded-full bg-muted p-[3px] [scrollbar-width:none]', className)}
    >
      {options.map(option => {
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
                layoutId={`${id}-thumb`}
                aria-hidden
                className="absolute inset-0 rounded-full bg-card shadow-sm ring-1 ring-border"
                // critically damped: it arrives, it doesn't wobble
                transition={reduceMotion ? { duration: 0 } : { type: 'spring', bounce: 0, duration: 0.4 }}
              />
            )}
            <span className="relative">
              {option.label}
              {option.count !== undefined && <span className="ml-1.5 tabular-nums opacity-60">{option.count}</span>}
            </span>
          </button>
        )
      })}
    </div>
  )
}
