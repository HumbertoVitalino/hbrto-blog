import { ExternalLink, Music } from 'lucide-react'
import { RecentTrackData } from '@/app/hooks/useRecentlyPlayed'
import { timeAgo } from '@/lib/formatDate'

interface RecentTrackItemProps {
    track: RecentTrackData
}

export function RecentTrackItem({ track }: RecentTrackItemProps) {
    return (
        <div className="group flex items-center gap-3 px-2 py-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors">
            {track.albumImageUrl ? (
                <img
                    src={track.albumImageUrl}
                    alt={track.album}
                    className="w-11 h-11 rounded-md object-cover shrink-0 shadow-sm"
                />
            ) : (
                <div className="w-11 h-11 rounded-md bg-muted flex items-center justify-center shrink-0">
                    <Music className="w-4 h-4 text-muted-foreground" />
                </div>
            )}

            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-tight truncate">{track.title}</p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{track.artist}</p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
                <span className="text-xs text-muted-foreground/50 hidden sm:block tabular-nums">
                    {timeAgo(track.playedAt)}
                </span>
                <a
                    href={track.songUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                    aria-label="Open in Spotify"
                >
                    <ExternalLink className="w-3.5 h-3.5" />
                </a>
            </div>
        </div>
    )
}
