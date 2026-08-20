'use client'

import { useState, useCallback, useEffect } from 'react'
import { StudyTopicStatus } from '@/domain/StudyTopicStatus'
import { StudyPriority } from '@/domain/StudyPriority'
import { supabase } from '@/infrastructure/supabase/client'

export interface StudyTopicData {
    id?: string
    title: string
    description?: string
    status?: StudyTopicStatus
    priority?: StudyPriority
    resourceUrl?: string
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

export function useStudyTopics() {
    const [topics, setTopics] = useState<StudyTopicData[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchTopics = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)
            const response = await fetch('/api/study-topics')

            if (!response.ok) {
                throw new Error('Failed to load study topics')
            }

            const data = await response.json()
            setTopics(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
        } finally {
            setIsLoading(false)
        }
    }, [])

    const createTopic = useCallback(async (topic: Omit<StudyTopicData, 'id'>) => {
        try {
            setError(null)
            const authHeader = await getAuthHeader()
            const response = await fetch('/api/study-topics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...authHeader
                },
                body: JSON.stringify({
                    title: topic.title,
                    description: topic.description,
                    status: topic.status,
                    priority: topic.priority,
                    resourceUrl: topic.resourceUrl
                })
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to create study topic')
            }

            const newTopic = await response.json()
            setTopics(prev => [newTopic, ...prev])
            return newTopic
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error creating study topic'
            setError(message)
            throw err
        }
    }, [])

    const updateTopic = useCallback(async (id: string, updates: Partial<Omit<StudyTopicData, 'id'>>) => {
        try {
            setError(null)
            const authHeader = await getAuthHeader()
            const response = await fetch(`/api/study-topics?id=${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...authHeader
                },
                body: JSON.stringify({
                    title: updates.title,
                    description: updates.description,
                    status: updates.status,
                    priority: updates.priority,
                    resourceUrl: updates.resourceUrl
                })
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to update study topic')
            }

            const updatedTopic = await response.json()
            setTopics(prev => prev.map(t => t.id === id ? updatedTopic : t))
            return updatedTopic
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error updating study topic'
            setError(message)
            throw err
        }
    }, [])

    const deleteTopic = useCallback(async (id: string) => {
        try {
            setError(null)
            const authHeader = await getAuthHeader()
            const response = await fetch(`/api/study-topics?id=${id}`, {
                method: 'DELETE',
                headers: authHeader
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to delete study topic')
            }

            setTopics(prev => prev.filter(t => t.id !== id))
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error deleting study topic'
            setError(message)
            throw err
        }
    }, [])

    useEffect(() => {
        fetchTopics()
    }, [fetchTopics])

    return {
        topics,
        isLoading,
        error,
        fetchTopics,
        createTopic,
        updateTopic,
        deleteTopic
    }
}
