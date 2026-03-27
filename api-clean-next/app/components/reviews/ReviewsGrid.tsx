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

export function ReviewsGrid({ reviews, bookId, isAdmin, onDelete, onUpdate }: ReviewsGridProps) {
    if (reviews.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">No reviews yet</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {reviews.map((review) => (
                <ReviewCard
                    key={review.id}
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
