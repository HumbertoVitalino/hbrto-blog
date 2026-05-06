'use client'

import { Review } from '@/domain/Review'
import { Button } from '@/components/ui/button'
import { Trash2, Edit2, Star, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { ReviewFormModal } from './ReviewFormModal'
import { formatDate } from '@/lib/formatDate'
import { MarkdownRenderer } from './MarkdownRenderer'

interface ReviewCardProps {
  review: Review
  isAdmin?: boolean
  bookId?: string
  onDelete?: (id: string, bookId?: string) => Promise<void>
  onUpdate?: (id: string, bookId: string | null, title: string, rating: number, comment: string) => Promise<void>
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i < rating ? 'fill-yellow-400 text-yellow-400' : 'fill-muted text-muted'
          }`}
        />
      ))}
      <span className="ml-1.5 text-xs text-muted-foreground font-medium tabular-nums">
        {rating}/5
      </span>
    </div>
  )
}

export function ReviewCard({ review, isAdmin, bookId, onDelete, onUpdate }: ReviewCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const isLong = review.comment.length > 400

  const handleDelete = async () => {
    if (!onDelete) return
    try {
      setIsDeleting(true)
      await onDelete(review.id, bookId || review.bookId || undefined)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <article className="group relative py-8 border-b border-border/50 last:border-0">

        {/* ADMIN ACTIONS */}
        {isAdmin && (
          <div className="absolute top-8 right-0 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="outline"
              className="h-7 w-7 p-0"
              onClick={() => setIsEditOpen(true)}
            >
              <Edit2 className="w-3 h-3" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="h-7 w-7 p-0"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="w-3 h-3" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        )}

        {/* META */}
        <div className="flex items-center gap-3 mb-3">
          <RatingStars rating={review.rating} />
          <span className="text-muted-foreground/40 text-xs">·</span>
          <time
            className="text-xs text-muted-foreground"
            dateTime={review.createdAt ? new Date(review.createdAt).toISOString() : undefined}
          >
            {formatDate(review.createdAt)}
          </time>
        </div>

        {/* TITLE */}
        <h2 className="text-xl font-semibold tracking-tight text-foreground mb-4 leading-snug pr-16">
          {review.title}
        </h2>

        {/* CONTENT */}
        <div className="relative">
          <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
            !isExpanded && isLong ? 'max-h-48' : 'max-h-1250'
          }`}>
            <MarkdownRenderer content={review.comment} />
          </div>

          {!isExpanded && isLong && (
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-linear-to-t from-background to-transparent pointer-events-none" />
          )}
        </div>

        {/* EXPAND TOGGLE */}
        {isLong && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-4 flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {isExpanded ? (
              <>Show less <ChevronUp className="w-3.5 h-3.5" /></>
            ) : (
              <>Read full review <ChevronDown className="w-3.5 h-3.5" /></>
            )}
          </button>
        )}
      </article>

      {isAdmin && (
        <ReviewFormModal
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          initialValues={{ title: review.title, rating: review.rating, comment: review.comment }}
          onSubmit={async (data) => {
            if (onUpdate) await onUpdate(review.id, review.bookId, data.title, data.rating, data.comment)
          }}
          mode="edit"
        />
      )}
    </>
  )
}
