import { Game } from '@/domain/Game'
import { GameRepository } from '@/infrastructure/repositories/GameRepository'

export class GetGameByIdUseCase {
    constructor(private gameRepository: GameRepository) {}

    async execute(id: string): Promise<Game | null> {
        return await this.gameRepository.findById(id)
    }
}
