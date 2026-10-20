import { NoteRepository } from "@/infrastructure/repositories/NoteRepository";

export class DeleteNoteUseCase {
    constructor(private noteRepository: NoteRepository) {}

    async execute(id: string): Promise<void> {
        if (!id) {
            throw new Error("Note ID is required");
        }

        const note = await this.noteRepository.findById(id);
        if (!note) {
            throw new Error("Note not found");
        }

        await this.noteRepository.delete(id);
    }
}
