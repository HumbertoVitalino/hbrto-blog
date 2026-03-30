'use client'

import { Review } from '@/domain/Review'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Trash2, Edit2 } from 'lucide-react'
import { useState } from 'react'
import { ReviewFormModal } from './ReviewFormModal'
import { formatDate } from '@/lib/formatDate'

interface ReviewCardProps {
    review: Review
    isAdmin?: boolean
    bookId?: string
    onDelete?: (id: string, bookId?: string) => Promise<void>
    onUpdate?: (id: string, bookId: string | null, title: string, rating: number, comment: string) => Promise<void>
}

export function ReviewCard({ review, isAdmin, bookId, onDelete, onUpdate }: ReviewCardProps) {
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this review?')) {
            try {
                setIsDeleting(true)
                if (onDelete) {
                    await onDelete(review.id, bookId || review.bookId || undefined)
                }
            } catch (error) {
                alert('Failed to delete review')
            } finally {
                setIsDeleting(false)
            }
        }
    }

    const handleUpdate = async (data: { title: string; rating: number; comment: string }) => {
        if (onUpdate) {
            await onUpdate(review.id, review.bookId, data.title, data.rating, data.comment)
        }
        setIsEditOpen(false)
    }

    return (
        <>
            <div className="border rounded-lg p-4 bg-card">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <h4 className="font-semibold text-sm mb-2">{review.title}</h4>
                        <div className="flex items-center gap-2">
                            {[...Array(5)].map((_, i) => (
                                <span
                                    key={i}
                                    className={`text-lg ${
                                        i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                                    }`}
                                >
                                    ★
                                </span>
                            ))}
                            <span className="ml-2 text-sm text-muted-foreground">
                                {review.rating}/5
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            {formatDate(review.createdAt)}
                        </p>
                    </div>

                    {isAdmin && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsEditOpen(true)}
                                className="p-2 hover:bg-muted rounded transition-colors"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="p-2 hover:bg-destructive/10 hover:text-destructive rounded transition-colors disabled:opacity-50"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                <p className="text-sm text-foreground leading-relaxed">
                    {review.comment}
                </p>
            </div>

            {isAdmin && (
                <ReviewFormModal
                    open={isEditOpen}
                    onOpenChange={setIsEditOpen}
                    initialValues={{
                        title: review.title,
                        rating: review.rating,
                        comment: review.comment
                    }}
                    onSubmit={handleUpdate}
                    mode="edit"
                />
            )}
        </>
    )
}
