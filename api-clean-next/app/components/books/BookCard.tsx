'use client'

import { memo } from 'react'
import { BookData } from '@/app/hooks/useBooks'
import { BookStatus } from '@/domain/BookStatus'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Trash2, Edit2, MessageSquare, ShoppingCart } from 'lucide-react'

interface BookCardProps {
  book: BookData
  onEdit: (book: BookData) => void
  onDelete: (id: string) => void
  isDeleting?: boolean
  isPublic?: boolean
}

function getStatusConfig(status?: BookStatus) {
  switch (status) {
    case BookStatus.Completed:
      return { label: 'Completed', dot: 'bg-green-500' }
    case BookStatus.InProgress:
      return { label: 'Reading', dot: 'bg-blue-500' }
    default:
      return { label: 'To read', dot: 'bg-slate-400' }
  }
}

function BookCardComponent({ book, onEdit, onDelete, isDeleting, isPublic = false }: BookCardProps) {
  const status = getStatusConfig(book.status)

  return (
    <div className="group flex flex-col h-full rounded-2xl border border-border/60 bg-card overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">

      {/* COVER */}
      <div className="relative w-full aspect-2/3 bg-muted/40 overflow-hidden">
        {book.coverImageUrl ? (
          <img
            src={book.coverImageUrl}
            alt={`${book.title} cover`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-muted-foreground/30" />
          </div>
        )}

        {/* Status badge */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 bg-background/90 backdrop-blur-sm border border-border/50 text-xs font-medium px-2.5 py-1 rounded-full shadow-sm">
          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
          {status.label}
        </div>

        {/* Admin overlay */}
        {!isPublic && (
          <div className="absolute top-2.5 right-2.5 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(book)}
              className="w-7 h-7 rounded-full bg-background/90 backdrop-blur-sm border border-border/50 flex items-center justify-center hover:bg-background shadow-sm transition-colors"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            <button
              onClick={() => book.id && onDelete(book.id)}
              disabled={isDeleting || !book.id}
              className="w-7 h-7 rounded-full bg-destructive/90 backdrop-blur-sm flex items-center justify-center hover:bg-destructive shadow-sm transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3 h-3 text-destructive-foreground" />
            </button>
          </div>
        )}
      </div>

      {/* INFO */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div>
          <h3 className="font-semibold text-base leading-snug line-clamp-2 text-foreground">
            {book.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            {book.author}
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
            {book.pages} pages
          </span>
          {book.genre && (
            <span className="text-xs text-primary bg-primary/8 px-2 py-0.5 rounded-md capitalize">
              {book.genre.replace('-', ' ')}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 mt-auto pt-1">
          <Link href={`/library/${book.id}`} className="w-full">
            <Button variant="outline" size="sm" className="w-full gap-2 justify-center text-xs">
              <MessageSquare className="w-3.5 h-3.5" />
              Reviews
            </Button>
          </Link>

          {/* Amazon affiliate link */}
          {book.affiliateUrl && (
            <a href={book.affiliateUrl} target="_blank" rel="noopener noreferrer" className="w-full">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-center gap-2 bg-background hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 dark:hover:bg-amber-950/30 dark:hover:border-amber-700 dark:hover:text-amber-400 transition-colors"
              >
                <ShoppingCart className="w-4 h-4" />
                Buy on Amazon
              </Button>
            </a>
          )}

          {/* Authenticated actions */}
          {!isPublic && (
            <div className="flex gap-2">
              <Button
                onClick={() => onEdit(book)}
                variant="secondary"
                size="sm"
                className="flex-1 justify-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 justify-center text-xs hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 dark:hover:bg-amber-950/30 dark:hover:border-amber-700 dark:hover:text-amber-400 transition-colors"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                Buy on Amazon
              </Button>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export const BookCard = memo(BookCardComponent)
