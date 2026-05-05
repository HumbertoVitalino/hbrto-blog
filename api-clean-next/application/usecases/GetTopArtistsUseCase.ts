import { TopArtist } from "@/domain/TopArtist"
import { SpotifyRepository, TimeRange } from "@/infrastructure/repositories/SpotifyRepository"

export class GetTopArtistsUseCase {
    constructor(private spotifyRepository: SpotifyRepository) {}

    async execute(timeRange: TimeRange = "short_term", limit = 5): Promise<TopArtist[]> {
        return await this.spotifyRepository.getTopArtists(timeRange, limit)
    }
}
