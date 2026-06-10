import { Gamepad2, Pencil, Trash2, Loader2 } from 'lucide-react'
import { GameData } from '@/app/hooks/useGames'
import { GameStatus } from '@/domain/GameStatus'
import { GamePlatform } from '@/domain/GamePlatform'

const STATUS_LABEL: Record<GameStatus, string> = {
    [GameStatus.NotStarted]: 'Not started',
    [GameStatus.Playing]: 'Playing',
    [GameStatus.Completed]: 'Completed',
}

const STATUS_COLOR: Record<GameStatus, string> = {
    [GameStatus.NotStarted]: 'text-muted-foreground',
    [GameStatus.Playing]: 'text-green-600 dark:text-green-400',
    [GameStatus.Completed]: 'text-blue-600 dark:text-blue-400',
}

const PLATFORM_LABEL: Record<GamePlatform, string> = {
    [GamePlatform.PSN]: 'PlayStation',
    [GamePlatform.NintendoSwitch]: 'Nintendo Switch',
}

interface GameCardProps {
    game: GameData
    isAdmin?: boolean
    isDeleting?: boolean
    onEdit?: (game: GameData) => void
    onDelete?: (id: string) => void
}

export function GameCard({ game, isAdmin, isDeleting, onEdit, onDelete }: GameCardProps) {
    const status = game.status ?? GameStatus.NotStarted

    return (
        <div className="group flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm hover:shadow-md transition-shadow">
            <div className="relative aspect-video bg-muted overflow-hidden">
                {game.coverImageUrl ? (
                    <img
                        src={game.coverImageUrl}
                        alt={game.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Gamepad2 className="w-10 h-10 text-muted-foreground/30" />
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-1.5 p-4">
                <p className="font-semibold text-sm leading-tight line-clamp-2">{game.title}</p>

                <div className="flex items-center justify-between mt-0.5">
                    <span className="text-xs text-muted-foreground">
                        {PLATFORM_LABEL[game.platform]}
                    </span>
                    <span className={`text-xs font-medium ${STATUS_COLOR[status]}`}>
                        {STATUS_LABEL[status]}
                    </span>
                </div>

                {game.genre && (
                    <span className="text-xs text-muted-foreground/60">{game.genre}</span>
                )}

                {game.totalHours != null && game.totalHours > 0 && (
                    <span className="text-xs text-muted-foreground/60">{game.totalHours}h played</span>
                )}

                {isAdmin && (
                    <div className="flex gap-1.5 mt-1 pt-2 border-t border-border/50">
                        <button
                            onClick={() => onEdit?.(game)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-1 text-xs text-muted-foreground hover:text-foreground rounded-md hover:bg-muted/60 transition-colors"
                        >
                            <Pencil className="w-3 h-3" /> Edit
                        </button>
                        <button
                            onClick={() => game.id && onDelete?.(game.id)}
                            disabled={isDeleting}
                            className="flex-1 flex items-center justify-center gap-1.5 py-1 text-xs text-muted-foreground hover:text-red-500 rounded-md hover:bg-red-500/10 transition-colors disabled:opacity-40"
                        >
                            {isDeleting
                                ? <Loader2 className="w-3 h-3 animate-spin" />
                                : <Trash2 className="w-3 h-3" />
                            }
                            Delete
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
