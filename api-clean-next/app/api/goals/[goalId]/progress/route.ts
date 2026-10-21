import { SetGoalProgressUseCase } from "@/application/usecases";
import { jsonBody, trackerRoute } from "@/lib/trackerRoute";

// PUT { current } moves a manual goal's progress
export const PUT = trackerRoute<{ goalId: string }>(async ({ goals }, request, { goalId }) => {
    await new SetGoalProgressUseCase(goals).execute(goalId, (await jsonBody(request)).current);
});
