'use client'

import { useRecentlyPlayed } from '@/app/hooks/useRecentlyPlayed'
import { useSteamGames } from '@/app/hooks/useSteamGames'
import { useChessStats } from '@/app/hooks/useChessStats'
import { cn } from '@/lib/utils'

type State = 'checking' | 'up' | 'empty' | 'down'

const STATE_LABEL: Record<State, string> = { checking: 'Checking', up: 'Answering', empty: 'Answering, nothing to show', down: 'Not answering' }

function Feed({ name, state, detail }: { name: string; state: State; detail: string }) {
    return (
        <div className="flex items-start gap-3 rounded-2xl bg-card px-4.5 py-4 ring-1 ring-border">
            <span
                aria-hidden
                className={cn(
                    'mt-1.5 size-2.25 shrink-0 rounded-full',
                    state === 'up' && 'bg-success shadow-[0_0_0_3px] shadow-success/20',
                    state === 'empty' && 'bg-muted-foreground shadow-[0_0_0_3px] shadow-muted',
                    state === 'down' && 'bg-destructive shadow-[0_0_0_3px] shadow-destructive/20',
                    state === 'checking' && 'animate-pulse bg-muted-foreground/50',
                )}
            />
            <div className="min-w-0">
                <p className="text-sm font-semibold">{name}<span className="sr-only">: {STATE_LABEL[state]}</span></p>
                <p className="text-[13px] leading-snug text-muted-foreground text-pretty">{detail}</p>
            </div>
        </div>
    )
}

/** Whether the outside services the public pages lean on are answering, and what they last said. */
export function LiveFeeds() {
    const spotify = useRecentlyPlayed()
    const steam = useSteamGames()
    const chess = useChessStats()

    const lastTrack = spotify.tracks[0]
    const spotifyState: State = spotify.isLoading ? 'checking' : spotify.error ? 'down' : lastTrack ? 'up' : 'empty'
    const steamState: State = steam.isLoading ? 'checking' : steam.error ? 'down' : steam.games.length ? 'up' : 'empty'
    const rating = chess.data && (['rapid', 'blitz', 'bullet', 'daily'] as const).map(mode => ({ mode, r: chess.data![mode] })).find(m => m.r)
    const chessState: State = chess.isLoading ? 'checking' : chess.error ? 'down' : rating ? 'up' : 'empty'

    return (
        <div className="grid gap-3 md:grid-cols-3">
            <Feed
                name="Spotify"
                state={spotifyState}
                detail={
                    spotifyState === 'down' ? `Not answering: ${spotify.error}. Music shows nothing recent.`
                        : lastTrack ? `Last played “${lastTrack.title}” by ${lastTrack.artist}.`
                            : spotifyState === 'empty' ? 'Nothing played recently.' : 'Asking Spotify…'
                }
            />
            <Feed
                name="Steam"
                state={steamState}
                detail={
                    steamState === 'down' ? `Not answering: ${steam.error}.`
                        : steam.games.length ? `${steam.games[0].name} was played most recently.`
                            : steamState === 'empty' ? 'Nothing played in the last two weeks, so the Steam section is hidden on /games.' : 'Asking Steam…'
                }
            />
            <Feed
                name="Chess.com"
                state={chessState}
                detail={
                    chessState === 'down' ? `Not answering: ${chess.error}.`
                        : rating ? `${rating.mode[0].toUpperCase()}${rating.mode.slice(1)} ${rating.r!.last}.`
                            : chessState === 'empty' ? 'No rated games yet.' : 'Asking Chess.com…'
                }
            />
        </div>
    )
}
