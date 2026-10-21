'use client'

import { useState } from 'react'

const W = 420
const H = 150
const PAD_L = 26
const PAD_R = 10
const PAD_B = 20
const TOP = 18

const day = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' })
const month = new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' })

/**
 * Today's subscribers counted up in the order they joined: a step line, a dot per sign-up
 * (hover or focus one for its date), the total at the end, and the dates in a table.
 */
export function SignupsChart({ joined, recent, now }: { joined: string[]; recent: number; now: Date }) {
    const [active, setActive] = useState<number | null>(null)

    const subtitle = `${joined.length} subscribed now · ${recent} new in the last 30 days`
    if (joined.length === 0) {
        return (
            <figure className="raised-card px-5 py-5 sm:px-6">
                <figcaption>
                    <h3 className="text-sm font-semibold">Newsletter sign-ups</h3>
                    <p className="mt-0.5 text-[13px] text-muted-foreground">No subscribers yet.</p>
                </figcaption>
            </figure>
        )
    }

    const start = new Date(joined[0])
    start.setDate(start.getDate() - 7)
    const t0 = start.getTime()
    const t1 = now.getTime()
    const total = joined.length
    const yMax = Math.max(2, Math.ceil(total / 2) * 2)
    const x = (t: number) => PAD_L + ((W - PAD_L - PAD_R) * (t - t0)) / Math.max(1, t1 - t0)
    const y = (n: number) => TOP + (H - PAD_B - TOP) * (1 - n / yMax)
    const step = Math.max(1, yMax / 4)
    const ticks = Array.from({ length: Math.floor(yMax / step) + 1 }, (_, i) => i * step)

    let path = `M${x(t0)},${y(0)}`
    joined.forEach((at, i) => {
        const t = x(new Date(at).getTime())
        path += `H${t}V${y(i + 1)}`
    })
    path += `H${x(t1)}`
    const area = `${path}V${y(0)}H${x(t0)}Z`
    const point = active === null ? null : { cx: x(new Date(joined[active]).getTime()), cy: y(active + 1) }

    return (
        <figure className="raised-card px-5 pb-4 pt-5 sm:px-6">
            <figcaption>
                <h3 className="text-sm font-semibold">Newsletter sign-ups</h3>
                <p className="mt-0.5 text-[13px] text-muted-foreground">{subtitle}</p>
            </figcaption>
            <div className="relative mt-4">
                <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full overflow-visible" role="img" aria-label={`Sign-ups over time: ${total} subscribed now`}>
                    {ticks.map(t => (
                        <g key={t}>
                            <line x1={PAD_L} x2={W} y1={y(t)} y2={y(t)} className="stroke-border" strokeWidth={1} />
                            <text x={PAD_L - 6} y={y(t) + 3} textAnchor="end" className="fill-muted-foreground text-[10px] tabular-nums">{t}</text>
                        </g>
                    ))}
                    <path d={area} className="fill-chart-1/10" />
                    <path d={path} fill="none" className="stroke-chart-1" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
                    {joined.map((at, i) => (
                        <circle
                            key={at + i}
                            cx={x(new Date(at).getTime())}
                            cy={y(i + 1)}
                            r={active === i ? 5 : 4}
                            tabIndex={0}
                            aria-label={`Subscriber ${i + 1}, joined ${day.format(new Date(at))}`}
                            onMouseEnter={() => setActive(i)}
                            onMouseLeave={() => setActive(null)}
                            onFocus={() => setActive(i)}
                            onBlur={() => setActive(null)}
                            className="cursor-default fill-chart-1 stroke-card outline-none"
                            strokeWidth={2}
                        />
                    ))}
                    <text x={x(t1)} y={y(total) - 9} textAnchor="end" className="fill-foreground text-[11px] font-semibold tabular-nums">{total} subscribed</text>
                    <text x={PAD_L} y={H - 4} className="fill-muted-foreground text-[10px]">{month.format(start)}</text>
                    <text x={W} y={H - 4} textAnchor="end" className="fill-muted-foreground text-[10px]">Today</text>
                </svg>
                {point && active !== null && (
                    <span
                        className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg bg-primary px-2 py-1 text-xs text-primary-foreground"
                        style={{ left: `${(point.cx / W) * 100}%`, top: `calc(${(point.cy / H) * 100}% - 10px)` }}
                    >
                        <b className="font-semibold">{active + 1}</b> · joined {day.format(new Date(joined[active]))}
                    </span>
                )}
            </div>
            <details className="mt-3 text-xs text-muted-foreground">
                <summary className="w-max cursor-pointer">View data</summary>
                <table className="mt-2 tabular-nums">
                    <tbody>
                        {joined.map((at, i) => (
                            <tr key={at + i}><th className="pr-4 text-left font-normal">{day.format(new Date(at))}</th><td>{i + 1} subscribed</td></tr>
                        ))}
                    </tbody>
                </table>
            </details>
        </figure>
    )
}
