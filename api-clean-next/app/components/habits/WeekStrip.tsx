'use client'

import { fromDayKey } from '@/lib/habitDates'
import { cn } from '@/lib/utils'
import { Ring } from './Ring'

const weekday = new Intl.DateTimeFormat('en', { weekday: 'short' })
const longDay = new Intl.DateTimeFormat('en', { weekday: 'long', month: 'short', day: 'numeric' })

/** The week as seven rings; pick a day to see or fix what was logged on it. */
export function WeekStrip({ days, today, selected, scores, onSelect }: {
    days: string[]
    today: string
    selected: string
    scores: Map<string, number>
    onSelect: (day: string) => void
}) {
    return (
        <div role="group" aria-label="Day of the week" className="grid grid-cols-7 gap-1">
            {days.map(day => {
                const future = day > today
                const score = future ? 0 : scores.get(day) ?? 0
                const active = day === selected
                return (
                    <button
                        key={day}
                        type="button"
                        disabled={future}
                        aria-pressed={active}
                        aria-label={`${longDay.format(fromDayKey(day))}${future ? '' : `, ${Math.round(score * 100)}% done`}`}
                        onClick={() => onSelect(day)}
                        className={cn(
                            'grid justify-items-center gap-1 rounded-2xl py-1.5 transition-[background-color,transform] duration-100 active:scale-[0.96] disabled:opacity-40',
                            active && 'bg-muted',
                        )}
                    >
                        <span className={cn('text-[11px] font-semibold uppercase tracking-wide', day === today ? 'text-brand-accent' : 'text-muted-foreground')}>
                            {weekday.format(fromDayKey(day))}
                        </span>
                        <Ring value={score} size={34} stroke={3.5} trackClassName={active ? 'stroke-card' : 'stroke-muted'}>
                            <span className="text-[13px] font-semibold tabular-nums">{fromDayKey(day).getDate()}</span>
                        </Ring>
                    </button>
                )
            })}
        </div>
    )
}
