import { Note } from "@/domain/Note";
import { NoteRepository } from "@/infrastructure/repositories/NoteRepository";
import { NoteDTO, toNoteDraft } from "./noteDraft";

export type CreateNoteDTO = NoteDTO;

export class CreateNoteUseCase {
    constructor(private noteRepository: NoteRepository) {}

    async execute(dto: CreateNoteDTO): Promise<Note> {
        return await this.noteRepository.save(toNoteDraft(dto));
    }
}
