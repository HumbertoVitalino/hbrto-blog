import { ReleaseNoteRepository } from "@/infrastructure/repositories/ReleaseNoteRepository"

export class DeleteReleaseNoteUseCase {
    constructor(private repo: ReleaseNoteRepository) {}

    async execute(id: string): Promise<void> {
        const existing = await this.repo.findById(id)
        if (!existing) throw new Error("Release note not found")

        await this.repo.delete(id)
    }
}
