import { Goal, Habit, ScheduleBlock, WeeklyReview } from "@/domain/Habit";
import { HabitRepository } from "@/infrastructure/repositories/HabitRepository";
import { GoalRepository } from "@/infrastructure/repositories/GoalRepository";
import { ScheduleRepository } from "@/infrastructure/repositories/ScheduleRepository";
import { assertDay, BlockInput, GoalInput, HabitInput, toBlockDraft, toBlockStatus, toGoalCurrent, toGoalDraft, toHabitDraft, toReview } from "./habitDrafts";

/** Creates a habit, or replaces one when an id is given. */
export class SaveHabitUseCase {
    constructor(private habits: HabitRepository) {}

    async execute(input: HabitInput, id?: string): Promise<Habit> {
        const draft = toHabitDraft(input);
        return id ? this.habits.update(id, draft) : this.habits.create(draft);
    }
}

export class ArchiveHabitUseCase {
    constructor(private habits: HabitRepository) {}

    async execute(id: string): Promise<void> {
        if (!id) throw new Error("Habit ID is required");
        await this.habits.archive(id);
    }
}

/** Sets how much of a habit was done on a day; 0 clears it. */
export class LogHabitUseCase {
    constructor(private habits: HabitRepository) {}

    async execute(habitId: string, day: unknown, value: unknown): Promise<void> {
        const amount = Number(value);
        if (!Number.isFinite(amount) || amount < 0) throw new Error("Value must be zero or more");
        await this.habits.log(habitId, assertDay(day), amount);
    }
}

/** Creates a schedule block, or replaces one when an id is given. */
export class SaveScheduleBlockUseCase {
    constructor(private schedule: ScheduleRepository) {}

    async execute(input: BlockInput, id?: string): Promise<ScheduleBlock> {
        const draft = toBlockDraft(input);
        return id ? this.schedule.update(id, draft) : this.schedule.create(draft);
    }
}

export class ArchiveScheduleBlockUseCase {
    constructor(private schedule: ScheduleRepository) {}

    async execute(id: string): Promise<void> {
        if (!id) throw new Error("Block ID is required");
        await this.schedule.archive(id);
    }
}

/** Records how a block went on a day (done, partial, missed); null clears it. */
export class LogScheduleBlockUseCase {
    constructor(private schedule: ScheduleRepository) {}

    async execute(blockId: string, day: unknown, status: unknown): Promise<void> {
        await this.schedule.log(blockId, assertDay(day), toBlockStatus(status));
    }
}

export class SaveWeeklyReviewUseCase {
    constructor(private schedule: ScheduleRepository) {}

    async execute(weekStart: unknown, input: Partial<WeeklyReview>): Promise<WeeklyReview> {
        const review = toReview(weekStart, input);
        await this.schedule.saveReview(review);
        return review;
    }
}

/** Creates a goal, or replaces one when an id is given. */
export class SaveGoalUseCase {
    constructor(private goals: GoalRepository) {}

    async execute(input: GoalInput, id?: string): Promise<Goal> {
        const draft = toGoalDraft(input);
        return id ? this.goals.update(id, draft) : this.goals.create(draft);
    }
}

/** Moves a manual goal's progress (phase 3 of 6). */
export class SetGoalProgressUseCase {
    constructor(private goals: GoalRepository) {}

    async execute(id: string, current: unknown): Promise<void> {
        if (!id) throw new Error("Goal ID is required");
        await this.goals.setCurrent(id, toGoalCurrent(current));
    }
}

export class ArchiveGoalUseCase {
    constructor(private goals: GoalRepository) {}

    async execute(id: string): Promise<void> {
        if (!id) throw new Error("Goal ID is required");
        await this.goals.archive(id);
    }
}
