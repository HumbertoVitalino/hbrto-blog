'use client'

import { useState, useEffect } from 'react'
import { TimeRange } from '@/infrastructure/repositories/SpotifyRepository'

export interface TopArtistData {
    name: string
    imageUrl: string
    genres: string[]
    artistUrl: string
}

export function useTopArtists(timeRange: TimeRange) {
    const [artists, setArtists] = useState<TopArtistData[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        setIsLoading(true)
        setError(null)

        window.fetch(`/api/music/top-artists?range=${timeRange}`)
            .then((res) => {
                if (!res.ok) throw new Error('Failed to fetch top artists')
                return res.json()
            })
            .then(setArtists)
            .catch((err) => setError(err.message))
            .finally(() => setIsLoading(false))
    }, [timeRange])

    return { artists, isLoading, error }
}
