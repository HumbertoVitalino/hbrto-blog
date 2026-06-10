import { GameRepository } from '@/infrastructure/repositories/GameRepository'

export class DeleteGameUseCase {
    constructor(private gameRepository: GameRepository) {}

    async execute(id: string): Promise<void> {
        const existing = await this.gameRepository.findById(id)

        if (!existing) {
            throw new Error('Game not found')
        }

        await this.gameRepository.delete(id)
    }
}
