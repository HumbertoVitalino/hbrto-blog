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
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, Plus } from 'lucide-react'
import { GamePlatform } from '@/domain/GamePlatform'
import { GameStatus } from '@/domain/GameStatus'

const PLATFORM_FILTERS: { label: string; value: GamePlatform | 'all' }[] = [
    { label: 'All', value: 'all' },
    { label: 'PlayStation', value: GamePlatform.PSN },
    { label: 'Switch', value: GamePlatform.NintendoSwitch },
]

const STATUS_FILTERS: { label: string; value: GameStatus | 'all' }[] = [
    { label: 'All', value: 'all' },
    { label: 'Playing', value: GameStatus.Playing },
    { label: 'Completed', value: GameStatus.Completed },
    { label: 'Backlog', value: GameStatus.NotStarted },
]

function Spinner() {
    return (
        <div className="flex justify-center py-10">
            <div className="h-4 w-4 rounded-full border border-muted border-t-foreground animate-spin" />
        </div>
    )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            {children}
        </p>
    )
}

function FilterPill({
    active,
    onClick,
    children,
    count,
}: {
    active: boolean
    onClick: () => void
    children: React.ReactNode
    count?: number
}) {
    return (
        <button
            onClick={onClick}
            className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                active
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
            }`}
        >
            {children}
            {count !== undefined && (
                <span className="opacity-60 ml-1.5 tabular-nums">{count}</span>
            )}
        </button>
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

    const countFor = (platform: GamePlatform | 'all', status: GameStatus | 'all') =>
        games.filter((g) => {
            if (platform !== 'all' && g.platform !== platform) return false
            if (status !== 'all' && g.status !== status) return false
            return true
        }).length

    return (
    <>
        <main className="min-h-screen bg-background">

            {/* HERO */}
            <section className="border-b bg-muted/10">
                <div className="max-w-5xl mx-auto px-6 py-14">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Games</p>
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight">What I'm playing</h1>
                            <p className="text-muted-foreground mt-2">
                                Steam activity, Chess.com ratings, and my PlayStation & Switch library.
                            </p>
                        </div>
                        {isAdmin && (
                            <Button size="sm" onClick={handleNew} className="gap-2 shrink-0 mt-1">
                                <Plus className="w-4 h-4" />
                                Add game
                            </Button>
                        )}
                    </div>

                    {/* STATS */}
                    {!loadingGames && (games.length > 0 || steamGames.length > 0) && (
                        <div className="flex items-center gap-2 mt-8 pt-6 border-t border-border/50 text-sm flex-wrap">
                            {steamGames.length > 0 && (
                                <>
                                    <span>
                                        <span className="font-semibold text-foreground tabular-nums">{steamGames.length}</span>
                                        <span className="text-muted-foreground ml-1">Steam games</span>
                                    </span>
                                    <span className="text-border select-none">·</span>
                                </>
                            )}
                            {games.length > 0 && (
                                <>
                                    <span>
                                        <span className="font-semibold text-foreground tabular-nums">
                                            {games.filter((g) => g.status === GameStatus.Playing).length}
                                        </span>
                                        <span className="text-muted-foreground ml-1">playing</span>
                                    </span>
                                    <span className="text-border select-none">·</span>
                                    <span>
                                        <span className="font-semibold text-foreground tabular-nums">
                                            {games.filter((g) => g.status === GameStatus.Completed).length}
                                        </span>
                                        <span className="text-muted-foreground ml-1">completed</span>
                                    </span>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </section>

            <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">

                {errorGames && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{errorGames}</AlertDescription>
                    </Alert>
                )}

                {/* LIVE — Steam + Chess */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

                    {/* Steam recently played */}
                    <Card className="p-5">
                        <SectionLabel>Recently played on Steam</SectionLabel>
                        {loadingSteam ? (
                            <Spinner />
                        ) : errorSteam ? (
                            <p className="text-sm text-muted-foreground py-4 text-center">Could not load Steam data.</p>
                        ) : steamGames.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-4 text-center">No recent games.</p>
                        ) : (
                            <div>
                                {steamGames.map((game, i) => (
                                    <SteamGameItem key={game.appId} game={game} rank={i + 1} />
                                ))}
                            </div>
                        )}
                    </Card>

                    {/* Chess.com stats */}
                    {loadingChess ? (
                        <Card className="p-5">
                            <SectionLabel>Chess.com</SectionLabel>
                            <Spinner />
                        </Card>
                    ) : errorChess || !chessStats ? (
                        <Card className="p-5">
                            <SectionLabel>Chess.com</SectionLabel>
                            <p className="text-sm text-muted-foreground py-4 text-center">Could not load Chess.com data.</p>
                        </Card>
                    ) : (
                        <ChessStatsCard data={chessStats} />
                    )}
                </div>

                {/* CATALOG — PSN + Switch */}
                <div>
                    <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
                        <SectionLabel>Library — PlayStation & Switch</SectionLabel>
                    </div>

                    {/* FILTERS */}
                    {!loadingGames && games.length > 0 && (
                        <div className="rounded-xl border border-border/50 bg-card p-4 space-y-3 mb-6">
                            <div className="flex items-start gap-3">
                                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 pt-1.5 w-14 shrink-0 select-none">
                                    Platform
                                </span>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    {PLATFORM_FILTERS.map(({ label, value }) => (
                                        <FilterPill
                                            key={value}
                                            active={platformFilter === value}
                                            onClick={() => setPlatformFilter(value)}
                                            count={countFor(value, statusFilter)}
                                        >
                                            {label}
                                        </FilterPill>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 pt-1.5 w-14 shrink-0 select-none">
                                    Status
                                </span>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    {STATUS_FILTERS.map(({ label, value }) => (
                                        <FilterPill
                                            key={value}
                                            active={statusFilter === value}
                                            onClick={() => setStatusFilter(value)}
                                            count={countFor(platformFilter, value)}
                                        >
                                            {label}
                                        </FilterPill>
                                    ))}
                                </div>
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
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {filteredGames.map((game) => (
                                <GameCard
                                    key={game.id}
                                    game={game}
                                    isAdmin={isAdmin}
                                    isDeleting={deletingId === game.id}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
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
