'use client'

import Link from 'next/link'
import { BookData } from '@/app/hooks/useBooks'
import { BookGenre } from '@/domain/BookGenre'
import { BookOpen } from 'lucide-react'
import { genreLabels } from './libraryFilters'

/** The one raised surface on the Library: what's on the nightstand right now. */
export function ReadingNow({ books }: { books: BookData[] }) {
  return (
    <section aria-label="Reading now" className="flex flex-col gap-4">
      {books.map(book => (
        <article
          key={book.id}
          className="cover-item relative flex items-center gap-6 rounded-[20px] bg-card p-5 shadow-[0_1px_2px_oklch(0.18_0.006_295/0.05),0_12px_32px_-16px_oklch(0.18_0.006_295/0.18)] dark:shadow-none ring-1 ring-border sm:gap-7 sm:px-7 sm:py-6"
        >
          <div className="cover-object w-21 shrink-0 sm:w-26">
            {book.coverImageUrl ? (
              <img src={book.coverImageUrl} alt="" className="size-full object-cover" />
            ) : (
              <div className="absolute inset-0 grid place-items-center">
                <BookOpen className="size-6 text-muted-foreground/40" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-[13px] font-semibold text-brand-accent">
              <span aria-hidden className="size-1.5 rounded-full bg-brand-accent" />
              Reading now
            </p>
            <h2 className="mt-2 text-[1.375rem] font-semibold leading-7 tracking-tight text-balance">
              <Link
                href={`/library/${book.id}`}
                className="after:absolute after:inset-0 after:rounded-[20px] focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-ring"
              >
                {book.title}
              </Link>
            </h2>
            <p className="mt-0.5 text-[15px] text-muted-foreground">{book.author}</p>
            <p className="mt-3 text-[13px] tabular-nums text-muted-foreground">
              {book.genre ? `${genreLabels[book.genre as BookGenre] ?? book.genre} · ` : ''}{book.pages} pages
            </p>
          </div>
        </article>
      ))}
    </section>
  )
}
