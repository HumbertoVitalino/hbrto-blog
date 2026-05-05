import { RecentTrack } from "@/domain/RecentTrack"
import { SpotifyRepository } from "@/infrastructure/repositories/SpotifyRepository"

export class GetRecentlyPlayedUseCase {
    constructor(private spotifyRepository: SpotifyRepository) {}

    async execute(limit = 10): Promise<RecentTrack[]> {
        return await this.spotifyRepository.getRecentTracks(limit)
    }
}
