import { ExternalLink } from 'lucide-react'
import { SteamGameData } from '@/app/hooks/useSteamGames'

interface SteamGameItemProps {
    game: SteamGameData
    rank: number
}

function formatHours(minutes: number): string {
    const hours = Math.round(minutes / 60)
    return hours < 1 ? `${minutes}m` : `${hours}h`
}

export function SteamGameItem({ game, rank }: SteamGameItemProps) {
    const storeUrl = `https://store.steampowered.com/app/${game.appId}`

    return (
        <div className="group flex items-center gap-3 px-2 py-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors">
            <span className="w-5 text-xs font-mono text-muted-foreground/40 text-right shrink-0 select-none">
                {rank}
            </span>

            <img
                src={game.headerImageUrl}
                alt={game.name}
                className="w-16 h-9 rounded-md object-cover shrink-0 shadow-sm"
            />

            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-tight truncate">{game.name}</p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {formatHours(game.playtimeForever)} total
                    {game.playtime2weeks > 0 && (
                        <span className="text-success">
                            {' '}· {formatHours(game.playtime2weeks)} recently
                        </span>
                    )}
                </p>
            </div>

            <a
                href={storeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground shrink-0"
                aria-label={`Open ${game.name} on Steam`}
            >
                <ExternalLink className="w-3.5 h-3.5" />
            </a>
        </div>
    )
}
