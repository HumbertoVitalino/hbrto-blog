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

interface ReviewFormModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (data: { bookId: string | null; rating: number; comment: string }) => Promise<void>
    initialValues?: { rating: number; comment: string }
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
    const [rating, setRating] = useState(initialValues?.rating ?? 5)
    const [comment, setComment] = useState(initialValues?.comment ?? '')
    const [selectedBookId, setSelectedBookId] = useState<string | null>(bookId ?? null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [step, setStep] = useState(bookId ? 'form' : 'book')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

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
            await onSubmit({ bookId: selectedBookId, rating, comment })
            
            // Reset form
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
                        <DialogTitle>Select a Book</DialogTitle>
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
                                            setSelectedBookId(book.id)
                                            setStep('form')
                                        }}
                                        className={`w-full text-left p-3 rounded border transition-colors ${
                                            selectedBookId === book.id
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
                        {mode === 'create' ? (
                            selectedBookId || !bookId ? 'Add Review' : 'Add Review'
                        ) : 'Edit Review'}
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

                    <div>
                        <label className="text-sm font-medium">Rating</label>
                        <div className="flex gap-2 mt-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className={`text-3xl transition-colors ${
                                        star <= rating ? 'text-yellow-400' : 'text-gray-300'
                                    }`}
                                >
                                    ★
                                </button>
                            ))}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{rating}/5</p>
                    </div>

                    <div>
                        <label className="text-sm font-medium">Comment</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Write your review..."
                            className="w-full mt-2 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            rows={4}
                        />
                    </div>

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
