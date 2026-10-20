'use client'

import { useState, useCallback, useMemo } from 'react'
import { useGames, GameData } from '@/app/hooks/useGames'
import { useSteamGames } from '@/app/hooks/useSteamGames'
import { useChessStats } from '@/app/hooks/useChessStats'
import { useAuth } from '@/app/context/AuthContext'
import { GameShelfItem } from '@/app/components/games/GameShelfItem'
import { GameFormModal } from '@/app/components/games/GameFormModal'
import { SteamGameItem } from '@/app/components/games/SteamGameItem'
import { ChessStatsCard } from '@/app/components/games/ChessStatsCard'
import { PlayingNow } from '@/app/components/games/PlayingNow'
import { gamesSummary, sortGames } from '@/app/components/games/gameStats'
import { PageContainer, PageHeader, PageLead } from '@/app/components/layout/PageHeader'
import { Segmented } from '@/app/components/layout/Segmented'
import { FadeIn } from '@/app/components/motion/FadeIn'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { AlertCircle, Plus } from 'lucide-react'
import { GamePlatform } from '@/domain/GamePlatform'
import { GameStatus } from '@/domain/GameStatus'
import { toast } from 'sonner'

type StatusFilter = GameStatus | 'all'
type PlatformFilter = GamePlatform | 'all'

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: GameStatus.Playing, label: 'Playing' },
    { value: GameStatus.Completed, label: 'Completed' },
    { value: GameStatus.NotStarted, label: 'Backlog' },
]

const PLATFORM_OPTIONS: { value: PlatformFilter; label: string }[] = [
    { value: 'all', label: 'All platforms' },
    { value: GamePlatform.PSN, label: 'PlayStation' },
    { value: GamePlatform.NintendoSwitch, label: 'Switch' },
]

function Spinner() {
    return (
        <div className="flex justify-center py-20">
            <div className="h-5 w-5 rounded-full border border-muted border-t-foreground animate-spin" />
        </div>
    )
}

export default function GamesPage() {
    const [platformFilter, setPlatformFilter] = useState<PlatformFilter>('all')
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [selectedGame, setSelectedGame] = useState<GameData | undefined>()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [deletingId, setDeletingId] = useState<string | undefined>()
    const [pendingDeleteId, setPendingDeleteId] = useState<string | undefined>()

    const { games, isLoading: loadingGames, error: errorGames, createGame, updateGame, deleteGame } = useGames()
    const { games: steamGames } = useSteamGames()
    const { data: chessStats } = useChessStats()
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
                toast.success('Game updated')
            } else {
                await createGame(data)
                toast.success('Game added')
            }
        } finally {
            setIsSubmitting(false)
        }
    }, [selectedGame, createGame, updateGame])

    const handleDelete = useCallback((id: string) => {
        setPendingDeleteId(id)
    }, [])

    const confirmDelete = useCallback(async () => {
        if (!pendingDeleteId) return
        setDeletingId(pendingDeleteId)
        try {
            await deleteGame(pendingDeleteId)
            toast.success('Game deleted')
        }
        finally {
            setDeletingId(undefined)
            setPendingDeleteId(undefined)
        }
    }, [pendingDeleteId, deleteGame])

    const summary = useMemo(() => gamesSummary(games), [games])
    const playing = useMemo(() => games.filter(g => g.status === GameStatus.Playing), [games])

    // status counts follow the platform choice, and a status with nothing in it isn't offered
    const onPlatform = useMemo(
        () => games.filter(g => platformFilter === 'all' || g.platform === platformFilter),
        [games, platformFilter],
    )
    const statusOptions = useMemo(() => STATUS_OPTIONS
        .map(o => ({ ...o, count: o.value === 'all' ? onPlatform.length : onPlatform.filter(g => g.status === o.value).length }))
        .filter(o => o.value === 'all' || o.count > 0 || o.value === statusFilter),
    [onPlatform, statusFilter])

    const visibleGames = useMemo(
        () => sortGames(onPlatform.filter(g => statusFilter === 'all' || g.status === statusFilter)),
        [onPlatform, statusFilter],
    )

    // only show platforms the shelf actually holds
    const platformOptions = PLATFORM_OPTIONS.filter(o => o.value === 'all' || games.some(g => g.platform === o.value))

    return (
    <>
        <PageContainer>
            <PageHeader title="Games I’ve finished, I’m playing, and want to play.">
                {summary && <PageLead>{summary}</PageLead>}
                {isAdmin && (
                    <Button size="sm" onClick={handleNew} className="mt-8 gap-2">
                        <Plus className="size-4" />
                        Add game
                    </Button>
                )}
            </PageHeader>

            {errorGames && (
                <Alert variant="destructive" className="mt-10">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{errorGames}</AlertDescription>
                </Alert>
            )}

            {playing.length > 0 && (
                <FadeIn index={1} className="mt-14">
                    <PlayingNow games={playing} />
                </FadeIn>
            )}

            {/* live data shows only when there's something real to show */}
            {chessStats && (
                <FadeIn index={2} className="mt-4">
                    <ChessStatsCard data={chessStats} />
                </FadeIn>
            )}

            {steamGames.length > 0 && (
                <FadeIn index={3}>
                    <section aria-labelledby="steam-heading" className="mt-16">
                        <h2 id="steam-heading" className="text-sm font-semibold">Recently on Steam</h2>
                        <ul className="mt-8 flex flex-col gap-10">
                            {steamGames.slice(0, 5).map(game => <SteamGameItem key={game.appId} game={game} />)}
                        </ul>
                    </section>
                </FadeIn>
            )}

            {loadingGames ? (
                <Spinner />
            ) : games.length > 0 && (
                <FadeIn index={4}>
                    <div className="mt-16 flex flex-col gap-3 sm:mt-18 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                        <Segmented id="games-status" label="Filter by status" options={statusOptions} value={statusFilter} onChange={setStatusFilter} />
                        {platformOptions.length > 2 && (
                            <Segmented
                                id="games-platform"
                                label="Filter by platform"
                                options={platformOptions}
                                value={platformFilter}
                                onChange={(value) => { setPlatformFilter(value); setStatusFilter('all') }}
                            />
                        )}
                    </div>

                    <section aria-labelledby="shelf-heading" className="mt-14">
                        <div className="mb-7 flex items-baseline gap-3">
                            <h2 id="shelf-heading" className="text-sm font-semibold">Library</h2>
                            <span className="text-[13px] tabular-nums text-muted-foreground">
                                {visibleGames.length} {visibleGames.length === 1 ? 'game' : 'games'}
                            </span>
                        </div>
                        {visibleGames.length === 0 ? (
                            <p className="py-10 text-sm text-muted-foreground">No games match these filters.</p>
                        ) : (
                            <ul className="grid grid-cols-3 gap-x-4 gap-y-8 sm:grid-cols-4 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-6">
                                {visibleGames.map(game => (
                                    <GameShelfItem
                                        key={game.id}
                                        game={game}
                                        isAdmin={isAdmin}
                                        isDeleting={deletingId === game.id}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </ul>
                        )}
                    </section>
                </FadeIn>
            )}

            {!loadingGames && games.length === 0 && !errorGames && (
                <p className="mt-14 text-sm text-muted-foreground">No games yet.</p>
            )}
        </PageContainer>

        {isAdmin && (
            <GameFormModal
                isOpen={isFormOpen}
                game={selectedGame}
                isLoading={isSubmitting}
                onSubmit={handleSubmit}
                onOpenChange={setIsFormOpen}
            />
        )}

        <AlertDialog open={!!pendingDeleteId} onOpenChange={(open) => !open && setPendingDeleteId(undefined)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete this game?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action can&apos;t be undone. The entry will be permanently removed from your library.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel />
                    <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
    )
}
