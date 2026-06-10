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
    const total = rating.record.win + rating.record.loss + rating.record.draw
    const winRate = total > 0 ? Math.round((rating.record.win / total) * 100) : 0

    return (
        <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
            <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground w-12">
                    {MODE_LABEL[mode] ?? mode}
                </span>
                <div className="flex gap-1.5 text-xs text-muted-foreground/60">
                    <span className="text-green-600 dark:text-green-400">{rating.record.win}W</span>
                    <span>{rating.record.draw}D</span>
                    <span className="text-red-500 dark:text-red-400">{rating.record.loss}L</span>
                </div>
            </div>
            <div className="text-right">
                <span className="text-sm font-bold">{rating.last}</span>
                <span className="text-xs text-muted-foreground ml-1.5">
                    best {rating.best} · {winRate}%
                </span>
            </div>
        </div>
    )
}

export function ChessStatsCard({ data }: ChessStatsCardProps) {
    const profileUrl = `https://www.chess.com/member/${data.username}`
    const modes = ['bullet', 'blitz', 'rapid', 'daily'] as const

    return (
        <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
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
