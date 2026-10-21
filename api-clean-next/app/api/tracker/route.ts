import { GetTrackerSnapshotUseCase } from "@/application/usecases";
import { StudySessionRepository } from "@/infrastructure/repositories/StudySessionRepository";
import { NoteRepository } from "@/infrastructure/repositories/NoteRepository";
import { BookRepository } from "@/infrastructure/repositories/BookRepository";
import { trackerRoute } from "@/lib/trackerRoute";

// GET /api/tracker?from=2026-10-13&to=2026-10-20 — habits, logs, schedule, reviews and goals for the range
export const GET = trackerRoute(async ({ habits, schedule, goals }, request) => {
    const params = request.nextUrl.searchParams;
    return new GetTrackerSnapshotUseCase(habits, schedule, new StudySessionRepository(), new NoteRepository(), goals, new BookRepository())
        .execute(params.get("from"), params.get("to"));
});
