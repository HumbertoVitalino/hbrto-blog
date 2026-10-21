import { SaveHabitUseCase } from "@/application/usecases";
import { jsonBody, trackerRoute } from "@/lib/trackerRoute";

export const POST = trackerRoute(async ({ habits }, request) =>
    new SaveHabitUseCase(habits).execute(await jsonBody(request)), 201);
