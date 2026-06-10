import { Game } from '@/domain/Game'
import { GameRepository } from '@/infrastructure/repositories/GameRepository'

export class GetAllGamesUseCase {
    constructor(private gameRepository: GameRepository) {}

    async execute(): Promise<Game[]> {
        return await this.gameRepository.findAll()
    }
}
