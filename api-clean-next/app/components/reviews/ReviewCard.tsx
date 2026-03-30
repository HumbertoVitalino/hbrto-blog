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

export function ReviewCard({
  review,
  isAdmin,
  bookId,
  onDelete,
  onUpdate
}: ReviewCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false) // Novo estado para o truncamento

  const handleDelete = async () => {
    if (!onDelete) return

    try {
      setIsDeleting(true)
      await onDelete(review.id, bookId || review.bookId || undefined)
    } finally {
      setIsDeleting(false)
    }
  }

  // Verifica se o texto é consideravelmente grande (heurística simples)
  const isLongReview = review.comment.length > 400

  return (
    <>
      <article className="group relative rounded-2xl border bg-card/50 p-6 shadow-sm hover:shadow-md hover:bg-card transition-all duration-300">

        {/* HEADER DO CARD */}
        <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 pb-4 border-b border-border/50">
          <div className="space-y-1.5 flex-1">
            <h3 className="text-xl font-semibold tracking-tight leading-tight text-foreground">
              {review.title}
            </h3>

            <div className="flex items-center gap-3">
              {/* Estrelas com Lucide-react (mais limpo) */}
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < review.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-muted text-muted'
                      }`}
                  />
                ))}
                <span className="ml-1.5 text-xs font-medium text-muted-foreground">
                  {review.rating}/5
                </span>
              </div>

              <span className="text-muted-foreground/50 text-xs">•</span>

              {/* CORREÇÃO AQUI: Instanciando um novo Date antes de usar toISOString() */}
              <time 
                className="text-xs font-medium text-muted-foreground" 
                dateTime={review.createdAt ? new Date(review.createdAt).toISOString() : undefined}
              >
                {formatDate(review.createdAt)}
              </time>
            </div>
          </div>

          {/* ADMIN ACTIONS (Agora aparecem melhor no hover) */}
          {isAdmin && (
            <div className="flex gap-2 sm:opacity-50 sm:group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => setIsEditOpen(true)}
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span className="sr-only">Edit review</span>
              </Button>

              <Button
                size="sm"
                variant="destructive"
                className="h-8 w-8 p-0"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="sr-only">Delete review</span>
              </Button>
            </div>
          )}
        </header>

        {/* CORPO DA REVIEW COM TRUNCAMENTO OPCIONAL */}
        <div className="relative">
          <div className={`transition-all duration-500 ease-in-out overflow-hidden ${!isExpanded && isLongReview ? 'max-h-62.5' : 'max-h-1250'
            }`}>
            {/* O MarkdownRenderer já lida com o conteúdo, apenas limitamos a altura da div pai */}
            <MarkdownRenderer content={review.comment} />
          </div>

          {/* FADE OUT EFFECT QUANDO TRUNCADO */}
          {!isExpanded && isLongReview && (
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-card/90 via-card/50 to-transparent flex items-end justify-center pb-2">
            </div>
          )}
        </div>

        {/* BOTÃO LER MAIS (Só aparece se for longo) */}
        {isLongReview && (
          <div className="mt-4 flex justify-center border-t border-border/30 pt-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground text-xs gap-1.5"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <>Show less <ChevronUp className="w-3 h-3" /></>
              ) : (
                <>Read full review <ChevronDown className="w-3 h-3" /></>
              )}
            </Button>
          </div>
        )}

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