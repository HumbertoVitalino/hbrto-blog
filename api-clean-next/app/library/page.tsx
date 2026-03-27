'use client'

import { useState, useCallback } from 'react'
import { useBooks, BookData } from '@/app/hooks/useBooks'
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

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-16 space-y-10">
        
        {/* HEADER */}
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Articles
          </h1>
          <p className="text-sm text-muted-foreground">
            Thoughts, notes and reflections on what I'm reading.
          </p>

          {isAdmin && (
            <Button
              onClick={handleNew}
              size="sm"
              className="mt-4 gap-2"
            >
              <Plus className="w-4 h-4" />
              New Article
            </Button>
          )}
        </div>

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
        ) : books.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-sm text-muted-foreground">
              No articles yet.
            </p>

            {isAdmin && (
              <Button variant="ghost" onClick={handleNew} className="mt-4">
                Create your first article
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            <BooksGrid
              books={books}
              onEdit={isAdmin ? handleEdit : () => {}}
              onDelete={isAdmin ? handleDelete : () => {}}
              deletingId={deletingId}
              isPublic={!isAdmin}
              variant="feed" // 👈 importante (explico abaixo)
            />
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