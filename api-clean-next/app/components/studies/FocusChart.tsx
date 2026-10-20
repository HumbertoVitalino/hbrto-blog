'use client'

import { useMemo } from 'react'
import { StudySessionData } from '@/app/hooks/useStudySessions'
import { ActivityPeriod, dayKey, focusSessions, formatMinutes } from '@/lib/studyStats'

const dayLabel = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' })

/**
 * Daily focus as bars, the way Screen Time shows a week: totals on top, one bar per day,
 * a dashed line at the average study day. An empty window says when the last session was.
 */
export function FocusChart({ sessions, period }: { sessions: StudySessionData[]; period: ActivityPeriod }) {
    const { days, total, activeDays, lastSession } = useMemo(() => {
        const totals = new Map<string, number>()
        let last: string | undefined
        for (const s of focusSessions(sessions)) {
            const key = dayKey(new Date(s.startedAt))
            totals.set(key, (totals.get(key) ?? 0) + s.actualSeconds)
            if (!last || s.startedAt > last) last = s.startedAt
        }
        const buckets: { key: string; date: Date; seconds: number }[] = []
        for (let i = period - 1; i >= 0; i--) {
            const date = new Date()
            date.setDate(date.getDate() - i)
            const key = dayKey(date)
            buckets.push({ key, date, seconds: totals.get(key) ?? 0 })
        }
        return {
            days: buckets,
            total: buckets.reduce((sum, d) => sum + d.seconds, 0),
            activeDays: buckets.filter(d => d.seconds > 0).length,
            lastSession: last,
        }
    }, [sessions, period])

    const max = Math.max(...days.map(d => d.seconds), 1)
    const average = activeDays > 0 ? total / activeDays : 0
    const gap = period > 30 ? 'gap-0.5' : period > 7 ? 'gap-1' : 'gap-2.5'

    return (
        <div className="raised-card p-6 sm:px-8 sm:py-7">
            <dl className="flex flex-wrap gap-x-10 gap-y-2">
                {[
                    ['Total', total > 0 ? formatMinutes(total) : '0min'],
                    ['Days studied', String(activeDays)],
                    ['Per study day', activeDays > 0 ? formatMinutes(average) : '—'],
                ].map(([label, value]) => (
                    <div key={label}>
                        <dt className="text-[13px] text-muted-foreground">{label}</dt>
                        <dd className="text-[1.75rem] font-semibold leading-9 tracking-tight tabular-nums">{value}</dd>
                    </div>
                ))}
            </dl>

            {total === 0 ? (
                <p className="mt-7 border-t border-border py-8 text-center text-sm text-muted-foreground">
                    No focus sessions in the last {period} days.
                    {lastSession && <> The last one was {dayLabel.format(new Date(lastSession))}.</>}
                </p>
            ) : (
                <>
                    <div
                        role="img"
                        aria-label={`Focus per day over the last ${period} days: ${formatMinutes(total)} across ${activeDays} days`}
                        className={`relative mt-7 flex h-40 items-end border-b border-border ${gap}`}
                    >
                        <div
                            aria-hidden
                            className="pointer-events-none absolute inset-x-0 border-t border-dashed border-brand-accent/70"
                            style={{ bottom: `${(average / max) * 100}%` }}
                        >
                            <span className="absolute -top-5 right-0 text-[11px] font-semibold text-brand-accent">avg {formatMinutes(average)}</span>
                        </div>
                        {days.map((d, i) => (
                            <div key={d.key} className="group relative flex h-full min-w-0 flex-1 items-end">
                                {d.seconds > 0 ? (
                                    <>
                                        <span
                                            className="block w-full origin-bottom rounded-t-[4px] rounded-b-[1px] bg-brand-accent transition-[filter] group-hover:brightness-110 motion-safe:animate-[bar-grow_0.6s_var(--ease-ios)_both]"
                                            style={{ height: `${(d.seconds / max) * 100}%`, animationDelay: `${i * (period > 30 ? 4 : 18)}ms` }}
                                        />
                                        <span className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-primary px-2 py-1 text-xs text-primary-foreground opacity-0 transition-opacity group-hover:opacity-100">
                                            {dayLabel.format(d.date)} · {formatMinutes(d.seconds)}
                                        </span>
                                    </>
                                ) : (
                                    <span className="block h-0.5 w-full rounded-[1px] bg-muted" />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="mt-2 flex justify-between text-[11px] tabular-nums text-muted-foreground">
                        <span>{dayLabel.format(days[0].date)}</span>
                        <span>{dayLabel.format(days[days.length - 1].date)}</span>
                    </div>
                </>
            )}
        </div>
    )
}
