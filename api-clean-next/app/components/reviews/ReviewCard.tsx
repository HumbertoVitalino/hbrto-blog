'use client'

import { Review } from '@/domain/Review'
import { Button } from '@/components/ui/button'
import { Trash2, Edit2 } from 'lucide-react'
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

export function ReviewCard({
  review,
  isAdmin,
  bookId,
  onDelete,
  onUpdate
}: ReviewCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

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
      <article className="border rounded-xl p-5 bg-card space-y-4 hover:shadow-sm transition-shadow">

        <header className="flex items-start justify-between">
          <div>
            <h3 className="font-medium">{review.title}</h3>

            <div className="flex items-center gap-2 mt-1">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={`text-sm ${i < review.rating
                    ? 'text-yellow-400'
                    : 'text-muted-foreground'
                    }`}
                >
                  ★
                </span>
              ))}

              <span className="text-xs text-muted-foreground">
                {review.rating}/5
              </span>
            </div>

            <p className="text-xs text-muted-foreground mt-1">
              {formatDate(review.createdAt)}
            </p>
          </div>

          {isAdmin && (
            <div className="flex gap-1">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsEditOpen(true)}
              >
                <Edit2 className="w-4 h-4" />
              </Button>

              <Button
                size="icon"
                variant="ghost"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </header>

        <MarkdownRenderer content={review.comment} />
      </article>

      {isAdmin && (
        <ReviewFormModal
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          initialValues={{
            title: review.title,
            rating: review.rating,
            comment: review.comment
          }}
          onSubmit={async (data) => {
            if (onUpdate) {
              await onUpdate(review.id, review.bookId, data.title, data.rating, data.comment)
            }
          }}
          mode="edit"
        />
      )}
    </>
  )
}