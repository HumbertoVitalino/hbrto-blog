import { SaveScheduleBlockUseCase } from "@/application/usecases";
import { jsonBody, trackerRoute } from "@/lib/trackerRoute";

export const POST = trackerRoute(async ({ schedule }, request) =>
    new SaveScheduleBlockUseCase(schedule).execute(await jsonBody(request)), 201);
