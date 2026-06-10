import { ChessRepository } from '@/infrastructure/repositories/ChessRepository'
import { GetChessStatsUseCase } from '@/application/usecases'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const repo = new ChessRepository()
        const useCase = new GetChessStatsUseCase(repo)
        const stats = await useCase.execute()

        return NextResponse.json({
            username: stats.username,
            bullet: stats.bullet,
            blitz: stats.blitz,
            rapid: stats.rapid,
            daily: stats.daily,
            tacticsHighest: stats.tacticsHighest,
        })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
