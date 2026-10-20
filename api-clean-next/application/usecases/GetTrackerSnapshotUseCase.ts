import { BlockLog, Habit, HabitLog, ScheduleBlock, WeeklyReview } from "@/domain/Habit";
import { PomodoroPhaseType } from "@/domain/PomodoroPhaseType";
import { HabitRepository } from "@/infrastructure/repositories/HabitRepository";
import { ScheduleRepository } from "@/infrastructure/repositories/ScheduleRepository";
import { StudySessionRepository } from "@/infrastructure/repositories/StudySessionRepository";
import { NoteRepository } from "@/infrastructure/repositories/NoteRepository";
import { assertRange, localDay } from "./habitDrafts";

export interface TrackerSnapshot {
    from: string;
    to: string;
    habits: Habit[];
    logs: HabitLog[];
    blocks: ScheduleBlock[];
    blockLogs: BlockLog[];
    reviews: WeeklyReview[];
}

/**
 * Everything the tracker shows for a range of days, in one read. Automatic habits get their
 * values from the rest of the site (focus minutes from Studies, a published note) instead of
 * from taps; those values are computed here and never stored.
 */
export class GetTrackerSnapshotUseCase {
    constructor(
        private habits: HabitRepository,
        private schedule: ScheduleRepository,
        private studySessions: StudySessionRepository,
        private notes: NoteRepository,
    ) {}

    async execute(fromInput: unknown, toInput: unknown): Promise<TrackerSnapshot> {
        const { from, to } = assertRange(fromInput, toInput);

        const [habits, manualLogs, blocks, blockLogs, reviews] = await Promise.all([
            this.habits.findActive(),
            this.habits.findLogs(from, to),
            this.schedule.findForRange(from, to),
            this.schedule.findLogs(from, to),
            this.schedule.findReviews(from, to),
        ]);

        const autoHabits = habits.filter(h => h.autoSource);
        const autoLogs = autoHabits.length ? await this.autoLogs(autoHabits, from, to) : [];
        const autoIds = new Set(autoHabits.map(h => h.id));

        return {
            from,
            to,
            habits,
            // an automatic habit's value always comes from the site, never from a stray tap
            logs: [...manualLogs.filter(l => !autoIds.has(l.habitId)), ...autoLogs],
            blocks,
            blockLogs,
            reviews,
        };
    }

    private async autoLogs(habits: Habit[], from: string, to: string): Promise<HabitLog[]> {
        const needsStudy = habits.some(h => h.autoSource === "study_focus");
        const needsNotes = habits.some(h => h.autoSource === "note_published");
        const [sessions, notes] = await Promise.all([
            needsStudy ? this.studySessions.findAll() : Promise.resolve([]),
            needsNotes ? this.notes.findAll() : Promise.resolve([]),
        ]);

        const focusMinutes = new Map<string, number>();
        for (const s of sessions) {
            if (s.phaseType !== PomodoroPhaseType.Focus) continue;
            const day = localDay(s.startedAt);
            if (day < from || day > to) continue;
            focusMinutes.set(day, (focusMinutes.get(day) ?? 0) + s.actualSeconds / 60);
        }

        const notesPublished = new Map<string, number>();
        for (const n of notes) {
            const day = localDay(n.createdAt);
            if (day < from || day > to) continue;
            notesPublished.set(day, (notesPublished.get(day) ?? 0) + 1);
        }

        const logs: HabitLog[] = [];
        for (const habit of habits) {
            const source = habit.autoSource === "study_focus" ? focusMinutes : notesPublished;
            for (const [day, amount] of source) {
                // a yes/no habit is done by any of it; a counted one gets the amount
                const value = habit.kind === "bool" ? 1 : Math.round(amount);
                if (value > 0) logs.push({ habitId: habit.id, day, value, auto: true });
            }
        }
        return logs;
    }
}
