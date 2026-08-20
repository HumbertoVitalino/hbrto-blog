'use client'

import { useState, useCallback } from 'react'
import { useGames, GameData } from '@/app/hooks/useGames'
import { useSteamGames } from '@/app/hooks/useSteamGames'
import { useChessStats } from '@/app/hooks/useChessStats'
import { useAuth } from '@/app/context/AuthContext'
import { GameCard } from '@/app/components/games/GameCard'
import { GameFormModal } from '@/app/components/games/GameFormModal'
import { SteamGameItem } from '@/app/components/games/SteamGameItem'
import { ChessStatsCard } from '@/app/components/games/ChessStatsCard'
import { RevealGroup, RevealItem } from '@/app/components/motion/Reveal'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, Plus, Gamepad2, PlayCircle, CheckCircle2, Bookmark } from 'lucide-react'
import { GamePlatform } from '@/domain/GamePlatform'
import { GameStatus } from '@/domain/GameStatus'

const PLATFORM_FILTERS: { label: string; value: GamePlatform | 'all' }[] = [
    { label: 'All', value: 'all' },
    { label: 'PlayStation', value: GamePlatform.PSN },
    { label: 'Switch', value: GamePlatform.NintendoSwitch },
]

type StatusToken = 'primary' | 'info' | 'success' | 'muted'

const STATUS_FILTERS: { label: string; value: GameStatus | 'all'; icon: typeof Gamepad2; token: StatusToken }[] = [
    { label: 'All', value: 'all', icon: Gamepad2, token: 'primary' },
    { label: 'Playing', value: GameStatus.Playing, icon: PlayCircle, token: 'info' },
    { label: 'Completed', value: GameStatus.Completed, icon: CheckCircle2, token: 'success' },
    { label: 'Backlog', value: GameStatus.NotStarted, icon: Bookmark, token: 'muted' },
]

const STATUS_ACTIVE: Record<StatusToken, string> = {
    primary: 'border-primary/40 bg-primary/10 text-primary',
    info: 'border-info/40 bg-info/10 text-info',
    success: 'border-success/40 bg-success/10 text-success',
    muted: 'border-foreground/30 bg-muted text-foreground',
}

function formatHours(minutes: number): string {
    const hours = Math.round(minutes / 60)
    return hours < 1 ? `${minutes}m` : `${hours}h`
}

function Spinner() {
    return (
        <div className="flex justify-center py-10">
            <div className="h-4 w-4 rounded-full border border-muted border-t-foreground animate-spin" />
        </div>
    )
}

function PanelLabel({ children }: { children: React.ReactNode }) {
    return (
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            {children}
        </p>
    )
}

export default function GamesPage() {
    const [platformFilter, setPlatformFilter] = useState<GamePlatform | 'all'>('all')
    const [statusFilter, setStatusFilter] = useState<GameStatus | 'all'>('all')
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [selectedGame, setSelectedGame] = useState<GameData | undefined>()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [deletingId, setDeletingId] = useState<string | undefined>()

    const { games, isLoading: loadingGames, error: errorGames, createGame, updateGame, deleteGame } = useGames()
    const { games: steamGames, isLoading: loadingSteam, error: errorSteam } = useSteamGames()
    const { data: chessStats, isLoading: loadingChess, error: errorChess } = useChessStats()
    const { isAdmin } = useAuth()

    const handleNew = useCallback(() => {
        setSelectedGame(undefined)
        setIsFormOpen(true)
    }, [])

    const handleEdit = useCallback((game: GameData) => {
        setSelectedGame(game)
        setIsFormOpen(true)
    }, [])

    const handleSubmit = useCallback(async (data: Omit<GameData, 'id'>) => {
        setIsSubmitting(true)
        try {
            if (selectedGame?.id) {
                await updateGame(selectedGame.id, data)
            } else {
                await createGame(data)
            }
        } finally {
            setIsSubmitting(false)
        }
    }, [selectedGame, createGame, updateGame])

    const handleDelete = useCallback(async (id: string) => {
        if (!confirm('Delete this game?')) return
        setDeletingId(id)
        try { await deleteGame(id) }
        finally { setDeletingId(undefined) }
    }, [deleteGame])

    const filteredGames = games.filter((g) => {
        if (platformFilter !== 'all' && g.platform !== platformFilter) return false
        if (statusFilter !== 'all' && g.status !== statusFilter) return false
        return true
    })

    const countForStatus = (status: GameStatus | 'all') =>
        status === 'all' ? games.length : games.filter((g) => g.status === status).length

    const spotlightGame = steamGames[0]
    const restSteamGames = steamGames.slice(1, 5)
    const spotlightRatio = spotlightGame && spotlightGame.playtimeForever > 0
        ? Math.min((spotlightGame.playtime2weeks / spotlightGame.playtimeForever) * 100, 100)
        : 0

    return (
    <>
        <main className="min-h-screen bg-background">
            <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">

                {/* TITLE BAR */}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="font-display text-3xl font-medium tracking-tight">Games</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Steam activity, Chess.com ratings, and my PlayStation &amp; Switch library.
                        </p>
                    </div>
                    {isAdmin && (
                        <Button size="sm" onClick={handleNew} className="gap-2 shrink-0">
                            <Plus className="w-4 h-4" />
                            Add game
                        </Button>
                    )}
                </div>

                {errorGames && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{errorGames}</AlertDescription>
                    </Alert>
                )}

                {/* RIGHT NOW — Steam + Chess */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">

                    {/* Steam */}
                    <div className="rounded-2xl border border-border/60 bg-card p-5 h-full">
                        <PanelLabel>Recently played on Steam</PanelLabel>
                        {loadingSteam ? (
                            <Spinner />
                        ) : errorSteam ? (
                            <p className="text-sm text-muted-foreground py-4 text-center">Could not load Steam data.</p>
                        ) : steamGames.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-4 text-center">No recent games.</p>
                        ) : (
                            <>
                                {spotlightGame && (
                                    <div className="rounded-xl border border-border/50 bg-muted/20 p-4 mb-2">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="relative flex h-2 w-2 shrink-0">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-75" />
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-accent" />
                                            </span>
                                            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                                Most played recently
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <img
                                                src={spotlightGame.headerImageUrl}
                                                alt={spotlightGame.name}
                                                className="w-28 h-16 rounded-lg object-cover shrink-0 shadow-sm"
                                            />
                                            <div className="min-w-0 flex-1">
                                                <p className="font-semibold text-base leading-snug line-clamp-1">{spotlightGame.name}</p>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    {formatHours(spotlightGame.playtimeForever)} total
                                                    {spotlightGame.playtime2weeks > 0 && ` · ${formatHours(spotlightGame.playtime2weeks)} this week`}
                                                </p>
                                                <div className="h-1.5 rounded-full bg-muted overflow-hidden mt-2 max-w-50">
                                                    <div
                                                        className="h-full bg-brand-accent rounded-full transition-[width] duration-500"
                                                        style={{ width: `${spotlightRatio}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {restSteamGames.length > 0 && (
                                    <div>
                                        {restSteamGames.map((game, i) => (
                                            <SteamGameItem key={game.appId} game={game} rank={i + 2} />
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Chess.com */}
                    {loadingChess ? (
                        <div className="rounded-2xl border border-border/60 bg-card p-5 h-full">
                            <PanelLabel>Chess.com</PanelLabel>
                            <Spinner />
                        </div>
                    ) : errorChess || !chessStats ? (
                        <div className="rounded-2xl border border-border/60 bg-card p-5 h-full">
                            <PanelLabel>Chess.com</PanelLabel>
                            <p className="text-sm text-muted-foreground py-4 text-center">Could not load Chess.com data.</p>
                        </div>
                    ) : (
                        <ChessStatsCard data={chessStats} />
                    )}
                </div>

                {/* CATALOG — PSN + Switch */}
                <div>
                    <PanelLabel>Library — PlayStation &amp; Switch</PanelLabel>

                    {!loadingGames && games.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap mb-6">
                            {STATUS_FILTERS.map(({ label, value, icon: Icon, token }) => (
                                <button
                                    key={value}
                                    onClick={() => setStatusFilter(value)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                                        statusFilter === value
                                            ? STATUS_ACTIVE[token]
                                            : 'border-border/60 text-muted-foreground hover:text-foreground hover:border-border'
                                    }`}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    {label}
                                    <span className="opacity-70 tabular-nums">{countForStatus(value)}</span>
                                </button>
                            ))}

                            <div className="ml-auto flex items-center gap-0.5 rounded-full border border-border/60 p-0.5">
                                {PLATFORM_FILTERS.map(({ label, value }) => (
                                    <button
                                        key={value}
                                        onClick={() => setPlatformFilter(value)}
                                        className={`text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
                                            platformFilter === value
                                                ? 'bg-primary text-primary-foreground'
                                                : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {loadingGames ? (
                        <Spinner />
                    ) : filteredGames.length === 0 ? (
                        <div className="text-center py-20 border border-dashed border-border/50 rounded-2xl">
                            <p className="text-sm text-muted-foreground">
                                {games.length === 0 ? 'No games yet.' : 'No games match these filters.'}
                            </p>
                        </div>
                    ) : (
                        <RevealGroup className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {filteredGames.map((game) => (
                                <RevealItem key={game.id}>
                                    <GameCard
                                        game={game}
                                        isAdmin={isAdmin}
                                        isDeleting={deletingId === game.id}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                    />
                                </RevealItem>
                            ))}
                        </RevealGroup>
                    )}
                </div>

            </div>
        </main>

        {isAdmin && (
            <GameFormModal
                isOpen={isFormOpen}
                game={selectedGame}
                isLoading={isSubmitting}
                onSubmit={handleSubmit}
                onOpenChange={setIsFormOpen}
            />
        )}
    </>
    )
}
