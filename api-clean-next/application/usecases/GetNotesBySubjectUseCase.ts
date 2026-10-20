import { Note, NoteSubjectKind } from "@/domain/Note";
import { NoteRepository } from "@/infrastructure/repositories/NoteRepository";

export class GetNotesBySubjectUseCase {
    constructor(private noteRepository: NoteRepository) {}

    async execute(kind: NoteSubjectKind, subjectId: string): Promise<Note[]> {
        if (!subjectId) {
            throw new Error("Subject ID is required");
        }

        return await this.noteRepository.findBySubject(kind, subjectId);
    }
}
