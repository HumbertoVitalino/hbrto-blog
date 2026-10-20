'use client'

import { Fragment } from 'react'
import { BlockLog, BlockStatus, LIFE_AREA_LABEL, ScheduleBlock } from '@/domain/Habit'
import { minutesOf } from '@/lib/habitDates'
import { cn } from '@/lib/utils'

const NEXT_STATUS: Record<BlockStatus | 'none', BlockStatus | null> = {
    none: 'done',
    done: 'partial',
    partial: 'missed',
    missed: null,
}

const STATUS_LABEL: Record<BlockStatus, string> = { done: 'Done', partial: 'Partly', missed: 'Missed' }

const STATUS_STYLE: Record<BlockStatus, string> = {
    done: 'bg-success/15 text-success',
    partial: 'bg-warning/15 text-warning-foreground dark:text-warning',
    missed: 'bg-destructive/12 text-destructive-text',
}

/** The red line at the current time. */
function NowLine({ label }: { label: string }) {
    return (
        <li aria-hidden className="relative my-1 mb-2.5 border-t-[1.5px] border-destructive">
            <span className="absolute -left-13 -top-2.5 w-8.5 text-right text-[10px] font-bold text-destructive-text">{label}</span>
        </li>
    )
}

/**
 * The day's blocks on a timeline, with a line at "now" on today. A block that has started can be
 * marked: each tap moves it along done → partly → missed → unmarked.
 */
export function AgendaTimeline({ blocks, logs, day, isToday, nowMinutes, onLog, onEdit }: {
    blocks: ScheduleBlock[]
    logs: BlockLog[]
    day: string
    isToday: boolean
    nowMinutes: number
    onLog: (blockId: string, status: BlockStatus | null) => void
    onEdit: (block: ScheduleBlock) => void
}) {
    const sorted = [...blocks].sort((a, b) => minutesOf(a.startsAt) - minutesOf(b.startsAt))
    const statusOf = (id: string) => logs.find(l => l.blockId === id && l.day === day)?.status
    const nowIndex = isToday ? sorted.findIndex(b => minutesOf(b.startsAt) > nowMinutes) : -1
    const nowLabel = `${String(Math.floor(nowMinutes / 60)).padStart(2, '0')}:${String(nowMinutes % 60).padStart(2, '0')}`

    return (
        <ol className="relative pl-13 before:absolute before:bottom-1 before:left-11 before:top-1 before:w-px before:bg-border">
            {sorted.map((block, i) => {
                const start = minutesOf(block.startsAt)
                const end = minutesOf(block.endsAt) > start ? minutesOf(block.endsAt) : 24 * 60
                const started = !isToday || start <= nowMinutes
                const live = isToday && start <= nowMinutes && nowMinutes < end
                const status = statusOf(block.id)
                return (
                    <Fragment key={block.id}>
                        {i === nowIndex && <NowLine label={nowLabel} />}
                        <li className={cn('relative mb-2 flex items-center gap-2.5 rounded-xl bg-card px-3 py-2.5 ring-1', live ? 'ring-[1.5px] ring-chart-1' : 'ring-border')}>
                            <span aria-hidden className="absolute -left-3.25 top-4 size-2.25 rounded-full shadow-[0_0_0_3px_var(--card)]" style={{ background: `var(--area-${block.area})` }} />
                            <span className="absolute -left-13 top-2.5 w-8.5 text-right text-[11px] tabular-nums text-muted-foreground">{block.startsAt}</span>
                            <button type="button" onClick={() => onEdit(block)} className="min-w-0 flex-1 text-left">
                                <span className="block truncate text-sm font-medium">{block.title}</span>
                                <span className="block text-xs tabular-nums text-muted-foreground">
                                    {block.startsAt}–{block.endsAt} · {LIFE_AREA_LABEL[block.area]}
                                </span>
                            </button>
                            {started && (
                                <button
                                    type="button"
                                    onClick={() => onLog(block.id, NEXT_STATUS[status ?? 'none'])}
                                    aria-label={`${block.title}: ${status ? STATUS_LABEL[status] : 'not marked'}. Change`}
                                    className={cn(
                                        'shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-transform duration-100 active:scale-95',
                                        status ? STATUS_STYLE[status] : live ? 'bg-chart-1/12 text-brand-accent' : 'bg-muted text-muted-foreground',
                                    )}
                                >
                                    {status ? STATUS_LABEL[status] : live ? 'Now' : 'Mark'}
                                </button>
                            )}
                        </li>
                    </Fragment>
                )
            })}
            {isToday && nowIndex === -1 && sorted.length > 0 && <NowLine label={nowLabel} />}
        </ol>
    )
}
