'use client'

import { useRouter, useParams } from 'next/navigation'
import { useBooks } from '@/app/hooks/useBooks'
import { useReviews } from '@/app/hooks/useReviews'
import { useAuth } from '@/app/context/AuthContext'
import { ReviewsGrid } from '@/app/components/reviews/ReviewsGrid'
import { ReviewFormModal } from '@/app/components/reviews/ReviewFormModal'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, ArrowLeft, Plus } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Book } from '@/domain/Book'

export default function BookDetailPage() {
  const router = useRouter()
  const { bookId } = useParams() as { bookId: string }

  const { books, isLoading: booksLoading } = useBooks()
  const {
    reviews,
    isLoading: reviewsLoading,
    error,
    createReview,
    updateReview,
    deleteReview,
  } = useReviews(bookId)

  const { isAdmin } = useAuth()

  const [book, setBook] = useState<Book | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (!booksLoading) {
      const found = books.find(b => b.id === bookId)
      setBook(found && found.id ? new Book({
        id: found.id,
        title: found.title,
        author: found.author,
        pages: found.pages,
        genre: found.genre
      }) : null)
    }
  }, [books, bookId, booksLoading])

  const handleSubmit = async (data: { title: string; rating: number; comment: string }) => {
    try {
      setIsSubmitting(true)
      setSubmitError(null)
      await createReview(data.title, bookId, data.rating, data.comment)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save review'
      setSubmitError(message)
      throw err
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return
    await deleteReview(id, bookId)
  }

  // LOADING
  if (booksLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-6 w-6 rounded-full border border-muted border-t-foreground animate-spin" />
      </main>
    )
  }

  // NOT FOUND
  if (!book) {
    return (
      <main className="min-h-screen bg-background max-w-2xl mx-auto px-4 py-16">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6 gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Book not found</AlertTitle>
          <AlertDescription>This book does not exist.</AlertDescription>
        </Alert>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-16 space-y-12">

        {/* BACK */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        {/* BOOK HEADER (EDITORIAL STYLE) */}
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight">
            {book.title}
          </h1>

          <p className="text-sm text-muted-foreground">
            {book.author} · {book.pages} pages
          </p>
        </div>

        {/* REVIEWS HEADER */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Reviews
          </h2>

          {isAdmin && (
            <Button size="sm" variant="ghost" onClick={() => setIsFormOpen(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Add
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

        {/* REVIEWS FEED */}
        {reviewsLoading ? (
          <div className="flex justify-center py-16">
            <div className="h-5 w-5 rounded-full border border-muted border-t-foreground animate-spin" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm text-muted-foreground">
              No reviews yet.
            </p>

            {isAdmin && (
              <Button
                variant="ghost"
                onClick={() => setIsFormOpen(true)}
                className="mt-4"
              >
                Write the first review
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            <ReviewsGrid
              reviews={reviews}
              bookId={bookId}
              isAdmin={isAdmin}
              onDelete={isAdmin ? handleDelete : undefined}
              onUpdate={isAdmin ? updateReview : undefined}
            />
          </div>
        )}
      </div>

      {/* MODAL */}
      {isAdmin && (
        <ReviewFormModal
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          onSubmit={handleSubmit}
          mode="create"
          bookId={bookId}
        />
      )}
    </main>
  )
}