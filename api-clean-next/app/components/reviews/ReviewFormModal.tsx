'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { useBooks } from '@/app/hooks/useBooks'
import { formatDate } from '@/lib/formatDate'
import { MarkdownPreview } from './MarkdownPreview'

interface ReviewFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: { title: string; bookId: string | null; rating: number; comment: string }) => Promise<void>
  initialValues?: { title?: string; rating: number; comment: string; createdAt?: Date }
  mode?: 'create' | 'edit'
  bookId?: string | null
}

export function ReviewFormModal({
  open,
  onOpenChange,
  onSubmit,
  initialValues,
  mode = 'create',
  bookId
}: ReviewFormModalProps) {
  const { books, isLoading: booksLoading } = useBooks()
  const [title, setTitle] = useState(initialValues?.title ?? '')
  const [rating, setRating] = useState(initialValues?.rating ?? 5)
  const [comment, setComment] = useState(initialValues?.comment ?? '')
  const [selectedBookId, setSelectedBookId] = useState<string | null>(bookId ?? null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState(bookId ? 'form' : 'book')
  const [showPreview, setShowPreview] = useState(false)
  const [showMarkdownHelp, setShowMarkdownHelp] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      setError('Title is required')
      return
    }

    if (!comment.trim()) {
      setError('Comment is required')
      return
    }

    if (rating < 1 || rating > 5) {
      setError('Rating must be between 1 and 5')
      return
    }

    try {
      setError(null)
      setIsLoading(true)

      if (mode === 'create') {
        await onSubmit({ title, bookId: selectedBookId, rating, comment })
      } else {
        await onSubmit({ title, rating, comment } as any)
      }

      setTitle('')
      setRating(5)
      setComment('')
      if (!bookId) {
        setSelectedBookId(null)
        setStep('book')
      }
      onOpenChange(false)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (mode === 'create' && step === 'book' && !bookId) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Book</DialogTitle>
          </DialogHeader>

          <div>
            {booksLoading ? (
              <p className="text-muted-foreground">Loading books...</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                <button
                  onClick={() => {
                    setSelectedBookId('')
                    setStep('form')
                  }}
                  className="w-full text-left p-3 rounded border border-dashed hover:bg-muted transition-colors"
                >
                  <div className="font-medium">General Review (No specific book)</div>
                </button>
                {books.map((book) => (
                  <button
                    key={book.id}
                    onClick={() => {
                      setSelectedBookId(book.id || null)
                      setStep('form')
                    }}
                    className={`w-full text-left p-3 rounded border transition-colors ${selectedBookId === book.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                      }`}
                  >
                    <div className="font-medium">{book.title}</div>
                    <div className="text-sm opacity-75">{book.author}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'New Review' : 'Edit Review'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!bookId && selectedBookId && (
            <div className="bg-muted p-3 rounded">
              <p className="text-sm text-muted-foreground">
                Selected book: {books.find(b => b.id === selectedBookId)?.title}
              </p>
            </div>
          )}

          {mode === 'edit' && initialValues?.createdAt && (
            <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded">
              <p className="text-xs text-muted-foreground">
                Created: {formatDate(initialValues.createdAt)}
              </p>
            </div>
          )}

          <div>
            <label className="text-sm font-medium">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Review title..."
              className="mt-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Rating</label>
            <div className="flex gap-2 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-3xl transition-colors ${star <= rating ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                >
                  ★
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-1">{rating}/5</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Comment</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="text-xs text-primary hover:underline"
                >
                  {showPreview ? 'Hide' : 'Show'} Preview
                </button>
                <button
                  type="button"
                  onClick={() => setShowMarkdownHelp(!showMarkdownHelp)}
                  className="text-xs text-primary hover:underline"
                >
                  Markdown Help
                </button>
              </div>
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write your review... (Markdown supported)"
              className="w-full mt-2 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              rows={4}
            />
            {showMarkdownHelp && (
              <div className="mt-3 p-3 bg-muted rounded text-xs space-y-1">
                <p className="font-medium">Markdown Syntax:</p>
                <p><code>**bold**</code> or <code>__bold__</code></p>
                <p><code>*italic*</code> or <code>_italic_</code></p>
                <p><code># Heading 1</code> ... <code>### Heading 3</code></p>
                <p><code>- List item</code> for bullet lists</p>
                <p><code>1. Numbered item</code> for ordered lists</p>
                <p><code>&gt; Blockquote</code></p>
                <p><code>`code`</code> or triple backticks for code blocks</p>
                <p><code>[Link text](url)</code></p>
              </div>
            )}
          </div>

          {showPreview && <MarkdownPreview text={comment} showPreview={true} />}

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (!bookId && step === 'form') {
                  setStep('book')
                } else {
                  onOpenChange(false)
                }
              }}
            >
              {!bookId && step === 'form' ? 'Back' : 'Cancel'}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? mode === 'create'
                  ? 'Adding...'
                  : 'Updating...'
                : mode === 'create'
                  ? 'Add Review'
                  : 'Update Review'
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
