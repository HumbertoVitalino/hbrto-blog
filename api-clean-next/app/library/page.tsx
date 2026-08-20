'use client'

import { useState, useCallback, useMemo } from 'react'
import { useBooks, BookData } from '@/app/hooks/useBooks'
import { BookStatus } from '@/domain/BookStatus'
import { BookGenre } from '@/domain/BookGenre'
import { useAuth } from '@/app/context/AuthContext'
import { BookFormModal } from '@/app/components/books/BookFormModal'
import { BooksGrid } from '@/app/components/books/BooksGrid'
import { LibraryFilterBento } from '@/app/components/books/LibraryFilterBento'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, Plus } from 'lucide-react'

type FilterStatus = BookStatus | 'all'
type FilterGenre = BookGenre | 'all'

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

const sectionOrder: { status: BookStatus; label: string; accent: string }[] = [
  { status: BookStatus.InProgress, label: 'Currently reading', accent: 'bg-info' },
  { status: BookStatus.NotStarted, label: 'To read', accent: 'bg-muted-foreground/50' },
  { status: BookStatus.Completed, label: 'Completed', accent: 'bg-success' },
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

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">

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
              <div className="space-y-4">

                {/* Status — bento */}
                <LibraryFilterBento
                  books={books}
                  statusFilter={statusFilter}
                  onStatusFilter={handleStatusFilter}
                />

                {/* Genre — outline chips */}
                {availableGenres.length > 0 && (
                  <div className="relative">
                    <div
                      className="flex items-center gap-1.5 overflow-x-auto pb-0.5"
                      style={{ scrollbarWidth: 'none' }}
                    >
                      <button
                        onClick={() => setGenreFilter('all')}
                        className={`shrink-0 text-xs font-medium px-3 py-1 rounded-full border transition-colors ${
                          genreFilter === 'all'
                            ? 'border-foreground text-foreground'
                            : 'border-border text-muted-foreground hover:border-foreground/50 hover:text-foreground'
                        }`}
                      >
                        All
                      </button>
                      {availableGenres.map(({ genre }) => (
                        <button
                          key={genre}
                          onClick={() => setGenreFilter(genre)}
                          className={`shrink-0 text-xs font-medium px-3 py-1 rounded-full border transition-colors ${
                            genreFilter === genre
                              ? 'border-foreground text-foreground'
                              : 'border-border text-muted-foreground hover:border-foreground/50 hover:text-foreground'
                          }`}
                        >
                          {genreLabels[genre]}
                        </button>
                      ))}
                    </div>
                    <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 bg-linear-to-l from-background to-transparent" />
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
                {sectionOrder.map(({ status, label, accent }) => {
                  const sectionBooks = booksByStatusAndGenre[status]
                  if (!sectionBooks.length) return null
                  if (statusFilter !== 'all' && statusFilter !== status) return null

                  return (
                    <div key={status} className="space-y-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-1 h-4 rounded-full shrink-0 ${accent}`} />
                        <h2 className="text-sm font-semibold text-foreground">
                          {label}
                        </h2>
                        <div className="flex-1 h-px bg-border/40" />
                        <span className="text-xs tabular-nums text-muted-foreground">{sectionBooks.length}</span>
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
