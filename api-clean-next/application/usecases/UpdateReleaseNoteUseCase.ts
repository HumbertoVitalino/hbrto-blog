import { ReleaseNote } from "@/domain/ReleaseNote"
import { ReleaseNoteRepository } from "@/infrastructure/repositories/ReleaseNoteRepository"

export interface UpdateReleaseNoteDTO {
    version?: string
    title?: string
    description?: string
}

export class UpdateReleaseNoteUseCase {
    constructor(private repo: ReleaseNoteRepository) {}

    async execute(id: string, dto: UpdateReleaseNoteDTO): Promise<ReleaseNote> {
        const existing = await this.repo.findById(id)
        if (!existing) throw new Error("Release note not found")

        return await this.repo.update(id, dto)
    }
}
