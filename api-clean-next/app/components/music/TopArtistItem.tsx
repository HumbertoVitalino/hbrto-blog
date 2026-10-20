import { Mic2 } from 'lucide-react'
import { TopArtistData } from '@/app/hooks/useTopArtists'

/** An artist as a portrait in a row of circles, the way Apple Music shows them. */
export function TopArtistItem({ artist, rank }: { artist: TopArtistData; rank: number }) {
    return (
        <li className="group relative min-w-0 snap-start text-center">
            <div className="relative aspect-square w-full overflow-hidden rounded-full bg-muted shadow-[0_1px_2px_rgb(10_10_10/0.10),0_12px_28px_-12px_rgb(10_10_10/0.38)] transition-transform duration-450 ease-(--ease-ios) group-active:scale-[0.97] group-active:duration-100 motion-safe:[@media(hover:hover)]:group-hover:-translate-y-0.75 dark:shadow-[0_1px_2px_rgb(0_0_0/0.6),0_12px_28px_-12px_rgb(0_0_0/0.95)]">
                {artist.imageUrl ? (
                    <img src={artist.imageUrl} alt="" loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" />
                ) : (
                    <div className="absolute inset-0 grid place-items-center">
                        <Mic2 className="size-6 text-muted-foreground/50" />
                    </div>
                )}
            </div>
            <p className="mt-3 truncate text-[13px] font-semibold leading-[1.15rem]">
                <a
                    href={artist.artistUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:rounded-2xl focus-visible:after:ring-2 focus-visible:after:ring-ring"
                >
                    {artist.name}
                </a>
            </p>
            <p className="text-xs tabular-nums text-muted-foreground">#{rank}</p>
        </li>
    )
}
