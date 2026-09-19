'use client'

import { useState, useCallback, useEffect } from 'react'
import { StudyEpicStatus } from '@/domain/StudyEpicStatus'
import { supabase } from '@/infrastructure/supabase/client'

export interface StudyEpicData {
    id?: string
    title: string
    description?: string
    status?: StudyEpicStatus
    color?: string
    targetSeconds?: number | null
    createdAt?: string
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

export function useStudyEpics() {
    const [epics, setEpics] = useState<StudyEpicData[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchEpics = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)
            const response = await fetch('/api/study-epics')

            if (!response.ok) {
                throw new Error('Failed to load study epics')
            }

            const data = await response.json()
            setEpics(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
        } finally {
            setIsLoading(false)
        }
    }, [])

    const createEpic = useCallback(async (epic: Omit<StudyEpicData, 'id'>) => {
        try {
            setError(null)
            const authHeader = await getAuthHeader()
            const response = await fetch('/api/study-epics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...authHeader
                },
                body: JSON.stringify({
                    title: epic.title,
                    description: epic.description,
                    status: epic.status,
                    color: epic.color,
                    targetSeconds: epic.targetSeconds
                })
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to create study epic')
            }

            const newEpic = await response.json()
            setEpics(prev => [newEpic, ...prev])
            return newEpic
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error creating study epic'
            setError(message)
            throw err
        }
    }, [])

    const updateEpic = useCallback(async (id: string, updates: Partial<Omit<StudyEpicData, 'id'>>) => {
        try {
            setError(null)
            const authHeader = await getAuthHeader()
            const response = await fetch(`/api/study-epics?id=${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...authHeader
                },
                body: JSON.stringify({
                    title: updates.title,
                    description: updates.description,
                    status: updates.status,
                    color: updates.color,
                    targetSeconds: updates.targetSeconds
                })
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to update study epic')
            }

            const updatedEpic = await response.json()
            setEpics(prev => prev.map(e => e.id === id ? updatedEpic : e))
            return updatedEpic
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error updating study epic'
            setError(message)
            throw err
        }
    }, [])

    const deleteEpic = useCallback(async (id: string) => {
        try {
            setError(null)
            const authHeader = await getAuthHeader()
            const response = await fetch(`/api/study-epics?id=${id}`, {
                method: 'DELETE',
                headers: authHeader
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to delete study epic')
            }

            setEpics(prev => prev.filter(e => e.id !== id))
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error deleting study epic'
            setError(message)
            throw err
        }
    }, [])

    useEffect(() => {
        fetchEpics()
    }, [fetchEpics])

    return {
        epics,
        isLoading,
        error,
        fetchEpics,
        createEpic,
        updateEpic,
        deleteEpic
    }
}
