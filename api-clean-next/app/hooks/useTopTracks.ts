'use client'

import { useState, useEffect } from 'react'
import { TimeRange } from '@/infrastructure/repositories/SpotifyRepository'

export interface TopTrackData {
    title: string
    artist: string
    album: string
    albumImageUrl: string
    songUrl: string
}

export function useTopTracks(timeRange: TimeRange) {
    const [tracks, setTracks] = useState<TopTrackData[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        setIsLoading(true)
        setError(null)

        window.fetch(`/api/music/top-tracks?range=${timeRange}`)
            .then((res) => {
                if (!res.ok) throw new Error('Failed to fetch top tracks')
                return res.json()
            })
            .then(setTracks)
            .catch((err) => setError(err.message))
            .finally(() => setIsLoading(false))
    }, [timeRange])

    return { tracks, isLoading, error }
}
