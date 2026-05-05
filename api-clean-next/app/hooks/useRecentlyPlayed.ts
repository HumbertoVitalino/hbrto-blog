'use client'

import { useState, useEffect } from 'react'

export interface RecentTrackData {
    title: string
    artist: string
    album: string
    albumImageUrl: string
    songUrl: string
    playedAt: string
}

export function useRecentlyPlayed() {
    const [tracks, setTracks] = useState<RecentTrackData[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetch() {
            try {
                const response = await window.fetch('/api/music/recently-played')
                if (!response.ok) throw new Error('Failed to fetch recently played')
                const json = await response.json()
                setTracks(json)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch')
            } finally {
                setIsLoading(false)
            }
        }

        fetch()
    }, [])

    return { tracks, isLoading, error }
}
