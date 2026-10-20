'use client'

import { GameData } from '@/app/hooks/useGames'
import { Gamepad2 } from 'lucide-react'
import { PLATFORM_LABEL } from './gameStats'

/** What's in the console right now, one raised card each. */
export function PlayingNow({ games }: { games: GameData[] }) {
    return (
        <section aria-label="Playing now" className="grid gap-4 md:grid-cols-2">
            {games.map(game => (
                <article key={game.id} className="raised-card flex items-center gap-5 p-5">
                    <div className="cover-object is-game w-21 shrink-0">
                        {game.coverImageUrl ? (
                            <img src={game.coverImageUrl} alt="" />
                        ) : (
                            <div className="absolute inset-0 grid place-items-center">
                                <Gamepad2 className="size-6 text-muted-foreground/40" />
                            </div>
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="flex items-center gap-2 text-[13px] font-semibold text-brand-accent">
                            <span aria-hidden className="size-1.5 rounded-full bg-brand-accent" />
                            Playing now
                        </p>
                        <h2 className="mt-1.5 text-lg font-semibold leading-6 tracking-tight text-balance">{game.title}</h2>
                        <p className="mt-1.5 text-[13px] leading-5 tabular-nums text-muted-foreground">
                            {PLATFORM_LABEL[game.platform]}{game.genre ? ` · ${game.genre}` : ''}
                            {!!game.totalHours && <><br />{game.totalHours} {game.totalHours === 1 ? 'hour' : 'hours'} so far</>}
                        </p>
                    </div>
                </article>
            ))}
        </section>
    )
}
