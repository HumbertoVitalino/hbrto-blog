import { ExternalLink, Music } from 'lucide-react'
import { TopTrackData } from '@/app/hooks/useTopTracks'

interface TopTrackItemProps {
    track: TopTrackData
    rank: number
}

export function TopTrackItem({ track, rank }: TopTrackItemProps) {
    return (
        <div className="group flex items-center gap-3 px-2 py-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors">
            <span className="w-5 text-xs font-mono text-muted-foreground/40 text-right shrink-0 select-none">
                {rank}
            </span>

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

            <a
                href={track.songUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground shrink-0"
                aria-label="Open in Spotify"
            >
                <ExternalLink className="w-3.5 h-3.5" />
            </a>
        </div>
    )
}
