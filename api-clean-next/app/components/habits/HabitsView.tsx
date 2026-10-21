'use client'

import { useMemo } from 'react'
import { Habit, habitProgress, isHabitDue } from '@/domain/Habit'
import { addDays, fromDayKey } from '@/lib/habitDates'
import { consistency, createdDay, indexLogs, logFor, streak } from '@/lib/habitStats'
import type { TrackerData, useHabitTracker } from '@/app/hooks/useHabitTracker'
import { cn } from '@/lib/utils'
import { AreaTag } from './HabitRow'
import { GoalsSection } from './GoalsSection'

type Tracker = ReturnType<typeof useHabitTracker>

const WEEKS = 12
const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0]
const WEEKDAY_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const count = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 })
const longDay = new Intl.DateTimeFormat('en', { weekday: 'short', month: 'short', day: 'numeric' })

type Cell = { day: string; state: 'done' | 'partly' | 'missed' | 'off' | 'future' }

function plan(habit: Habit) {
    const days = habit.days ? WEEKDAY_ORDER.filter(d => habit.days!.includes(d)).map(d => WEEKDAY_SHORT[d]).join(' ') : 'Every day'
    return habit.kind === 'qty' ? `${days} · ${count.format(habit.target ?? 0)}${habit.unit ? ` ${habit.unit}` : ''}` : days
}

/**
 * Where I'm going (the goals), then each habit over the last twelve weeks: its streak, how
 * steady it's been, and every day as a square.
 */
export function HabitsView({ data, tracker, today, currentWeek }: { data: TrackerData; tracker: Tracker; today: string; currentWeek: string }) {
    const index = useMemo(() => indexLogs(data.logs), [data.logs])
    const first = addDays(currentWeek, -7 * (WEEKS - 1))

    const cards = useMemo(() => data.habits.map(habit => {
        const created = createdDay(habit)
        const cells: Cell[] = []
        let done = 0
        let due = 0
        for (let i = 0; i < WEEKS * 7; i++) {
            const day = addDays(first, i)
            if (day > today) { cells.push({ day, state: 'future' }); continue }
            if (day < created || !isHabitDue(habit, day)) { cells.push({ day, state: 'off' }); continue }
            const p = habitProgress(habit, logFor(index, habit.id, day)?.value)
            due++
            if (p >= 1) done++
            cells.push({ day, state: p >= 1 ? 'done' : p > 0 ? 'partly' : 'missed' })
        }
        return { habit, cells, done, due, streak: streak(habit, index, today), steady: consistency(habit, index, today) }
    }), [data.habits, index, first, today])

    return (
        <div className="grid grid-cols-1 gap-8">
            <GoalsSection
                goals={data.goals}
                habits={data.habits}
                index={index}
                currentWeek={currentWeek}
                today={today}
                onSave={tracker.saveGoal}
                onArchive={tracker.archiveGoal}
                onProgress={tracker.setGoalProgress}
            />
            <section aria-labelledby="habits-heading" className="grid grid-cols-1 gap-3">
                <h2 id="habits-heading" className="text-sm font-semibold">Habits · last 12 weeks</h2>
                {data.habits.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No habits yet. Add one from Today.</p>}
                {cards.map(({ habit, cells, done, due, streak, steady }) => (
                    <article key={habit.id} className="rounded-2xl bg-card px-5 py-4 ring-1 ring-border">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <h3 className="truncate text-[15px] font-semibold">{habit.name}</h3>
                                <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
                                    <AreaTag area={habit.area} /><span aria-hidden>·</span>{plan(habit)}
                                </p>
                            </div>
                            <dl className="flex shrink-0 gap-4.5 text-right">
                                <div>
                                    <dt className="text-[11px] text-muted-foreground">Streak</dt>
                                    <dd className="text-lg font-semibold tabular-nums">{streak}</dd>
                                </div>
                                <div>
                                    <dt className="text-[11px] text-muted-foreground">30 days</dt>
                                    <dd className="text-lg font-semibold tabular-nums">{steady === null ? '—' : `${Math.round(steady * 100)}%`}</dd>
                                </div>
                            </dl>
                        </div>
                        <div
                            role="img"
                            aria-label={due ? `Done on ${done} of ${due} planned days in the last 12 weeks` : 'Nothing planned in the last 12 weeks'}
                            className="mt-3.5 grid grid-flow-col grid-rows-7 justify-start gap-0.75"
                        >
                            {cells.map(({ day, state }) => (
                                <span
                                    key={day}
                                    title={state === 'future' ? undefined : `${longDay.format(fromDayKey(day))}: ${state === 'off' ? 'not planned' : state}`}
                                    className={cn(
                                        'size-3 rounded-[3px]',
                                        state === 'done' && 'bg-chart-1',
                                        state === 'partly' && 'bg-chart-1/40',
                                        state === 'missed' && 'bg-muted',
                                        state === 'off' && 'ring-1 ring-inset ring-border',
                                        state === 'future' && 'invisible',
                                    )}
                                />
                            ))}
                        </div>
                    </article>
                ))}
            </section>
        </div>
    )
}
