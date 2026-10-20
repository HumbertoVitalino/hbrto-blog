import type { ReactNode } from 'react'
import { Music } from 'lucide-react'

/**
 * One song in a dense list (recently played, a chart): small artwork, title and artist; the
 * whole row opens it on Spotify and a soft surface grows in behind it on hover.
 */
export function TrackRow({ title, artist, albumImageUrl, songUrl, lead, trail }: {
    title: string
    artist: string
    albumImageUrl?: string
    songUrl?: string
    /** before the artwork, e.g. a chart position */
    lead?: ReactNode
    /** after the text, e.g. when it was played */
    trail?: ReactNode
}) {
    return (
        <li className="relative isolate flex items-center gap-3.5 py-2 before:absolute before:inset-y-0 before:-inset-x-3 before:-z-10 before:scale-[0.97] before:rounded-xl before:bg-muted before:opacity-0 before:transition-[opacity,transform] before:duration-250 hover:before:scale-100 hover:before:opacity-100 has-[a:focus-visible]:before:opacity-100 motion-reduce:before:transition-none">
            {lead}
            <div className="relative aspect-square w-11 shrink-0 overflow-hidden rounded-md bg-muted shadow-[0_1px_2px_rgb(10_10_10/0.12)]">
                {albumImageUrl ? (
                    <img src={albumImageUrl} alt="" loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" />
                ) : (
                    <div className="absolute inset-0 grid place-items-center">
                        <Music className="size-4 text-muted-foreground/50" />
                    </div>
                )}
            </div>
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold leading-5">
                    {songUrl ? (
                        <a
                            href={songUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="after:absolute after:inset-y-0 after:-inset-x-3 after:rounded-xl focus-visible:outline-none"
                        >
                            {title}
                        </a>
                    ) : title}
                </p>
                <p className="truncate text-[13px] leading-[1.15rem] text-muted-foreground">{artist}</p>
            </div>
            {trail}
        </li>
    )
}
