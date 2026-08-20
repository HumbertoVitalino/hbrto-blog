'use client'

import { useState, useCallback, useMemo } from 'react'
import { useReviews } from '@/app/hooks/useReviews'
import { useAuth } from '@/app/context/AuthContext'
import { ReviewFormModal } from '@/app/components/reviews/ReviewFormModal'
import { ReviewsGrid } from '@/app/components/reviews/ReviewsGrid'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, Plus } from 'lucide-react'

type SortOption = 'newest' | 'highest' | 'lowest'

export default function ReviewsPage() {
  const { reviews, isLoading, error, createReview, updateReview, deleteReview } = useReviews()
  const { isAdmin } = useAuth()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [sort, setSort] = useState<SortOption>('newest')

  const handleSubmit = useCallback(async (data: any) => {
    try {
      setSubmitError(null)
      await createReview(data.title, data.bookId, data.rating, data.comment, data.language)
      setIsFormOpen(false)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to publish')
    }
  }, [createReview])

  const handleDelete = useCallback(async (id: string) => {
    await deleteReview(id, null)
  }, [deleteReview])

  const handleUpdate = useCallback(async (id: string, bookId: string | null, title: string, rating: number, comment: string, language?: any) => {
    await updateReview(id, bookId, title, rating, comment, language)
  }, [updateReview])

  const avgRating = useMemo(() => {
    if (!reviews.length) return 0
    return reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
  }, [reviews])

  const sorted = useMemo(() => {
    return [...reviews].sort((a, b) => {
      if (sort === 'highest') return b.rating - a.rating
      if (sort === 'lowest') return a.rating - b.rating
      return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
    })
  }, [reviews, sort])

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'newest', label: 'Newest' },
    { value: 'highest', label: 'Highest rated' },
    { value: 'lowest', label: 'Lowest rated' },
  ]

  return (
    <main className="min-h-screen bg-background">

      {/* HERO */}
      <section className="border-b bg-muted/10">
        <div className="max-w-5xl mx-auto px-6 py-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Reviews</p>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-display text-4xl font-medium tracking-tight">Writing</h1>
              <p className="text-muted-foreground mt-2 leading-relaxed">
                Thoughts, notes and reflections — not limited to books.
              </p>
            </div>
            {isAdmin && (
              <Button size="sm" onClick={() => setIsFormOpen(true)} className="gap-2 shrink-0">
                <Plus className="w-4 h-4" />
                New review
              </Button>
            )}
          </div>

          {/* STATS */}
          {!isLoading && reviews.length > 0 && (
            <div className="flex items-center gap-2 mt-8 pt-6 border-t border-border/50 text-sm flex-wrap">
              <span>
                <span className="font-semibold text-foreground tabular-nums">{reviews.length}</span>
                <span className="text-muted-foreground ml-1">reviews</span>
              </span>
              <span className="text-border select-none">·</span>
              <span>
                <span className="font-semibold text-foreground tabular-nums">{avgRating.toFixed(1)}</span>
                <span className="text-muted-foreground ml-1">avg rating</span>
              </span>
            </div>
          )}
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">

        {/* ERROR */}
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
            <div className="h-5 w-5 rounded-full border border-muted border-t-foreground animate-spin" />
          </div>
        )}

        {/* EMPTY */}
        {!isLoading && reviews.length === 0 && (
          <div className="text-center py-20 border border-dashed border-border/50 rounded-2xl">
            <p className="text-sm text-muted-foreground">No entries yet.</p>
            {isAdmin && (
              <Button onClick={() => setIsFormOpen(true)} className="mt-4">
                Write your first entry
              </Button>
            )}
          </div>
        )}

        {/* SORT BAR + LIST */}
        {!isLoading && reviews.length > 0 && (
          <>
            <div className="flex items-center gap-2">
              {sortOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setSort(opt.value)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                    sort === opt.value
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <ReviewsGrid
              reviews={sorted}
              isAdmin={isAdmin}
              onDelete={isAdmin ? handleDelete : undefined}
              onUpdate={isAdmin ? handleUpdate : undefined}
            />
          </>
        )}
      </div>

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
