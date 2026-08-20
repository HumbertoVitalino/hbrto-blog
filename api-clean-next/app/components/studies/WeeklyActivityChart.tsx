'use client'

import { useMemo, useState } from 'react'
import { StudySessionData } from '@/app/hooks/useStudySessions'
import { dayKey, formatMinutes, focusSessions } from '@/lib/studyStats'

interface DayBucket {
    key: string
    label: string
    date: Date
    seconds: number
    isToday: boolean
}

interface WeeklyActivityChartProps {
    sessions: StudySessionData[]
}

export function WeeklyActivityChart({ sessions }: WeeklyActivityChartProps) {
    const [hovered, setHovered] = useState<number | null>(null)

    const days = useMemo<DayBucket[]>(() => {
        const totals = new Map<string, number>()
        for (const s of focusSessions(sessions)) {
            const key = dayKey(new Date(s.startedAt))
            totals.set(key, (totals.get(key) ?? 0) + s.actualSeconds)
        }

        const todayKey = dayKey(new Date())
        const buckets: DayBucket[] = []
        for (let i = 6; i >= 0; i--) {
            const date = new Date()
            date.setDate(date.getDate() - i)
            const key = dayKey(date)
            buckets.push({
                key,
                label: date.toLocaleDateString('en-US', { weekday: 'short' }),
                date,
                seconds: totals.get(key) ?? 0,
                isToday: key === todayKey,
            })
        }
        return buckets
    }, [sessions])

    const totalWeekSeconds = days.reduce((sum, d) => sum + d.seconds, 0)
    const maxSeconds = Math.max(...days.map(d => d.seconds), 1)

    return (
        <div className="rounded-2xl border border-border/60 bg-card p-5">
            <div className="flex items-center justify-between mb-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">This week</p>
                <p className="text-sm font-medium tabular-nums">
                    {totalWeekSeconds > 0 ? formatMinutes(totalWeekSeconds) : '—'}
                </p>
            </div>

            {totalWeekSeconds === 0 ? (
                <div className="h-32 flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">No sessions logged this week yet.</p>
                </div>
            ) : (
                <div className="flex items-end justify-between gap-2.5 h-32">
                    {days.map((day, i) => {
                        const heightPct = Math.max((day.seconds / maxSeconds) * 100, day.seconds > 0 ? 6 : 2)
                        const isHovered = hovered === i
                        return (
                            <div
                                key={day.key}
                                className="relative flex-1 h-full flex flex-col items-center justify-end gap-2"
                                onMouseEnter={() => setHovered(i)}
                                onMouseLeave={() => setHovered(null)}
                            >
                                {isHovered && (
                                    <div className="absolute -top-1 -translate-y-full whitespace-nowrap rounded-md bg-popover border border-border/60 px-2 py-1 text-xs shadow-sm z-10">
                                        <span className="font-medium tabular-nums">{formatMinutes(day.seconds)}</span>
                                        <span className="text-muted-foreground ml-1">
                                            {day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                )}
                                <div className="w-full flex-1 flex items-end">
                                    <div
                                        className={`w-full rounded-t transition-[height,background-color] duration-200 ${
                                            day.isToday ? 'bg-brand-accent' : isHovered ? 'bg-primary' : 'bg-primary/70'
                                        }`}
                                        style={{ height: `${heightPct}%` }}
                                    />
                                </div>
                                <span className={`text-[10px] font-medium tabular-nums ${day.isToday ? 'text-brand-accent' : 'text-muted-foreground'}`}>
                                    {day.label}
                                </span>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
