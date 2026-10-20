'use client'

import { memo } from 'react'
import { GameData } from '@/app/hooks/useGames'
import { GameStatus } from '@/domain/GameStatus'
import { Gamepad2, Pencil, Trash2 } from 'lucide-react'
import { PLATFORM_LABEL } from './gameStats'

interface GameShelfItemProps {
    game: GameData
    isAdmin?: boolean
    isDeleting?: boolean
    onEdit?: (game: GameData) => void
    onDelete?: (id: string) => void
}

const adminButton =
    'grid size-7 place-items-center rounded-full bg-card/90 text-muted-foreground shadow-sm ring-1 ring-border backdrop-blur-sm transition-[color,transform] duration-100 ease-out hover:text-foreground active:scale-[0.94] disabled:opacity-50'

/** A game box on the shelf. Games have no page of their own, so the box doesn't pretend to be a link. */
function GameShelfItemComponent({ game, isAdmin, isDeleting, onEdit, onDelete }: GameShelfItemProps) {
    const playing = game.status === GameStatus.Playing

    return (
        <li className="group relative flex min-w-0 flex-col">
            <div className="cover-object is-game">
                {game.coverImageUrl ? (
                    <img src={game.coverImageUrl} alt="" loading="lazy" decoding="async" />
                ) : (
                    <div className="absolute inset-0 grid place-items-center">
                        <Gamepad2 className="size-6 text-muted-foreground/40" />
                    </div>
                )}
            </div>

            <h3 className="mt-3 line-clamp-2 text-[13px] font-semibold leading-[1.15rem] tracking-[-0.005em]">{game.title}</h3>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs tabular-nums text-muted-foreground">
                {playing && (
                    <>
                        <span aria-hidden className="size-1.5 rounded-full bg-brand-accent" />
                        <span>Playing</span>
                        <span aria-hidden>·</span>
                    </>
                )}
                <span>{PLATFORM_LABEL[game.platform]}</span>
                {!!game.totalHours && <><span aria-hidden>·</span><span>{game.totalHours}h</span></>}
            </p>

            {isAdmin && (
                <div className="absolute right-1.5 top-1.5 z-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100">
                    <button type="button" onClick={() => onEdit?.(game)} aria-label={`Edit ${game.title}`} className={adminButton}>
                        <Pencil className="size-3" />
                    </button>
                    <button
                        type="button"
                        onClick={() => game.id && onDelete?.(game.id)}
                        disabled={isDeleting || !game.id}
                        aria-label={`Delete ${game.title}`}
                        className={`${adminButton} hover:text-destructive-text`}
                    >
                        <Trash2 className="size-3" />
                    </button>
                </div>
            )}
        </li>
    )
}

export const GameShelfItem = memo(GameShelfItemComponent)
