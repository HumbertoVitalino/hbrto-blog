import { BookStatus } from '@/domain/BookStatus'
import { BookGenre } from '@/domain/BookGenre'
import { StudyTopicStatus } from '@/domain/StudyTopicStatus'
import type { BookData } from '@/app/hooks/useBooks'
import type { NoteData } from '@/lib/mappers'
import type { StudySessionData } from '@/app/hooks/useStudySessions'
import type { StudyTopicData } from '@/app/hooks/useStudyTopics'
import type { SubscriberPlain } from '@/app/hooks/useSubscribers'
import { focusSessions } from '@/lib/studyStats'
import { addDays, toDayKey, weekStartOf } from '@/lib/habitDates'

// The admin overview's numbers, worked out from what the site already loads. Days are the
// device's own (the admin is used from where Humberto is), like the habit tracker.

const DAY_MS = 864e5

export function daysSince(iso: string, now: Date): number {
    return Math.max(0, Math.floor((now.getTime() - new Date(iso).getTime()) / DAY_MS))
}

const monthKey = (date: Date) => toDayKey(date).slice(0, 7)

export function finishedBooks(books: BookData[]): (BookData & { completedAt: string })[] {
    return books.filter((b): b is BookData & { completedAt: string } => b.status === BookStatus.Completed && !!b.completedAt)
}

// ── This year so far ──

export interface YearSoFar {
    books: number
    booksLastYear: number
    pages: number
    pagesLastYear: number
    notes: number
    lastNoteDaysAgo: number | null
    focusSeconds: number
    lastFocusDaysAgo: number | null
}

/** This year up to today, beside last year up to the same day. */
export function yearSoFar(books: BookData[], notes: NoteData[], sessions: StudySessionData[], now: Date): YearSoFar {
    const today = toDayKey(now)
    const year = today.slice(0, 4)
    const lastYear = String(Number(year) - 1)
    const sameDayLastYear = `${lastYear}${today.slice(4)}`
    const done = finishedBooks(books)
    const thisYear = done.filter(b => b.completedAt.startsWith(year) && b.completedAt <= today)
    const lastYears = done.filter(b => b.completedAt.startsWith(lastYear) && b.completedAt <= sameDayLastYear)
    const pages = (list: BookData[]) => list.reduce((sum, b) => sum + (b.pages || 0), 0)
    const focus = focusSessions(sessions)
    const latest = (dates: string[]) => dates.reduce<string | null>((a, b) => (!a || b > a ? b : a), null)
    const lastNote = latest(notes.map(n => n.createdAt))
    const lastFocus = latest(focus.map(s => s.startedAt))
    return {
        books: thisYear.length,
        booksLastYear: lastYears.length,
        pages: pages(thisYear),
        pagesLastYear: pages(lastYears),
        notes: notes.filter(n => toDayKey(new Date(n.createdAt)).startsWith(year)).length,
        lastNoteDaysAgo: lastNote ? daysSince(lastNote, now) : null,
        focusSeconds: focus.filter(s => toDayKey(new Date(s.startedAt)).startsWith(year)).reduce((sum, s) => sum + s.actualSeconds, 0),
        lastFocusDaysAgo: lastFocus ? daysSince(lastFocus, now) : null,
    }
}

// ── Needs attention ──

export interface Attention {
    unwritten: (BookData & { completedAt: string })[]
    englishOnly: NoteData[]
    reviewTitles: NoteData[]
    staleTopics: { topic: StudyTopicData; lastSession: string | null }[]
    lastFocus: string | null
}

// titles carried over from the old reviews: "Review: …" or a numbered "2. …"
const REVIEW_TITLE = /^(review:|\d+\.\s)/i
const STALE_DAYS = 14

export function attention(books: BookData[], notes: NoteData[], topics: StudyTopicData[], sessions: StudySessionData[], now: Date): Attention {
    const cited = new Set(notes.flatMap(n => n.subjects.filter(s => s.kind === 'book').map(s => s.id)))
    const focus = focusSessions(sessions)
    const lastOf = (list: StudySessionData[]) => list.reduce<string | null>((a, s) => (!a || s.startedAt > a ? s.startedAt : a), null)
    return {
        unwritten: finishedBooks(books)
            .filter(b => b.id && !cited.has(b.id))
            .sort((a, b) => b.completedAt.localeCompare(a.completedAt)),
        englishOnly: notes.filter(n => !n.entries.some(e => e.language === 'pt-BR')),
        reviewTitles: notes.filter(n => REVIEW_TITLE.test(n.entries[0]?.title ?? '')),
        staleTopics: topics
            .filter(t => t.status === StudyTopicStatus.InProgress)
            .map(topic => ({ topic, lastSession: lastOf(focus.filter(s => s.topicId === topic.id)) }))
            .filter(({ lastSession }) => !lastSession || daysSince(lastSession, now) > STALE_DAYS),
        lastFocus: lastOf(focus),
    }
}

// ── Trends ──

export interface Point {
    /** short label under the bar */
    label: string
    /** full name for the tooltip and the table */
    name: string
    value: number
}

const shortMonth = new Intl.DateTimeFormat('en', { month: 'short' })
const longMonth = new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' })
const monthDay = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' })

/** The last twelve months, oldest first, each counting what `monthOf` puts in it. */
function byMonth<T>(items: T[], monthOf: (item: T) => string | null, now: Date): Point[] {
    const counts = new Map<string, number>()
    for (const item of items) {
        const key = monthOf(item)
        if (key) counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    return Array.from({ length: 12 }, (_, i) => {
        const date = new Date(now.getFullYear(), now.getMonth() - 11 + i, 15)
        return { label: shortMonth.format(date), name: longMonth.format(date), value: counts.get(monthKey(date)) ?? 0 }
    })
}

export function booksByMonth(books: BookData[], now: Date): Point[] {
    return byMonth(finishedBooks(books), b => b.completedAt.slice(0, 7), now)
}

export function notesByMonth(notes: NoteData[], now: Date): Point[] {
    return byMonth(notes, n => monthKey(new Date(n.createdAt)), now)
}

/** Focus hours in each of the last twelve weeks (Monday to Sunday), oldest first. */
export function focusByWeek(sessions: StudySessionData[], now: Date): Point[] {
    const current = weekStartOf(toDayKey(now))
    const seconds = new Map<string, number>()
    for (const s of focusSessions(sessions)) {
        const week = weekStartOf(toDayKey(new Date(s.startedAt)))
        seconds.set(week, (seconds.get(week) ?? 0) + s.actualSeconds)
    }
    return Array.from({ length: 12 }, (_, i) => {
        const week = addDays(current, -7 * (11 - i))
        const date = new Date(`${week}T12:00:00`)
        return { label: monthDay.format(date), name: `Week of ${monthDay.format(date)}`, value: (seconds.get(week) ?? 0) / 3600 }
    })
}

/** Finished books per genre, most first. */
export function booksByGenre(books: BookData[]): { genre: BookGenre; count: number }[] {
    const counts = new Map<BookGenre, number>()
    for (const b of finishedBooks(books)) if (b.genre) counts.set(b.genre, (counts.get(b.genre) ?? 0) + 1)
    return [...counts].map(([genre, count]) => ({ genre, count })).sort((a, b) => b.count - a.count)
}

/** Current subscribers in the order they joined, and how many joined in the last 30 days. */
export function signups(subscribers: SubscriberPlain[], now: Date): { joined: string[]; recent: number } {
    const joined = subscribers.map(s => s.subscribedAt).sort()
    return { joined, recent: joined.filter(at => daysSince(at, now) <= 30).length }
}
