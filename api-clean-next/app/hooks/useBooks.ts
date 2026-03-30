'use client'

import { useState, useCallback, useEffect } from 'react'
import { BookGenre } from '@/domain/BookGenre'
import { BookStatus } from '@/domain/BookStatus'
import { supabase } from '@/infrastructure/supabase/client'

export interface BookData {
    id?: string
    title: string
    author: string
    pages: number
    genre?: BookGenre
    coverImageUrl?: string
    status?: BookStatus
}

async function getAuthHeader(): Promise<Record<string, string>> {
    try {
        const { data } = await supabase.auth.getSession()
        const token = data?.session?.access_token

        if (token) {
            return {
                'Authorization': `Bearer ${token}`
            }
        }
    } catch (error) {
        console.error('Error getting auth token:', error)
    }

    return {}
}

export function useBooks() {
    const [books, setBooks] = useState<BookData[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchBooks = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)
            const response = await fetch('/api/books')
            
            if (!response.ok) {
                throw new Error('Failed to load books')
            }
            
            const data = await response.json()
            setBooks(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
        } finally {
            setIsLoading(false)
        }
    }, [])

    const createBook = useCallback(async (book: Omit<BookData, 'id'>) => {
        try {
            setError(null)
            const authHeader = await getAuthHeader()
            const response = await fetch('/api/books', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...authHeader
                },
                body: JSON.stringify({
                    title: book.title,
                    author: book.author,
                    pages: book.pages,
                    genre: book.genre,
                    coverImageUrl: book.coverImageUrl,
                    status: book.status
                })
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to create book')
            }

            const newBook = await response.json()
            setBooks(prev => [...prev, newBook])
            return newBook
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error creating book'
            setError(message)
            throw err
        }
    }, [])

    const updateBook = useCallback(async (id: string, updates: Partial<Omit<BookData, 'id'>>) => {
        try {
            setError(null)
            const authHeader = await getAuthHeader()
            const response = await fetch(`/api/books?id=${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...authHeader
                },
                body: JSON.stringify({
                    title: updates.title,
                    author: updates.author,
                    pages: updates.pages,
                    genre: updates.genre,
                    coverImageUrl: updates.coverImageUrl,
                    status: updates.status
                })
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to update book')
            }

            const updatedBook = await response.json()
            setBooks(prev => prev.map(b => b.id === id ? updatedBook : b))
            return updatedBook
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error updating book'
            setError(message)
            throw err
        }
    }, [])

    const deleteBook = useCallback(async (id: string) => {
        try {
            setError(null)
            const authHeader = await getAuthHeader()
            const response = await fetch(`/api/books?id=${id}`, {
                method: 'DELETE',
                headers: authHeader
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to delete book')
            }

            setBooks(prev => prev.filter(b => b.id !== id))
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error deleting book'
            setError(message)
            throw err
        }
    }, [])

    useEffect(() => {
        fetchBooks()
    }, [fetchBooks])

    return {
        books,
        isLoading,
        error,
        fetchBooks,
        createBook,
        updateBook,
        deleteBook
    }
}
