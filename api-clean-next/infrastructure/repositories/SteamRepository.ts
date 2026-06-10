import { SteamGame } from '@/domain/SteamGame'

const RECENTLY_PLAYED_ENDPOINT = 'https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001'

export class SteamRepository {
    async getRecentGames(limit = 6): Promise<SteamGame[]> {
        const apiKey = process.env.STEAM_API_KEY!
        const steamId = process.env.STEAM_USER_ID!

        const url = `${RECENTLY_PLAYED_ENDPOINT}?key=${apiKey}&steamid=${steamId}&count=${limit}&format=json`

        const response = await fetch(url, { cache: 'no-store' })

        if (!response.ok) return []

        const data = await response.json()
        const games = data.response?.games ?? []

        return games.map((item: {
            appid: number
            name: string
            playtime_forever: number
            playtime_2weeks?: number
        }) => new SteamGame({
            appId: item.appid,
            name: item.name,
            playtimeForever: item.playtime_forever,
            playtime2weeks: item.playtime_2weeks ?? 0,
            headerImageUrl: `https://cdn.cloudflare.steamstatic.com/steam/apps/${item.appid}/header.jpg`,
        }))
    }
}
