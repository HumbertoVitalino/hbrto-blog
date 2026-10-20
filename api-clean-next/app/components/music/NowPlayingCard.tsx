import { ChevronRight, Music } from 'lucide-react'
import { NowPlayingData } from '@/app/hooks/useNowPlaying'
import { timeAgo } from '@/lib/formatDate'

const EQ_HEIGHTS = ['h-full', 'h-2/3', 'h-1/2']

/**
 * The album as the page's hero, lit by its own colours the way Apple Music tints a player.
 * Live playback gets the moving equalizer; otherwise it says how long ago the last song was.
 */
export function NowPlayingCard({ data, lastPlayedAt }: { data: NowPlayingData; lastPlayedAt?: string }) {
    return (
        <section aria-label={data.isPlaying ? 'Now playing' : 'Last played'} className="raised-card isolate overflow-hidden">
            {data.albumImageUrl && (
                <div
                    aria-hidden
                    className="absolute -inset-[40%] -z-10 bg-cover bg-center opacity-20 blur-[60px] saturate-150 dark:opacity-30"
                    style={{ backgroundImage: `url(${data.albumImageUrl})` }}
                />
            )}

            <div className="flex items-center gap-6 p-5 sm:gap-8 sm:p-7">
                <div className="relative aspect-square w-30 shrink-0 overflow-hidden rounded-[10px] bg-muted shadow-[0_1px_2px_rgb(10_10_10/0.10),0_12px_28px_-12px_rgb(10_10_10/0.38)] sm:w-42">
                    {data.albumImageUrl ? (
                        <img src={data.albumImageUrl} alt="" className="absolute inset-0 size-full object-cover" />
                    ) : (
                        <div className="absolute inset-0 grid place-items-center">
                            <Music className="size-8 text-muted-foreground/50" />
                        </div>
                    )}
                </div>

                <div className="min-w-0">
                    {data.isPlaying ? (
                        <p className="flex items-center gap-2 text-[13px] font-semibold text-brand-accent">
                            <span aria-hidden className="inline-flex h-3 items-end gap-0.5">
                                {EQ_HEIGHTS.map((h, i) => (
                                    <span key={i} className={`eq-bar w-0.75 rounded-[1px] bg-current ${h}`} style={{ animationDelay: `${-i * 0.3}s` }} />
                                ))}
                            </span>
                            Now playing
                        </p>
                    ) : (
                        <p className="text-[13px] font-semibold text-muted-foreground">
                            Last played{lastPlayedAt && <> · {timeAgo(lastPlayedAt)}</>}
                        </p>
                    )}
                    <h2 className="mt-2 text-2xl font-semibold leading-tight tracking-tight text-balance sm:text-[1.875rem] sm:leading-9">
                        {data.title}
                    </h2>
                    <p className="mt-1 text-[15px] text-muted-foreground">
                        {data.artist}{data.album && <> · {data.album}</>}
                    </p>
                    {data.songUrl && (
                        <a
                            href={data.songUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3.5 inline-flex items-center text-sm font-medium text-brand-accent hover:underline underline-offset-3"
                        >
                            Open in Spotify
                            <ChevronRight className="ml-0.5 size-4" />
                        </a>
                    )}
                </div>
            </div>
        </section>
    )
}
