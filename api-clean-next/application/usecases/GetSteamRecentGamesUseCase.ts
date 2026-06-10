import { SteamGame } from '@/domain/SteamGame'
import { SteamRepository } from '@/infrastructure/repositories/SteamRepository'

export class GetSteamRecentGamesUseCase {
    constructor(private steamRepository: SteamRepository) {}

    async execute(limit = 6): Promise<SteamGame[]> {
        return await this.steamRepository.getRecentGames(limit)
    }
}
