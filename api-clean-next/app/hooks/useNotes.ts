'use client'

import { useState, useEffect, useCallback } from 'react'
import type { NoteData } from '@/lib/mappers'
import type { NoteLanguage, NoteSubjectKind } from '@/domain/Note'
import { supabase } from '@/infrastructure/supabase/client'

export interface NoteInput {
    entries: { language: NoteLanguage; title: string; body: string }[]
    subjects: { kind: NoteSubjectKind; id: string }[]
    /** Only sent when the publish date was changed by hand. */
    createdAt?: string
}

export type NoteNotification = { sent: number } | { error: string } | null

async function authHeaders(): Promise<Record<string, string>> {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}
}

async function send<T>(url: string, method: string, body?: unknown): Promise<T> {
    const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
        body: body === undefined ? undefined : JSON.stringify(body),
    })
    const json = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(json.error || `Request failed (${response.status})`)
    return json as T
}

/** Writes. Pages rendered on the server refresh themselves with router.refresh() after these. */
export const noteApi = {
    create: (input: NoteInput & { notify: boolean }) =>
        send<{ note: NoteData; notification: NoteNotification }>('/api/notes', 'POST', input),
    update: (id: string, input: NoteInput) =>
        send<NoteData>(`/api/notes/${id}`, 'PUT', input),
    remove: (id: string) =>
        send<{ message: string }>(`/api/notes/${id}`, 'DELETE'),
}

/** Notes for client-rendered pages: all of them, or only those citing one book or game. */
export function useNotes(filter?: { kind: NoteSubjectKind; id: string }) {
    const [notes, setNotes] = useState<NoteData[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const query = filter ? `?${filter.kind}=${encodeURIComponent(filter.id)}` : ''

    const refetch = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)
            const response = await fetch(`/api/notes${query}`)
            if (!response.ok) throw new Error('Failed to load notes')
            const data = await response.json()
            setNotes(Array.isArray(data) ? data : [])
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load notes')
            setNotes([])
        } finally {
            setIsLoading(false)
        }
    }, [query])

    useEffect(() => {
        refetch()
    }, [refetch])

    return { notes, isLoading, error, refetch }
}
