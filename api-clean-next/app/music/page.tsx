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
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
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

            {/* HERO */}
            <section className="border-b bg-muted/10">
                <div className="max-w-5xl mx-auto px-6 py-14">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Music</p>
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                            <h1 className="font-display text-4xl font-medium tracking-tight">What I&apos;m listening to</h1>
                            <p className="text-muted-foreground mt-2">
                                My Spotify activity — live data updated every 30 seconds.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">

                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* NOW PLAYING — hero full width */}
                {loadingNow ? (
                    <Spinner />
                ) : nowPlaying?.title ? (
                    <NowPlayingCard data={nowPlaying} />
                ) : (
                    <div className="rounded-xl border bg-card px-5 py-8 text-center">
                        <p className="text-sm text-muted-foreground">Nothing playing right now.</p>
                    </div>
                )}

                {/* GRID — Recently Played | Top Tracks + Artists */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

                    {/* LEFT — Recently Played */}
                    <Card className="p-5">
                        <SectionLabel>Recently Played</SectionLabel>
                        {loadingRecent ? (
                            <Spinner />
                        ) : recentTracks.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-4 text-center">No recent tracks.</p>
                        ) : (
                            <div>
                                {recentTracks.map((track, i) => (
                                    <RecentTrackItem key={`${track.songUrl}-${i}`} track={track} />
                                ))}
                            </div>
                        )}
                    </Card>

                    {/* RIGHT — Top Tracks + Top Artists */}
                    <div className="space-y-4">

                        {/* Time range filter */}
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                Top
                            </p>
                            <div className="flex gap-1.5">
                                {TIME_RANGES.map(({ label, value }) => (
                                    <Button
                                        key={value}
                                        variant={timeRange === value ? "default" : "outline"}
                                        size="sm"
                                        className="text-xs h-7 px-2.5"
                                        onClick={() => setTimeRange(value)}
                                    >
                                        {label}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Top Tracks */}
                        <Card className="p-5">
                            <SectionLabel>Tracks</SectionLabel>
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
                        </Card>

                        {/* Top Artists */}
                        <Card className="p-5">
                            <SectionLabel>Artists</SectionLabel>
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
                        </Card>

                    </div>
                </div>

            </div>
        </main>
    )
}
