'use client'

import { useState, useMemo } from 'react'
import { useNowPlaying } from '@/app/hooks/useNowPlaying'
import { useRecentlyPlayed } from '@/app/hooks/useRecentlyPlayed'
import { useTopTracks } from '@/app/hooks/useTopTracks'
import { useTopArtists } from '@/app/hooks/useTopArtists'
import { NowPlayingCard } from '@/app/components/music/NowPlayingCard'
import { TrackRow } from '@/app/components/music/TrackRow'
import { TopArtistItem } from '@/app/components/music/TopArtistItem'
import { joinNames, musicSummary } from '@/app/components/music/musicSummary'
import { PageContainer, PageHeader, PageLead } from '@/app/components/layout/PageHeader'
import { Segmented } from '@/app/components/layout/Segmented'
import { FadeIn } from '@/app/components/motion/FadeIn'
import { TimeRange } from '@/infrastructure/repositories/SpotifyRepository'
import { timeAgo } from '@/lib/formatDate'

const TIME_RANGES: { value: TimeRange; label: string }[] = [
    { value: 'short_term', label: '4 weeks' },
    { value: 'medium_term', label: '6 months' },
    { value: 'long_term', label: 'All time' },
]

function Spinner() {
    return (
        <div className="flex justify-center py-20">
            <div className="h-5 w-5 rounded-full border border-muted border-t-foreground animate-spin" />
        </div>
    )
}

const Names = ({ names }: { names: string[] }) => (
    <b className="font-semibold text-foreground">{joinNames(names)}</b>
)

export default function MusicPage() {
    const [timeRange, setTimeRange] = useState<TimeRange>('short_term')

    const { data: nowPlaying, isLoading: loadingNow, error: errorNow } = useNowPlaying()
    const { tracks: recentTracks, isLoading: loadingRecent } = useRecentlyPlayed()
    const { tracks: topTracks, isLoading: loadingTopTracks } = useTopTracks(timeRange)
    const { artists: topArtists, isLoading: loadingTopArtists } = useTopArtists(timeRange)
    // the opening line always reads "lately" against "all time", whatever range is picked below
    const { artists: latelyArtists } = useTopArtists('short_term')
    const { artists: allTimeArtists } = useTopArtists('long_term')

    const summary = useMemo(() => musicSummary(latelyArtists, allTimeArtists), [latelyArtists, allTimeArtists])

    const firstLoad = loadingNow && loadingRecent
    // Spotify answers all of these with one token; if the first two fail, it's down for the page
    const spotifyDown = !loadingNow && !loadingRecent && !!errorNow && recentTracks.length === 0

    return (
        <PageContainer>
            <PageHeader title="What I’ve been listening to.">
                {summary && (
                    <PageLead>
                        {summary.lately.length > 0 && <>Lately it’s <Names names={summary.lately} /> on repeat.</>}
                        {summary.always.length > 0 && <> Over the years, <Names names={summary.always} />.</>}
                    </PageLead>
                )}
            </PageHeader>

            {firstLoad && <Spinner />}

            {spotifyDown && (
                <p role="status" className="mt-14 text-sm text-muted-foreground">
                    Spotify isn’t answering right now. Try again in a minute.
                </p>
            )}

            {nowPlaying?.title && (
                <FadeIn index={1} className="mt-14">
                    <NowPlayingCard data={nowPlaying} lastPlayedAt={recentTracks[0]?.playedAt} />
                </FadeIn>
            )}

            {recentTracks.length > 0 && (
                <FadeIn index={2}>
                    <section aria-labelledby="recent-heading" className="mt-18">
                        <h2 id="recent-heading" className="text-sm font-semibold">Recently played</h2>
                        <ul className="mt-7 grid gap-x-10 gap-y-1 md:grid-cols-2">
                            {recentTracks.map((track, i) => (
                                <TrackRow
                                    key={`${track.songUrl}-${track.playedAt}-${i}`}
                                    title={track.title}
                                    artist={track.artist}
                                    albumImageUrl={track.albumImageUrl}
                                    songUrl={track.songUrl}
                                    trail={
                                        <time dateTime={track.playedAt} className="shrink-0 text-xs tabular-nums text-muted-foreground">
                                            {timeAgo(track.playedAt)}
                                        </time>
                                    }
                                />
                            ))}
                        </ul>
                    </section>
                </FadeIn>
            )}

            {!spotifyDown && !firstLoad && (
                <FadeIn index={3}>
                    <section aria-labelledby="top-heading" className="mt-18">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <h2 id="top-heading" className="text-sm font-semibold">Most played</h2>
                            <Segmented id="music-range" label="Time range" options={TIME_RANGES} value={timeRange} onChange={setTimeRange} />
                        </div>

                        <h3 className="mb-4 mt-7 text-[13px] font-semibold text-muted-foreground">Artists</h3>
                        {loadingTopArtists ? (
                            <Spinner />
                        ) : topArtists.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Nothing for this period yet.</p>
                        ) : (
                            // five across; on a phone the row scrolls sideways instead of shrinking the faces
                            <ol className="grid snap-x snap-mandatory auto-cols-[30%] grid-flow-col gap-4 overflow-x-auto pb-2 [scrollbar-width:none] sm:auto-cols-auto sm:grid-flow-row sm:grid-cols-5 sm:overflow-visible sm:pb-0">
                                {topArtists.map((artist, i) => (
                                    <TopArtistItem key={artist.artistUrl} artist={artist} rank={i + 1} />
                                ))}
                            </ol>
                        )}

                        <h3 className="mb-2 mt-10 text-[13px] font-semibold text-muted-foreground">Songs</h3>
                        {loadingTopTracks ? (
                            <Spinner />
                        ) : topTracks.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Nothing for this period yet.</p>
                        ) : (
                            <ol className="divide-y divide-border">
                                {topTracks.map((track, i) => (
                                    <TrackRow
                                        key={track.songUrl}
                                        title={track.title}
                                        artist={track.artist}
                                        albumImageUrl={track.albumImageUrl}
                                        songUrl={track.songUrl}
                                        lead={<span className="w-5.5 shrink-0 text-right text-[15px] font-semibold tabular-nums text-muted-foreground">{i + 1}</span>}
                                    />
                                ))}
                            </ol>
                        )}
                    </section>
                </FadeIn>
            )}
        </PageContainer>
    )
}
