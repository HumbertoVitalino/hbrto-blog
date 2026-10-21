import { LogHabitUseCase } from "@/application/usecases";
import { jsonBody, trackerRoute } from "@/lib/trackerRoute";

// PUT { day: "2026-10-20", value: 1 } — value 0 clears the day
export const PUT = trackerRoute<{ habitId: string }>(async ({ habits }, request, { habitId }) => {
    const body = await jsonBody(request);
    await new LogHabitUseCase(habits).execute(habitId, body.day, body.value);
});
