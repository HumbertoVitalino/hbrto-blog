import { SaveGoalUseCase } from "@/application/usecases";
import { jsonBody, trackerRoute } from "@/lib/trackerRoute";

export const POST = trackerRoute(async ({ goals }, request) =>
    new SaveGoalUseCase(goals).execute(await jsonBody(request)), 201);
