import { Note } from "@/domain/Note";
import { NoteRepository } from "@/infrastructure/repositories/NoteRepository";

export class GetNoteByIdUseCase {
    constructor(private noteRepository: NoteRepository) {}

    async execute(id: string): Promise<Note | null> {
        if (!id) {
            throw new Error("Note ID is required");
        }

        return await this.noteRepository.findById(id);
    }
}
