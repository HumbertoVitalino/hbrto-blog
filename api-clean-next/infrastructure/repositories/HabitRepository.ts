import { SupabaseClient } from "@supabase/supabase-js";
import { AutoSource, Habit, HabitKind, HabitLog, LifeArea, TimeOfDay } from "@/domain/Habit";

interface HabitRow {
    id: string;
    name: string;
    area: string;
    kind: string;
    target: number | null;
    unit: string | null;
    step: number | null;
    time_of_day: string;
    days: number[] | null;
    auto_source: string | null;
    position: number;
    created_at: string;
}

export type HabitDraft = Omit<Habit, "id" | "createdAt">;

function toHabit(row: HabitRow): Habit {
    return {
        id: row.id,
        name: row.name,
        area: row.area as LifeArea,
        kind: row.kind as HabitKind,
        target: row.target === null ? null : Number(row.target),
        unit: row.unit,
        step: row.step === null ? null : Number(row.step),
        timeOfDay: row.time_of_day as TimeOfDay,
        days: row.days,
        autoSource: row.auto_source as AutoSource | null,
        position: row.position,
        createdAt: row.created_at,
    };
}

function toRow(draft: HabitDraft) {
    return {
        name: draft.name,
        area: draft.area,
        kind: draft.kind,
        target: draft.target,
        unit: draft.unit,
        step: draft.step,
        time_of_day: draft.timeOfDay,
        days: draft.days,
        auto_source: draft.autoSource,
        position: draft.position,
    };
}

/** Habits and their daily logs. Built per request with the admin's own client (row level security). */
export class HabitRepository {
    constructor(private db: SupabaseClient) {}

    async findActive(): Promise<Habit[]> {
        const { data, error } = await this.db
            .from("habits")
            .select("*")
            .is("archived_at", null)
            .order("position")
            .order("created_at");
        if (error) throw new Error(error.message);
        return (data as HabitRow[]).map(toHabit);
    }

    async create(draft: HabitDraft): Promise<Habit> {
        const { data, error } = await this.db.from("habits").insert(toRow(draft)).select().single();
        if (error) throw new Error(error.message);
        return toHabit(data as HabitRow);
    }

    async update(id: string, draft: HabitDraft): Promise<Habit> {
        const { data, error } = await this.db.from("habits").update(toRow(draft)).eq("id", id).select().maybeSingle();
        if (error) throw new Error(error.message);
        if (!data) throw new Error("Habit not found");
        return toHabit(data as HabitRow);
    }

    /** Archived, not deleted: its history still counts in past weeks. */
    async archive(id: string): Promise<void> {
        const { error } = await this.db.from("habits").update({ archived_at: new Date().toISOString() }).eq("id", id);
        if (error) throw new Error(error.message);
    }

    async findLogs(from: string, to: string): Promise<HabitLog[]> {
        const { data, error } = await this.db
            .from("habit_logs")
            .select("habit_id, day, value")
            .gte("day", from)
            .lte("day", to);
        if (error) throw new Error(error.message);
        return (data as { habit_id: string; day: string; value: number }[])
            .map(r => ({ habitId: r.habit_id, day: r.day, value: Number(r.value) }));
    }

    /** Setting a value to 0 clears the log rather than keeping an empty row. */
    async log(habitId: string, day: string, value: number): Promise<void> {
        const { error } = value > 0
            ? await this.db.from("habit_logs").upsert({ habit_id: habitId, day, value, updated_at: new Date().toISOString() })
            : await this.db.from("habit_logs").delete().eq("habit_id", habitId).eq("day", day);
        if (error) {
            if (error.code === "23503") throw new Error("Habit not found");
            throw new Error(error.message);
        }
    }
}
