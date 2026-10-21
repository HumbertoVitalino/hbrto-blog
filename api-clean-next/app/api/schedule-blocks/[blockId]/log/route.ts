import { LogScheduleBlockUseCase } from "@/application/usecases";
import { jsonBody, trackerRoute } from "@/lib/trackerRoute";

// PUT { day: "2026-10-20", status: "done" | "partial" | "missed" | null }
export const PUT = trackerRoute<{ blockId: string }>(async ({ schedule }, request, { blockId }) => {
    const body = await jsonBody(request);
    await new LogScheduleBlockUseCase(schedule).execute(blockId, body.day, body.status ?? null);
});
