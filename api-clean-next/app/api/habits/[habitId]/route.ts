import { ArchiveHabitUseCase, SaveHabitUseCase } from "@/application/usecases";
import { jsonBody, trackerRoute } from "@/lib/trackerRoute";

type Params = { habitId: string };

export const PUT = trackerRoute<Params>(async ({ habits }, request, { habitId }) =>
    new SaveHabitUseCase(habits).execute(await jsonBody(request), habitId));

// archived rather than deleted, so past weeks keep their history
export const DELETE = trackerRoute<Params>(async ({ habits }, _request, { habitId }) => {
    await new ArchiveHabitUseCase(habits).execute(habitId);
});
