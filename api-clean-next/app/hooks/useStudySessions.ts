'use client'

import { useState, useCallback, useEffect } from 'react'
import { PomodoroPhaseType } from '@/domain/PomodoroPhaseType'
import { supabase } from '@/infrastructure/supabase/client'

export interface StudySessionData {
    id?: string
    topicId: string
    phaseType: PomodoroPhaseType
    plannedSeconds: number
    actualSeconds: number
    completed: boolean
    startedAt: string
    endedAt?: string
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

export function useStudySessions(topicId?: string) {
    const [sessions, setSessions] = useState<StudySessionData[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchSessions = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)
            const url = topicId ? `/api/study-sessions?topicId=${topicId}` : '/api/study-sessions'
            const response = await fetch(url)

            if (!response.ok) {
                throw new Error('Failed to load study sessions')
            }

            const data = await response.json()
            setSessions(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
        } finally {
            setIsLoading(false)
        }
    }, [topicId])

    const createSession = useCallback(async (session: Omit<StudySessionData, 'id'>) => {
        try {
            setError(null)
            const authHeader = await getAuthHeader()
            const response = await fetch('/api/study-sessions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...authHeader
                },
                body: JSON.stringify(session)
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to log study session')
            }

            const newSession = await response.json()
            setSessions(prev => [newSession, ...prev])
            return newSession
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error logging study session'
            setError(message)
            throw err
        }
    }, [])

    const deleteSession = useCallback(async (id: string) => {
        try {
            setError(null)
            const authHeader = await getAuthHeader()
            const response = await fetch(`/api/study-sessions?id=${id}`, {
                method: 'DELETE',
                headers: authHeader
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to delete study session')
            }

            setSessions(prev => prev.filter(s => s.id !== id))
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error deleting study session'
            setError(message)
            throw err
        }
    }, [])

    useEffect(() => {
        fetchSessions()
    }, [fetchSessions])

    return {
        sessions,
        isLoading,
        error,
        fetchSessions,
        createSession,
        deleteSession
    }
}
