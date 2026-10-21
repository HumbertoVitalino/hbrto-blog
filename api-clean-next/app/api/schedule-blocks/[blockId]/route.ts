import { ArchiveScheduleBlockUseCase, SaveScheduleBlockUseCase } from "@/application/usecases";
import { jsonBody, trackerRoute } from "@/lib/trackerRoute";

type Params = { blockId: string };

export const PUT = trackerRoute<Params>(async ({ schedule }, request, { blockId }) =>
    new SaveScheduleBlockUseCase(schedule).execute(await jsonBody(request), blockId));

export const DELETE = trackerRoute<Params>(async ({ schedule }, _request, { blockId }) => {
    await new ArchiveScheduleBlockUseCase(schedule).execute(blockId);
});
