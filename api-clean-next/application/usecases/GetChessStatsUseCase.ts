import { ChessStats } from '@/domain/ChessStats'
import { ChessRepository } from '@/infrastructure/repositories/ChessRepository'

export class GetChessStatsUseCase {
    constructor(private chessRepository: ChessRepository) {}

    async execute(): Promise<ChessStats> {
        return await this.chessRepository.getStats()
    }
}
