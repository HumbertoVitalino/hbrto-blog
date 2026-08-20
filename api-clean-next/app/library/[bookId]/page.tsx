'use client'

import { useRouter, useParams } from 'next/navigation'
import { useBooks } from '@/app/hooks/useBooks'
import { useReviews } from '@/app/hooks/useReviews'
import { useAuth } from '@/app/context/AuthContext'
import { ReviewsGrid } from '@/app/components/reviews/ReviewsGrid'
import { ReviewFormModal } from '@/app/components/reviews/ReviewFormModal'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, ArrowLeft, Plus, ShoppingCart, Star } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Book } from '@/domain/Book'
import { BookStatus } from '@/domain/BookStatus'

function getStatusConfig(status?: BookStatus) {
  switch (status) {
    case BookStatus.Completed:
      return {
        label: 'Completed',
        dotColor: 'bg-success',
        bgColor: 'bg-success/10',
        textColor: 'text-success',
        borderColor: 'border-success/20'
      }
    case BookStatus.InProgress:
      return {
        label: 'In Progress',
        dotColor: 'bg-info',
        bgColor: 'bg-info/10',
        textColor: 'text-info',
        borderColor: 'border-info/20'
      }
    case BookStatus.NotStarted:
    default:
      return {
        label: 'Not Started',
        dotColor: 'bg-muted-foreground/50',
        bgColor: 'bg-muted',
        textColor: 'text-muted-foreground',
        borderColor: 'border-border'
      }
  }
}

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
        genre: found.genre,
        status: found.status,
        coverImageUrl: found.coverImageUrl,
        affiliateUrl: found.affiliateUrl,
      }) as Book : null)
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
      <main className="min-h-screen bg-background max-w-4xl mx-auto px-4 py-16">
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

  const statusConfig = getStatusConfig(book.status)
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : null

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-16 space-y-12">

        {/* BACK BUTTON */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="gap-2 -ml-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Library
        </Button>

        {/* BOOK HEADER (EDITORIAL & VISUAL STYLE) */}
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Cover Image Section */}
          <div className="w-full sm:w-64 shrink-0 mx-auto md:mx-0">
            {book.coverImageUrl ? (
              <div className="aspect-2/3 relative rounded-lg overflow-hidden shadow-xl border border-border/50">
                <img
                  src={book.coverImageUrl}
                  alt={`${book.title} cover`}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-2/3 bg-muted/50 rounded-lg flex flex-col items-center justify-center border border-dashed border-border shadow-sm text-muted-foreground">
                <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                <span className="text-sm">No cover</span>
              </div>
            )}
          </div>

          {/* Book Info Section */}
          <div className="flex-1 space-y-6 text-center md:text-left">
            <div className="space-y-2">
              <h1 className="font-display text-3xl sm:text-4xl font-medium tracking-tight text-foreground">
                {book.title}
              </h1>
              <p className="text-xl text-muted-foreground font-medium">
                por {book.author}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              {/* Status Badge */}
              <div className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 border ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor}`}>
                <span className={`w-2 h-2 rounded-full ${statusConfig.dotColor}`}></span>
                {statusConfig.label}
              </div>

              {/* Pages Tag */}
              <div className="bg-secondary/30 text-secondary-foreground text-sm font-medium px-3 py-1.5 rounded-full border border-border/50">
                {book.pages} pages
              </div>

              {/* Genre Tag */}
              {book.genre && (
                <div className="bg-primary/5 text-primary text-sm font-medium px-3 py-1.5 rounded-full capitalize border border-primary/20">
                  {book.genre.replace('-', ' ')}
                </div>
              )}

              {/* Rating — derived from reviews already loaded below */}
              {avgRating !== null && (
                <div className="bg-warning/10 text-warning text-sm font-medium px-3 py-1.5 rounded-full border border-warning/20 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 fill-warning" />
                  {avgRating.toFixed(1)}
                  <span className="opacity-70">({reviews.length})</span>
                </div>
              )}
            </div>

            {/* Amazon affiliate button */}
            {book.affiliateUrl && (
              <div className="flex justify-center md:justify-start pt-2">
                <a href={book.affiliateUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    Buy on Amazon
                  </Button>
                </a>
              </div>
            )}
          </div>
        </div>

        <hr className="border-border/50" />

        {/* REVIEWS HEADER */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Reviews
          </h2>

          {isAdmin && (
            <Button size="sm" variant="outline" onClick={() => setIsFormOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Review
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
          <div className="text-center py-16 bg-muted/10 rounded-lg border border-dashed border-border/50">
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