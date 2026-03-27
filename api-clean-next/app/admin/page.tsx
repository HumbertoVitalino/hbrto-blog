'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'
import { useState, useCallback, useEffect } from 'react'
import { useBooks, BookData } from '@/app/hooks/useBooks'
import { BookFormModal } from '@/app/components/books/BookFormModal'
import { BooksGrid } from '@/app/components/books/BooksGrid'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, Plus } from 'lucide-react'

export default function AdminPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { books, isLoading, error, createBook, updateBook, deleteBook } = useBooks()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedBook, setSelectedBook] = useState<BookData | undefined>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | undefined>()
  const [submitError, setSubmitError] = useState<string | null>(null)

  // All hooks must be defined before any conditional returns
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
      if (!confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
        return
      }

      try {
        setDeletingId(id)
        await deleteBook(id)
      } finally {
        setDeletingId(undefined)
      }
    },
    [deleteBook]
  )

  // Protect this route - redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/admin/login')
    }
  }, [user, authLoading, router])

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Return early if not authenticated (will redirect via useEffect)
  if (!user) {
    return null
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-16 space-y-10">
        
        {/* HEADER */}
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Admin Panel
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Manage your articles and content.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Authenticated as: <span className="font-semibold">{user?.email}</span>
            </p>
          </div>
          <Button size="sm" onClick={handleNew}>
            <Plus className="w-4 h-4 mr-2" />
            New Article
          </Button>
        </div>

        {/* Error Messages */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Failed to load articles</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {submitError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error saving</AlertTitle>
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <BooksGrid
            books={books}
            onEdit={handleEdit}
            onDelete={handleDelete}
            deletingId={deletingId}
            isPublic={false}
          />
        )}
      </div>

      {/* Form Modal */}
      <BookFormModal
        isOpen={isFormOpen}
        book={selectedBook}
        isLoading={isSubmitting}
        onSubmit={handleSubmit}
        onOpenChange={setIsFormOpen}
      />
    </main>
  )
}
