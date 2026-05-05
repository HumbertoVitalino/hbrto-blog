import { ReleaseNote } from "@/domain/ReleaseNote"
import { ReleaseNoteRepository } from "@/infrastructure/repositories/ReleaseNoteRepository"

export class GetAllReleaseNotesUseCase {
    constructor(private repo: ReleaseNoteRepository) {}

    async execute(): Promise<ReleaseNote[]> {
        return await this.repo.findAll()
    }
}
