'use client'

import { useEffect, useMemo, useState } from 'react'
import { Habit, isBlockOn, ScheduleBlock, TIMES_OF_DAY, TimeOfDay, habitProgress } from '@/domain/Habit'
import { fromDayKey } from '@/lib/habitDates'
import { dayScore, habitsDueOn, indexLogs, logFor, missedLastTime, streak } from '@/lib/habitStats'
import type { TrackerData } from '@/app/hooks/useHabitTracker'
import type { useHabitTracker } from '@/app/hooks/useHabitTracker'
import { Plus } from 'lucide-react'
import { Ring } from './Ring'
import { WeekStrip } from './WeekStrip'
import { HabitRow } from './HabitRow'
import { AgendaTimeline } from './AgendaTimeline'
import { HabitEditor } from './HabitEditor'
import { BlockEditor } from './BlockEditor'

const TIME_LABEL: Record<TimeOfDay, string> = { morning: 'Morning', anytime: 'Anytime', evening: 'Evening' }
const longDay = new Intl.DateTimeFormat('en', { weekday: 'long', month: 'short', day: 'numeric' })

const nowInMinutes = () => {
    const now = new Date()
    return now.getHours() * 60 + now.getMinutes()
}

type Tracker = ReturnType<typeof useHabitTracker>

/** The day: one tap per habit, and the schedule with how each block went. */
export function TodayView({ data, tracker, today, days }: { data: TrackerData; tracker: Tracker; today: string; days: string[] }) {
    const [selected, setSelected] = useState(today)
    const [nowMinutes, setNowMinutes] = useState(nowInMinutes)
    const [editingHabit, setEditingHabit] = useState<Habit | 'new' | null>(null)
    const [editingBlock, setEditingBlock] = useState<ScheduleBlock | 'new' | null>(null)
    const [addOpen, setAddOpen] = useState(false)

    // the "now" line moves with the clock
    useEffect(() => {
        const id = setInterval(() => setNowMinutes(nowInMinutes()), 60_000)
        return () => clearInterval(id)
    }, [])

    const index = useMemo(() => indexLogs(data.logs), [data.logs])
    const scores = useMemo(() => new Map(days.map(d => [d, dayScore(data.habits, index, d)])), [days, data.habits, index])
    const due = useMemo(() => habitsDueOn(data.habits, selected), [data.habits, selected])
    const missed = useMemo(() => (selected === today ? missedLastTime(due, index, today) : new Set<string>()), [due, index, selected, today])
    const blocks = useMemo(() => data.blocks.filter(b => isBlockOn(b, selected)), [data.blocks, selected])

    const doneCount = due.filter(h => habitProgress(h, logFor(index, h.id, selected)?.value) >= 1).length
    const isToday = selected === today

    const summary = due.length === 0
        ? 'Nothing planned this day.'
        : doneCount === due.length
            ? 'Everything done. Nice.'
            : `${due.length - doneCount} ${due.length - doneCount === 1 ? 'habit' : 'habits'} left${isToday ? ' today' : ''}`

    return (
        <div className="grid grid-cols-1 gap-6">
            <WeekStrip days={days} today={today} selected={selected} scores={scores} onSelect={setSelected} />

            <div className="raised-card flex items-center gap-4.5 px-5 py-4.5">
                <Ring value={due.length ? doneCount / due.length : 0} size={64} stroke={7}>
                    <span className="text-[15px] font-semibold tabular-nums">{doneCount}/{due.length}</span>
                </Ring>
                <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-semibold">{summary}</p>
                    <p className="text-[13px] text-muted-foreground">
                        {isToday
                            ? missed.size > 0 ? `${missed.size} missed last time. Don’t miss twice.` : longDay.format(fromDayKey(selected))
                            : longDay.format(fromDayKey(selected))}
                    </p>
                </div>
                <div className="relative">
                    <button
                        type="button"
                        aria-label="Add"
                        aria-expanded={addOpen}
                        onClick={() => setAddOpen(o => !o)}
                        className="grid size-10 place-items-center rounded-full bg-primary text-primary-foreground transition-transform duration-100 active:scale-90"
                    >
                        <Plus className="size-5" />
                    </button>
                    {addOpen && (
                        <div className="absolute right-0 top-12 z-20 grid w-44 overflow-hidden rounded-2xl bg-popover p-1 shadow-xl ring-1 ring-border">
                            <button type="button" onClick={() => { setAddOpen(false); setEditingHabit('new') }} className="rounded-xl px-3 py-2.5 text-left text-sm font-medium hover:bg-muted">New habit</button>
                            <button type="button" onClick={() => { setAddOpen(false); setEditingBlock('new') }} className="rounded-xl px-3 py-2.5 text-left text-sm font-medium hover:bg-muted">New time block</button>
                        </div>
                    )}
                </div>
            </div>

            {data.habits.length === 0 ? (
                <div className="rounded-2xl px-5 py-8 text-center ring-1 ring-border">
                    <p className="text-[15px] font-semibold">Start with one habit</p>
                    <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">Pick something small enough that you can’t say no to it. Two minutes counts.</p>
                    <button type="button" onClick={() => setEditingHabit('new')} className="mt-4 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground active:scale-[0.97]">
                        Add a habit
                    </button>
                </div>
            ) : (
                TIMES_OF_DAY.map(time => {
                    const group = due.filter(h => h.timeOfDay === time)
                    if (group.length === 0) return null
                    return (
                        <section key={time} aria-labelledby={`habits-${time}`}>
                            <h2 id={`habits-${time}`} className="mb-1.5 text-[13px] font-semibold text-muted-foreground">{TIME_LABEL[time]}</h2>
                            <ul className="divide-y divide-border overflow-hidden rounded-2xl bg-card ring-1 ring-border">
                                {group.map(h => (
                                    <HabitRow
                                        key={h.id}
                                        habit={h}
                                        value={logFor(index, h.id, selected)?.value ?? 0}
                                        streak={streak(h, index, today)}
                                        missedLastTime={missed.has(h.id)}
                                        onLog={value => tracker.logHabit(h.id, selected, value)}
                                        onEdit={() => setEditingHabit(h)}
                                    />
                                ))}
                            </ul>
                        </section>
                    )
                })
            )}

            <section aria-labelledby="schedule-heading" className="mt-2">
                <div className="mb-2.5 flex items-baseline justify-between">
                    <h2 id="schedule-heading" className="text-[13px] font-semibold text-muted-foreground">Schedule</h2>
                    {blocks.length > 0 && (
                        <span className="text-xs tabular-nums text-muted-foreground">
                            {blocks.length} {blocks.length === 1 ? 'block' : 'blocks'}
                        </span>
                    )}
                </div>
                {blocks.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        Nothing scheduled.{' '}
                        <button type="button" onClick={() => setEditingBlock('new')} className="font-medium text-brand-accent hover:underline">Plan a block</button>
                    </p>
                ) : (
                    <AgendaTimeline
                        blocks={blocks}
                        logs={data.blockLogs}
                        day={selected}
                        isToday={isToday}
                        nowMinutes={nowMinutes}
                        onLog={(blockId, status) => tracker.logBlock(blockId, selected, status)}
                        onEdit={block => setEditingBlock(block)}
                    />
                )}
            </section>

            <HabitEditor
                open={editingHabit !== null}
                habit={editingHabit === 'new' || editingHabit === null ? undefined : editingHabit}
                onOpenChange={open => !open && setEditingHabit(null)}
                onSave={tracker.saveHabit}
                onArchive={tracker.archiveHabit}
            />
            <BlockEditor
                open={editingBlock !== null}
                block={editingBlock === 'new' || editingBlock === null ? undefined : editingBlock}
                defaultDay={selected}
                onOpenChange={open => !open && setEditingBlock(null)}
                onSave={tracker.saveBlock}
                onArchive={tracker.archiveBlock}
            />
        </div>
    )
}

