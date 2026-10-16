'use client'

import { Suspense, useState, useCallback, useMemo, useRef } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useBooks, BookData } from '@/app/hooks/useBooks'
import { BookStatus } from '@/domain/BookStatus'
import { useAuth } from '@/app/context/AuthContext'
import { BookFormModal } from '@/app/components/books/BookFormModal'
import { BooksGrid } from '@/app/components/books/BooksGrid'
import { LibraryFilterBento } from '@/app/components/books/LibraryFilterBento'
import { LibraryFilterBar } from '@/app/components/books/LibraryFilterBar'
import {
  LibraryFilters,
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
  numberFormat,
  parseFilters,
  sortByCompletion,
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

const sectionOrder: { status: BookStatus; label: string; accent: string }[] = [
  { status: BookStatus.InProgress, label: 'Currently reading', accent: 'bg-info' },
  { status: BookStatus.NotStarted, label: 'To read', accent: 'bg-muted-foreground/50' },
  { status: BookStatus.Completed, label: 'Completed', accent: 'bg-success' },
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

/** The year as the heading of a slice of the reading log. */
function YearHeading({ year, books, as: Tag = 'h3', large = false }: {
  year: string
  books: BookData[]
  as?: 'h2' | 'h3'
  large?: boolean
}) {
  return (
    <div className="flex items-baseline gap-3">
      <Tag className={`font-display font-medium tracking-tight tabular-nums ${large ? 'text-3xl' : 'text-xl'}`}>
        {yearLabel(year)}
      </Tag>
      <span className="text-xs tabular-nums text-muted-foreground">
        {countBooks(books.length)} · {numberFormat.format(sumPages(books))} pages
      </span>
    </div>
  )
}

export default function LibraryPage() {
  // useSearchParams needs a Suspense boundary to prerender
  return (
    <Suspense fallback={<div className="min-h-screen bg-background"><Spinner /></div>}>
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

  return (
    <div className="min-h-screen bg-background">

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-8 sm:px-6 sm:py-10 sm:space-y-10">

        {/* TITLE BAR */}
        <div>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-display text-3xl font-medium tracking-tight">Library</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Books I&apos;ve read, I&apos;m reading, and plan to read.
              </p>
            </div>
            {isAdmin && (
              <Button size="sm" onClick={handleNew} className="gap-2 shrink-0">
                <Plus className="w-4 h-4" />
                Add book
              </Button>
            )}
          </div>
        </div>

        {/* ERRORS */}
        {(error || submitError) && (
          <Alert variant="destructive">
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
            {/* FILTERS */}
            {books.length > 0 && (
              <div className="space-y-4">
                <LibraryFilterBento
                  books={books}
                  statusFilter={filters.status}
                  onStatusFilter={handleStatusFilter}
                />
                <LibraryFilterBar
                  ref={filterBarRef}
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
            )}

            {/* EMPTY */}
            {visibleBooks.length === 0 && (
              <div className="text-center py-20 border border-dashed border-border/50 rounded-2xl">
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
              <section className="space-y-3 md:space-y-6">
                <YearHeading year={filters.year} books={completedBooks} as="h2" large />
                {filters.year === UNDATED && isAdmin && (
                  <p className="text-sm text-muted-foreground md:-mt-3">
                    Edit a book and set when you finished it to file it under its year.
                  </p>
                )}
                <BooksGrid books={completedBooks} {...gridProps} />
              </section>
            )}

            {/* SECTIONS */}
            {visibleBooks.length > 0 && !isYearView && (
              <div className="space-y-10 md:space-y-14">
                {sectionOrder.map(({ status, label, accent }) => {
                  const sectionBooks = booksByStatus[status]
                  if (!sectionBooks.length) return null

                  const yearGroups = status === BookStatus.Completed ? groupByCompletionYear(sectionBooks) : []
                  // only worth grouping once at least one book has a date
                  const groupByYear = yearGroups.some(group => group.year !== UNDATED)

                  return (
                    <section key={status} className="space-y-3 md:space-y-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-1 h-4 rounded-full shrink-0 ${accent}`} />
                        <h2 className="text-sm font-semibold text-foreground">
                          {label}
                        </h2>
                        <div className="flex-1 h-px bg-border/40" />
                        <span className="text-xs tabular-nums text-muted-foreground">{sectionBooks.length}</span>
                      </div>

                      {groupByYear ? (
                        <div className="space-y-6 md:space-y-10">
                          {yearGroups.map(group => (
                            <div key={group.year} className="space-y-1 md:space-y-4">
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
          </>
        )}
      </div>

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
    </div>
  )
}
