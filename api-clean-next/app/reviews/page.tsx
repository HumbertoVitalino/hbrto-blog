'use client'

import { useState, useCallback, useMemo } from 'react'
import { useReviews } from '@/app/hooks/useReviews'
import { useBooks } from '@/app/hooks/useBooks'
import { useAuth } from '@/app/context/AuthContext'
import { ReviewFormModal } from '@/app/components/reviews/ReviewFormModal'
import { ReviewsGrid } from '@/app/components/reviews/ReviewsGrid'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, Plus, Clock, TrendingUp, TrendingDown } from 'lucide-react'
import { Review, ReviewLanguage } from '@/domain/Review'

type SortOption = 'newest' | 'highest' | 'lowest'

interface ReviewFormSubmitData {
  title: string
  bookId: string | null
  rating: number
  comment: string
  language?: ReviewLanguage
}

export default function ReviewsPage() {
  const { reviews, isLoading, error, createReview, updateReview, deleteReview } = useReviews()
  const { books } = useBooks()
  const { isAdmin } = useAuth()

  const bookById = useMemo(() => {
    const map: Record<string, typeof books[number]> = {}
    for (const b of books) {
      if (b.id) map[b.id] = b
    }
    return map
  }, [books])

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [sort, setSort] = useState<SortOption>('newest')

  const [selectedReview, setSelectedReview] = useState<Review | undefined>()
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | undefined>()

  const handleSubmit = useCallback(async (data: ReviewFormSubmitData) => {
    try {
      setSubmitError(null)
      await createReview(data.title, data.bookId, data.rating, data.comment, data.language)
      setIsFormOpen(false)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to publish')
    }
  }, [createReview])

  const handleEdit = useCallback((review: Review) => {
    setSelectedReview(review)
    setIsEditOpen(true)
  }, [])

  const handleEditSubmit = useCallback(async (data: ReviewFormSubmitData) => {
    if (!selectedReview) return
    await updateReview(selectedReview.id, selectedReview.bookId, data.title, data.rating, data.comment, data.language)
    setIsEditOpen(false)
  }, [selectedReview, updateReview])

  const handleDelete = useCallback(async (id: string, bookId?: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return
    setDeletingId(id)
    try {
      await deleteReview(id, bookId ?? null)
    } finally {
      setDeletingId(undefined)
    }
  }, [deleteReview])

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

  const sortOptions: { value: SortOption; label: string; icon: typeof Clock }[] = [
    { value: 'newest', label: 'Newest', icon: Clock },
    { value: 'highest', label: 'Highest rated', icon: TrendingUp },
    { value: 'lowest', label: 'Lowest rated', icon: TrendingDown },
  ]

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-10">

        {/* TITLE BAR — editorial masthead */}
        <div>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-display text-4xl font-medium tracking-tight">Writing</h1>
              <p className="text-muted-foreground mt-2">
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
            <div className="flex items-center gap-2 mt-6 pt-6 border-t border-border/50 text-sm flex-wrap">
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
                  className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                    sort === opt.value
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  }`}
                >
                  <opt.icon className="w-3.5 h-3.5" />
                  {opt.label}
                </button>
              ))}
            </div>

            <ReviewsGrid
              reviews={sorted}
              bookById={bookById}
              isAdmin={isAdmin}
              deletingId={deletingId}
              onEdit={isAdmin ? handleEdit : undefined}
              onDelete={isAdmin ? handleDelete : undefined}
            />
          </>
        )}
      </div>

      {isAdmin && (
        <>
          <ReviewFormModal
            open={isFormOpen}
            onOpenChange={setIsFormOpen}
            onSubmit={handleSubmit}
            mode="create"
          />
          <ReviewFormModal
            open={isEditOpen}
            onOpenChange={setIsEditOpen}
            onSubmit={handleEditSubmit}
            initialValues={selectedReview ? {
              title: selectedReview.title,
              rating: selectedReview.rating,
              comment: selectedReview.comment,
              createdAt: selectedReview.createdAt,
              language: selectedReview.language,
            } : undefined}
            mode="edit"
          />
        </>
      )}
    </main>
  )
}
