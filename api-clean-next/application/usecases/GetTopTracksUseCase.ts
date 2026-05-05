import { TopTrack } from "@/domain/TopTrack"
import { SpotifyRepository, TimeRange } from "@/infrastructure/repositories/SpotifyRepository"

export class GetTopTracksUseCase {
    constructor(private spotifyRepository: SpotifyRepository) {}

    async execute(timeRange: TimeRange = "short_term", limit = 5): Promise<TopTrack[]> {
        return await this.spotifyRepository.getTopTracks(timeRange, limit)
    }
}
