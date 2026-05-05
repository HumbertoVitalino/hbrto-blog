import { ReleaseNote } from "@/domain/ReleaseNote"
import { ReleaseNoteRepository } from "@/infrastructure/repositories/ReleaseNoteRepository"

export interface CreateReleaseNoteDTO {
    version: string
    title: string
    description: string
}

export class CreateReleaseNoteUseCase {
    constructor(private repo: ReleaseNoteRepository) {}

    async execute(dto: CreateReleaseNoteDTO): Promise<ReleaseNote> {
        if (!dto.version.trim()) throw new Error("Version is required")
        if (!dto.title.trim()) throw new Error("Title is required")
        if (!dto.description.trim()) throw new Error("Description is required")

        return await this.repo.create(dto)
    }
}
