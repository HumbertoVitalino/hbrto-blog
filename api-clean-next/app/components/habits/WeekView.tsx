'use client'

import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { AUTO_SOURCE_LABEL, Habit, habitProgress, isHabitDue, LIFE_AREA_LABEL, WeeklyReview } from '@/domain/Habit'
import { addDays, formatDuration, fromDayKey, weekDays } from '@/lib/habitDates'
import { areaScores, createdDay, dayScore, habitsDueOn, indexLogs, logFor, missedTwice, progressOver, scheduleTime, streak } from '@/lib/habitStats'
import type { TrackerData, useHabitTracker } from '@/app/hooks/useHabitTracker'
import { cn } from '@/lib/utils'
import { AreaTag } from './HabitRow'
import { fieldClass } from './FormBits'

type Tracker = ReturnType<typeof useHabitTracker>

const weekdayLong = new Intl.DateTimeFormat('en', { weekday: 'long' })
const weekdayShort = new Intl.DateTimeFormat('en', { weekday: 'short' })
const weekdayNarrow = new Intl.DateTimeFormat('en', { weekday: 'narrow' })
const monthDay = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' })
const pct = (v: number) => `${Math.round(v * 100)}%`

const nowInMinutes = () => {
    const now = new Date()
    return now.getHours() * 60 + now.getMinutes()
}

function weekLabel(start: string) {
    const end = addDays(start, 6)
    const a = fromDayKey(start)
    const b = fromDayKey(end)
    return a.getMonth() === b.getMonth()
        ? `${monthDay.format(a)} – ${b.getDate()}`
        : `${monthDay.format(a)} – ${monthDay.format(b)}`
}

/**
 * The weekly review: how much of what was planned got done, habit by habit and area by area,
 * how the schedule held up, a few things worth noticing, and three questions to answer.
 * Earlier weeks are a step back; the tracker keeps twelve of them.
 */
export function WeekView({ data, tracker, today, currentWeek }: { data: TrackerData; tracker: Tracker; today: string; currentWeek: string }) {
    const [weekStart, setWeekStart] = useState(currentWeek)
    const [nowMinutes, setNowMinutes] = useState(nowInMinutes)

    useEffect(() => {
        const id = setInterval(() => setNowMinutes(nowInMinutes()), 60_000)
        return () => clearInterval(id)
    }, [])

    // the oldest week that still has a week before it loaded, to compare against
    const earliest = addDays(data.from, 7)
    const isCurrent = weekStart === currentWeek
    const index = useMemo(() => indexLogs(data.logs), [data.logs])

    const view = useMemo(() => {
        const days = weekDays(weekStart)
        const lived = days.filter(d => d <= today)
        const before = lived.map(d => addDays(d, -7))
        const week = progressOver(data.habits, index, lived)
        const last = progressOver(data.habits, index, before)
        const planned = lived.filter(d => habitsDueOn(data.habits, d).length > 0)
        const scored = planned.map(d => ({ day: d, score: dayScore(data.habits, index, d) }))
        const best = scored.length > 1 ? scored.reduce((a, b) => (b.score > a.score ? b : a)) : null
        const worst = scored.length > 1 ? scored.reduce((a, b) => (b.score < a.score ? b : a)) : null
        const areas = areaScores(data.habits, index, lived)
        const rated = [...areas].filter((e): e is [Habit['area'], number] => e[1] !== null)
        const weakest = rated.length > 1 ? rated.reduce((a, b) => (b[1] < a[1] ? b : a)) : null
        // habits that existed by the end of the week and were planned on at least one of its days
        const rows = data.habits.filter(h => createdDay(h) <= days[6] && days.some(d => isHabitDue(h, d)))
        return {
            days,
            lived,
            score: week.due ? week.done / week.due : null,
            lastScore: last.due ? last.done / last.due : null,
            best: best && worst && best.score !== worst.score ? best : null,
            worst: best && worst && best.score !== worst.score ? worst : null,
            perfect: scored.filter(s => s.score >= 1).length,
            areas,
            weakest: weakest && weakest[1] < 1 ? weakest[0] : null,
            rows,
        }
    }, [data.habits, index, weekStart, today])

    const time = useMemo(
        () => scheduleTime(data.blocks, data.blockLogs, view.days, today, nowMinutes),
        [data.blocks, data.blockLogs, view.days, today, nowMinutes],
    )

    const facts = useMemo(() => {
        const list: { icon: string; text: React.ReactNode }[] = []
        if (isCurrent) {
            const top = data.habits
                .map(h => ({ h, n: streak(h, index, today) }))
                .reduce<{ h: Habit; n: number } | null>((a, b) => (!a || b.n > a.n ? b : a), null)
            if (top && top.n >= 2) list.push({ icon: '🔥', text: <><b className="font-semibold">{top.h.name}</b> is your longest streak: {top.n} days.</> })
        }
        for (const h of view.rows) {
            const pair = missedTwice(h, index, view.lived)
            if (pair) list.push({
                icon: '⚠️',
                text: <><b className="font-semibold">{h.name}</b> was missed two planned days in a row ({weekdayShort.format(fromDayKey(pair[0]))}, {weekdayShort.format(fromDayKey(pair[1]))}). Never miss twice.</>,
            })
        }
        for (const h of view.rows.filter(r => r.autoSource)) {
            const values = view.lived.map(d => logFor(index, h.id, d)?.value ?? 0)
            const total = values.reduce((a, b) => a + b, 0)
            if (total === 0) continue
            const source = AUTO_SOURCE_LABEL[h.autoSource!]
            list.push({
                icon: '✨',
                text: h.kind === 'qty' && h.autoSource === 'study_focus'
                    ? <><b className="font-semibold">{h.name}</b>: {formatDuration(total)} of focus, logged by {source} on its own.</>
                    : <><b className="font-semibold">{h.name}</b> filled itself in from {source} on {values.filter(v => v > 0).length} {values.filter(v => v > 0).length === 1 ? 'day' : 'days'}.</>,
            })
        }
        if (view.perfect > 0) list.push({ icon: '✅', text: <>{view.perfect} {view.perfect === 1 ? 'day' : 'days'} with every planned habit done.</> })
        return list
    }, [data.habits, index, today, isCurrent, view])

    const delta = view.score !== null && view.lastScore !== null ? Math.round((view.score - view.lastScore) * 100) : null

    return (
        <div className="grid gap-6">
            <div className="flex items-center justify-between gap-3">
                <button
                    type="button"
                    onClick={() => setWeekStart(w => addDays(w, -7))}
                    disabled={weekStart <= earliest}
                    aria-label="Previous week"
                    className="grid size-9 place-items-center rounded-full bg-muted transition-transform duration-100 active:scale-90 disabled:opacity-40"
                >
                    <ChevronLeft className="size-4" />
                </button>
                <div className="text-center">
                    <p className="text-[15px] font-semibold tabular-nums">{weekLabel(weekStart)}</p>
                    <p className="text-xs text-muted-foreground">
                        {isCurrent ? 'This week' : weekStart === addDays(currentWeek, -7) ? 'Last week' : `${Math.round((fromDayKey(currentWeek).getTime() - fromDayKey(weekStart).getTime()) / (7 * 864e5))} weeks ago`}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setWeekStart(w => addDays(w, 7))}
                    disabled={isCurrent}
                    aria-label="Next week"
                    className="grid size-9 place-items-center rounded-full bg-muted transition-transform duration-100 active:scale-90 disabled:opacity-40"
                >
                    <ChevronRight className="size-4" />
                </button>
            </div>

            <section className="raised-card px-5 py-5">
                {view.score === null ? (
                    <p className="text-[15px] font-semibold">No habits planned {isCurrent ? 'this week yet' : 'that week'}.</p>
                ) : (
                    <>
                        <div className="flex flex-wrap items-end gap-x-3.5 gap-y-1">
                            <span className="text-5xl font-semibold leading-none tracking-tighter tabular-nums">{pct(view.score)}</span>
                            {delta !== null && (
                                <span className={cn('pb-1.5 text-[13px] font-semibold tabular-nums', delta < 0 ? 'text-destructive-text' : 'text-success')}>
                                    <span aria-hidden>{delta < 0 ? '▼' : '▲'}</span> {Math.abs(delta)} pts vs the week before
                                </span>
                            )}
                        </div>
                        <p className="mt-3 text-sm text-muted-foreground text-pretty">
                            Of what you planned{isCurrent ? ' so far' : ''}, you did <b className="font-semibold text-foreground">{pct(view.score)}</b>.
                            {view.best && view.worst && (
                                <> Strongest day was <b className="font-semibold text-foreground">{weekdayLong.format(fromDayKey(view.best.day))}</b>, weakest <b className="font-semibold text-foreground">{weekdayLong.format(fromDayKey(view.worst.day))}</b>.</>
                            )}
                            {view.weakest && <> <b className="font-semibold text-foreground">{LIFE_AREA_LABEL[view.weakest]}</b> is the area that slipped most.</>}
                        </p>
                    </>
                )}
            </section>

            {view.rows.length > 0 && (
                <section aria-labelledby="grid-heading">
                    <h2 id="grid-heading" className="mb-2.5 text-sm font-semibold">Every habit, every day</h2>
                    <div className="overflow-x-auto rounded-2xl bg-card px-4 py-3 ring-1 ring-border">
                        <table className="w-full border-separate border-spacing-y-1.5 text-[13px]">
                            <thead>
                                <tr className="text-[11px] text-muted-foreground">
                                    <th scope="col" className="text-left font-semibold"><span className="sr-only">Habit</span></th>
                                    {view.days.map(d => (
                                        <th key={d} scope="col" className={cn('w-7 text-center font-semibold', d === today && 'text-brand-accent')}>
                                            <abbr title={weekdayLong.format(fromDayKey(d))} className="no-underline">{weekdayNarrow.format(fromDayKey(d))}</abbr>
                                        </th>
                                    ))}
                                    <th scope="col" className="w-11 text-right font-semibold">%</th>
                                </tr>
                            </thead>
                            <tbody>
                                {view.rows.map(h => {
                                    let done = 0
                                    let due = 0
                                    return (
                                        <tr key={h.id}>
                                            <th scope="row" className="max-w-36 truncate pr-2 text-left font-normal">{h.name}</th>
                                            {view.days.map(d => {
                                                const planned = d <= today && createdDay(h) <= d && isHabitDue(h, d)
                                                if (!planned) {
                                                    const reason = d > today ? 'Still to come' : 'Not planned'
                                                    return <td key={d} className="text-center"><span title={reason} aria-label={reason} className="inline-block size-4.5 rounded-md ring-1 ring-inset ring-border" /></td>
                                                }
                                                const p = habitProgress(h, logFor(index, h.id, d)?.value)
                                                done += p
                                                due++
                                                const label = p >= 1 ? 'Done' : p > 0 ? 'Partly' : 'Missed'
                                                return (
                                                    <td key={d} className="text-center">
                                                        <span title={label} aria-label={label} className={cn('inline-block size-4.5 rounded-md', p >= 1 ? 'bg-chart-1' : p > 0 ? 'bg-chart-1/40' : 'bg-muted')} />
                                                    </td>
                                                )
                                            })}
                                            <td className="pl-2 text-right font-semibold tabular-nums">{due ? pct(done / due) : '—'}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                    <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5"><span aria-hidden className="size-2.5 rounded-[3px] bg-chart-1" />Done</span>
                        <span className="inline-flex items-center gap-1.5"><span aria-hidden className="size-2.5 rounded-[3px] bg-chart-1/40" />Partly</span>
                        <span className="inline-flex items-center gap-1.5"><span aria-hidden className="size-2.5 rounded-[3px] bg-muted" />Missed</span>
                        <span className="inline-flex items-center gap-1.5"><span aria-hidden className="size-2.5 rounded-[3px] ring-1 ring-inset ring-border" />Not planned</span>
                    </p>
                </section>
            )}

            {view.score !== null && (
                <section aria-labelledby="balance-heading">
                    <h2 id="balance-heading" className="mb-2.5 text-sm font-semibold">Balance</h2>
                    <div className="grid gap-2.5 rounded-2xl bg-card px-5 py-4 ring-1 ring-border">
                        {[...view.areas].map(([area, score]) => (
                            <div key={area} className="grid grid-cols-[6rem_1fr_2.75rem] items-center gap-2.5 text-[13px]">
                                <AreaTag area={area} />
                                <div className="h-2.5 overflow-hidden rounded-full bg-muted" aria-hidden>
                                    {score !== null && <div className="h-full rounded-full bg-chart-1 transition-[width] duration-500 ease-(--ease-ios)" style={{ width: `${score * 100}%` }} />}
                                </div>
                                <span className={cn('text-right tabular-nums', score === null ? 'text-muted-foreground' : 'font-semibold')}>
                                    {score === null ? '—' : pct(score)}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {time.planned > 0 && (
                <section aria-labelledby="time-heading">
                    <h2 id="time-heading" className="mb-2.5 text-sm font-semibold">Schedule: planned vs done</h2>
                    <div className="rounded-2xl bg-card px-5 py-4 ring-1 ring-border">
                        <dl className="grid grid-cols-3 gap-3">
                            {[
                                ['Planned', time.planned],
                                ['Done', time.done],
                                ['Partly', time.partial],
                            ].map(([label, minutes]) => (
                                <div key={label as string}>
                                    <dt className="text-xs text-muted-foreground">{label}</dt>
                                    <dd className="text-xl font-semibold tracking-tight tabular-nums">{formatDuration(minutes as number)}</dd>
                                </div>
                            ))}
                        </dl>
                        {time.unmarked > 0 && (
                            <p className="mt-2 text-xs text-muted-foreground">{formatDuration(time.unmarked)} of blocks weren’t marked. Only blocks that have ended count.</p>
                        )}
                    </div>
                </section>
            )}

            {facts.length > 0 && (
                <section aria-labelledby="facts-heading">
                    <h2 id="facts-heading" className="mb-2.5 text-sm font-semibold">Worth knowing</h2>
                    <ul className="divide-y divide-border rounded-2xl bg-card px-5 py-1 text-sm ring-1 ring-border">
                        {facts.map((f, i) => (
                            <li key={i} className="flex gap-2.5 py-2.5">
                                <span aria-hidden className="w-5.5 shrink-0 text-center">{f.icon}</span>
                                <span className="text-pretty">{f.text}</span>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            <ReviewForm
                key={weekStart}
                weekStart={weekStart}
                saved={data.reviews.find(r => r.weekStart === weekStart)}
                onSave={tracker.saveReview}
            />
        </div>
    )
}

const QUESTIONS: { field: keyof Omit<WeeklyReview, 'weekStart'>; label: string; placeholder: string }[] = [
    { field: 'wentWell', label: 'What went well?', placeholder: 'Wins, however small' },
    { field: 'gotInTheWay', label: 'What got in the way?', placeholder: 'Be specific: when, where, why' },
    { field: 'changeNext', label: 'One thing to change next week', placeholder: 'Small and concrete' },
]

/** The three questions. Each answer saves when you leave its field. */
function ReviewForm({ weekStart, saved, onSave }: { weekStart: string; saved?: WeeklyReview; onSave: (review: WeeklyReview) => Promise<void> }) {
    const empty: WeeklyReview = { weekStart, wentWell: '', gotInTheWay: '', changeNext: '' }
    const [review, setReview] = useState<WeeklyReview>(saved ?? empty)
    const [lastSaved, setLastSaved] = useState<WeeklyReview>(saved ?? empty)
    const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

    const save = async () => {
        if (QUESTIONS.every(q => review[q.field] === lastSaved[q.field])) return
        setStatus('saving')
        try {
            await onSave(review)
            setLastSaved(review)
            setStatus('saved')
        } catch {
            setStatus('error')
        }
    }

    return (
        <section aria-labelledby="review-heading">
            <div className="mb-2.5 flex items-baseline justify-between">
                <h2 id="review-heading" className="text-sm font-semibold">Your review</h2>
                <span role="status" className={cn('text-xs', status === 'error' ? 'text-destructive-text' : 'text-muted-foreground')}>
                    {status === 'saving' ? 'Saving…' : status === 'saved' ? 'Saved' : status === 'error' ? 'Didn’t save. Leave the field to try again.' : ''}
                </span>
            </div>
            <div className="grid gap-4 rounded-2xl bg-card px-5 py-4 ring-1 ring-border">
                {QUESTIONS.map(q => (
                    <label key={q.field} className="grid gap-1.5">
                        <span className="text-[13px] font-semibold">{q.label}</span>
                        <textarea
                            value={review[q.field]}
                            onChange={e => setReview(r => ({ ...r, [q.field]: e.target.value }))}
                            onBlur={save}
                            placeholder={q.placeholder}
                            rows={2}
                            className={cn(fieldClass, 'min-h-16 resize-y')}
                        />
                    </label>
                ))}
            </div>
        </section>
    )
}
