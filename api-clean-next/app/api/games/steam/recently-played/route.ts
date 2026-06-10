import { SteamRepository } from '@/infrastructure/repositories/SteamRepository'
import { GetSteamRecentGamesUseCase } from '@/application/usecases'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const repo = new SteamRepository()
        const useCase = new GetSteamRecentGamesUseCase(repo)
        const games = await useCase.execute()

        return NextResponse.json(games.map((g) => ({
            appId: g.appId,
            name: g.name,
            playtimeForever: g.playtimeForever,
            playtime2weeks: g.playtime2weeks,
            headerImageUrl: g.headerImageUrl,
        })))
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
