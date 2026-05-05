import { SpotifyRepository } from "@/infrastructure/repositories/SpotifyRepository"
import { GetRecentlyPlayedUseCase } from "@/application/usecases"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        const repo = new SpotifyRepository()
        const useCase = new GetRecentlyPlayedUseCase(repo)
        const tracks = await useCase.execute(10)

        return NextResponse.json(
            tracks.map((t) => ({
                title: t.title,
                artist: t.artist,
                album: t.album,
                albumImageUrl: t.albumImageUrl,
                songUrl: t.songUrl,
                playedAt: t.playedAt,
            }))
        )
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}
