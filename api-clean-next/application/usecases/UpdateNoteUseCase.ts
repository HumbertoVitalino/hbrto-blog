import { Note } from "@/domain/Note";
import { NoteRepository } from "@/infrastructure/repositories/NoteRepository";
import { NoteDTO, toNoteDraft } from "./noteDraft";

export type UpdateNoteDTO = NoteDTO;

export class UpdateNoteUseCase {
    constructor(private noteRepository: NoteRepository) {}

    async execute(id: string, dto: UpdateNoteDTO): Promise<Note> {
        if (!id) {
            throw new Error("Note ID is required");
        }

        // a full replacement: the editor always sends every version and citation
        return await this.noteRepository.save(toNoteDraft(dto), id);
    }
}
