'use client'

import { memo } from 'react'
import { motion } from 'motion/react'
import { BookData } from '@/app/hooks/useBooks'
import { BookStatus } from '@/domain/BookStatus'
import Link from 'next/link'
import { Trash2, Edit2, MessageSquare, ShoppingCart, BookOpen } from 'lucide-react'

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
      return { label: 'Completed', dot: 'bg-success' }
    case BookStatus.InProgress:
      return { label: 'Reading', dot: 'bg-info' }
    default:
      return { label: 'To read', dot: 'bg-muted-foreground/50' }
  }
}

function BookCardComponent({ book, onEdit, onDelete, isDeleting, isPublic = false }: BookCardProps) {
  const status = getStatusConfig(book.status)

  return (
    <motion.div
      className="group flex flex-col h-full rounded-2xl border border-border/60 bg-card overflow-hidden hover:shadow-lg hover:border-primary/30 transition-shadow duration-300"
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
    >

      {/* COVER */}
      <div className={`relative w-full aspect-2/3 bg-muted/40 overflow-hidden ${
        book.status === BookStatus.InProgress ? 'ring-2 ring-inset ring-info/40' : ''
      }`}>
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

        {/* Status badge — bottom left */}
        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 bg-background/90 backdrop-blur-sm border border-border/50 text-xs font-medium px-2.5 py-1 rounded-full shadow-sm">
          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
          {status.label}
        </div>

        {/* Admin overlay — top right */}
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
      <div className="flex flex-col flex-1 p-4 gap-2">
        <div className="flex-1">
          <h3 className="font-semibold text-[15px] leading-snug line-clamp-2 text-foreground">
            {book.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
            {book.author}
          </p>
        </div>

        {/* Footer: metadata + icon actions */}
        <div className="flex items-center justify-between gap-2 mt-auto pt-3 border-t border-border/40">
          <div className="flex items-center gap-1.5 min-w-0 text-xs text-muted-foreground">
            {book.genre && (
              <>
                <span className="truncate capitalize">{book.genre.replaceAll('-', ' ')}</span>
                <span className="opacity-40 shrink-0">·</span>
              </>
            )}
            <span className="whitespace-nowrap shrink-0">{book.pages}p</span>
          </div>

          <div className="flex items-center gap-0.5 shrink-0">
            {book.affiliateUrl && (
              <a href={book.affiliateUrl} target="_blank" rel="noopener noreferrer">
                <button
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                  title="Buy on Amazon"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                </button>
              </a>
            )}
            <Link href={`/library/${book.id}`}>
              <button
                className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                title="Reviews"
              >
                <MessageSquare className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export const BookCard = memo(BookCardComponent)
