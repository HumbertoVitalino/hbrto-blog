'use client'

import { Review, ReviewLanguage } from '@/domain/Review'
import { Button } from '@/components/ui/button'
import { Trash2, Edit2, Star, ChevronDown, ChevronUp } from 'lucide-react'
import { useState, useEffect } from 'react'
import { ReviewFormModal } from './ReviewFormModal'
import { formatDate } from '@/lib/formatDate'
import { MarkdownRenderer } from './MarkdownRenderer'

interface ReviewCardProps {
  review: Review
  variants?: Review[]
  isAdmin?: boolean
  bookId?: string
  onDelete?: (id: string, bookId?: string) => Promise<void>
  onUpdate?: (id: string, bookId: string | null, title: string, rating: number, comment: string, language?: ReviewLanguage) => Promise<void>
}

const LANG_META: Record<ReviewLanguage, { flag: string; label: string }> = {
  'en': { flag: '🇺🇸', label: 'EN' },
  'pt-BR': { flag: '🇧🇷', label: 'PT' },
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'fill-muted text-muted'}`}
        />
      ))}
      <span className="ml-1.5 text-xs text-muted-foreground font-medium tabular-nums">{rating}/5</span>
    </div>
  )
}

export function ReviewCard({ review, variants = [], isAdmin, bookId, onDelete, onUpdate }: ReviewCardProps) {
  const allVariants = [review, ...variants]

  const [activeReview, setActiveReview] = useState(review)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  // Reset active review and expanded state when the primary review changes
  useEffect(() => {
    setActiveReview(review)
    setIsExpanded(false)
  }, [review.id])

  // Collapse when switching language — content length may differ
  useEffect(() => {
    setIsExpanded(false)
  }, [activeReview.id])

  const isLong = activeReview.comment.length > 400

  const handleDelete = async () => {
    if (!onDelete) return
    try {
      setIsDeleting(true)
      await onDelete(activeReview.id, bookId || activeReview.bookId || undefined)
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
            <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => setIsEditOpen(true)}>
              <Edit2 className="w-3 h-3" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button size="sm" variant="destructive" className="h-7 w-7 p-0" onClick={handleDelete} disabled={isDeleting}>
              <Trash2 className="w-3 h-3" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        )}

        {/* META */}
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <RatingStars rating={activeReview.rating} />
          <span className="text-muted-foreground/40 text-xs">·</span>
          <time className="text-xs text-muted-foreground" dateTime={activeReview.createdAt ? new Date(activeReview.createdAt).toISOString() : undefined}>
            {formatDate(activeReview.createdAt)}
          </time>

          {/* Language switcher — shown when multiple variants exist; single flag when only one language */}
          {allVariants.length > 1 ? (
            <>
              <span className="text-muted-foreground/40 text-xs">·</span>
              <div className="flex items-center gap-0.5 bg-muted/40 p-0.5 rounded-full">
                {allVariants.map((v) => {
                  const meta = LANG_META[v.language as ReviewLanguage]
                  const isActive = activeReview.id === v.id
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setActiveReview(v)}
                      title={v.language}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <span>{meta?.flag ?? v.language}</span>
                      <span>{meta?.label ?? v.language}</span>
                    </button>
                  )
                })}
              </div>
            </>
          ) : (
            activeReview.language && activeReview.language !== 'en' && (
              <>
                <span className="text-muted-foreground/40 text-xs">·</span>
                <span className="text-sm leading-none" title={activeReview.language}>
                  {LANG_META[activeReview.language as ReviewLanguage]?.flag ?? activeReview.language}
                </span>
              </>
            )
          )}
        </div>

        {/* TITLE */}
        <h2 className="text-xl font-semibold tracking-tight text-foreground mb-4 leading-snug pr-16">
          {activeReview.title}
        </h2>

        {/* CONTENT */}
        <div className="relative">
          <div className={`overflow-hidden transition-all duration-500 ease-in-out ${!isExpanded && isLong ? 'max-h-48' : 'max-h-none'}`}>
            <MarkdownRenderer content={activeReview.comment} />
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
            {isExpanded
              ? <><ChevronUp className="w-3.5 h-3.5" /> Show less</>
              : <><ChevronDown className="w-3.5 h-3.5" /> Read full review</>}
          </button>
        )}
      </article>

      {isAdmin && (
        <ReviewFormModal
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          initialValues={{
            title: activeReview.title,
            rating: activeReview.rating,
            comment: activeReview.comment,
            language: activeReview.language,
          }}
          onSubmit={async (data) => {
            if (onUpdate) await onUpdate(activeReview.id, activeReview.bookId, data.title, data.rating, data.comment, data.language)
          }}
          mode="edit"
        />
      )}
    </>
  )
}
