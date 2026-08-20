'use client'

import { motion } from 'motion/react'
import { BookData } from '@/app/hooks/useBooks'
import { BookStatus } from '@/domain/BookStatus'
import { Library, BookMarked, CheckCircle2, BookOpen } from 'lucide-react'

export type StatusFilter = BookStatus | 'all'

interface LibraryFilterBentoProps {
    books: BookData[]
    statusFilter: StatusFilter
    onStatusFilter: (value: StatusFilter) => void
}

const tapProps = {
    whileHover: { y: -2 },
    whileTap: { scale: 0.98 },
    transition: { type: 'spring' as const, stiffness: 320, damping: 26 },
}

export function LibraryFilterBento({ books, statusFilter, onStatusFilter }: LibraryFilterBentoProps) {
    const reading = books.filter(b => b.status === BookStatus.InProgress)
    const toRead = books.filter(b => b.status === BookStatus.NotStarted)
    const completed = books.filter(b => b.status === BookStatus.Completed)
    const spotlightBook = reading[0]

    const isReadingActive = statusFilter === BookStatus.InProgress

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

            {/* SPOTLIGHT — currently reading */}
            <motion.button
                {...tapProps}
                onClick={() => onStatusFilter(BookStatus.InProgress)}
                disabled={!spotlightBook}
                className={`lg:col-span-2 relative overflow-hidden rounded-2xl border p-5 text-left transition-colors ${
                    isReadingActive
                        ? 'border-info/40 bg-info/5'
                        : 'border-border/60 bg-card hover:border-info/30'
                } ${!spotlightBook ? 'cursor-default' : ''}`}
            >
                {spotlightBook?.coverImageUrl && (
                    <div
                        className="absolute inset-0 scale-110 opacity-15 blur-2xl pointer-events-none"
                        style={{
                            backgroundImage: `url(${spotlightBook.coverImageUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    />
                )}

                <div className="relative flex items-center gap-2 mb-4">
                    <span className="relative flex h-2 w-2 shrink-0">
                        {spotlightBook && (
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-info opacity-75" />
                        )}
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${spotlightBook ? 'bg-info' : 'bg-muted-foreground/40'}`} />
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        {spotlightBook ? 'Reading now' : 'Nothing in progress'}
                    </span>
                </div>

                {spotlightBook ? (
                    <div className="relative flex items-center gap-4">
                        <div className="w-14 h-21 rounded-md overflow-hidden shrink-0 shadow-sm bg-muted">
                            {spotlightBook.coverImageUrl ? (
                                <img
                                    src={spotlightBook.coverImageUrl}
                                    alt={`${spotlightBook.title} cover`}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <BookOpen className="w-5 h-5 text-muted-foreground/40" />
                                </div>
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="font-semibold text-lg leading-snug line-clamp-2">{spotlightBook.title}</p>
                            <p className="text-sm text-muted-foreground mt-0.5 truncate">{spotlightBook.author}</p>
                            {reading.length > 1 && (
                                <p className="text-xs text-muted-foreground/70 mt-1">+{reading.length - 1} more in progress</p>
                            )}
                        </div>
                    </div>
                ) : (
                    <p className="relative text-sm text-muted-foreground">
                        Pick something up and it&apos;ll show up here.
                    </p>
                )}
            </motion.button>

            {/* STAT TILES — All / To read / Completed */}
            <div className="grid grid-cols-3 lg:grid-cols-1 gap-3">
                <StatTile
                    icon={Library}
                    label="All"
                    count={books.length}
                    active={statusFilter === 'all'}
                    token="primary"
                    onClick={() => onStatusFilter('all')}
                />
                <StatTile
                    icon={BookMarked}
                    label="To read"
                    count={toRead.length}
                    active={statusFilter === BookStatus.NotStarted}
                    token="muted"
                    onClick={() => onStatusFilter(BookStatus.NotStarted)}
                />
                <StatTile
                    icon={CheckCircle2}
                    label="Completed"
                    count={completed.length}
                    active={statusFilter === BookStatus.Completed}
                    token="success"
                    onClick={() => onStatusFilter(BookStatus.Completed)}
                />
            </div>
        </div>
    )
}

type Token = 'primary' | 'success' | 'muted'

const TOKEN_ACTIVE: Record<Token, string> = {
    primary: 'border-primary/40 bg-primary/5 text-primary',
    success: 'border-success/40 bg-success/5 text-success',
    muted: 'border-foreground/30 bg-muted text-foreground',
}

const TOKEN_ICON_INACTIVE: Record<Token, string> = {
    primary: 'text-muted-foreground group-hover:text-primary',
    success: 'text-muted-foreground group-hover:text-success',
    muted: 'text-muted-foreground group-hover:text-foreground',
}

interface StatTileProps {
    icon: React.ComponentType<{ className?: string }>
    label: string
    count: number
    active: boolean
    token: Token
    onClick: () => void
}

function StatTile({ icon: Icon, label, count, active, token, onClick }: StatTileProps) {
    return (
        <motion.button
            {...tapProps}
            onClick={onClick}
            className={`group flex-1 flex flex-col justify-center rounded-2xl border px-4 py-3 lg:py-0 lg:flex-row lg:items-center lg:gap-3 text-left transition-colors ${
                active ? TOKEN_ACTIVE[token] : 'border-border/60 bg-card hover:border-border'
            }`}
        >
            <Icon className={`w-4 h-4 mb-1.5 lg:mb-0 shrink-0 ${active ? '' : TOKEN_ICON_INACTIVE[token]}`} />
            <div className="min-w-0">
                <p className="text-xl font-bold tabular-nums leading-none">{count}</p>
                <p className={`text-xs mt-1 lg:mt-0.5 truncate ${active ? 'opacity-80' : 'text-muted-foreground'}`}>{label}</p>
            </div>
        </motion.button>
    )
}
