import { Game } from '@/domain/Game'
import { GamePlatform } from '@/domain/GamePlatform'
import { GameStatus } from '@/domain/GameStatus'
import { GameRepository } from '@/infrastructure/repositories/GameRepository'

export interface CreateGameDTO {
    title: string
    platform: GamePlatform
    genre?: string
    status?: GameStatus
    coverImageUrl?: string
    totalHours?: number
}

export class CreateGameUseCase {
    constructor(private gameRepository: GameRepository) {}

    async execute(dto: CreateGameDTO): Promise<Game> {
        if (!dto.title || !dto.platform) {
            throw new Error('Title and platform are required')
        }

        const game = new Game({
            id: crypto.randomUUID(),
            title: dto.title,
            platform: dto.platform,
            genre: dto.genre,
            status: dto.status ?? GameStatus.NotStarted,
            coverImageUrl: dto.coverImageUrl,
            totalHours: dto.totalHours,
        })

        return await this.gameRepository.create(game)
    }
}
