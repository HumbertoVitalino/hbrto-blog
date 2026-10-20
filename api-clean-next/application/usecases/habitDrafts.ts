import { AUTO_SOURCES, AutoSource, BlockStatus, LIFE_AREAS, LifeArea, TIMES_OF_DAY, TimeOfDay, WeeklyReview } from "@/domain/Habit";
import { HabitDraft } from "@/infrastructure/repositories/HabitRepository";
import { ScheduleBlockDraft } from "@/infrastructure/repositories/ScheduleRepository";

// Days are lived in São Paulo: a session at 23:00 there belongs to that day, not to UTC's next one.
const TIME_ZONE = "America/Sao_Paulo";
const dayFormat = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE });

/** "YYYY-MM-DD" in São Paulo for an instant. */
export function localDay(date: Date | string): string {
    return dayFormat.format(new Date(date));
}

const DAY = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

/** A real calendar day as YYYY-MM-DD. Anything else is refused before it reaches a query. */
export function assertDay(day: unknown, label = "Day"): string {
    if (typeof day !== "string" || !DAY.test(day) || Number.isNaN(new Date(`${day}T12:00:00Z`).getTime())) {
        throw new Error(`${label} must be a date like 2026-10-20`);
    }
    return day;
}

export function assertRange(from: unknown, to: unknown): { from: string; to: string } {
    const range = { from: assertDay(from, "From"), to: assertDay(to, "To") };
    if (range.from > range.to) throw new Error("From must be on or before To");
    const days = (new Date(range.to).getTime() - new Date(range.from).getTime()) / 86_400_000;
    if (days > 400) throw new Error("Ask for at most about a year at a time");
    return range;
}

function weekdays(value: unknown, label: string): number[] | null {
    if (value === null || value === undefined) return null;
    if (!Array.isArray(value) || value.length === 0) throw new Error(`${label}: pick at least one day`);
    const days = [...new Set(value)];
    if (!days.every(d => Number.isInteger(d) && d >= 0 && d <= 6)) throw new Error(`${label}: days go from 0 (Sunday) to 6`);
    return (days as number[]).sort();
}

function area(value: unknown): LifeArea {
    if (!LIFE_AREAS.includes(value as LifeArea)) throw new Error("Pick an area");
    return value as LifeArea;
}

export interface HabitInput {
    name?: string;
    area?: string;
    kind?: string;
    target?: number | null;
    unit?: string | null;
    step?: number | null;
    timeOfDay?: string;
    days?: number[] | null;
    autoSource?: string | null;
    position?: number;
}

export function toHabitDraft(input: HabitInput): HabitDraft {
    const name = input.name?.trim() ?? "";
    if (!name) throw new Error("Give the habit a name");

    const kind = input.kind === "qty" ? "qty" : "bool";
    let target: number | null = null;
    let step: number | null = null;
    let unit: string | null = null;
    if (kind === "qty") {
        target = Number(input.target);
        if (!Number.isFinite(target) || target <= 0) throw new Error("Set how much counts as done");
        step = input.step === null || input.step === undefined ? null : Number(input.step);
        if (step !== null && (!Number.isFinite(step) || step <= 0)) throw new Error("The step must be more than zero");
        unit = input.unit?.trim() || null;
    }

    const timeOfDay = (TIMES_OF_DAY.includes(input.timeOfDay as TimeOfDay) ? input.timeOfDay : "anytime") as TimeOfDay;
    const autoSource = input.autoSource ? input.autoSource as AutoSource : null;
    if (autoSource && !AUTO_SOURCES.includes(autoSource)) throw new Error("Unknown automatic source");

    return {
        name,
        area: area(input.area),
        kind,
        target,
        unit,
        step,
        timeOfDay,
        days: weekdays(input.days, "Repeat"),
        autoSource,
        position: Number.isInteger(input.position) ? input.position! : 0,
    };
}

export interface BlockInput {
    title?: string;
    area?: string;
    startsAt?: string;
    endsAt?: string;
    weekdays?: number[] | null;
    oneOffDay?: string | null;
}

export function toBlockDraft(input: BlockInput): ScheduleBlockDraft {
    const title = input.title?.trim() ?? "";
    if (!title) throw new Error("Give the block a title");
    if (!input.startsAt || !TIME.test(input.startsAt)) throw new Error("Start time must look like 07:30");
    if (!input.endsAt || !TIME.test(input.endsAt)) throw new Error("End time must look like 08:15");
    if (input.startsAt === input.endsAt) throw new Error("A block needs some length");

    const repeats = weekdays(input.weekdays, "Repeat");
    const oneOffDay = input.oneOffDay ? assertDay(input.oneOffDay) : null;
    if (!repeats === !oneOffDay) throw new Error("A block either repeats on weekdays or happens on one day");

    return { title, area: area(input.area), startsAt: input.startsAt, endsAt: input.endsAt, weekdays: repeats, oneOffDay };
}

export function toBlockStatus(value: unknown): BlockStatus | null {
    if (value === null) return null;
    if (value === "done" || value === "partial" || value === "missed") return value;
    throw new Error("Status is done, partial, missed or null");
}

export function toReview(weekStart: unknown, input: Partial<WeeklyReview>): WeeklyReview {
    const day = assertDay(weekStart, "Week");
    if (new Date(`${day}T12:00:00`).getDay() !== 1) throw new Error("A week starts on a Monday");
    const text = (v: unknown) => (typeof v === "string" ? v.slice(0, 4000) : "");
    return { weekStart: day, wentWell: text(input.wentWell), gotInTheWay: text(input.gotInTheWay), changeNext: text(input.changeNext) };
}
