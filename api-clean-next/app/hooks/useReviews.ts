'use client'

import { useState, useEffect } from 'react'
import { Review } from '@/domain/Review'
import { supabase } from '@/infrastructure/supabase/client'

export function useReviews(bookId?: string) {
    const [reviews, setReviews] = useState<Review[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const getAuthHeader = async () => {
        const { data: { session } } = await supabase.auth.getSession()
        return session?.access_token ? `Bearer ${session.access_token}` : undefined
    }

    const fetchReviews = async () => {
        try {
            setIsLoading(true)
            setError(null)

            // Use RESTful route: /api/books/:bookId/reviews or /api/reviews
            const url = bookId
                ? `/api/books/${bookId}/reviews`
                : '/api/reviews'

            const response = await fetch(url)

            if (!response.ok) {
                throw new Error('Failed to fetch reviews')
            }

            const data = await response.json()
            setReviews(Array.isArray(data) ? data : [])
        } catch (err: any) {
            setError(err.message)
            setReviews([])
        } finally {
            setIsLoading(false)
        }
    }

    const createReview = async (title: string, bookId: string | null, rating: number, comment: string) => {
        try {
            const token = await getAuthHeader()

            // Normalize bookId: trim whitespace and convert empty to null
            const normalizedBookId = bookId?.trim() || null;

            // Use RESTful route: /api/books/:bookId/reviews if bookId provided, else /api/reviews
            const url = normalizedBookId 
                ? `/api/books/${normalizedBookId}/reviews` 
                : '/api/reviews'

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': token })
                },
                body: JSON.stringify({ title, bookId: normalizedBookId, rating, comment })
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to create review')
            }

            const newReview = await response.json()
            setReviews([...reviews, newReview])
            return newReview
        } catch (err: any) {
            setError(err.message)
            throw err
        }
    }

    const updateReview = async (id: string, bookId: string | null, title?: string, rating?: number, comment?: string) => {
        try {
            const token = await getAuthHeader()

            // Normalize bookId: trim whitespace and convert empty to null
            const normalizedBookId = bookId?.trim() || null;

            // Use RESTful route: /api/books/:bookId/reviews/:reviewId
            const url = normalizedBookId
                ? `/api/books/${normalizedBookId}/reviews/${id}`
                : `/api/reviews/${id}`

            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': token })
                },
                body: JSON.stringify({ title, rating, comment })
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to update review')
            }

            const updatedReview = await response.json()
            setReviews(reviews.map(r => r.id === id ? updatedReview : r))
            return updatedReview
        } catch (err: any) {
            setError(err.message)
            throw err
        }
    }

    const deleteReview = async (id: string, bookId?: string | null) => {
        try {
            const token = await getAuthHeader()

            // Normalize bookId: trim whitespace and convert empty to null
            const normalizedBookId = bookId?.trim() || null;

            // Use RESTful route: /api/books/:bookId/reviews/:reviewId
            const url = normalizedBookId
                ? `/api/books/${normalizedBookId}/reviews/${id}`
                : `/api/reviews/${id}`

            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    ...(token && { 'Authorization': token })
                }
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to delete review')
            }

            setReviews(reviews.filter(r => r.id !== id))
        } catch (err: any) {
            setError(err.message)
            throw err
        }
    }

    useEffect(() => {
        fetchReviews()
    }, [bookId])

    return {
        reviews,
        isLoading,
        error,
        createReview,
        updateReview,
        deleteReview,
        refetch: fetchReviews
    }
}
