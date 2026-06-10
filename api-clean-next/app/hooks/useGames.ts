'use client'

import { useState, useCallback, useEffect } from 'react'
import { GamePlatform } from '@/domain/GamePlatform'
import { GameStatus } from '@/domain/GameStatus'
import { supabase } from '@/infrastructure/supabase/client'

export interface GameData {
    id?: string
    title: string
    platform: GamePlatform
    genre?: string
    status?: GameStatus
    coverImageUrl?: string
    totalHours?: number
}

async function getAuthHeader(): Promise<Record<string, string>> {
    try {
        const { data } = await supabase.auth.getSession()
        const token = data?.session?.access_token
        if (token) return { Authorization: `Bearer ${token}` }
    } catch {
        // no-op
    }
    return {}
}

export function useGames() {
    const [games, setGames] = useState<GameData[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchGames = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)
            const response = await fetch('/api/games')
            if (!response.ok) throw new Error('Failed to load games')
            const data = await response.json()
            setGames(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
        } finally {
            setIsLoading(false)
        }
    }, [])

    const createGame = useCallback(async (game: Omit<GameData, 'id'>) => {
        try {
            setError(null)
            const authHeader = await getAuthHeader()
            const response = await fetch('/api/games', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeader },
                body: JSON.stringify(game),
            })
            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to create game')
            }
            const newGame = await response.json()
            setGames((prev) => [...prev, newGame])
            return newGame
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error creating game'
            setError(message)
            throw err
        }
    }, [])

    const updateGame = useCallback(async (id: string, updates: Partial<Omit<GameData, 'id'>>) => {
        try {
            setError(null)
            const authHeader = await getAuthHeader()
            const response = await fetch(`/api/games?id=${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...authHeader },
                body: JSON.stringify(updates),
            })
            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to update game')
            }
            const updatedGame = await response.json()
            setGames((prev) => prev.map((g) => g.id === id ? updatedGame : g))
            return updatedGame
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error updating game'
            setError(message)
            throw err
        }
    }, [])

    const deleteGame = useCallback(async (id: string) => {
        try {
            setError(null)
            const authHeader = await getAuthHeader()
            const response = await fetch(`/api/games?id=${id}`, {
                method: 'DELETE',
                headers: authHeader,
            })
            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to delete game')
            }
            setGames((prev) => prev.filter((g) => g.id !== id))
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error deleting game'
            setError(message)
            throw err
        }
    }, [])

    useEffect(() => {
        fetchGames()
    }, [fetchGames])

    return { games, isLoading, error, fetchGames, createGame, updateGame, deleteGame }
}
