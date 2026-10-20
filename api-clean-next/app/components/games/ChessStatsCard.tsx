import { ChevronRight } from 'lucide-react'
import { ChessStatsData, ChessRatingData } from '@/app/hooks/useChessStats'

const MODES = ['rapid', 'blitz', 'bullet', 'daily'] as const
type Mode = (typeof MODES)[number]

const MODE_LABEL: Record<Mode, string> = { rapid: 'Rapid', blitz: 'Blitz', bullet: 'Bullet', daily: 'Daily' }

const numberFormat = new Intl.NumberFormat('en-US')

const gamesPlayed = (r: ChessRatingData) => r.record.win + r.record.draw + r.record.loss

/**
 * A summary in the spirit of Apple Fitness: the mode played most is the headline number with
 * its record as one bar, the other modes sit beside it as small tiles.
 */
export function ChessStatsCard({ data }: { data: ChessStatsData }) {
    const played = MODES.filter(m => data[m]).map(m => ({ mode: m, rating: data[m]! }))
    if (played.length === 0) return null

    const [main, ...others] = [...played].sort((a, b) => gamesPlayed(b.rating) - gamesPlayed(a.rating))
    const { win, draw, loss } = main.rating.record
    const total = win + draw + loss
    const pct = (n: number) => `${(n / total) * 100}%`

    return (
        <section aria-labelledby="chess-heading" className="raised-card p-6 sm:px-8 sm:py-7">
            <div className="flex items-baseline justify-between gap-3">
                <h2 id="chess-heading" className="text-sm font-semibold">Chess.com</h2>
                <a
                    href={`https://www.chess.com/member/${data.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-[13px] font-medium text-brand-accent hover:underline underline-offset-3"
                >
                    {data.username}
                    <ChevronRight className="size-3.5" />
                </a>
            </div>

            <div className="mt-5 grid gap-7 md:grid-cols-[1.1fr_1fr] md:items-end md:gap-10">
                <div>
                    <p className="text-[13px] text-muted-foreground">{MODE_LABEL[main.mode]} rating</p>
                    <p className="mt-1.5 text-[3.5rem] font-semibold leading-none tracking-[-0.04em] tabular-nums">
                        {main.rating.last}
                        <span className="ml-2 text-[15px] font-medium tracking-normal text-muted-foreground">best {main.rating.best}</span>
                    </p>

                    {total > 0 && (
                        <div className="mt-5">
                            <div
                                role="img"
                                aria-label={`${win} wins, ${draw} draws, ${loss} losses`}
                                className="flex h-2 gap-0.5 overflow-hidden rounded-full bg-muted"
                            >
                                {win > 0 && <span className="h-full bg-success" style={{ width: pct(win) }} />}
                                {draw > 0 && <span className="h-full bg-muted-foreground/50" style={{ width: pct(draw) }} />}
                                {loss > 0 && <span className="h-full bg-destructive" style={{ width: pct(loss) }} />}
                            </div>
                            <p className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-[13px] tabular-nums text-muted-foreground">
                                <span className="flex items-center gap-1.5"><span aria-hidden className="size-1.5 rounded-full bg-success" /><b className="font-semibold text-foreground">{numberFormat.format(win)}</b> wins</span>
                                <span className="flex items-center gap-1.5"><span aria-hidden className="size-1.5 rounded-full bg-muted-foreground/50" /><b className="font-semibold text-foreground">{numberFormat.format(draw)}</b> draws</span>
                                <span className="flex items-center gap-1.5"><span aria-hidden className="size-1.5 rounded-full bg-destructive" /><b className="font-semibold text-foreground">{numberFormat.format(loss)}</b> losses</span>
                                <span>{Math.round((win / total) * 100)}% won across {numberFormat.format(total)} games</span>
                            </p>
                        </div>
                    )}
                </div>

                {others.length > 0 && (
                    <div className="grid grid-cols-3 gap-3">
                        {others.map(({ mode, rating }) => (
                            <div key={mode} className="rounded-2xl bg-muted px-4 py-3.5">
                                <p className="text-xs font-medium text-muted-foreground">{MODE_LABEL[mode]}</p>
                                <p className="mt-0.5 text-2xl font-semibold tracking-tight tabular-nums">{rating.last}</p>
                                <p className="text-xs tabular-nums text-muted-foreground">best {rating.best}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {data.tacticsHighest != null && (
                <p className="mt-5 border-t border-border pt-4 text-[13px] text-muted-foreground">
                    Best puzzle rating <b className="font-semibold tabular-nums text-foreground">{numberFormat.format(data.tacticsHighest)}</b>
                </p>
            )}
        </section>
    )
}
