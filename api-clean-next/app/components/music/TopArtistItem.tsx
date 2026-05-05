import { ExternalLink, Mic2 } from 'lucide-react'
import { TopArtistData } from '@/app/hooks/useTopArtists'

interface TopArtistItemProps {
    artist: TopArtistData
    rank: number
}

export function TopArtistItem({ artist, rank }: TopArtistItemProps) {
    return (
        <div className="group flex items-center gap-3 px-2 py-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors">
            <span className="w-5 text-xs font-mono text-muted-foreground/40 text-right shrink-0 select-none">
                {rank}
            </span>

            {artist.imageUrl ? (
                <img
                    src={artist.imageUrl}
                    alt={artist.name}
                    className="w-11 h-11 rounded-full object-cover shrink-0 shadow-sm"
                />
            ) : (
                <div className="w-11 h-11 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <Mic2 className="w-4 h-4 text-muted-foreground" />
                </div>
            )}

            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-tight truncate">{artist.name}</p>
                {artist.genres.length > 0 && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                        {artist.genres.map((g) => (
                            <span
                                key={g}
                                className="inline-flex items-center text-[10px] font-medium bg-muted px-1.5 py-0.5 rounded-full capitalize text-muted-foreground"
                            >
                                {g}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <a
                href={artist.artistUrl}
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
