'use client'

import { useState, useEffect } from 'react'

export interface NowPlayingData {
    isPlaying: boolean
    title?: string
    artist?: string
    album?: string
    albumImageUrl?: string
    songUrl?: string
}

export function useNowPlaying() {
    const [data, setData] = useState<NowPlayingData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetch() {
            try {
                const response = await window.fetch('/api/music/now-playing')
                if (!response.ok) throw new Error('Failed to fetch now playing')
                const json = await response.json()
                setData(json)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch')
            } finally {
                setIsLoading(false)
            }
        }

        fetch()
        const interval = setInterval(fetch, 30_000)
        return () => clearInterval(interval)
    }, [])

    return { data, isLoading, error }
}
