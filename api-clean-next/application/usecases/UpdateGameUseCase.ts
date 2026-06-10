import { Game } from '@/domain/Game'
import { GamePlatform } from '@/domain/GamePlatform'
import { GameStatus } from '@/domain/GameStatus'
import { GameRepository } from '@/infrastructure/repositories/GameRepository'

export interface UpdateGameDTO {
    title?: string
    platform?: GamePlatform
    genre?: string
    status?: GameStatus
    coverImageUrl?: string
    totalHours?: number
}

export class UpdateGameUseCase {
    constructor(private gameRepository: GameRepository) {}

    async execute(id: string, dto: UpdateGameDTO): Promise<Game> {
        const existing = await this.gameRepository.findById(id)

        if (!existing) {
            throw new Error('Game not found')
        }

        return await this.gameRepository.update(id, dto)
    }
}
