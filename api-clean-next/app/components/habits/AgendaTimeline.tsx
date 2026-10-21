'use client'

import { BlockLog, BlockStatus, LIFE_AREA_LABEL, ScheduleBlock } from '@/domain/Habit'
import { blockMinutes, formatDuration, minutesOf } from '@/lib/habitDates'
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

// an hour is this tall, so a block's height says how long it is
const PX_PER_MINUTE = 0.8
// shorter blocks still get room for a title; they keep their real start
const MIN_HEIGHT = 40
const GAP = 3
const DAY_END = 24 * 60

const clock = (minutes: number) => `${String(Math.floor(minutes / 60) % 24).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`

interface Placed {
    block: ScheduleBlock
    start: number
    /** where it ends on this day's page: midnight for a block that runs past it */
    end: number
    top: number
    height: number
    lane: number
    lanes: number
}

/**
 * Blocks laid out like a calendar's day: top at the start time, height by length. Blocks that
 * overlap on the page (really, or because a short one was given room for its title) share the
 * width side by side.
 */
function layout(blocks: ScheduleBlock[], from: number): Placed[] {
    const items = blocks
        .map(block => {
            const start = minutesOf(block.startsAt)
            const end = Math.min(DAY_END, start + blockMinutes(block.startsAt, block.endsAt))
            const top = (start - from) * PX_PER_MINUTE
            const height = Math.max(MIN_HEIGHT, (end - start) * PX_PER_MINUTE) - GAP
            return { block, start, end, top, height, lane: 0, lanes: 1 }
        })
        .sort((a, b) => a.top - b.top || b.height - a.height)

    // group blocks whose boxes touch into clusters, then give each a lane within its cluster
    let cluster: Placed[] = []
    let clusterBottom = -Infinity
    const close = () => {
        const laneBottoms: number[] = []
        for (const item of cluster) {
            let lane = laneBottoms.findIndex(bottom => bottom <= item.top)
            if (lane === -1) lane = laneBottoms.length
            laneBottoms[lane] = item.top + item.height + GAP
            item.lane = lane
        }
        for (const item of cluster) item.lanes = laneBottoms.length
    }
    for (const item of items) {
        if (item.top >= clusterBottom && cluster.length) {
            close()
            cluster = []
        }
        cluster.push(item)
        clusterBottom = Math.max(clusterBottom, item.top + item.height + GAP)
    }
    if (cluster.length) close()
    return items
}

/**
 * The day's blocks on a timeline sized to the clock, with hour lines and a line at "now" on
 * today. A block that has started can be marked: each tap moves it along done → partly →
 * missed → unmarked.
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
    const statusOf = (id: string) => logs.find(l => l.blockId === id && l.day === day)?.status

    // from the hour of the first block to the hour after the last one (and now, on today)
    const starts = blocks.map(b => minutesOf(b.startsAt))
    const ends = blocks.map(b => Math.min(DAY_END, minutesOf(b.startsAt) + Math.max(blockMinutes(b.startsAt, b.endsAt), MIN_HEIGHT / PX_PER_MINUTE)))
    const from = Math.floor(Math.min(...starts, ...(isToday ? [nowMinutes] : [])) / 60) * 60
    const to = Math.min(DAY_END, Math.ceil(Math.max(...ends, ...(isToday ? [nowMinutes + 1] : [])) / 60) * 60)
    const hours = Array.from({ length: (to - from) / 60 + 1 }, (_, i) => from + i * 60)
    const placed = layout(blocks, from)
    const showNow = isToday && nowMinutes >= from && nowMinutes <= to

    return (
        <div className="relative" style={{ height: (to - from) * PX_PER_MINUTE + 8 }}>
            {/* hour lines */}
            {hours.map(h => (
                <div key={h} aria-hidden className="absolute inset-x-0 flex items-center" style={{ top: (h - from) * PX_PER_MINUTE }}>
                    <span className="w-11 shrink-0 -translate-y-1/2 pr-2 text-right text-[10px] tabular-nums text-muted-foreground">{clock(h)}</span>
                    <span className="h-px flex-1 -translate-y-1/2 bg-border" />
                </div>
            ))}

            <ol className="absolute inset-y-0 left-12 right-0">
                {placed.map(({ block, start, end, top, height, lane, lanes }) => {
                    const length = blockMinutes(block.startsAt, block.endsAt)
                    const started = !isToday || start <= nowMinutes
                    const live = isToday && start <= nowMinutes && nowMinutes < end
                    const status = statusOf(block.id)
                    const roomy = height >= 52
                    return (
                        <li
                            key={block.id}
                            className={cn(
                                'absolute flex gap-2 overflow-hidden rounded-xl bg-card py-1.5 pl-3 pr-1.5 ring-1',
                                roomy ? 'items-start' : 'items-center',
                                live ? 'ring-[1.5px] ring-chart-1' : 'ring-border',
                            )}
                            style={{ top, height, left: `calc(${(lane / lanes) * 100}% + ${lane ? 2 : 0}px)`, width: `calc(${100 / lanes}% - ${lanes > 1 ? 2 : 0}px)` }}
                        >
                            <span aria-hidden className="absolute inset-y-0 left-0 w-1" style={{ background: `var(--area-${block.area})` }} />
                            <button
                                type="button"
                                onClick={() => onEdit(block)}
                                aria-label={`${block.title}, ${block.startsAt} to ${block.endsAt}, ${formatDuration(length)}, ${LIFE_AREA_LABEL[block.area]}. Edit`}
                                className="min-w-0 flex-1 self-stretch text-left"
                            >
                                <span className="block truncate text-sm font-medium leading-5">{block.title}</span>
                                <span className={cn('block truncate text-xs tabular-nums text-muted-foreground', !roomy && 'sr-only')}>
                                    {block.startsAt}–{block.endsAt} · {formatDuration(length)}{lanes === 1 && ` · ${LIFE_AREA_LABEL[block.area]}`}
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
                    )
                })}
            </ol>

            {showNow && (
                <div aria-hidden className="pointer-events-none absolute inset-x-0 z-10 flex items-center" style={{ top: (nowMinutes - from) * PX_PER_MINUTE }}>
                    <span className="w-11 shrink-0 -translate-y-1/2 pr-2 text-right text-[10px] font-bold tabular-nums text-destructive-text">{clock(nowMinutes)}</span>
                    <span className="relative h-[1.5px] flex-1 -translate-y-1/2 bg-destructive before:absolute before:-left-1 before:-top-0.75 before:size-[7.5px] before:rounded-full before:bg-destructive" />
                </div>
            )}
        </div>
    )
}
