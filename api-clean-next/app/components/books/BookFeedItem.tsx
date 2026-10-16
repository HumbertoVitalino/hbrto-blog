'use client'

import { memo } from 'react'
import Link from 'next/link'
import { BookData } from '@/app/hooks/useBooks'
import { BookGenre } from '@/domain/BookGenre'
import { BookStatus } from '@/domain/BookStatus'
import { BookOpen, Edit2, ShoppingCart, Trash2 } from 'lucide-react'
import { formatMonthYear, genreLabels } from './libraryFilters'

interface BookFeedItemProps {
  book: BookData
  onEdit: (book: BookData) => void
  onDelete: (id: string) => void
  isDeleting?: boolean
  isPublic?: boolean
  onAuthorClick?: (author: string) => void
}

const iconButton =
  'relative z-10 inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-[color,background-color,transform] duration-100 ease-out select-none hover:bg-muted/60 hover:text-foreground active:scale-[0.94] active:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50'

/**
 * One entry in the phone-sized reading log. The whole row opens the book (a stretched link on
 * the title); author, buy and admin controls sit above that link on their own layer.
 */
function BookFeedItemComponent({ book, onEdit, onDelete, isDeleting, isPublic = false, onAuthorClick }: BookFeedItemProps) {
  const isReading = book.status === BookStatus.InProgress
  const finished = book.status === BookStatus.Completed && book.completedAt

  return (
    <li className="relative flex gap-3.5 py-3">

      {/* COVER */}
      <div
        className={`relative aspect-2/3 w-18 shrink-0 overflow-hidden rounded-md bg-muted/40 shadow-sm ring-1 ${
          isReading ? 'ring-2 ring-info/50' : 'ring-foreground/5'
        }`}
      >
        {book.coverImageUrl ? (
          <img
            src={book.coverImageUrl}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <BookOpen className="h-5 w-5 text-muted-foreground/30" />
          </div>
        )}
      </div>

      {/* TEXT */}
      <div className="flex min-w-0 flex-1 flex-col py-0.5">
        <h3 className="line-clamp-2 text-[15px] leading-snug font-semibold text-foreground">
          <Link
            href={`/library/${book.id}`}
            className="outline-none select-none after:absolute after:inset-y-0 after:-inset-x-2 after:rounded-lg after:transition-colors after:duration-100 active:after:bg-foreground/5 focus-visible:after:ring-2 focus-visible:after:ring-ring/50"
          >
            {book.title}
          </Link>
        </h3>

        {onAuthorClick ? (
          <button
            type="button"
            onClick={() => onAuthorClick(book.author)}
            title={`More by ${book.author}`}
            className="relative z-10 -mb-1 max-w-full self-start truncate rounded-sm py-1 text-left text-sm text-muted-foreground underline-offset-2 transition-colors select-none hover:text-foreground hover:underline active:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            {book.author}
          </button>
        ) : (
          <p className="truncate text-sm text-muted-foreground">{book.author}</p>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <p className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground tabular-nums">
            {book.genre && (
              <>
                <span className="truncate">{genreLabels[book.genre as BookGenre] ?? book.genre}</span>
                <span className="shrink-0 opacity-40">·</span>
              </>
            )}
            <span className="shrink-0 whitespace-nowrap">{book.pages}p</span>
            {finished && (
              <>
                <span className="shrink-0 opacity-40">·</span>
                <time dateTime={book.completedAt!} title="Finished" className="shrink-0 whitespace-nowrap">
                  {formatMonthYear(book.completedAt!)}
                </time>
              </>
            )}
          </p>

          <div className="-my-1.5 -mr-1.5 flex shrink-0 items-center">
            {book.affiliateUrl && (
              <a
                href={book.affiliateUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Buy ${book.title} on Amazon`}
                className={iconButton}
              >
                <ShoppingCart className="h-4 w-4" />
              </a>
            )}
            {!isPublic && (
              <>
                <button
                  type="button"
                  onClick={() => onEdit(book)}
                  aria-label={`Edit ${book.title}`}
                  className={iconButton}
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => book.id && onDelete(book.id)}
                  disabled={isDeleting || !book.id}
                  aria-label={`Delete ${book.title}`}
                  className={`${iconButton} hover:text-destructive-text`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </li>
  )
}

export const BookFeedItem = memo(BookFeedItemComponent)
