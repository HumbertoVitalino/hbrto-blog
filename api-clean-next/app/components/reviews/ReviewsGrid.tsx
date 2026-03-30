'use client'

import { Review } from '@/domain/Review'
import { ReviewCard } from './ReviewCard'

interface ReviewsGridProps {
  reviews: Review[]
  bookId?: string
  isAdmin?: boolean
  onDelete?: (id: string, bookId?: string) => Promise<void>
  onUpdate?: (id: string, bookId: string | null, title: string, rating: number, comment: string) => Promise<void>
}

export function ReviewsGrid({
  reviews,
  bookId,
  isAdmin = false,
  onDelete,
  onUpdate
}: ReviewsGridProps) {
  return (
    <div className="space-y-6">
      {reviews.map((review, index) => (
        <ReviewCard
          key={review.id || `review-${index}`}
          review={review}
          bookId={bookId}
          isAdmin={isAdmin}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  )
}