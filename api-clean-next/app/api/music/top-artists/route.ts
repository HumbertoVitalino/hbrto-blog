import { SpotifyRepository, TimeRange } from "@/infrastructure/repositories/SpotifyRepository"
import { GetTopArtistsUseCase } from "@/application/usecases"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
    try {
        const range = (request.nextUrl.searchParams.get("range") ?? "short_term") as TimeRange

        const repo = new SpotifyRepository()
        const useCase = new GetTopArtistsUseCase(repo)
        const artists = await useCase.execute(range, 5)

        return NextResponse.json(
            artists.map((a) => ({
                name: a.name,
                imageUrl: a.imageUrl,
                genres: a.genres,
                artistUrl: a.artistUrl,
            }))
        )
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
