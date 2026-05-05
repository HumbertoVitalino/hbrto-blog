import { SpotifyRepository } from "@/infrastructure/repositories/SpotifyRepository"
import { GetNowPlayingUseCase } from "@/application/usecases"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        const repo = new SpotifyRepository()
        const useCase = new GetNowPlayingUseCase(repo)
        const nowPlaying = await useCase.execute()

        if (!nowPlaying) {
            return NextResponse.json({ isPlaying: false })
        }

        return NextResponse.json({
            isPlaying: nowPlaying.isPlaying,
            title: nowPlaying.title,
            artist: nowPlaying.artist,
            album: nowPlaying.album,
            albumImageUrl: nowPlaying.albumImageUrl,
            songUrl: nowPlaying.songUrl,
        })
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}
