import { NowPlaying } from "@/domain/NowPlaying"
import { SpotifyRepository } from "@/infrastructure/repositories/SpotifyRepository"

export class GetNowPlayingUseCase {
    constructor(private spotifyRepository: SpotifyRepository) {}

    async execute(): Promise<NowPlaying | null> {
        return await this.spotifyRepository.getNowPlaying()
    }
}
