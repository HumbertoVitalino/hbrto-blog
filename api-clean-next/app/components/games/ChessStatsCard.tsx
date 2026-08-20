import { ExternalLink } from 'lucide-react'
import { ChessStatsData, ChessRatingData } from '@/app/hooks/useChessStats'

interface ChessStatsCardProps {
    data: ChessStatsData
}

const MODE_LABEL: Record<string, string> = {
    bullet: 'Bullet',
    blitz: 'Blitz',
    rapid: 'Rapid',
    daily: 'Daily',
}

function RatingRow({ mode, rating }: { mode: string; rating: ChessRatingData }) {
    const { win, loss, draw } = rating.record
    const total = win + loss + draw
    const winRate = total > 0 ? Math.round((win / total) * 100) : 0
    const winPct = total > 0 ? (win / total) * 100 : 0
    const drawPct = total > 0 ? (draw / total) * 100 : 0
    const lossPct = total > 0 ? (loss / total) * 100 : 0

    return (
        <div className="py-3 border-b border-border/50 last:border-0">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {MODE_LABEL[mode] ?? mode}
                </span>
                <div className="text-right">
                    <span className="text-sm font-bold tabular-nums">{rating.last}</span>
                    <span className="text-xs text-muted-foreground ml-1.5">best {rating.best}</span>
                </div>
            </div>

            {total > 0 && (
                <>
                    <div className="flex h-1.5 rounded-full overflow-hidden bg-muted">
                        {win > 0 && <div className="bg-success" style={{ width: `${winPct}%` }} />}
                        {draw > 0 && <div className="bg-muted-foreground/40" style={{ width: `${drawPct}%` }} />}
                        {loss > 0 && <div className="bg-destructive" style={{ width: `${lossPct}%` }} />}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" />{win}W</span>
                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 shrink-0" />{draw}D</span>
                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-destructive shrink-0" />{loss}L</span>
                        <span className="ml-auto tabular-nums">{winRate}% win rate</span>
                    </div>
                </>
            )}
        </div>
    )
}

export function ChessStatsCard({ data }: ChessStatsCardProps) {
    const profileUrl = `https://www.chess.com/member/${data.username}`
    const modes = ['bullet', 'blitz', 'rapid', 'daily'] as const

    return (
        <div className="rounded-2xl border border-border/60 bg-card p-5 h-full">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Chess.com</p>
                    <p className="font-semibold mt-0.5">{data.username}</p>
                </div>
                <a
                    href={profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="View Chess.com profile"
                >
                    <ExternalLink className="w-4 h-4" />
                </a>
            </div>

            <div>
                {modes.map((mode) => {
                    const rating = data[mode]
                    if (!rating) return null
                    return <RatingRow key={mode} mode={mode} rating={rating} />
                })}
            </div>

            {data.tacticsHighest != null && (
                <p className="text-xs text-muted-foreground mt-3">
                    Tactics best: <span className="font-semibold text-foreground">{data.tacticsHighest}</span>
                </p>
            )}
        </div>
    )
}
