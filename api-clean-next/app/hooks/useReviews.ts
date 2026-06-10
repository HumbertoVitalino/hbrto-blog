'use client'

import { useState, useEffect, useCallback } from 'react'
import { Review, ReviewLanguage } from '@/domain/Review'
import { supabase } from '@/infrastructure/supabase/client'

export function useReviews(bookId?: string) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const getAuthHeader = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token ? `Bearer ${session.access_token}` : undefined
  }

  const fetchReviews = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

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
  }, [bookId])

  const createReview = useCallback(async (
    title: string,
    bookId: string | null,
    rating: number,
    comment: string,
    language: ReviewLanguage = 'en',
  ) => {
    try {
      const token = await getAuthHeader()
      const normalizedBookId = bookId?.trim() || null

      const url = normalizedBookId
        ? `/api/books/${normalizedBookId}/reviews`
        : '/api/reviews'

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: token })
        },
        body: JSON.stringify({ title, bookId: normalizedBookId, rating, comment, language })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create review')
      }

      const newReview = await response.json()

      // ✅ FIX: evitar stale state
      setReviews(prev => [...prev, newReview])

      return newReview
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }, [])

  const updateReview = useCallback(async (
    id: string,
    bookId: string | null,
    title?: string,
    rating?: number,
    comment?: string,
    language?: ReviewLanguage,
  ) => {
    try {
      const token = await getAuthHeader()
      const normalizedBookId = bookId?.trim() || null

      const url = normalizedBookId
        ? `/api/books/${normalizedBookId}/reviews/${id}`
        : `/api/reviews/${id}`

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: token })
        },
        body: JSON.stringify({ title, rating, comment, language })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update review')
      }

      const updatedReview = await response.json()

      setReviews(prev =>
        prev.map(r => (r.id === id ? updatedReview : r))
      )

      return updatedReview
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }, [])

  const deleteReview = useCallback(async (id: string, bookId?: string | null) => {
    try {
      const token = await getAuthHeader()
      const normalizedBookId = bookId?.trim() || null

      const url = normalizedBookId
        ? `/api/books/${normalizedBookId}/reviews/${id}`
        : `/api/reviews/${id}`

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          ...(token && { Authorization: token })
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete review')
      }

      setReviews(prev => prev.filter(r => r.id !== id))
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }, [])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

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