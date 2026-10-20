import { GetTrackerSnapshotUseCase } from "@/application/usecases";
import { StudySessionRepository } from "@/infrastructure/repositories/StudySessionRepository";
import { NoteRepository } from "@/infrastructure/repositories/NoteRepository";
import { trackerRoute } from "@/lib/trackerRoute";

// GET /api/tracker?from=2026-10-13&to=2026-10-20 — habits, logs, schedule and reviews for the range
export const GET = trackerRoute(async ({ habits, schedule }, request) => {
    const params = request.nextUrl.searchParams;
    return new GetTrackerSnapshotUseCase(habits, schedule, new StudySessionRepository(), new NoteRepository())
        .execute(params.get("from"), params.get("to"));
});
