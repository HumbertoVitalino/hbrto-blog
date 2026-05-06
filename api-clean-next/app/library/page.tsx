'use client'

import { useState, useCallback, useMemo } from 'react'
import { useBooks, BookData } from '@/app/hooks/useBooks'
import { BookStatus } from '@/domain/BookStatus'
import { useAuth } from '@/app/context/AuthContext'
import { BookFormModal } from '@/app/components/books/BookFormModal'
import { BooksGrid } from '@/app/components/books/BooksGrid'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, Plus, BookOpen, CheckCircle, Clock } from 'lucide-react'

type FilterStatus = BookStatus | 'all'

const statusFilters: { value: FilterStatus; label: string; color?: string }[] = [
  { value: 'all', label: 'All' },
  { value: BookStatus.InProgress, label: 'Reading' },
  { value: BookStatus.NotStarted, label: 'To read' },
  { value: BookStatus.Completed, label: 'Completed' },
]

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

  const booksByStatus = useMemo(() => ({
    [BookStatus.NotStarted]: books.filter(b => b.status === BookStatus.NotStarted),
    [BookStatus.InProgress]: books.filter(b => b.status === BookStatus.InProgress),
    [BookStatus.Completed]: books.filter(b => b.status === BookStatus.Completed),
  }), [books])

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

  const hasVisibleBooks = useMemo(() => {
    if (statusFilter === 'all') return books.length > 0
    return booksByStatus[statusFilter].length > 0
  }, [books.length, booksByStatus, statusFilter])

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
            {/* FILTER PILLS */}
            {books.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                {statusFilters.map(({ value, label }) => {
                  const count = value === 'all' ? books.length : booksByStatus[value].length
                  return (
                    <button
                      key={value}
                      onClick={() => setStatusFilter(value)}
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
            )}

            {/* EMPTY */}
            {!hasVisibleBooks && (
              <div className="text-center py-20 border border-dashed border-border/50 rounded-2xl">
                <p className="text-sm text-muted-foreground">
                  {statusFilter === 'all' ? 'No books yet.' : 'No books with this status.'}
                </p>
                {isAdmin && statusFilter === 'all' && (
                  <Button variant="ghost" onClick={handleNew} className="mt-4">
                    Add your first book
                  </Button>
                )}
              </div>
            )}

            {/* SECTIONS */}
            {hasVisibleBooks && (
              <div className="space-y-14">
                {sectionOrder.map(({ status, label }) => {
                  const sectionBooks = booksByStatus[status]
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
