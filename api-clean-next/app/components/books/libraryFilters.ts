import { BookData } from '@/app/hooks/useBooks'
import { BookGenre } from '@/domain/BookGenre'
import { BookStatus } from '@/domain/BookStatus'

export type StatusFilter = BookStatus | 'all'

/** Year bucket for completed books that have no completion date yet. */
export const UNDATED = 'undated'

export interface LibraryFilters {
    status: StatusFilter
    genre: BookGenre | 'all'
    /** 'YYYY', UNDATED or 'all' — a year means "finished in", so it implies completed */
    year: string
    /** an authorKey() or 'all' */
    author: string
    query: string
}

export interface FacetOption {
    value: string
    label: string
    /** books this option would show, given the other active filters */
    count: number
}

export const genreLabels: Record<BookGenre, string> = {
    [BookGenre.Fiction]: 'Fiction',
    [BookGenre.NonFiction]: 'Non-Fiction',
    [BookGenre.Fantasy]: 'Fantasy',
    [BookGenre.ScienceFiction]: 'Sci-Fi',
    [BookGenre.Mystery]: 'Mystery',
    [BookGenre.Thriller]: 'Thriller',
    [BookGenre.Romance]: 'Romance',
    [BookGenre.Horror]: 'Horror',
    [BookGenre.Biography]: 'Biography',
    [BookGenre.History]: 'History',
    [BookGenre.SelfHelp]: 'Self-Help',
    [BookGenre.Business]: 'Business',
    [BookGenre.Technology]: 'Technology',
    [BookGenre.Philosophy]: 'Philosophy',
}

const STATUSES = Object.values(BookStatus) as string[]
const GENRES = Object.values(BookGenre) as string[]

/** lowercase and accent-free, so "Dostoiévski" matches "dostoievski" */
function fold(text: string) {
    return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

/** "Robert C. Martin" and "robert c martin " are the same author */
export function authorKey(author: string) {
    return fold(author).replace(/\./g, '').replace(/\s+/g, ' ').trim()
}

/** 'YYYY' or UNDATED for completed books, null for anything not finished */
export function completedYear(book: BookData): string | null {
    if (book.status !== BookStatus.Completed) return null
    return book.completedAt ? book.completedAt.slice(0, 4) : UNDATED
}

export function yearLabel(year: string) {
    return year === UNDATED ? 'No date' : year
}

type Facet = 'status' | 'genre' | 'year' | 'author' | 'query'

function matches(book: BookData, filters: LibraryFilters, skip: Facet[] = []) {
    const applies = (facet: Facet) => !skip.includes(facet)

    if (applies('status') && filters.status !== 'all' && book.status !== filters.status) return false
    if (applies('year') && filters.year !== 'all' && completedYear(book) !== filters.year) return false
    if (applies('genre') && filters.genre !== 'all' && book.genre !== filters.genre) return false
    if (applies('author') && filters.author !== 'all' && authorKey(book.author) !== filters.author) return false

    const query = fold(filters.query.trim())
    if (applies('query') && query && !fold(book.title).includes(query) && !fold(book.author).includes(query)) {
        return false
    }
    return true
}

export function filterBooks(books: BookData[], filters: LibraryFilters) {
    return books.filter(book => matches(book, filters))
}

export function hasRefinements(filters: LibraryFilters) {
    return filters.genre !== 'all' || filters.year !== 'all' || filters.author !== 'all' || filters.query.trim() !== ''
}

/**
 * Every value present in the library stays listed (a stable menu), ordered by how often it
 * appears overall; the count reflects the other active filters so dead ends can be disabled.
 */
function buildFacet(
    books: BookData[],
    filters: LibraryFilters,
    skip: Facet[],
    valueOf: (book: BookData) => string | null | undefined,
    labelOf: (value: string, book: BookData) => string,
): FacetOption[] {
    const options = new Map<string, FacetOption & { total: number }>()

    for (const book of books) {
        const value = valueOf(book)
        if (!value) continue

        const option = options.get(value) ?? { value, label: labelOf(value, book), count: 0, total: 0 }
        option.total++
        if (matches(book, filters, skip)) option.count++
        options.set(value, option)
    }

    return Array.from(options.values())
        .sort((a, b) => b.total - a.total || a.label.localeCompare(b.label))
        .map(({ value, label, count }) => ({ value, label, count }))
}

export function yearOptions(books: BookData[], filters: LibraryFilters): FacetOption[] {
    // picking a year switches the view to completed, so the current status doesn't narrow the counts
    return buildFacet(books, filters, ['year', 'status'], completedYear, yearLabel)
        .sort((a, b) => {
            if (a.value === UNDATED) return 1
            if (b.value === UNDATED) return -1
            return b.value.localeCompare(a.value)
        })
}

export function authorOptions(books: BookData[], filters: LibraryFilters): FacetOption[] {
    return buildFacet(books, filters, ['author'], book => authorKey(book.author), (_, book) => book.author.trim())
}

export function genreOptions(books: BookData[], filters: LibraryFilters): FacetOption[] {
    return buildFacet(books, filters, ['genre'], book => book.genre, value => genreLabels[value as BookGenre] ?? value)
}

/** Distinct author names (first spelling wins), for suggestions when adding a book. */
export function distinctAuthors(books: BookData[]) {
    const byKey = new Map<string, string>()
    for (const book of books) {
        const key = authorKey(book.author)
        if (key && !byKey.has(key)) byKey.set(key, book.author.trim())
    }
    return Array.from(byKey.values()).sort((a, b) => a.localeCompare(b))
}

/** Most recently finished first; undated books go last, alphabetically. */
export function sortByCompletion(books: BookData[]) {
    return [...books].sort((a, b) => {
        if (a.completedAt && b.completedAt) return b.completedAt.localeCompare(a.completedAt)
        if (a.completedAt) return -1
        if (b.completedAt) return 1
        return a.title.localeCompare(b.title)
    })
}

export interface YearGroup {
    year: string
    books: BookData[]
    pages: number
}

export function groupByCompletionYear(books: BookData[]): YearGroup[] {
    const groups = new Map<string, YearGroup>()
    for (const book of sortByCompletion(books)) {
        const year = completedYear(book) ?? UNDATED
        const group = groups.get(year) ?? { year, books: [], pages: 0 }
        group.books.push(book)
        group.pages += book.pages || 0
        groups.set(year, group)
    }
    // sortByCompletion already put dated years newest-first and the undated bucket last
    return Array.from(groups.values())
}

export function parseFilters(params: { get(name: string): string | null }, query: string): LibraryFilters {
    const status = params.get('status') ?? ''
    const genre = params.get('genre') ?? ''
    const year = params.get('year') ?? ''
    const author = params.get('author') ?? ''
    const validYear = /^\d{4}$/.test(year) || year === UNDATED

    return {
        // a year means "finished in", so a shared ?year= link lands on Completed too
        status: validYear ? BookStatus.Completed : STATUSES.includes(status) ? (status as BookStatus) : 'all',
        genre: GENRES.includes(genre) ? (genre as BookGenre) : 'all',
        year: validYear ? year : 'all',
        author: author ? authorKey(author) : 'all',
        query,
    }
}

export function filtersToSearch(filters: LibraryFilters) {
    const params = new URLSearchParams()
    if (filters.status !== 'all') params.set('status', filters.status)
    if (filters.year !== 'all') params.set('year', filters.year)
    if (filters.author !== 'all') params.set('author', filters.author)
    if (filters.genre !== 'all') params.set('genre', filters.genre)
    return params.toString()
}

/** Today as YYYY-MM-DD in the reader's timezone (toISOString would use UTC). */
export function todayIsoDate() {
    const now = new Date()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${now.getFullYear()}-${month}-${day}`
}

/** "2025-03-14" → "Mar 2025", parsed as a local date so it never shifts a day */
export function formatMonthYear(isoDate: string) {
    const [year, month, day] = isoDate.split('-').map(Number)
    return new Date(year, month - 1, day).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export const numberFormat = new Intl.NumberFormat('en-US')
