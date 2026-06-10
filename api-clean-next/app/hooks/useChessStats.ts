'use client'

import { useState, useEffect } from 'react'

export interface ChessRatingData {
    last: number
    best: number
    record: { win: number; loss: number; draw: number }
}

export interface ChessStatsData {
    username: string
    bullet?: ChessRatingData
    blitz?: ChessRatingData
    rapid?: ChessRatingData
    daily?: ChessRatingData
    tacticsHighest?: number
}

export function useChessStats() {
    const [data, setData] = useState<ChessStatsData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetch() {
            try {
                const response = await window.fetch('/api/games/chess/stats')
                if (!response.ok) throw new Error('Failed to fetch Chess.com stats')
                const json = await response.json()
                setData(json)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch')
            } finally {
                setIsLoading(false)
            }
        }

        fetch()
    }, [])

    return { data, isLoading, error }
}
