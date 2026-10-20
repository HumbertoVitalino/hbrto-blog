import { permanentRedirect } from 'next/navigation'
import { NoteRepository } from '@/infrastructure/repositories/NoteRepository'
import { GetNoteIdByLegacyReviewUseCase } from '@/application/usecases'

// Reviews became notes; old links (including ones in emails already sent) land on the note each review became.
export default async function LegacyReviewPage({ params }: { params: Promise<{ reviewId: string }> }) {
    const { reviewId } = await params
    const noteId = await new GetNoteIdByLegacyReviewUseCase(new NoteRepository()).execute(reviewId).catch(() => null)
    permanentRedirect(noteId ? `/notes/${noteId}` : '/notes')
}
