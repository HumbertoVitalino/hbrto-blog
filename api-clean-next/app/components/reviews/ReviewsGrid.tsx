'use client'

import { useMemo } from 'react'
import { Review } from '@/domain/Review'
import { ReviewCard } from './ReviewCard'
import { RevealGroup, RevealItem } from '@/app/components/motion/Reveal'
import { BookData } from '@/app/hooks/useBooks'
import { groupReviewsByTitle } from '@/lib/reviews'

interface ReviewsGridProps {
  reviews: Review[]
  bookId?: string
  bookById?: Record<string, BookData>
  isAdmin?: boolean
  deletingId?: string
  onEdit?: (review: Review) => void
  onDelete?: (id: string, bookId?: string) => void
}

export function ReviewsGrid({ reviews, bookId, bookById, isAdmin = false, deletingId, onEdit, onDelete }: ReviewsGridProps) {
  const grouped = useMemo(() => groupReviewsByTitle(reviews), [reviews])

  return (
    <RevealGroup className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {grouped.map(([primary, ...variants]) => (
        <RevealItem key={primary.id}>
          <ReviewCard
            review={primary}
            variantCount={variants.length}
            bookId={bookId}
            bookById={bookById}
            isAdmin={isAdmin}
            isDeleting={deletingId === primary.id}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </RevealItem>
      ))}
    </RevealGroup>
  )
}
