import { ExternalLink, Music } from 'lucide-react'
import { NowPlayingData } from '@/app/hooks/useNowPlaying'

interface NowPlayingCardProps {
    data: NowPlayingData
}

export function NowPlayingCard({ data }: NowPlayingCardProps) {
    return (
        <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
            {/* Ambient blur backdrop */}
            {data.albumImageUrl && (
                <div
                    className="absolute inset-0 scale-110 opacity-15 blur-2xl"
                    style={{
                        backgroundImage: `url(${data.albumImageUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                />
            )}

            <div className="relative flex items-stretch">
                {/* Album art */}
                {data.albumImageUrl ? (
                    <img
                        src={data.albumImageUrl}
                        alt={`${data.album} cover`}
                        className="w-36 h-36 sm:w-48 sm:h-48 shrink-0 object-cover"
                    />
                ) : (
                    <div className="w-36 h-36 sm:w-48 sm:h-48 shrink-0 bg-muted flex items-center justify-center">
                        <Music className="w-10 h-10 text-muted-foreground" />
                    </div>
                )}

                {/* Track info */}
                <div className="flex flex-col justify-between px-5 py-5 sm:px-7 sm:py-6 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        {data.isPlaying ? (
                            <>
                                <span className="relative flex h-2 w-2 shrink-0">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-accent" />
                                </span>
                                <span className="text-xs font-medium text-brand-accent tracking-wide">
                                    Now Playing
                                </span>
                            </>
                        ) : (
                            <>
                                <span className="w-2 h-2 rounded-full bg-muted-foreground/30 shrink-0" />
                                <span className="text-xs font-medium text-muted-foreground tracking-wide">
                                    Last Played
                                </span>
                            </>
                        )}
                    </div>

                    <div className="space-y-1 mt-3">
                        <p className="font-bold text-xl sm:text-2xl leading-tight line-clamp-2 tracking-tight">
                            {data.title}
                        </p>
                        <p className="text-sm sm:text-base text-muted-foreground line-clamp-1 font-medium">
                            {data.artist}
                        </p>
                        <p className="text-xs text-muted-foreground/60 line-clamp-1">
                            {data.album}
                        </p>
                    </div>

                    {data.songUrl && (
                        <a
                            href={data.songUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mt-4 w-fit"
                        >
                            <ExternalLink className="w-3 h-3" />
                            Open in Spotify
                        </a>
                    )}
                </div>
            </div>
        </div>
    )
}
