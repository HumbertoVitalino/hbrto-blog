import { SpotifyRepository, TimeRange } from "@/infrastructure/repositories/SpotifyRepository"
import { GetTopTracksUseCase } from "@/application/usecases"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
    try {
        const range = (request.nextUrl.searchParams.get("range") ?? "short_term") as TimeRange

        const repo = new SpotifyRepository()
        const useCase = new GetTopTracksUseCase(repo)
        const tracks = await useCase.execute(range, 5)

        return NextResponse.json(
            tracks.map((t) => ({
                title: t.title,
                artist: t.artist,
                album: t.album,
                albumImageUrl: t.albumImageUrl,
                songUrl: t.songUrl,
            }))
        )
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
