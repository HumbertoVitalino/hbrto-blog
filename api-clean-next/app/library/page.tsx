'use client'

import { useState, useCallback, useMemo } from 'react'
import { useBooks, BookData } from '@/app/hooks/useBooks'
import { BookStatus } from '@/domain/BookStatus'
import { useAuth } from '@/app/context/AuthContext'
import { BookFormModal } from '@/app/components/books/BookFormModal'
import { BooksGrid } from '@/app/components/books/BooksGrid'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, Plus } from 'lucide-react'

export default function ArticlesPage() {
  const { books, isLoading, error, createBook, updateBook, deleteBook } = useBooks()
  const { isAdmin } = useAuth()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedBook, setSelectedBook] = useState<BookData | undefined>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | undefined>()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<BookStatus | 'all'>('all')

  // Agrupar livros por status
  const booksByStatus = useMemo(() => {
    return {
      [BookStatus.NotStarted]: books.filter(b => b.status === BookStatus.NotStarted),
      [BookStatus.InProgress]: books.filter(b => b.status === BookStatus.InProgress),
      [BookStatus.Completed]: books.filter(b => b.status === BookStatus.Completed),
    }
  }, [books])

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

  const handleSubmit = useCallback(
    async (data: Omit<BookData, 'id'>) => {
      try {
        setIsSubmitting(true)
        setSubmitError(null)

        if (selectedBook?.id) {
          await updateBook(selectedBook.id, data)
        } else {
          await createBook(data)
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to save article'
        setSubmitError(message)
        throw err
      } finally {
        setIsSubmitting(false)
      }
    },
    [selectedBook, createBook, updateBook]
  )

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm('Are you sure you want to delete this article?')) return

      try {
        setDeletingId(id)
        await deleteBook(id)
      } finally {
        setDeletingId(undefined)
      }
    },
    [deleteBook]
  )

  // Helper para renderizar uma seção de livros se ela tiver itens e o filtro permitir
  const renderBookSection = (title: string, sectionStatus: BookStatus, booksInSection: BookData[]) => {
    if (booksInSection.length === 0) return null
    if (statusFilter !== 'all' && statusFilter !== sectionStatus) return null

    return (
      <div key={sectionStatus} className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight border-b pb-2 flex items-center gap-2">
          {title}
          <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {booksInSection.length}
          </span>
        </h2>
        <BooksGrid
          books={booksInSection}
          onEdit={isAdmin ? handleEdit : () => {}}
          onDelete={isAdmin ? handleDelete : () => {}}
          deletingId={deletingId}
          isPublic={!isAdmin}
        />
      </div>
    )
  }

  // Verifica se existe algum livro visível com os filtros atuais
  const hasVisibleBooks = useMemo(() => {
    if (statusFilter === 'all') return books.length > 0
    return booksByStatus[statusFilter].length > 0
  }, [books.length, booksByStatus, statusFilter])

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-16 space-y-10">
        
        {/* HEADER */}
        <div className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Articles
            </h1>
            <p className="text-sm text-muted-foreground">
              Thoughts, notes and reflections on what I'm reading.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {isAdmin && (
              <Button
                onClick={handleNew}
                size="sm"
                className="gap-2 w-fit"
              >
                <Plus className="w-4 h-4" />
                New Article
              </Button>
            )}
          </div>
        </div>

        {/* Status Filters */}
        {books.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('all')}
            >
              All ({books.length})
            </Button>
            <Button
              variant={statusFilter === BookStatus.InProgress ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(BookStatus.InProgress)}
              className={statusFilter === BookStatus.InProgress ? 'bg-blue-600 hover:bg-blue-700 text-white border-transparent' : ''}
            >
              In Progress ({booksByStatus[BookStatus.InProgress].length})
            </Button>
            <Button
              variant={statusFilter === BookStatus.NotStarted ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(BookStatus.NotStarted)}
              className={statusFilter === BookStatus.NotStarted ? 'bg-gray-600 hover:bg-gray-700 text-white border-transparent' : ''}
            >
              Not Started ({booksByStatus[BookStatus.NotStarted].length})
            </Button>
            <Button
              variant={statusFilter === BookStatus.Completed ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(BookStatus.Completed)}
              className={statusFilter === BookStatus.Completed ? 'bg-green-600 hover:bg-green-700 text-white border-transparent' : ''}
            >
              Completed ({booksByStatus[BookStatus.Completed].length})
            </Button>
          </div>
        )}

        {/* ERRORS */}
        {(error || submitError) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error || submitError}
            </AlertDescription>
          </Alert>
        )}

        {/* FEED */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="h-6 w-6 rounded-full border border-muted border-t-foreground animate-spin" />
          </div>
        ) : !hasVisibleBooks ? (
          <div className="text-center py-20">
            <p className="text-sm text-muted-foreground">
              {statusFilter === 'all' 
                ? 'No articles yet.' 
                : `No articles with status "${statusFilter}".`}
            </p>

            {isAdmin && statusFilter === 'all' && (
              <Button variant="ghost" onClick={handleNew} className="mt-4">
                Create your first article
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-12">
            {renderBookSection('In Progress', BookStatus.InProgress, booksByStatus[BookStatus.InProgress])}
            {renderBookSection('Not Started', BookStatus.NotStarted, booksByStatus[BookStatus.NotStarted])}
            {renderBookSection('Completed', BookStatus.Completed, booksByStatus[BookStatus.Completed])}
          </div>
        )}
      </div>

      {/* MODAL */}
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