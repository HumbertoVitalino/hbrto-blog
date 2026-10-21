'use client'

import { useMemo, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { ArrowDown, ArrowUp, Clock, Globe, PenLine, Plus, Tag } from 'lucide-react'
import { toast } from 'sonner'
import { BookGenre } from '@/domain/BookGenre'
import { BookStatus } from '@/domain/BookStatus'
import { useBooks } from '@/app/hooks/useBooks'
import { useNotes } from '@/app/hooks/useNotes'
import { useGames } from '@/app/hooks/useGames'
import { useStudySessions } from '@/app/hooks/useStudySessions'
import { useStudyTopics } from '@/app/hooks/useStudyTopics'
import type { SubscriberPlain } from '@/app/hooks/useSubscribers'
import { NewNoteButton } from '@/app/components/notes/NoteAdmin'
import { BookFormModal } from '@/app/components/books/BookFormModal'
import { GameFormModal } from '@/app/components/games/GameFormModal'
import { StudyTopicFormModal } from '@/app/components/studies/StudyTopicFormModal'
import { genreLabels } from '@/app/components/books/libraryFilters'
import { formatMinutes } from '@/lib/studyStats'
import { attention, booksByGenre, booksByMonth, daysSince, focusByWeek, notesByMonth, signups, yearSoFar } from '@/lib/adminOverview'
import { cn } from '@/lib/utils'
import { ColumnChart } from './ColumnChart'
import { SignupsChart } from './SignupsChart'
import { LiveFeeds } from './LiveFeeds'

const number = new Intl.NumberFormat('en-US')
const shortDay = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' })
const ago = (days: number) => (days === 0 ? 'today' : days === 1 ? 'yesterday' : `${days} days ago`)
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`

const pill = 'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.75 text-[13px] font-medium transition-transform duration-100 active:scale-[0.97]'

function Delta({ now, before, year }: { now: number; before: number; year: number }) {
    if (!before) return <p className="mt-1 text-xs text-muted-foreground">nothing by this point in {year - 1}</p>
    const change = Math.round(((now - before) / before) * 100)
    const up = change >= 0
    const Icon = up ? ArrowUp : ArrowDown
    return (
        <p className={cn('mt-1 flex items-center gap-1 text-xs', up ? 'text-success' : 'text-destructive-text')}>
            <Icon className="size-3" aria-hidden />
            {up ? 'up' : 'down'} {Math.abs(change)}% on this point in {year - 1}
        </p>
    )
}

function Tile({ label, value, children }: { label: string; value: string; children: ReactNode }) {
    return (
        <div className="raised-card px-5 py-4.5">
            <p className="text-[13px] text-muted-foreground">{label}</p>
            <p className="mt-1 text-[1.75rem] font-semibold leading-9 tracking-tight">{value}</p>
            {children}
        </div>
    )
}

function AttentionRow({ icon, tone, title, detail, action }: { icon: ReactNode; tone: 'info' | 'warn'; title: string; detail: string; action: ReactNode }) {
    return (
        <li className="flex items-center gap-3.5 px-5 py-3.5">
            <span aria-hidden className={cn('grid size-7 shrink-0 place-items-center rounded-lg', tone === 'warn' ? 'bg-warning/15 text-warning' : 'bg-chart-1/10 text-brand-accent')}>
                {icon}
            </span>
            <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-snug">{title}</p>
                <p className="mt-0.5 truncate text-[13px] text-muted-foreground">{detail}</p>
            </div>
            <div className="shrink-0">{action}</div>
        </li>
    )
}

const actionClass = 'rounded-full bg-chart-1/10 px-3 py-1.25 text-xs font-semibold text-brand-accent transition-transform duration-100 active:scale-[0.97]'

/**
 * The admin's view of the site: what needs doing, how this year compares with the last, how
 * reading, writing, focus and the newsletter are moving, and whether the outside feeds answer.
 */
export function AdminOverview({ subscribers, subscribersLoading }: { subscribers: SubscriberPlain[]; subscribersLoading: boolean }) {
    const { books, isLoading: booksLoading, createBook } = useBooks()
    const { notes, isLoading: notesLoading } = useNotes()
    const { createGame } = useGames()
    const { sessions, isLoading: sessionsLoading } = useStudySessions()
    const { topics, isLoading: topicsLoading, createTopic } = useStudyTopics()
    const [adding, setAdding] = useState<'book' | 'game' | 'topic' | null>(null)
    const [saving, setSaving] = useState(false)
    const now = useMemo(() => new Date(), [])

    const loading = booksLoading || notesLoading || sessionsLoading || topicsLoading || subscribersLoading
    const year = now.getFullYear()

    const stats = useMemo(() => yearSoFar(books, notes, sessions, now), [books, notes, sessions, now])
    const todo = useMemo(() => attention(books, notes, topics, sessions, now), [books, notes, topics, sessions, now])
    const genres = useMemo(() => booksByGenre(books), [books])
    const joined = useMemo(() => signups(subscribers, now), [subscribers, now])
    const reading = books.find(b => b.status === BookStatus.InProgress)

    const save = (create: () => Promise<unknown>, done: string) => async () => {
        setSaving(true)
        try {
            await create()
            toast.success(done)
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="h-5 w-5 animate-spin rounded-full border border-muted border-t-foreground" />
            </div>
        )
    }

    const rows: ReactNode[] = []
    if (todo.unwritten.length) {
        const latest = todo.unwritten[0]
        rows.push(
            <AttentionRow
                key="unwritten"
                icon={<PenLine className="size-3.75" />}
                tone="info"
                title={`${plural(todo.unwritten.length, 'finished book')} with no note yet`}
                detail={`Latest: ${todo.unwritten.slice(0, 3).map(b => b.title).join(', ')}`}
                action={<NewNoteButton preset={{ kind: 'book', id: latest.id! }} trigger={open => <button type="button" onClick={open} className={actionClass}>Write a note</button>} />}
            />,
        )
    }
    if (todo.englishOnly.length) {
        rows.push(
            <AttentionRow
                key="english"
                icon={<Globe className="size-3.75" />}
                tone="info"
                title={todo.englishOnly.length === notes.length ? 'Every note is only in English' : `${plural(todo.englishOnly.length, 'note is', 'notes are')} only in English`}
                detail="Add a Português version from the note’s editor"
                action={<Link href={todo.englishOnly.length === 1 ? `/notes/${todo.englishOnly[0].id}` : '/notes'} className={actionClass}>Open notes</Link>}
            />,
        )
    }
    if (todo.reviewTitles.length) {
        rows.push(
            <AttentionRow
                key="titles"
                icon={<Tag className="size-3.75" />}
                tone="warn"
                title={`${plural(todo.reviewTitles.length, 'title still reads', 'titles still read')} like a review`}
                detail={todo.reviewTitles.map(n => `“${n.entries[0].title}”`).join(' · ')}
                action={<Link href={`/notes/${todo.reviewTitles[0].id}`} className={actionClass}>Rename</Link>}
            />,
        )
    }
    for (const { topic, lastSession } of todo.staleTopics) {
        rows.push(
            <AttentionRow
                key={`topic-${topic.id}`}
                icon={<Clock className="size-3.75" />}
                tone="warn"
                title={lastSession
                    ? `“${topic.title}” has had no focus for ${daysSince(lastSession, now)} days`
                    : `“${topic.title}” is in progress but hasn’t had a focus session yet`}
                detail={lastSession
                    ? `Last session ${shortDay.format(new Date(lastSession))}`
                    : todo.lastFocus ? `Your last session was ${shortDay.format(new Date(todo.lastFocus))}, on another topic` : 'No focus sessions recorded yet'}
                action={<Link href="/studies" className={actionClass}>Open Studies</Link>}
            />,
        )
    }

    return (
        <div className="grid grid-cols-1 gap-12">
            <section>
                <p className="max-w-2xl text-base text-muted-foreground text-pretty">
                    You’ve finished <b className="font-semibold text-foreground">{plural(stats.books, 'book')}</b> this year
                    {reading ? <> and you’re reading <b className="font-semibold text-foreground">{reading.title}</b></> : null}.{' '}
                    {stats.lastNoteDaysAgo !== null ? (
                        <>
                            The last note went out <b className="font-semibold text-foreground">{ago(stats.lastNoteDaysAgo)}</b>, and{' '}
                            <b className="font-semibold text-foreground">{plural(subscribers.length, 'person', 'people')}</b> {subscribers.length === 1 ? 'is' : 'are'} waiting for the next one.
                        </>
                    ) : (
                        <>No note yet; <b className="font-semibold text-foreground">{plural(subscribers.length, 'person', 'people')}</b> {subscribers.length === 1 ? 'is' : 'are'} waiting for the first.</>
                    )}
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                    <NewNoteButton trigger={open => (
                        <button type="button" onClick={open} className={cn(pill, 'bg-primary text-primary-foreground')}><Plus className="size-3.5" />New note</button>
                    )} />
                    <button type="button" onClick={() => setAdding('book')} className={cn(pill, 'bg-card ring-1 ring-inset ring-border')}><Plus className="size-3.5" />Add book</button>
                    <button type="button" onClick={() => setAdding('game')} className={cn(pill, 'bg-card ring-1 ring-inset ring-border')}><Plus className="size-3.5" />Add game</button>
                    <button type="button" onClick={() => setAdding('topic')} className={cn(pill, 'bg-card ring-1 ring-inset ring-border')}><Plus className="size-3.5" />Add study topic</button>
                </div>
            </section>

            <section aria-labelledby="attention-heading">
                <h2 id="attention-heading" className="mb-4 text-sm font-semibold">Needs attention</h2>
                {rows.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nothing needs you right now.</p>
                ) : (
                    <ul className="raised-card divide-y divide-border py-1">{rows}</ul>
                )}
            </section>

            <section aria-labelledby="year-heading">
                <h2 id="year-heading" className="mb-4 text-sm font-semibold">This year so far</h2>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    <Tile label="Books finished" value={number.format(stats.books)}>
                        <Delta now={stats.books} before={stats.booksLastYear} year={year} />
                    </Tile>
                    <Tile label="Pages read" value={number.format(stats.pages)}>
                        <Delta now={stats.pages} before={stats.pagesLastYear} year={year} />
                    </Tile>
                    <Tile label="Notes published" value={number.format(stats.notes)}>
                        <p className="mt-1 text-xs text-muted-foreground">{stats.lastNoteDaysAgo === null ? 'none yet' : `last one ${ago(stats.lastNoteDaysAgo)}`}</p>
                    </Tile>
                    <Tile label="Focus time" value={stats.focusSeconds ? formatMinutes(stats.focusSeconds) : '0min'}>
                        <p className="mt-1 text-xs text-muted-foreground">{stats.lastFocusDaysAgo === null ? 'no sessions yet' : `last session ${ago(stats.lastFocusDaysAgo)}`}</p>
                    </Tile>
                </div>
            </section>

            <section aria-labelledby="trends-heading">
                <h2 id="trends-heading" className="mb-4 text-sm font-semibold">Trends</h2>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <ColumnChart title="Books finished" subtitle="Per month, last 12 months" points={booksByMonth(books, now)} />
                    <ColumnChart title="Notes published" subtitle="Per month, last 12 months" points={notesByMonth(notes, now)} />
                    <ColumnChart title="Focus time" subtitle="Hours per week, last 12 weeks" points={focusByWeek(sessions, now)} format={v => `${v.toFixed(1)}h`} />
                    <SignupsChart joined={joined.joined} recent={joined.recent} now={now} />
                    {genres.length > 0 && (
                        <figure className="raised-card px-5 py-5 sm:px-6 lg:col-span-2">
                            <figcaption>
                                <h3 className="text-sm font-semibold">What I finish</h3>
                                <p className="mt-0.5 text-[13px] text-muted-foreground">Finished books by genre, all time</p>
                            </figcaption>
                            <ul className="mt-4 grid gap-2.5">
                                {genres.map(({ genre, count }) => (
                                    <li key={genre} className="grid grid-cols-[6.5rem_1fr] items-center gap-3 text-[13px]">
                                        <span className="truncate text-muted-foreground">{genreLabels[genre as BookGenre] ?? genre}</span>
                                        <span className="flex items-center gap-2">
                                            <span aria-hidden className="h-3.5 rounded-l-[1px] rounded-r-[4px] bg-chart-1" style={{ width: `${(count / genres[0].count) * 85}%` }} />
                                            <span className="text-xs font-semibold tabular-nums">{count}</span>
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </figure>
                    )}
                </div>
            </section>

            <section aria-labelledby="feeds-heading">
                <h2 id="feeds-heading" className="mb-4 text-sm font-semibold">Live feeds</h2>
                <LiveFeeds />
            </section>

            {adding === 'book' && (
                <BookFormModal
                    isOpen
                    authors={[...new Set(books.map(b => b.author))].sort()}
                    isLoading={saving}
                    onSubmit={data => save(() => createBook(data), 'Book added')()}
                    onOpenChange={open => !open && setAdding(null)}
                />
            )}
            {adding === 'game' && (
                <GameFormModal
                    isOpen
                    isLoading={saving}
                    onSubmit={data => save(() => createGame(data), 'Game added')()}
                    onOpenChange={open => !open && setAdding(null)}
                />
            )}
            {adding === 'topic' && (
                <StudyTopicFormModal
                    isOpen
                    isLoading={saving}
                    onSubmit={data => save(() => createTopic(data), 'Topic added')()}
                    onOpenChange={open => !open && setAdding(null)}
                />
            )}
        </div>
    )
}
