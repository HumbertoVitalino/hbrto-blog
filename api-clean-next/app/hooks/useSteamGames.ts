'use client'

import { useState, useEffect } from 'react'

export interface SteamGameData {
    appId: number
    name: string
    playtimeForever: number
    playtime2weeks: number
    headerImageUrl: string
}

export function useSteamGames() {
    const [games, setGames] = useState<SteamGameData[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetch() {
            try {
                const response = await window.fetch('/api/games/steam/recently-played')
                if (!response.ok) throw new Error('Failed to fetch Steam games')
                const json = await response.json()
                setGames(json)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch')
            } finally {
                setIsLoading(false)
            }
        }

        fetch()
    }, [])

    return { games, isLoading, error }
}
