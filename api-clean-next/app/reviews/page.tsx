'use client'

import { useState, useCallback } from 'react'
import { useReviews } from '@/app/hooks/useReviews'
import { useAuth } from '@/app/context/AuthContext'
import { ReviewFormModal } from '@/app/components/reviews/ReviewFormModal'
import { ReviewsGrid } from '@/app/components/reviews/ReviewsGrid'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, Plus } from 'lucide-react'

export default function ReviewsPage() {
  const { reviews, isLoading, error, createReview, updateReview, deleteReview } = useReviews()
  const { isAdmin } = useAuth()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleNew = useCallback(() => {
    setSubmitError(null)
    setIsFormOpen(true)
  }, [])

  const handleSubmit = useCallback(
    async (data: { title: string; bookId: string | null; rating: number; comment: string }) => {
      try {
        setIsSubmitting(true)
        setSubmitError(null)
        await createReview(data.title, data.bookId, data.rating, data.comment)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to publish'
        setSubmitError(message)
        throw err
      } finally {
        setIsSubmitting(false)
      }
    },
    [createReview]
  )

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm('Delete this entry?')) return
      await deleteReview(id, null)
    },
    [deleteReview]
  )

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-16 space-y-12">

        {/* HEADER (EDITORIAL) */}
        <div className="space-y-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            Writing
          </h1>

          <p className="text-sm text-muted-foreground leading-relaxed">
            Thoughts, notes and reflections — not limited to books.
          </p>

          {isAdmin && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleNew}
              className="mt-4 gap-2"
            >
              <Plus className="w-4 h-4" />
              New Entry
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
            <div className="h-5 w-5 rounded-full border border-muted border-t-foreground animate-spin" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-sm text-muted-foreground">
              No entries yet.
            </p>

            {isAdmin && (
              <Button variant="ghost" onClick={handleNew} className="mt-4">
                Write your first entry
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-12">
            <ReviewsGrid
              reviews={reviews}
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
        />
      )}
    </main>
  )
}