'use client'

import { AUTO_SOURCE_LABEL, Habit, habitProgress, LIFE_AREA_LABEL } from '@/domain/Habit'
import { cn } from '@/lib/utils'
import { Minus, Plus } from 'lucide-react'

const count = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 })

export function AreaTag({ area }: { area: Habit['area'] }) {
    return (
        <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="size-1.75 rounded-full" style={{ background: `var(--area-${area})` }} />
            {LIFE_AREA_LABEL[area]}
        </span>
    )
}

/**
 * One habit for one day. A yes/no habit is a single tap; a counted one steps with + and −
 * (or the circle fills it to the target at once). Automatic habits show their value but
 * take no taps: the site fills them in.
 */
export function HabitRow({ habit, value, streak, missedLastTime, onLog, onEdit }: {
    habit: Habit
    value: number
    streak: number
    missedLastTime: boolean
    onLog: (value: number) => void
    onEdit: () => void
}) {
    const progress = habitProgress(habit, value)
    const done = progress >= 1
    const auto = !!habit.autoSource
    const step = habit.step ?? Math.max(1, Math.round((habit.target ?? 1) / 4))

    return (
        <li className="flex min-h-15 items-center gap-3.5 px-4 py-3">
            <button
                type="button"
                disabled={auto}
                aria-pressed={done}
                aria-label={auto ? `${habit.name}: filled in automatically` : done ? `Mark ${habit.name} not done` : `Mark ${habit.name} done`}
                onClick={() => onLog(done ? 0 : habit.kind === 'bool' ? 1 : habit.target ?? 1)}
                className={cn(
                    'grid size-7.5 shrink-0 place-items-center rounded-full transition-[background-color,box-shadow,transform] duration-200 active:scale-90 disabled:cursor-default',
                    done ? 'bg-success' : 'ring-2 ring-inset ring-muted-foreground/45',
                )}
            >
                <svg viewBox="0 0 16 16" fill="none" aria-hidden className={cn('size-3.75 text-white transition-[opacity,transform] duration-300 ease-(--ease-ios)', done ? 'scale-100 opacity-100' : 'scale-60 opacity-0')}>
                    <path d="m3.5 8.5 3 3 6-7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>

            <div className="min-w-0 flex-1">
                <button type="button" onClick={onEdit} className={cn('block max-w-full truncate text-left text-[15px] font-medium leading-snug', done && 'text-muted-foreground')}>
                    {habit.name}
                </button>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-muted-foreground">
                    <AreaTag area={habit.area} />
                    {auto && (
                        <span className="rounded-full bg-chart-1/12 px-1.75 py-px text-[11px] font-semibold text-brand-accent">
                            Auto · {AUTO_SOURCE_LABEL[habit.autoSource!]}
                        </span>
                    )}
                    {streak > 0 && <span className="tabular-nums" aria-label={`${streak} day streak`}>🔥 {streak}</span>}
                    {missedLastTime && !done && <span className="font-medium text-destructive-text">Missed last time</span>}
                </p>
                {habit.kind === 'qty' && (
                    <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted" aria-hidden>
                        <div className={cn('h-full rounded-full transition-[width] duration-400 ease-(--ease-ios)', done ? 'bg-success' : 'bg-chart-1')} style={{ width: `${progress * 100}%` }} />
                    </div>
                )}
            </div>

            {habit.kind === 'qty' && (
                <div className="flex shrink-0 items-center gap-1.5">
                    {!auto && (
                        <button type="button" onClick={() => onLog(Math.max(0, value - step))} disabled={value <= 0} aria-label={`Less ${habit.name}`} className="grid size-7.5 place-items-center rounded-full bg-muted transition-transform duration-100 active:scale-90 disabled:opacity-40">
                            <Minus className="size-3.5" />
                        </button>
                    )}
                    <span className="min-w-16 text-center text-[13px] font-semibold tabular-nums">
                        {count.format(value)}<span className="font-normal text-muted-foreground"> / {count.format(habit.target ?? 0)}{habit.unit ? ` ${habit.unit}` : ''}</span>
                    </span>
                    {!auto && (
                        <button type="button" onClick={() => onLog(value + step)} aria-label={`More ${habit.name}`} className="grid size-7.5 place-items-center rounded-full bg-muted transition-transform duration-100 active:scale-90">
                            <Plus className="size-3.5" />
                        </button>
                    )}
                </div>
            )}
        </li>
    )
}
