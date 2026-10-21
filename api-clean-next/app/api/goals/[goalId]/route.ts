import { ArchiveGoalUseCase, SaveGoalUseCase } from "@/application/usecases";
import { jsonBody, trackerRoute } from "@/lib/trackerRoute";

type Params = { goalId: string };

export const PUT = trackerRoute<Params>(async ({ goals }, request, { goalId }) =>
    new SaveGoalUseCase(goals).execute(await jsonBody(request), goalId));

export const DELETE = trackerRoute<Params>(async ({ goals }, _request, { goalId }) => {
    await new ArchiveGoalUseCase(goals).execute(goalId);
});
