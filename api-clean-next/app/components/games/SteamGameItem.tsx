import { SteamGameData } from '@/app/hooks/useSteamGames'

function formatHours(minutes: number): string {
    const hours = Math.round(minutes / 60)
    return hours < 1 ? `${minutes}m` : `${hours}h`
}

/** One recent Steam game: its wide header art, name and playtime; the whole row opens the store page. */
export function SteamGameItem({ game }: { game: SteamGameData }) {
    return (
        <li className="hover-surface flex items-center gap-4">
            <div className="relative aspect-460/215 w-28 shrink-0 overflow-hidden rounded-md bg-muted shadow-sm ring-1 ring-foreground/5">
                <img src={game.headerImageUrl} alt="" loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" />
            </div>
            <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold">
                    <a href={`https://store.steampowered.com/app/${game.appId}`} target="_blank" rel="noopener noreferrer" className="stretched-link">
                        {game.name}
                    </a>
                </h3>
                <p className="text-[13px] tabular-nums text-muted-foreground">
                    {formatHours(game.playtimeForever)} total
                    {game.playtime2weeks > 0 && <> · {formatHours(game.playtime2weeks)} in the last two weeks</>}
                </p>
            </div>
        </li>
    )
}
