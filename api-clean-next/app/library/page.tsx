'use client'

import { useState, useCallback, useMemo } from 'react'
import { useBooks, BookData } from '@/app/hooks/useBooks'
import { BookStatus } from '@/domain/BookStatus'
import { BookGenre } from '@/domain/BookGenre'
import { useAuth } from '@/app/context/AuthContext'
import { BookFormModal } from '@/app/components/books/BookFormModal'
import { BooksGrid } from '@/app/components/books/BooksGrid'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, Plus, BookOpen, CheckCircle, Clock } from 'lucide-react'

type FilterStatus = BookStatus | 'all'
type FilterGenre = BookGenre | 'all'

const statusFilters: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: BookStatus.InProgress, label: 'Reading' },
  { value: BookStatus.NotStarted, label: 'To read' },
  { value: BookStatus.Completed, label: 'Completed' },
]

const genreLabels: Record<BookGenre, string> = {
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

const sectionOrder: { status: BookStatus; label: string }[] = [
  { status: BookStatus.InProgress, label: 'Currently reading' },
  { status: BookStatus.NotStarted, label: 'To read' },
  { status: BookStatus.Completed, label: 'Completed' },
]

export default function LibraryPage() {
  const { books, isLoading, error, createBook, updateBook, deleteBook } = useBooks()
  const { isAdmin } = useAuth()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedBook, setSelectedBook] = useState<BookData | undefined>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | undefined>()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all')
  const [genreFilter, setGenreFilter] = useState<FilterGenre>('all')

  const booksByStatus = useMemo(() => ({
    [BookStatus.NotStarted]: books.filter(b => b.status === BookStatus.NotStarted),
    [BookStatus.InProgress]: books.filter(b => b.status === BookStatus.InProgress),
    [BookStatus.Completed]: books.filter(b => b.status === BookStatus.Completed),
  }), [books])

  // books visible under the current status filter — used to derive available genres
  const booksInStatusView = useMemo(() =>
    statusFilter === 'all' ? books : booksByStatus[statusFilter]
  , [books, booksByStatus, statusFilter])

  // unique genres present in the current status view, sorted by frequency
  const availableGenres = useMemo(() => {
    const counts = new Map<BookGenre, number>()
    for (const book of booksInStatusView) {
      if (book.genre) {
        const g = book.genre as BookGenre
        counts.set(g, (counts.get(g) ?? 0) + 1)
      }
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([genre, count]) => ({ genre, count }))
  }, [booksInStatusView])

  // final books per section after applying both filters
  const booksByStatusAndGenre = useMemo(() => {
    const applyGenre = (list: BookData[]) =>
      genreFilter === 'all' ? list : list.filter(b => b.genre === genreFilter)
    return {
      [BookStatus.NotStarted]: applyGenre(booksByStatus[BookStatus.NotStarted]),
      [BookStatus.InProgress]: applyGenre(booksByStatus[BookStatus.InProgress]),
      [BookStatus.Completed]: applyGenre(booksByStatus[BookStatus.Completed]),
    }
  }, [booksByStatus, genreFilter])

  const handleStatusFilter = useCallback((value: FilterStatus) => {
    setStatusFilter(value)
    setGenreFilter('all')
  }, [])

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
      } else {
        await createBook(data)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save book'
      setSubmitError(message)
      throw err
    } finally {
      setIsSubmitting(false)
    }
  }, [selectedBook, createBook, updateBook])

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Are you sure you want to delete this book?')) return
    try {
      setDeletingId(id)
      await deleteBook(id)
    } finally {
      setDeletingId(undefined)
    }
  }, [deleteBook])

  const hasVisibleBooks = useMemo(() =>
    sectionOrder.some(({ status }) => {
      if (statusFilter !== 'all' && statusFilter !== status) return false
      return booksByStatusAndGenre[status].length > 0
    })
  , [booksByStatusAndGenre, statusFilter])

  return (
    <main className="min-h-screen bg-background">

      {/* HERO */}
      <section className="border-b bg-muted/10">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Library</p>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">My reading list</h1>
              <p className="text-muted-foreground mt-2 leading-relaxed">
                Books I've read, I'm reading, and plan to read.
              </p>
            </div>
            {isAdmin && (
              <Button size="sm" onClick={handleNew} className="gap-2 shrink-0">
                <Plus className="w-4 h-4" />
                Add book
              </Button>
            )}
          </div>

          {/* STATS */}
          {!isLoading && books.length > 0 && (
            <div className="flex items-center gap-6 mt-8 pt-8 border-t border-border/50 flex-wrap">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-muted-foreground" />
                <div>
                  <span className="text-2xl font-bold">{books.length}</span>
                  <p className="text-xs text-muted-foreground">Total books</p>
                </div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <div>
                  <span className="text-2xl font-bold">{booksByStatus[BookStatus.InProgress].length}</span>
                  <p className="text-xs text-muted-foreground">Reading now</p>
                </div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <div>
                  <span className="text-2xl font-bold">{booksByStatus[BookStatus.Completed].length}</span>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-10">

        {/* ERRORS */}
        {(error || submitError) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error || submitError}</AlertDescription>
          </Alert>
        )}

        {/* LOADING */}
        {isLoading && (
          <div className="flex justify-center py-20">
            <div className="h-6 w-6 rounded-full border border-muted border-t-foreground animate-spin" />
          </div>
        )}

        {/* CONTENT */}
        {!isLoading && (
          <>
            {/* FILTERS */}
            {books.length > 0 && (
              <div className="space-y-2">
                {/* Status — primary filter */}
                <div className="flex items-center gap-2 flex-wrap">
                  {statusFilters.map(({ value, label }) => {
                    const count = value === 'all' ? books.length : booksByStatus[value].length
                    return (
                      <button
                        key={value}
                        onClick={() => handleStatusFilter(value)}
                        className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                          statusFilter === value
                            ? 'bg-foreground text-background'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                        }`}
                      >
                        {label} <span className="opacity-60 ml-1">{count}</span>
                      </button>
                    )
                  })}
                </div>

                {/* Genre — secondary filter, only when genres exist */}
                {availableGenres.length > 0 && (
                  <div className="relative">
                    <div
                      className="flex items-center gap-1.5 overflow-x-auto pb-0.5"
                      style={{ scrollbarWidth: 'none' }}
                    >
                      <button
                        onClick={() => setGenreFilter('all')}
                        className={`shrink-0 text-xs px-3 py-1 rounded-full border transition-colors ${
                          genreFilter === 'all'
                            ? 'border-border bg-muted text-foreground'
                            : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40'
                        }`}
                      >
                        All genres
                      </button>
                      {availableGenres.map(({ genre, count }) => (
                        <button
                          key={genre}
                          onClick={() => setGenreFilter(genre)}
                          className={`shrink-0 text-xs px-3 py-1 rounded-full border transition-colors ${
                            genreFilter === genre
                              ? 'border-border bg-muted text-foreground'
                              : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40'
                          }`}
                        >
                          {genreLabels[genre]}
                          <span className="opacity-50 ml-1">{count}</span>
                        </button>
                      ))}
                    </div>
                    <div className="pointer-events-none absolute right-0 top-0 bottom-0.5 w-8 bg-linear-to-l from-background to-transparent" />
                  </div>
                )}
              </div>
            )}

            {/* EMPTY */}
            {!hasVisibleBooks && (
              <div className="text-center py-20 border border-dashed border-border/50 rounded-2xl">
                <p className="text-sm text-muted-foreground">
                  {books.length === 0
                    ? 'No books yet.'
                    : genreFilter !== 'all'
                    ? `No ${genreLabels[genreFilter as BookGenre]} books${statusFilter !== 'all' ? ' with this status' : ''}.`
                    : 'No books with this status.'}
                </p>
                {isAdmin && books.length === 0 && (
                  <Button variant="ghost" onClick={handleNew} className="mt-4">
                    Add your first book
                  </Button>
                )}
                {genreFilter !== 'all' && (
                  <button
                    onClick={() => setGenreFilter('all')}
                    className="mt-3 text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
                  >
                    Clear genre filter
                  </button>
                )}
              </div>
            )}

            {/* SECTIONS */}
            {hasVisibleBooks && (
              <div className="space-y-14">
                {sectionOrder.map(({ status, label }) => {
                  const sectionBooks = booksByStatusAndGenre[status]
                  if (!sectionBooks.length) return null
                  if (statusFilter !== 'all' && statusFilter !== status) return null

                  return (
                    <div key={status} className="space-y-6">
                      <div className="flex items-center gap-3">
                        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                          {label}
                        </h2>
                        <div className="flex-1 h-px bg-border/50" />
                        <span className="text-xs text-muted-foreground">{sectionBooks.length}</span>
                      </div>
                      <BooksGrid
                        books={sectionBooks}
                        onEdit={isAdmin ? handleEdit : () => {}}
                        onDelete={isAdmin ? handleDelete : () => {}}
                        deletingId={deletingId}
                        isPublic={!isAdmin}
                      />
                    </div>
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
          isLoading={isSubmitting}
          onSubmit={handleSubmit}
          onOpenChange={setIsFormOpen}
        />
      )}
    </main>
  )
}
