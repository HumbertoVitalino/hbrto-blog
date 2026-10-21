'use client'

import type { Point } from '@/lib/adminOverview'
import { cn } from '@/lib/utils'

/**
 * Clean ticks from zero: steps of 1, 2, 5 or 10 times a power of ten, about four of them. Counts
 * (whole numbers) never get a step below 1: half a book isn't a thing.
 */
function ticksFor(max: number, whole: boolean): number[] {
    if (max <= 0) return [0, 1]
    const raw = whole ? Math.max(1, max / 4) : max / 4
    const power = 10 ** Math.floor(Math.log10(raw))
    const step = [1, 2, 5, 10].map(m => m * power).find(s => s >= raw) ?? raw
    const top = Math.ceil(max / step) * step
    return Array.from({ length: Math.round(top / step) + 1 }, (_, i) => +(i * step).toFixed(6))
}

/**
 * One series as columns: thin bars from a single baseline, the peak labelled on its cap, every
 * value in a tooltip (hover or keyboard) and in the table under it.
 */
export function ColumnChart({ title, subtitle, points, format = v => String(v) }: {
    title: string
    subtitle: string
    points: Point[]
    format?: (value: number) => string
}) {
    const ticks = ticksFor(Math.max(...points.map(p => p.value)), points.every(p => Number.isInteger(p.value)))
    const top = ticks[ticks.length - 1]
    const peak = points.reduce((best, p, i) => (p.value > points[best].value ? i : best), 0)
    const thin = points.length > 8

    return (
        <figure className="raised-card px-5 pb-4 pt-5 sm:px-6">
            <figcaption>
                <h3 className="text-sm font-semibold">{title}</h3>
                <p className="mt-0.5 text-[13px] text-muted-foreground">{subtitle}</p>
            </figcaption>

            <div className="mt-5 flex gap-2">
                {/* y axis */}
                <div aria-hidden className="relative h-36 w-6 shrink-0 text-right text-[10px] tabular-nums text-muted-foreground">
                    {ticks.map(t => (
                        <span key={t} className="absolute right-0 translate-y-1/2" style={{ bottom: `${(t / top) * 100}%` }}>{t}</span>
                    ))}
                </div>

                <div className="min-w-0 flex-1">
                    <div className="relative h-36">
                        {ticks.map(t => (
                            <span key={t} aria-hidden className="absolute inset-x-0 border-t border-border" style={{ bottom: `${(t / top) * 100}%` }} />
                        ))}
                        <div role="list" aria-label={title} className="absolute inset-0 flex items-end">
                            {points.map((p, i) => (
                                <div
                                    key={p.name}
                                    role="listitem"
                                    tabIndex={0}
                                    aria-label={`${p.name}: ${format(p.value)}`}
                                    className="group relative flex h-full min-w-0 flex-1 items-end justify-center outline-none"
                                >
                                    {p.value > 0 ? (
                                        <span
                                            className="block w-[70%] max-w-6 origin-bottom rounded-t-[4px] bg-chart-1 transition-[filter] group-hover:brightness-110 motion-safe:animate-[bar-grow_0.6s_var(--ease-ios)_both]"
                                            style={{ height: `${(p.value / top) * 100}%`, animationDelay: `${i * 25}ms` }}
                                        />
                                    ) : (
                                        <span className="block h-0.5 w-[70%] max-w-6 rounded-[1px] bg-muted" />
                                    )}
                                    {i === peak && p.value > 0 && (
                                        <span aria-hidden className="absolute text-[11px] font-semibold tabular-nums" style={{ bottom: `calc(${(p.value / top) * 100}% + 4px)` }}>
                                            {format(p.value)}
                                        </span>
                                    )}
                                    <span className="pointer-events-none absolute bottom-[calc(100%+6px)] z-10 whitespace-nowrap rounded-lg bg-primary px-2 py-1 text-xs text-primary-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                                        <b className="font-semibold">{format(p.value)}</b> · {p.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div aria-hidden className="mt-1.5 flex text-[10px] text-muted-foreground">
                        {points.map((p, i) => (
                            <span key={p.name} className={cn('min-w-0 flex-1 text-center', thin && i % 2 !== (points.length - 1) % 2 && 'invisible')}>{p.label}</span>
                        ))}
                    </div>
                </div>
            </div>

            <details className="mt-3 text-xs text-muted-foreground">
                <summary className="w-max cursor-pointer">View data</summary>
                <table className="mt-2 tabular-nums">
                    <tbody>
                        {points.map(p => (
                            <tr key={p.name}><th className="pr-4 text-left font-normal">{p.name}</th><td>{format(p.value)}</td></tr>
                        ))}
                    </tbody>
                </table>
            </details>
        </figure>
    )
}
