'use client'

import { memo } from 'react'
import Link from 'next/link'
import { Review } from '@/domain/Review'
import { Star, Edit2, Trash2, Loader2 } from 'lucide-react'
import { formatDate } from '@/lib/formatDate'
import { stripMarkdown } from '@/lib/markdown'
import { BookData } from '@/app/hooks/useBooks'

interface ReviewCardProps {
  review: Review
  variantCount?: number
  bookId?: string
  bookById?: Record<string, BookData>
  isAdmin?: boolean
  isDeleting?: boolean
  onEdit?: (review: Review) => void
  onDelete?: (id: string, bookId?: string) => void
}

function ReviewCardComponent({ review, variantCount = 0, bookId, bookById, isAdmin, isDeleting, onEdit, onDelete }: ReviewCardProps) {
  // Only show the linked book's cover when we're not already scoped to that book's own page.
  const linkedBook = !bookId && review.bookId ? bookById?.[review.bookId] : undefined
  const excerpt = stripMarkdown(review.comment)

  return (
    <div className="group relative flex rounded-2xl border border-border/60 bg-card overflow-hidden hover:shadow-lg hover:border-primary/30 hover:-translate-y-1 transition-all duration-300">
      <Link href={`/reviews/${review.id}`} className="flex flex-1 min-w-0">

        {/* CONTENT — the review is the product, this is most of the card */}
        <div className="flex flex-col flex-1 min-w-0 p-6 sm:p-8 gap-3">

          {/* 1. RATING — the visual anchor */}
          <div className="flex items-center gap-1.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-warning text-warning' : 'fill-muted text-muted'}`} />
            ))}
            <span className="ml-1 text-sm font-semibold text-foreground tabular-nums">{review.rating}/5</span>
          </div>

          {/* 2. TITLE — dominant element */}
          <h3 className="font-semibold text-xl sm:text-2xl leading-snug line-clamp-2 text-foreground">
            {review.title}
          </h3>

          {/* 3. PREVIEW — bigger, more room to breathe */}
          <p className="text-sm sm:text-[15px] text-muted-foreground leading-relaxed line-clamp-3 sm:line-clamp-4 flex-1">
            {excerpt}
          </p>

          {/* 4. METADATA — discreet */}
          <div className="flex items-center gap-2.5 mt-auto pt-4 text-xs text-muted-foreground">
            <time>{formatDate(review.createdAt)}</time>
            {linkedBook?.genre && (
              <>
                <span className="opacity-40">·</span>
                <span className="capitalize">{linkedBook.genre.replaceAll('-', ' ')}</span>
              </>
            )}
            {variantCount > 0 && (
              <>
                <span className="opacity-40">·</span>
                <span>+{variantCount} lang</span>
              </>
            )}
          </div>
        </div>

        {/* 5. COVER — small, secondary, only when there's a book to identify */}
        {linkedBook?.coverImageUrl && (
          <div className="hidden sm:block relative w-28 md:w-36 shrink-0 bg-muted/40 overflow-hidden">
            <img
              src={linkedBook.coverImageUrl}
              alt={`${linkedBook.title} cover`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        )}
      </Link>

      {/* Admin overlay — sibling of the Link, not nested inside it */}
      {isAdmin && (
        <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit?.(review)}
            className="w-7 h-7 rounded-full bg-background/90 backdrop-blur-sm border border-border/50 flex items-center justify-center hover:bg-background shadow-sm transition-colors"
          >
            <Edit2 className="w-3 h-3" />
          </button>
          <button
            onClick={() => onDelete?.(review.id, bookId || review.bookId || undefined)}
            disabled={isDeleting}
            className="w-7 h-7 rounded-full bg-destructive/90 backdrop-blur-sm flex items-center justify-center hover:bg-destructive shadow-sm transition-colors disabled:opacity-50"
          >
            {isDeleting
              ? <Loader2 className="w-3 h-3 animate-spin text-destructive-foreground" />
              : <Trash2 className="w-3 h-3 text-destructive-foreground" />
            }
          </button>
        </div>
      )}
    </div>
  )
}

export const ReviewCard = memo(ReviewCardComponent)
