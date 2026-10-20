'use client'

import { memo } from 'react'
import Link from 'next/link'
import { BookData } from '@/app/hooks/useBooks'
import { BookStatus } from '@/domain/BookStatus'
import { BookOpen, Pencil, Trash2 } from 'lucide-react'
import { formatMonthYear } from './libraryFilters'

interface BookShelfItemProps {
  book: BookData
  onEdit: (book: BookData) => void
  onDelete: (id: string) => void
  isDeleting?: boolean
  isPublic?: boolean
  onAuthorClick?: (author: string) => void
}

const adminButton =
  'grid size-7 place-items-center rounded-full bg-card/90 text-muted-foreground shadow-sm ring-1 ring-border backdrop-blur-sm transition-[color,transform] duration-100 ease-out hover:text-foreground active:scale-[0.94] disabled:opacity-50'

/**
 * One book on the shelf: the cover is the object, the title opens the book (its link
 * stretches over the whole item), and the author and admin controls sit above that link.
 */
function BookShelfItemComponent({ book, onEdit, onDelete, isDeleting, isPublic = false, onAuthorClick }: BookShelfItemProps) {
  const finished = book.status === BookStatus.Completed && book.completedAt

  return (
    <li className="cover-item group relative flex min-w-0 flex-col">
      <div className="cover-object">
        {book.coverImageUrl ? (
          <img src={book.coverImageUrl} alt="" loading="lazy" decoding="async" className="size-full object-cover" />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <BookOpen className="size-6 text-muted-foreground/40" />
          </div>
        )}
      </div>

      <h3 className="mt-3 line-clamp-2 text-[13px] font-semibold leading-[1.15rem] tracking-[-0.005em]">
        <Link href={`/library/${book.id}`} className="after:absolute after:inset-0 after:z-1 focus-visible:outline-none focus-visible:after:rounded-md focus-visible:after:ring-2 focus-visible:after:ring-ring">
          {book.title}
        </Link>
      </h3>

      {onAuthorClick ? (
        <button
          type="button"
          onClick={() => onAuthorClick(book.author)}
          title={`More by ${book.author}`}
          className="relative z-2 mt-0.5 max-w-full self-start truncate text-left text-[13px] leading-[1.15rem] text-muted-foreground transition-colors hover:text-brand-accent"
        >
          {book.author}
        </button>
      ) : (
        <p className="mt-0.5 truncate text-[13px] leading-[1.15rem] text-muted-foreground">{book.author}</p>
      )}

      {finished && (
        <time dateTime={book.completedAt!} className="mt-0.5 text-xs tabular-nums text-muted-foreground/80">
          {formatMonthYear(book.completedAt!)}
        </time>
      )}

      {!isPublic && (
        <div className="absolute right-1.5 top-1.5 z-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100">
          <button type="button" onClick={() => onEdit(book)} aria-label={`Edit ${book.title}`} className={adminButton}>
            <Pencil className="size-3" />
          </button>
          <button
            type="button"
            onClick={() => book.id && onDelete(book.id)}
            disabled={isDeleting || !book.id}
            aria-label={`Delete ${book.title}`}
            className={`${adminButton} hover:text-destructive-text`}
          >
            <Trash2 className="size-3" />
          </button>
        </div>
      )}
    </li>
  )
}

export const BookShelfItem = memo(BookShelfItemComponent)
