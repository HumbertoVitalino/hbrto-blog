import { ChessStats, ChessRating } from '@/domain/ChessStats'

const BASE_URL = 'https://api.chess.com/pub'

export class ChessRepository {
    async getStats(): Promise<ChessStats> {
        const username = process.env.CHESS_USERNAME!

        const response = await fetch(`${BASE_URL}/player/${username}/stats`, {
            cache: 'no-store',
            headers: { 'User-Agent': 'hbrto-blog/1.0' },
        })

        if (!response.ok) {
            throw new Error('Failed to fetch Chess.com stats')
        }

        const data = await response.json()

        return new ChessStats({
            username,
            bullet: this.mapRating(data.chess_bullet),
            blitz: this.mapRating(data.chess_blitz),
            rapid: this.mapRating(data.chess_rapid),
            daily: this.mapRating(data.chess_daily),
            tacticsHighest: data.tactics?.highest?.rating,
        })
    }

    private mapRating(raw: {
        last?: { rating: number }
        best?: { rating: number }
        record?: { win: number; loss: number; draw: number }
    } | undefined): ChessRating | undefined {
        if (!raw?.last) return undefined

        return {
            last: raw.last.rating,
            best: raw.best?.rating ?? raw.last.rating,
            record: {
                win: raw.record?.win ?? 0,
                loss: raw.record?.loss ?? 0,
                draw: raw.record?.draw ?? 0,
            },
        }
    }
}
