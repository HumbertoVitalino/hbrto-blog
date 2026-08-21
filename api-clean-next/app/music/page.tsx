'use client'

import { useState } from 'react'
import { useNowPlaying } from '@/app/hooks/useNowPlaying'
import { useRecentlyPlayed } from '@/app/hooks/useRecentlyPlayed'
import { useTopTracks } from '@/app/hooks/useTopTracks'
import { useTopArtists } from '@/app/hooks/useTopArtists'
import { NowPlayingCard } from '@/app/components/music/NowPlayingCard'
import { RecentTrackItem } from '@/app/components/music/RecentTrackItem'
import { TopTrackItem } from '@/app/components/music/TopTrackItem'
import { TopArtistItem } from '@/app/components/music/TopArtistItem'
import { RevealGroup, RevealItem } from '@/app/components/motion/Reveal'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { TimeRange } from '@/infrastructure/repositories/SpotifyRepository'

const TIME_RANGES: { label: string; value: TimeRange }[] = [
    { label: "4 weeks", value: "short_term" },
    { label: "6 months", value: "medium_term" },
    { label: "All time", value: "long_term" },
]

function Spinner() {
    return (
        <div className="flex justify-center py-8">
            <div className="h-4 w-4 rounded-full border border-muted border-t-foreground animate-spin" />
        </div>
    )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {children}
        </p>
    )
}

export default function MusicPage() {
    const [timeRange, setTimeRange] = useState<TimeRange>("short_term")

    const { data: nowPlaying, isLoading: loadingNow, error: errorNow } = useNowPlaying()
    const { tracks: recentTracks, isLoading: loadingRecent, error: errorRecent } = useRecentlyPlayed()
    const { tracks: topTracks, isLoading: loadingTopTracks } = useTopTracks(timeRange)
    const { artists: topArtists, isLoading: loadingTopArtists } = useTopArtists(timeRange)

    const error = errorNow || errorRecent

    return (
        <main className="min-h-screen bg-background">
            <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">

                {/* TITLE BAR — editorial masthead */}
                <div>
                    <h1 className="font-display text-3xl font-medium tracking-tight">Music</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        What I&apos;m listening to — live Spotify activity.
                    </p>
                </div>

                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* NOW PLAYING — hero, full width, always the anchor */}
                {loadingNow ? (
                    <Spinner />
                ) : nowPlaying?.title ? (
                    <NowPlayingCard data={nowPlaying} />
                ) : (
                    <div className="rounded-2xl border border-dashed border-border/50 px-5 py-8 text-center">
                        <p className="text-sm text-muted-foreground">Nothing playing right now.</p>
                    </div>
                )}

                <RevealGroup className="space-y-10">

                    {/* RECENTLY PLAYED — its own full-width section, unaffected by the time range */}
                    <RevealItem className="space-y-3">
                        <SectionLabel>Recently Played</SectionLabel>
                        <div className="rounded-2xl border border-border/60 bg-card p-5">
                            {loadingRecent ? (
                                <Spinner />
                            ) : recentTracks.length === 0 ? (
                                <p className="text-sm text-muted-foreground py-4 text-center">No recent tracks.</p>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                                    {recentTracks.map((track, i) => (
                                        <RecentTrackItem key={`${track.songUrl}-${i}`} track={track} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </RevealItem>

                    {/* TOP CHARTS — Tracks + Artists share one header and one time-range control */}
                    <RevealItem className="space-y-3">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                            <SectionLabel>Top Charts</SectionLabel>
                            <div className="flex gap-1.5">
                                {TIME_RANGES.map(({ label, value }) => (
                                    <button
                                        key={value}
                                        onClick={() => setTimeRange(value)}
                                        className={`text-xs font-medium px-3 py-1 rounded-full transition-colors ${
                                            timeRange === value
                                                ? 'bg-primary text-primary-foreground'
                                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                                        }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            {/* Top Tracks */}
                            <div className="rounded-2xl border border-border/60 bg-card p-5">
                                <p className="text-xs font-medium text-muted-foreground mb-3">Tracks</p>
                                {loadingTopTracks ? (
                                    <Spinner />
                                ) : topTracks.length === 0 ? (
                                    <p className="text-sm text-muted-foreground py-4 text-center">No data.</p>
                                ) : (
                                    <div>
                                        {topTracks.map((track, i) => (
                                            <TopTrackItem key={track.songUrl} track={track} rank={i + 1} />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Top Artists */}
                            <div className="rounded-2xl border border-border/60 bg-card p-5">
                                <p className="text-xs font-medium text-muted-foreground mb-3">Artists</p>
                                {loadingTopArtists ? (
                                    <Spinner />
                                ) : topArtists.length === 0 ? (
                                    <p className="text-sm text-muted-foreground py-4 text-center">No data.</p>
                                ) : (
                                    <div>
                                        {topArtists.map((artist, i) => (
                                            <TopArtistItem key={artist.artistUrl} artist={artist} rank={i + 1} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </RevealItem>

                </RevealGroup>

            </div>
        </main>
    )
}
