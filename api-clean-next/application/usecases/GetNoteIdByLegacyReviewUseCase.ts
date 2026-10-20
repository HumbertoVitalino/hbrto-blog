import { NoteRepository } from "@/infrastructure/repositories/NoteRepository";

/** Old /reviews/<id> links resolve to the note the review was migrated into. */
export class GetNoteIdByLegacyReviewUseCase {
    constructor(private noteRepository: NoteRepository) {}

    async execute(reviewId: string): Promise<string | null> {
        if (!reviewId) return null;
        return await this.noteRepository.findIdByLegacyReviewId(reviewId);
    }
}
