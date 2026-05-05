'use client'

import { useState, useCallback, useEffect } from 'react'
import { supabase } from '@/infrastructure/supabase/client'

export interface ReleaseNoteData {
    id: string
    version: string
    title: string
    description: string
    publishedAt: Date
}

async function getAuthHeader(): Promise<Record<string, string>> {
    try {
        const { data } = await supabase.auth.getSession()
        const token = data?.session?.access_token
        if (token) return { Authorization: `Bearer ${token}` }
    } catch {}
    return {}
}

export function useReleaseNotes() {
    const [notes, setNotes] = useState<ReleaseNoteData[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchNotes = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)
            const response = await fetch('/api/release-notes')
            if (!response.ok) throw new Error('Failed to load release notes')
            const data = await response.json()
            setNotes(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
        } finally {
            setIsLoading(false)
        }
    }, [])

    const createNote = useCallback(async (note: Omit<ReleaseNoteData, 'id' | 'publishedAt'>) => {
        const authHeader = await getAuthHeader()
        const response = await fetch('/api/release-notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeader },
            body: JSON.stringify(note),
        })
        if (!response.ok) {
            const err = await response.json()
            throw new Error(err.error || 'Failed to create')
        }
        const created = await response.json()
        setNotes((prev) => [created, ...prev])
        return created
    }, [])

    const updateNote = useCallback(async (id: string, note: Partial<Omit<ReleaseNoteData, 'id' | 'publishedAt'>>) => {
        const authHeader = await getAuthHeader()
        const response = await fetch(`/api/release-notes/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...authHeader },
            body: JSON.stringify(note),
        })
        if (!response.ok) {
            const err = await response.json()
            throw new Error(err.error || 'Failed to update')
        }
        const updated = await response.json()
        setNotes((prev) => prev.map((n) => n.id === id ? updated : n))
        return updated
    }, [])

    const deleteNote = useCallback(async (id: string) => {
        const authHeader = await getAuthHeader()
        const response = await fetch(`/api/release-notes/${id}`, {
            method: 'DELETE',
            headers: authHeader,
        })
        if (!response.ok) {
            const err = await response.json()
            throw new Error(err.error || 'Failed to delete')
        }
        setNotes((prev) => prev.filter((n) => n.id !== id))
    }, [])

    useEffect(() => { fetchNotes() }, [fetchNotes])

    return { notes, isLoading, error, createNote, updateNote, deleteNote }
}
