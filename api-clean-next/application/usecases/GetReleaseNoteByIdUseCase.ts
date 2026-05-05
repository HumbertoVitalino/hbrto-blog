import { ReleaseNote } from "@/domain/ReleaseNote"
import { ReleaseNoteRepository } from "@/infrastructure/repositories/ReleaseNoteRepository"

export class GetReleaseNoteByIdUseCase {
    constructor(private repo: ReleaseNoteRepository) {}

    async execute(id: string): Promise<ReleaseNote | null> {
        return await this.repo.findById(id)
    }
}
