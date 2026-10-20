'use client'

import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { useBooks } from '@/app/hooks/useBooks'
import { useNotes } from '@/app/hooks/useNotes'
import { NewNoteButton } from '@/app/components/notes/NoteAdmin'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, ArrowLeft, Plus, ShoppingCart } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Book } from '@/domain/Book'
import { BookStatus } from '@/domain/BookStatus'
import { noteDate, noteExcerpt } from '@/lib/notes'

function getStatusConfig(status?: BookStatus) {
  switch (status) {
    case BookStatus.Completed:
      return {
        label: 'Completed',
        dotColor: 'bg-success',
        bgColor: 'bg-success/10',
        textColor: 'text-success',
        borderColor: 'border-success/20'
      }
    case BookStatus.InProgress:
      return {
        label: 'In Progress',
        dotColor: 'bg-info',
        bgColor: 'bg-info/10',
        textColor: 'text-info',
        borderColor: 'border-info/20'
      }
    case BookStatus.NotStarted:
    default:
      return {
        label: 'Not Started',
        dotColor: 'bg-muted-foreground/50',
        bgColor: 'bg-muted',
        textColor: 'text-muted-foreground',
        borderColor: 'border-border'
      }
  }
}

export default function BookDetailPage() {
  const router = useRouter()
  const { bookId } = useParams() as { bookId: string }

  const { books, isLoading: booksLoading } = useBooks()
  const { notes, isLoading: notesLoading, error } = useNotes({ kind: 'book', id: bookId })

  const [book, setBook] = useState<Book | null>(null)

  useEffect(() => {
    if (!booksLoading) {
      const found = books.find(b => b.id === bookId)
      setBook(found && found.id ? new Book({
        id: found.id,
        title: found.title,
        author: found.author,
        pages: found.pages,
        genre: found.genre,
        status: found.status,
        coverImageUrl: found.coverImageUrl,
        affiliateUrl: found.affiliateUrl,
      }) as Book : null)
    }
  }, [books, bookId, booksLoading])

  // LOADING
  if (booksLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-6 w-6 rounded-full border border-muted border-t-foreground animate-spin" />
      </div>
    )
  }

  // NOT FOUND
  if (!book) {
    return (
      <div className="min-h-screen bg-background max-w-4xl mx-auto px-4 py-16">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6 gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Book not found</AlertTitle>
          <AlertDescription>This book does not exist.</AlertDescription>
        </Alert>
      </div>
    )
  }

  const statusConfig = getStatusConfig(book.status)

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-16 space-y-12">

        {/* BACK BUTTON */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="gap-2 -ml-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Library
        </Button>

        {/* BOOK HEADER (EDITORIAL & VISUAL STYLE) */}
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Cover Image Section */}
          <div className="w-full sm:w-64 shrink-0 mx-auto md:mx-0">
            {book.coverImageUrl ? (
              <div className="aspect-2/3 relative rounded-lg overflow-hidden shadow-xl border border-border/50">
                <img
                  src={book.coverImageUrl}
                  alt={`${book.title} cover`}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-2/3 bg-muted/50 rounded-lg flex flex-col items-center justify-center border border-dashed border-border shadow-sm text-muted-foreground">
                <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                <span className="text-sm">No cover</span>
              </div>
            )}
          </div>

          {/* Book Info Section */}
          <div className="flex-1 space-y-6 text-center md:text-left">
            <div className="space-y-2">
              <h1 className="font-display text-3xl sm:text-4xl font-medium tracking-tight text-foreground">
                {book.title}
              </h1>
              <p className="text-xl text-muted-foreground font-medium">
                by {book.author}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              {/* Status Badge */}
              <div className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 border ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor}`}>
                <span className={`w-2 h-2 rounded-full ${statusConfig.dotColor}`}></span>
                {statusConfig.label}
              </div>

              {/* Pages Tag */}
              <div className="bg-secondary/30 text-secondary-foreground text-sm font-medium px-3 py-1.5 rounded-full border border-border/50">
                {book.pages} pages
              </div>

              {/* Genre Tag */}
              {book.genre && (
                <div className="bg-primary/5 text-primary text-sm font-medium px-3 py-1.5 rounded-full capitalize border border-primary/20">
                  {book.genre.replace('-', ' ')}
                </div>
              )}
            </div>

            {/* Amazon affiliate button */}
            {book.affiliateUrl && (
              <div className="flex justify-center md:justify-start pt-2">
                <a href={book.affiliateUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    Buy on Amazon
                  </Button>
                </a>
              </div>
            )}
          </div>
        </div>

        <hr className="border-border/50" />

        {/* NOTES ON THIS BOOK */}
        <section aria-labelledby="book-notes-heading">
          <div className="flex items-center justify-between gap-4">
            <h2 id="book-notes-heading" className="text-sm font-semibold">Notes on this book</h2>
            <NewNoteButton
              preset={{ kind: 'book', id: bookId }}
              trigger={open => (
                <Button size="sm" variant="outline" onClick={open} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Write a note
                </Button>
              )}
            />
          </div>

          {error && (
            <p role="alert" className="mt-8 text-sm text-muted-foreground">
              The notes on this book couldn’t be loaded right now.
            </p>
          )}

          {notesLoading ? (
            <div className="flex justify-center py-16">
              <div className="h-5 w-5 rounded-full border border-muted border-t-foreground animate-spin" />
            </div>
          ) : !error && notes.length === 0 ? (
            <p className="mt-8 text-sm text-muted-foreground">Nothing written about this book yet.</p>
          ) : (
            <ol className="mt-12 flex flex-col gap-14">
              {notes.map(note => (
                <li key={note.id} className="hover-surface flex flex-col items-start">
                  <h3 className="text-base font-semibold tracking-tight text-balance">
                    <Link href={`/notes/${note.id}`} className="stretched-link">{note.entries[0].title}</Link>
                  </h3>
                  <time dateTime={note.createdAt} className="order-first mb-3 text-sm text-muted-foreground">
                    {noteDate(note.createdAt)}
                  </time>
                  <p className="mt-2 text-sm text-muted-foreground text-pretty">{noteExcerpt(note.entries[0].body, 200)}</p>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  )
}
