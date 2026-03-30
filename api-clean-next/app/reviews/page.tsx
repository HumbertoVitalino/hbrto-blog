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
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = useCallback(async (data: any) => {
    try {
      setSubmitError(null)
      await createReview(data.title, data.bookId, data.rating, data.comment)
      setIsFormOpen(false)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to publish')
    }
  }, [createReview])

  const handleDelete = useCallback(async (id: string) => {
    await deleteReview(id, null)
  }, [deleteReview])

  const handleUpdate = useCallback(async (id: string, bookId: string | null, title: string, rating: number, comment: string) => {
    await updateReview(id, bookId, title, rating, comment)
  }, [updateReview])

  return (
    <main className="min-h-screen bg-background">

      <div className="max-w-2xl mx-auto px-4 py-16 space-y-12">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Writing
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Thoughts, notes and reflections — not limited to books.
            </p>
          </div>

          {isAdmin && (
            <Button size="sm" onClick={() => setIsFormOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New
            </Button>
          )}
        </div>

        {/* ERROR */}
        {(error || submitError) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error || submitError}
            </AlertDescription>
          </Alert>
        )}

        {/* STATES */}
        {isLoading && (
          <div className="flex justify-center py-20">
            <div className="h-5 w-5 rounded-full border border-muted border-t-foreground animate-spin" />
          </div>
        )}

        {!isLoading && reviews.length === 0 && (
          <div className="text-center py-20">
            <p className="text-sm text-muted-foreground">
              No entries yet.
            </p>

            {isAdmin && (
              <Button onClick={() => setIsFormOpen(true)} className="mt-4">
                Write your first entry
              </Button>
            )}
          </div>
        )}

        {!isLoading && reviews.length > 0 && (
          <ReviewsGrid
            reviews={reviews}
            isAdmin={isAdmin}
            onDelete={isAdmin ? handleDelete : undefined}
            onUpdate={isAdmin ? handleUpdate : undefined}
          />
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