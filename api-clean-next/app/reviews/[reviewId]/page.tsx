'use client'

import { useState, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useReviews } from '@/app/hooks/useReviews'
import { useBooks } from '@/app/hooks/useBooks'
import { useAuth } from '@/app/context/AuthContext'
import { ReviewFormModal } from '@/app/components/reviews/ReviewFormModal'
import { MarkdownRenderer } from '@/app/components/reviews/MarkdownRenderer'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, ArrowLeft, BookOpen, Edit2, Trash2, Star } from 'lucide-react'
import { ReviewLanguage } from '@/domain/Review'
import { formatDate } from '@/lib/formatDate'

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
          className={`w-4 h-4 ${i < rating ? 'fill-warning text-warning' : 'fill-muted text-muted'}`}
        />
      ))}
      <span className="ml-1.5 text-sm text-muted-foreground font-medium tabular-nums">{rating}/5</span>
    </div>
  )
}

export default function ReviewDetailPage() {
  const router = useRouter()
  const { reviewId } = useParams() as { reviewId: string }

  const { reviews, isLoading, error, updateReview, deleteReview } = useReviews()
  const { books } = useBooks()
  const { isAdmin } = useAuth()

  const [activeId, setActiveId] = useState(reviewId)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const variants = useMemo(() => {
    const target = reviews.find(r => r.id === reviewId)
    if (!target) return []
    const key = target.title.trim().toLowerCase()
    return reviews.filter(r => r.title.trim().toLowerCase() === key)
  }, [reviews, reviewId])

  const activeReview = variants.find(v => v.id === activeId) ?? variants[0]
  const linkedBook = activeReview?.bookId ? books.find(b => b.id === activeReview.bookId) : undefined

  const handleEditSubmit = async (data: { title: string; bookId: string | null; rating: number; comment: string; language?: ReviewLanguage }) => {
    if (!activeReview) return
    await updateReview(activeReview.id, activeReview.bookId, data.title, data.rating, data.comment, data.language)
    setIsEditOpen(false)
  }

  const handleDelete = async () => {
    if (!activeReview) return
    if (!confirm('Are you sure you want to delete this review?')) return
    setIsDeleting(true)
    try {
      await deleteReview(activeReview.id, activeReview.bookId)
      router.push('/reviews')
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-6 w-6 rounded-full border border-muted border-t-foreground animate-spin" />
      </main>
    )
  }

  if (!activeReview) {
    return (
      <main className="min-h-screen bg-background max-w-3xl mx-auto px-6 py-16">
        <Link href="/reviews">
          <Button variant="ghost" className="mb-6 gap-2 -ml-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Reviews
          </Button>
        </Link>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Review not found</AlertTitle>
          <AlertDescription>This review does not exist.</AlertDescription>
        </Alert>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">

        <div className="flex items-center justify-between gap-4">
          <Link href="/reviews">
            <Button variant="ghost" className="gap-2 -ml-4">
              <ArrowLeft className="w-4 h-4" />
              Back to Reviews
            </Button>
          </Link>

          {isAdmin && (
            <div className="flex gap-1.5">
              <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => setIsEditOpen(true)}>
                <Edit2 className="w-3.5 h-3.5" />
                <span className="sr-only">Edit</span>
              </Button>
              <Button size="sm" variant="destructive" className="h-8 w-8 p-0" onClick={handleDelete} disabled={isDeleting}>
                <Trash2 className="w-3.5 h-3.5" />
                <span className="sr-only">Delete</span>
              </Button>
            </div>
          )}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div>
          {linkedBook && (
            <Link
              href={`/library/${linkedBook.id}`}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
            >
              <span className="w-4 h-5.5 rounded-xs overflow-hidden bg-muted shrink-0">
                {linkedBook.coverImageUrl ? (
                  <img src={linkedBook.coverImageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <BookOpen className="w-full h-full p-0.5 text-muted-foreground/50" />
                )}
              </span>
              {linkedBook.title}
            </Link>
          )}

          <h1 className="font-display text-3xl sm:text-4xl font-medium tracking-tight text-foreground leading-tight">
            {activeReview.title}
          </h1>

          <div className="flex items-center gap-3 mt-4 flex-wrap">
            <RatingStars rating={activeReview.rating} />
            <span className="text-muted-foreground/40 text-sm">·</span>
            <time className="text-sm text-muted-foreground" dateTime={activeReview.createdAt ? new Date(activeReview.createdAt).toISOString() : undefined}>
              {formatDate(activeReview.createdAt)}
            </time>

            {variants.length > 1 && (
              <>
                <span className="text-muted-foreground/40 text-sm">·</span>
                <div className="flex items-center gap-0.5 bg-muted/40 p-0.5 rounded-full">
                  {variants.map((v) => {
                    const meta = LANG_META[v.language as ReviewLanguage]
                    const isActiveLang = activeReview.id === v.id
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setActiveId(v.id)}
                        title={v.language}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
                          isActiveLang
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
            )}
          </div>
        </div>

        <MarkdownRenderer content={activeReview.comment} />
      </div>

      {isAdmin && (
        <ReviewFormModal
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          onSubmit={handleEditSubmit}
          initialValues={{
            title: activeReview.title,
            rating: activeReview.rating,
            comment: activeReview.comment,
            createdAt: activeReview.createdAt,
            language: activeReview.language,
          }}
          mode="edit"
        />
      )}
    </main>
  )
}
