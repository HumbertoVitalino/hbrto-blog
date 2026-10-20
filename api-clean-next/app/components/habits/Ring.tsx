import { cn } from '@/lib/utils'

/** An Activity-style progress ring. Decorative: whatever it shows is also said in text nearby. */
export function Ring({ value, size, stroke, className, trackClassName = 'stroke-muted', children }: {
    /** 0 to 1 */
    value: number
    size: number
    stroke: number
    className?: string
    trackClassName?: string
    children?: React.ReactNode
}) {
    const r = (size - stroke) / 2
    const c = 2 * Math.PI * r
    return (
        <span className={cn('relative inline-grid shrink-0 place-items-center', className)} style={{ width: size, height: size }}>
            <svg viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 -rotate-90" aria-hidden>
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className={trackClassName} />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    fill="none"
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={c}
                    strokeDashoffset={c * (1 - Math.max(0, Math.min(1, value)))}
                    className="stroke-chart-1 transition-[stroke-dashoffset] duration-500 ease-(--ease-ios)"
                    style={{ opacity: value > 0 ? 1 : 0 }}
                />
            </svg>
            {children && <span className="relative">{children}</span>}
        </span>
    )
}
