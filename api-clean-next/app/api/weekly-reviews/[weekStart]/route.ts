import { SaveWeeklyReviewUseCase } from "@/application/usecases";
import { jsonBody, trackerRoute } from "@/lib/trackerRoute";

// PUT { wentWell, gotInTheWay, changeNext } for the week starting on that Monday
export const PUT = trackerRoute<{ weekStart: string }>(async ({ schedule }, request, { weekStart }) =>
    new SaveWeeklyReviewUseCase(schedule).execute(weekStart, await jsonBody(request)));
