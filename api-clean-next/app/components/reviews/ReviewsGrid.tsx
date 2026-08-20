'use client'

import { useMemo } from 'react'
import { Review, ReviewLanguage } from '@/domain/Review'
import { ReviewCard } from './ReviewCard'
import { RevealGroup, RevealItem } from '@/app/components/motion/Reveal'

interface ReviewsGridProps {
  reviews: Review[]
  bookId?: string
  isAdmin?: boolean
  onDelete?: (id: string, bookId?: string) => Promise<void>
  onUpdate?: (id: string, bookId: string | null, title: string, rating: number, comment: string, language?: ReviewLanguage) => Promise<void>
}

export function ReviewsGrid({ reviews, bookId, isAdmin = false, onDelete, onUpdate }: ReviewsGridProps) {
  // Group reviews with the same title as language variants of the same entry.
  // Map preserves insertion order, so sort priority from the parent is maintained.
  const grouped = useMemo(() => {
    const map = new Map<string, Review[]>()
    for (const r of reviews) {
      const key = r.title.trim().toLowerCase()
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(r)
    }
    return Array.from(map.values())
  }, [reviews])

  return (
    <RevealGroup className="space-y-6">
      {grouped.map(([primary, ...variants]) => (
        <RevealItem key={primary.id}>
          <ReviewCard
            review={primary}
            variants={variants}
            bookId={bookId}
            isAdmin={isAdmin}
            onDelete={onDelete}
            onUpdate={onUpdate}
          />
        </RevealItem>
      ))}
    </RevealGroup>
  )
}
