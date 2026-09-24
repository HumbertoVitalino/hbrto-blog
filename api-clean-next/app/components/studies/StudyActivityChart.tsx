'use client'

import { useId, useMemo, useState, useRef } from 'react'
import { StudySessionData } from '@/app/hooks/useStudySessions'
import { dayKey, formatMinutes, focusSessions } from '@/lib/studyStats'
import { Table2, X } from 'lucide-react'

export type ActivityPeriod = 7 | 30 | 90

interface DayBucket {
    key: string
    date: Date
    seconds: number
}

interface Point {
    x: number
    y: number
}

interface StudyActivityChartProps {
    sessions: StudySessionData[]
    period: ActivityPeriod
}

// baseline / top padding in the chart's abstract 0-100 coordinate space
const BASELINE_Y = 95
const TOP_Y = 10

function buildSmoothPath(points: Point[]): string {
    if (points.length === 0) return ''
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`

    let d = `M ${points[0].x} ${points[0].y}`
    for (let i = 0; i < points.length - 1; i++) {
        const cur = points[i]
        const next = points[i + 1]
        const midX = (cur.x + next.x) / 2
        const midY = (cur.y + next.y) / 2
        d += ` Q ${cur.x} ${cur.y} ${midX} ${midY}`
    }
    const last = points[points.length - 1]
    d += ` L ${last.x} ${last.y}`
    return d
}

function clampTranslate(fracX: number): string {
    if (fracX < 0.12) return 'translateX(0)'
    if (fracX > 0.88) return 'translateX(-100%)'
    return 'translateX(-50%)'
}

export function StudyActivityChart({ sessions, period }: StudyActivityChartProps) {
    const gradientId = useId()
    const containerRef = useRef<HTMLDivElement>(null)
    const [hoverIndex, setHoverIndex] = useState<number | null>(null)
    const [showTable, setShowTable] = useState(false)

    const days = useMemo<DayBucket[]>(() => {
        const totals = new Map<string, number>()
        for (const s of focusSessions(sessions)) {
            const key = dayKey(new Date(s.startedAt))
            totals.set(key, (totals.get(key) ?? 0) + s.actualSeconds)
        }

        const buckets: DayBucket[] = []
        for (let i = period - 1; i >= 0; i--) {
            const date = new Date()
            date.setDate(date.getDate() - i)
            const key = dayKey(date)
            buckets.push({ key, date, seconds: totals.get(key) ?? 0 })
        }
        return buckets
    }, [sessions, period])

    const totalSeconds = days.reduce((sum, d) => sum + d.seconds, 0)
    const maxSeconds = Math.max(...days.map(d => d.seconds), 1)
    const hasData = totalSeconds > 0

    const points = useMemo<Point[]>(() => days.map((d, i) => ({
        x: days.length > 1 ? (i / (days.length - 1)) * 100 : 50,
        y: BASELINE_Y - (d.seconds / maxSeconds) * (BASELINE_Y - TOP_Y),
    })), [days, maxSeconds])

    const linePath = useMemo(() => buildSmoothPath(points), [points])
    const areaPath = useMemo(() => {
        if (points.length === 0) return ''
        const first = points[0]
        const last = points[points.length - 1]
        return `${buildSmoothPath(points)} L ${last.x} ${BASELINE_Y} L ${first.x} ${BASELINE_Y} Z`
    }, [points])

    const labelStep = days.length <= 7 ? 1 : days.length <= 30 ? 5 : 15
    const rangeLabel = days.length > 0
        ? `${days[0].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${days[days.length - 1].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
        : ''

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        const rect = containerRef.current?.getBoundingClientRect()
        if (!rect || days.length === 0) return
        const fracX = (e.clientX - rect.left) / rect.width
        const idx = Math.min(days.length - 1, Math.max(0, Math.round(fracX * (days.length - 1))))
        setHoverIndex(idx)
    }

    const hovered = hoverIndex !== null ? days[hoverIndex] : undefined
    const hoveredPoint = hoverIndex !== null ? points[hoverIndex] : undefined

    return (
        <div className="instrument-panel border border-border/60 p-5">
            <div className="flex items-center justify-between mb-5 gap-3">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        {rangeLabel}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <p className="text-sm font-medium tabular-nums">
                        {hasData ? formatMinutes(totalSeconds) : '—'}
                    </p>
                    <button
                        onClick={() => setShowTable(v => !v)}
                        title={showTable ? 'Show chart' : 'Show as table'}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                        {showTable ? <X className="w-3.5 h-3.5" /> : <Table2 className="w-3.5 h-3.5" />}
                    </button>
                </div>
            </div>

            {!hasData ? (
                <div className="h-40 flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">No sessions logged in this period yet.</p>
                </div>
            ) : showTable ? (
                <div className="max-h-64 overflow-y-auto rounded-lg border border-border/50">
                    <table className="w-full text-xs">
                        <thead className="sticky top-0 bg-card">
                            <tr className="border-b border-border/50 text-muted-foreground">
                                <th className="text-left font-medium py-2 px-3">Date</th>
                                <th className="text-right font-medium py-2 px-3">Focus time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            {[...days].reverse().map(day => (
                                <tr key={day.key}>
                                    <td className="py-1.5 px-3">
                                        {day.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                    </td>
                                    <td className="py-1.5 px-3 text-right tabular-nums">
                                        {day.seconds > 0 ? formatMinutes(day.seconds) : '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div>
                    <div
                        ref={containerRef}
                        className="relative h-40"
                        onPointerMove={handlePointerMove}
                        onPointerLeave={() => setHoverIndex(null)}
                    >
                        <svg
                            className="absolute inset-0 w-full h-full overflow-visible"
                            viewBox="0 0 100 100"
                            preserveAspectRatio="none"
                        >
                            <defs>
                                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" style={{ stopColor: 'var(--brand-accent)' }} stopOpacity={0.22} />
                                    <stop offset="100%" style={{ stopColor: 'var(--brand-accent)' }} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <line x1="0" y1={BASELINE_Y} x2="100" y2={BASELINE_Y} className="stroke-border" strokeWidth={0.5} vectorEffect="non-scaling-stroke" />
                            <path d={areaPath} fill={`url(#${gradientId})`} />
                            <path d={linePath} fill="none" className="stroke-brand-accent" strokeWidth={2} vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
                            {hoveredPoint && (
                                <line x1={hoveredPoint.x} y1="0" x2={hoveredPoint.x} y2="100" className="stroke-border" strokeWidth={0.5} vectorEffect="non-scaling-stroke" />
                            )}
                        </svg>

                        {/* today marker — persistent endpoint label per dataviz convention */}
                        {points.length > 0 && (
                            <div
                                className="absolute w-2 h-2 rounded-full bg-brand-accent ring-2 ring-card -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                                style={{ left: `${points[points.length - 1].x}%`, top: `${points[points.length - 1].y}%` }}
                            />
                        )}

                        {/* hover marker + tooltip */}
                        {hoveredPoint && hovered && (
                            <>
                                <div
                                    className="absolute w-2.5 h-2.5 rounded-full bg-brand-accent ring-2 ring-card -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                                    style={{ left: `${hoveredPoint.x}%`, top: `${hoveredPoint.y}%` }}
                                />
                                <div
                                    className="absolute whitespace-nowrap rounded-md bg-popover border border-border/60 px-2.5 py-1.5 text-xs shadow-sm z-10 pointer-events-none"
                                    style={{ left: `${hoveredPoint.x}%`, top: `${hoveredPoint.y}%`, transform: `${clampTranslate(hoveredPoint.x / 100)} translateY(calc(-100% - 10px))` }}
                                >
                                    <span className="font-semibold tabular-nums">
                                        {hovered.seconds > 0 ? formatMinutes(hovered.seconds) : 'No sessions'}
                                    </span>
                                    <span className="text-muted-foreground ml-1.5">
                                        {hovered.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="relative h-4 mt-2">
                        {days.map((day, i) => {
                            const isFirst = i === 0
                            const isLast = i === days.length - 1
                            if (!isFirst && !isLast && i % labelStep !== 0) return null
                            const xPct = points[i].x
                            return (
                                <span
                                    key={day.key}
                                    className="absolute text-[10px] font-medium tabular-nums text-muted-foreground"
                                    style={{ left: `${xPct}%`, transform: clampTranslate(xPct / 100) }}
                                >
                                    {period <= 7
                                        ? day.date.toLocaleDateString('en-US', { weekday: 'short' })
                                        : day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
