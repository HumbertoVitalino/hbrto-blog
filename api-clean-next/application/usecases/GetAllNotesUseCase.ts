import { Note } from "@/domain/Note";
import { NoteRepository } from "@/infrastructure/repositories/NoteRepository";

export class GetAllNotesUseCase {
    constructor(private noteRepository: NoteRepository) {}

    async execute(): Promise<Note[]> {
        return await this.noteRepository.findAll();
    }
}
