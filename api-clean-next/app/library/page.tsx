'use client'

import { Suspense, useState, useCallback, useMemo, useRef } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useBooks, BookData } from '@/app/hooks/useBooks'
import { BookStatus } from '@/domain/BookStatus'
import { useAuth } from '@/app/context/AuthContext'
import { BookFormModal } from '@/app/components/books/BookFormModal'
import { BooksGrid } from '@/app/components/books/BooksGrid'
import { LibraryFilterBar } from '@/app/components/books/LibraryFilterBar'
import { ReadingNow } from '@/app/components/books/ReadingNow'
import { StatusSegmented } from '@/app/components/books/StatusSegmented'
import { PageContainer, PageHeader, PageLead } from '@/app/components/layout/PageHeader'
import { FadeIn } from '@/app/components/motion/FadeIn'
import {
  LibraryFilters,
  LibrarySummary,
  StatusFilter,
  UNDATED,
  authorKey,
  authorOptions,
  distinctAuthors,
  filterBooks,
  filtersToSearch,
  genreOptions,
  groupByCompletionYear,
  hasRefinements,
  librarySummary,
  numberFormat,
  parseFilters,
  sortByCompletion,
  statusCounts,
  yearLabel,
  yearOptions,
} from '@/app/components/books/libraryFilters'
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
import { toast } from 'sonner'

const sectionOrder: { status: BookStatus; label: string }[] = [
  { status: BookStatus.InProgress, label: 'Reading now' },
  { status: BookStatus.NotStarted, label: 'To read' },
  { status: BookStatus.Completed, label: 'Completed' },
]

const countBooks = (n: number) => `${n} ${n === 1 ? 'book' : 'books'}`
const sumPages = (books: BookData[]) => books.reduce((total, book) => total + (book.pages || 0), 0)

function Spinner() {
  return (
    <div className="flex justify-center py-20">
      <div className="h-6 w-6 rounded-full border border-muted border-t-foreground animate-spin" />
    </div>
  )
}

/** The year as the heading of a slice of the reading log, like a chapter title. */
function YearHeading({ year, books, as: Tag = 'h3', large = false }: {
  year: string
  books: BookData[]
  as?: 'h2' | 'h3'
  large?: boolean
}) {
  return (
    <div className="mb-7 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-border pb-4">
      <Tag className={`font-semibold tracking-tight tabular-nums ${large ? 'text-3xl' : 'text-2xl'}`}>
        {yearLabel(year)}
      </Tag>
      <span className="text-[13px] tabular-nums text-muted-foreground">
        {countBooks(books.length)} · {numberFormat.format(sumPages(books))} pages
      </span>
    </div>
  )
}

/** "28 finished since 2016, 7,946 pages in all. Mostly philosophy, with Dostoyevsky and Rowling on repeat." */
function summaryLine(s: LibrarySummary) {
  if (s.finished === 0) return null
  const first = `${s.finished} finished${s.since ? ` since ${s.since}` : ''}, ${numberFormat.format(s.pages)} pages in all.`
  const authors = s.repeatAuthors.length ? `${s.repeatAuthors.join(' and ')} on repeat` : ''
  const taste = s.mainGenre
    ? ` Mostly ${s.mainGenre}${authors ? `, with ${authors}` : ''}.`
    : authors ? ` ${authors[0].toUpperCase()}${authors.slice(1)}.` : ''
  return first + taste
}

function SectionHeading({ label, count }: { label: string; count: number }) {
  return (
    <div className="mb-7 flex items-baseline gap-3">
      <h2 className="text-sm font-semibold">{label}</h2>
      <span className="text-[13px] tabular-nums text-muted-foreground">{countBooks(count)}</span>
    </div>
  )
}

export default function LibraryPage() {
  // useSearchParams needs a Suspense boundary to prerender
  return (
    <Suspense fallback={<div className="min-h-screen"><Spinner /></div>}>
      <LibraryContent />
    </Suspense>
  )
}

function LibraryContent() {
  const { books, isLoading, error, createBook, updateBook, deleteBook } = useBooks()
  const { isAdmin } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const filterBarRef = useRef<HTMLDivElement>(null)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedBook, setSelectedBook] = useState<BookData | undefined>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | undefined>()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | undefined>()
  // search stays local; status/year/author/genre live in the URL so a view like "read in 2025" is linkable
  const [query, setQuery] = useState('')

  const filters = useMemo(() => parseFilters(searchParams, query), [searchParams, query])

  const setFilters = useCallback((patch: Partial<LibraryFilters>) => {
    const search = filtersToSearch({ ...filters, ...patch })
    router.replace(search ? `${pathname}?${search}` : pathname, { scroll: false })
  }, [filters, pathname, router])

  // a year means "finished in": anything but Completed (or All, which resets) drops it
  const handleStatusFilter = useCallback((status: StatusFilter) => {
    setFilters({ status, year: status === BookStatus.Completed ? filters.year : 'all' })
  }, [filters.year, setFilters])

  const handleYear = useCallback((year: string) => {
    setFilters({ year, status: year === 'all' ? filters.status : BookStatus.Completed })
  }, [filters.status, setFilters])

  const handleAuthorClick = useCallback((author: string) => {
    setFilters({ author: authorKey(author) })
    // the list shrinks under the reader's thumb; bring the active filters back into view
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    filterBarRef.current?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
  }, [setFilters])

  const clearRefinements = useCallback(() => {
    setQuery('')
    setFilters({ genre: 'all', year: 'all', author: 'all' })
  }, [setFilters])

  const clearAll = useCallback(() => {
    setQuery('')
    setFilters({ status: 'all', genre: 'all', year: 'all', author: 'all' })
  }, [setFilters])

  const visibleBooks = useMemo(() => filterBooks(books, filters), [books, filters])

  const booksByStatus = useMemo(() => ({
    [BookStatus.InProgress]: visibleBooks.filter(b => b.status === BookStatus.InProgress),
    [BookStatus.NotStarted]: visibleBooks.filter(b => b.status === BookStatus.NotStarted),
    [BookStatus.Completed]: sortByCompletion(visibleBooks.filter(b => b.status === BookStatus.Completed)),
  }), [visibleBooks])

  const years = useMemo(() => {
    const options = yearOptions(books, filters)
    // a menu holding only "No date" can't narrow anything down
    return options.some(o => o.value !== UNDATED) ? options : []
  }, [books, filters])
  const authors = useMemo(() => authorOptions(books, filters), [books, filters])
  const genres = useMemo(() => genreOptions(books, filters), [books, filters])
  const authorSuggestions = useMemo(() => distinctAuthors(books), [books])
  const counts = useMemo(() => statusCounts(books, filters), [books, filters])
  const summary = useMemo(() => summaryLine(librarySummary(books)), [books])
  const readingNow = useMemo(() => books.filter(b => b.status === BookStatus.InProgress), [books])

  const handleEdit = useCallback((book: BookData) => {
    setSelectedBook(book)
    setSubmitError(null)
    setIsFormOpen(true)
  }, [])

  const handleNew = useCallback(() => {
    setSelectedBook(undefined)
    setSubmitError(null)
    setIsFormOpen(true)
  }, [])

  const handleSubmit = useCallback(async (data: Omit<BookData, 'id'>) => {
    try {
      setIsSubmitting(true)
      setSubmitError(null)
      if (selectedBook?.id) {
        await updateBook(selectedBook.id, data)
        toast.success('Book updated')
      } else {
        await createBook(data)
        toast.success('Book added')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save book'
      setSubmitError(message)
      throw err
    } finally {
      setIsSubmitting(false)
    }
  }, [selectedBook, createBook, updateBook])

  const handleDelete = useCallback((id: string) => {
    setPendingDeleteId(id)
  }, [])

  const confirmDelete = useCallback(async () => {
    if (!pendingDeleteId) return
    try {
      setDeletingId(pendingDeleteId)
      await deleteBook(pendingDeleteId)
      toast.success('Book deleted')
    } finally {
      setDeletingId(undefined)
      setPendingDeleteId(undefined)
    }
  }, [pendingDeleteId, deleteBook])

  const gridProps = {
    onEdit: isAdmin ? handleEdit : () => {},
    onDelete: isAdmin ? handleDelete : () => {},
    deletingId,
    isPublic: !isAdmin,
    onAuthorClick: handleAuthorClick,
  }

  const isYearView = filters.year !== 'all'
  const completedBooks = booksByStatus[BookStatus.Completed]

  const isOverview = filters.status === 'all' && !hasRefinements(filters)
  // on the overview the book in hand gets its own card instead of a one-book shelf
  const showReadingNow = isOverview && readingNow.length > 0

  return (
    <PageContainer>

        <PageHeader title="Books I’ve read, I’m reading, and want to read.">
          {summary && <PageLead>{summary}</PageLead>}
          {isAdmin && (
            <Button size="sm" onClick={handleNew} className="mt-8 gap-2">
              <Plus className="size-4" />
              Add book
            </Button>
          )}
        </PageHeader>

        {/* ERRORS */}
        {(error || submitError) && (
          <Alert variant="destructive" className="mt-10">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error || submitError}</AlertDescription>
          </Alert>
        )}

        {/* LOADING */}
        {isLoading && <Spinner />}

        {/* CONTENT */}
        {!isLoading && (
          <>
            {showReadingNow && (
              <FadeIn index={1} className="mt-14">
                <ReadingNow books={readingNow} />
              </FadeIn>
            )}

            {/* FILTERS */}
            {books.length > 0 && (
              <FadeIn index={2}>
              <div ref={filterBarRef} className="mt-16 flex scroll-mt-28 flex-col gap-3 sm:mt-18 lg:flex-row lg:items-center lg:justify-between">
                <StatusSegmented value={filters.status} counts={counts} onChange={handleStatusFilter} />
                <LibraryFilterBar
                  query={query}
                  onQueryChange={setQuery}
                  year={filters.year}
                  yearOptions={years}
                  onYearChange={handleYear}
                  author={filters.author}
                  authorOptions={authors}
                  onAuthorChange={(author) => setFilters({ author })}
                  genre={filters.genre}
                  genreOptions={genres}
                  onGenreChange={(genre) => setFilters({ genre: genre as LibraryFilters['genre'] })}
                  canClear={hasRefinements(filters)}
                  onClear={clearRefinements}
                />
                <p className="sr-only" aria-live="polite">
                  {countBooks(visibleBooks.length)} shown
                </p>
              </div>
              </FadeIn>
            )}

            {/* one FadeIn around everything the filters swap, so changing a filter never replays the entrance */}
            <FadeIn index={3}>

            {/* EMPTY */}
            {visibleBooks.length === 0 && (
              <div className="mt-14 py-16 text-center">
                <p className="text-sm text-muted-foreground">
                  {books.length === 0 ? 'No books yet.' : 'No books match these filters.'}
                </p>
                {isAdmin && books.length === 0 && (
                  <Button variant="ghost" onClick={handleNew} className="mt-4">
                    Add your first book
                  </Button>
                )}
                {books.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearAll} className="mt-3">
                    Clear filters
                  </Button>
                )}
              </div>
            )}

            {/* YEAR VIEW — one slice of the reading log */}
            {visibleBooks.length > 0 && isYearView && (
              <section className="mt-14">
                <YearHeading year={filters.year} books={completedBooks} as="h2" large />
                {filters.year === UNDATED && isAdmin && (
                  <p className="-mt-3 mb-7 text-sm text-muted-foreground">
                    Edit a book and set when you finished it to file it under its year.
                  </p>
                )}
                <BooksGrid books={completedBooks} {...gridProps} />
              </section>
            )}

            {/* SHELVES */}
            {visibleBooks.length > 0 && !isYearView && (
              <div className="mt-14 flex flex-col gap-16">
                {sectionOrder.map(({ status, label }) => {
                  const sectionBooks = booksByStatus[status]
                  if (!sectionBooks.length) return null
                  if (status === BookStatus.InProgress && showReadingNow) return null

                  const yearGroups = status === BookStatus.Completed ? groupByCompletionYear(sectionBooks) : []
                  // only worth grouping once at least one book has a date
                  const groupByYear = yearGroups.some(group => group.year !== UNDATED)

                  return (
                    <section key={status}>
                      <SectionHeading label={label} count={sectionBooks.length} />
                      {groupByYear ? (
                        <div className="flex flex-col gap-12">
                          {yearGroups.map(group => (
                            <div key={group.year}>
                              <YearHeading year={group.year} books={group.books} />
                              <BooksGrid books={group.books} {...gridProps} />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <BooksGrid books={sectionBooks} {...gridProps} />
                      )}
                    </section>
                  )
                })}
              </div>
            )}
            </FadeIn>
          </>
        )}

      {isAdmin && (
        <BookFormModal
          isOpen={isFormOpen}
          book={selectedBook}
          authors={authorSuggestions}
          isLoading={isSubmitting}
          onSubmit={handleSubmit}
          onOpenChange={setIsFormOpen}
        />
      )}

      <AlertDialog open={!!pendingDeleteId} onOpenChange={(open) => !open && setPendingDeleteId(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this book?</AlertDialogTitle>
            <AlertDialogDescription>
              This action can&apos;t be undone. The book and its cover will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel />
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  )
}
