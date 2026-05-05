import { NowPlaying } from "@/domain/NowPlaying"
import { RecentTrack } from "@/domain/RecentTrack"
import { TopTrack } from "@/domain/TopTrack"
import { TopArtist } from "@/domain/TopArtist"

export type TimeRange = "short_term" | "medium_term" | "long_term"

const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token"
const NOW_PLAYING_ENDPOINT = "https://api.spotify.com/v1/me/player/currently-playing"
const RECENTLY_PLAYED_ENDPOINT = "https://api.spotify.com/v1/me/player/recently-played?limit=1"

export class SpotifyRepository {
    private async getAccessToken(): Promise<string> {
        const clientId = process.env.SPOTIFY_CLIENT_ID!
        const clientSecret = process.env.SPOTIFY_CLIENT_SECRET!
        const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN!

        const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

        const response = await fetch(TOKEN_ENDPOINT, {
            method: "POST",
            headers: {
                Authorization: `Basic ${credentials}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token: refreshToken,
            }),
            cache: "no-store",
        })

        if (!response.ok) {
            throw new Error("Failed to refresh Spotify access token")
        }

        const data = await response.json()
        return data.access_token
    }

    async getNowPlaying(): Promise<NowPlaying | null> {
        const accessToken = await this.getAccessToken()

        const response = await fetch(NOW_PLAYING_ENDPOINT, {
            headers: { Authorization: `Bearer ${accessToken}` },
            cache: "no-store",
        })

        if (response.status === 204 || response.status >= 400) {
            return await this.getRecentlyPlayed(accessToken)
        }

        const data = await response.json()

        if (!data.item) {
            return await this.getRecentlyPlayed(accessToken)
        }

        return new NowPlaying({
            isPlaying: data.is_playing,
            title: data.item.name,
            artist: data.item.artists.map((a: { name: string }) => a.name).join(", "),
            album: data.item.album.name,
            albumImageUrl: data.item.album.images[0]?.url ?? "",
            songUrl: data.item.external_urls.spotify,
        })
    }

    async getRecentTracks(limit = 10): Promise<RecentTrack[]> {
        const accessToken = await this.getAccessToken()

        const response = await fetch(
            `https://api.spotify.com/v1/me/player/recently-played?limit=${limit}`,
            { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" }
        )

        if (!response.ok) return []

        const data = await response.json()

        return (data.items ?? []).map((item: {
            track: {
                name: string
                artists: { name: string }[]
                album: { name: string; images: { url: string }[] }
                external_urls: { spotify: string }
            }
            played_at: string
        }) => new RecentTrack({
            title: item.track.name,
            artist: item.track.artists.map((a) => a.name).join(", "),
            album: item.track.album.name,
            albumImageUrl: item.track.album.images[0]?.url ?? "",
            songUrl: item.track.external_urls.spotify,
            playedAt: new Date(item.played_at),
        }))
    }

    async getTopTracks(timeRange: TimeRange = "short_term", limit = 5): Promise<TopTrack[]> {
        const accessToken = await this.getAccessToken()

        const response = await fetch(
            `https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&limit=${limit}`,
            { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" }
        )

        if (!response.ok) return []

        const data = await response.json()

        return (data.items ?? []).map((item: {
            name: string
            artists: { name: string }[]
            album: { name: string; images: { url: string }[] }
            external_urls: { spotify: string }
        }) => new TopTrack({
            title: item.name,
            artist: item.artists.map((a) => a.name).join(", "),
            album: item.album.name,
            albumImageUrl: item.album.images[0]?.url ?? "",
            songUrl: item.external_urls.spotify,
        }))
    }

    async getTopArtists(timeRange: TimeRange = "short_term", limit = 5): Promise<TopArtist[]> {
        const accessToken = await this.getAccessToken()

        const response = await fetch(
            `https://api.spotify.com/v1/me/top/artists?time_range=${timeRange}&limit=${limit}`,
            { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" }
        )

        if (!response.ok) return []

        const data = await response.json()

        return (data.items ?? []).map((item: {
            name: string
            images: { url: string }[]
            genres: string[]
            external_urls: { spotify: string }
        }) => new TopArtist({
            name: item.name,
            imageUrl: item.images[0]?.url ?? "",
            genres: (item.genres ?? []).slice(0, 2),
            artistUrl: item.external_urls.spotify,
        }))
    }

    private async getRecentlyPlayed(accessToken: string): Promise<NowPlaying | null> {
        const response = await fetch(RECENTLY_PLAYED_ENDPOINT, {
            headers: { Authorization: `Bearer ${accessToken}` },
            cache: "no-store",
        })

        if (!response.ok) {
            return null
        }

        const data = await response.json()
        const track = data.items?.[0]?.track

        if (!track) {
            return null
        }

        return new NowPlaying({
            isPlaying: false,
            title: track.name,
            artist: track.artists.map((a: { name: string }) => a.name).join(", "),
            album: track.album.name,
            albumImageUrl: track.album.images[0]?.url ?? "",
            songUrl: track.external_urls.spotify,
        })
    }
}
