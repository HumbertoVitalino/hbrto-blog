import { motion } from 'motion/react'
import { Gamepad2, Pencil, Trash2, Loader2, Clock } from 'lucide-react'
import { GameData } from '@/app/hooks/useGames'
import { GameStatus } from '@/domain/GameStatus'
import { GamePlatform } from '@/domain/GamePlatform'

const STATUS_LABEL: Record<GameStatus, string> = {
    [GameStatus.NotStarted]: 'Backlog',
    [GameStatus.Playing]: 'Playing',
    [GameStatus.Completed]: 'Completed',
}

const STATUS_DOT: Record<GameStatus, string> = {
    [GameStatus.NotStarted]: 'bg-muted-foreground/50',
    [GameStatus.Playing]: 'bg-info',
    [GameStatus.Completed]: 'bg-success',
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
        <motion.div
            className="group flex flex-col h-full rounded-2xl border border-border/60 bg-card overflow-hidden hover:shadow-lg hover:border-primary/30 transition-shadow duration-300"
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        >
            {/* COVER */}
            <div className="relative w-full aspect-2/3 bg-muted/40 overflow-hidden">
                {game.coverImageUrl ? (
                    <img
                        src={game.coverImageUrl}
                        alt={`${game.title} cover`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Gamepad2 className="w-10 h-10 text-muted-foreground/30" />
                    </div>
                )}

                {/* Status badge — bottom left */}
                <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 bg-background/90 backdrop-blur-sm border border-border/50 text-xs font-medium px-2.5 py-1 rounded-full shadow-sm">
                    <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[status]}`} />
                    {STATUS_LABEL[status]}
                </div>

                {/* Admin overlay — top right */}
                {isAdmin && (
                    <div className="absolute top-2.5 right-2.5 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => onEdit?.(game)}
                            className="w-7 h-7 rounded-full bg-background/90 backdrop-blur-sm border border-border/50 flex items-center justify-center hover:bg-background shadow-sm transition-colors"
                        >
                            <Pencil className="w-3 h-3" />
                        </button>
                        <button
                            onClick={() => game.id && onDelete?.(game.id)}
                            disabled={isDeleting || !game.id}
                            className="w-7 h-7 rounded-full bg-destructive/90 backdrop-blur-sm flex items-center justify-center hover:bg-destructive shadow-sm transition-colors disabled:opacity-50"
                        >
                            {isDeleting
                                ? <Loader2 className="w-3 h-3 animate-spin text-destructive-foreground" />
                                : <Trash2 className="w-3 h-3 text-destructive-foreground" />
                            }
                        </button>
                    </div>
                )}
            </div>

            {/* INFO */}
            <div className="flex flex-col flex-1 p-3 gap-1">
                <p className="font-semibold text-[13px] leading-snug line-clamp-2">{game.title}</p>
                <div className="flex items-center justify-between gap-2 mt-auto pt-1">
                    <span className="text-[11px] text-muted-foreground truncate">
                        {PLATFORM_LABEL[game.platform]}
                        {game.genre ? ` · ${game.genre}` : ''}
                    </span>
                    {game.totalHours != null && game.totalHours > 0 && (
                        <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground/70 shrink-0">
                            <Clock className="w-3 h-3" />
                            {game.totalHours}h
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    )
}
