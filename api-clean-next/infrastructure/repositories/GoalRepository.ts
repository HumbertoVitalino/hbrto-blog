import { SupabaseClient } from "@supabase/supabase-js";
import { Goal, GoalKind } from "@/domain/Habit";

interface GoalRow {
    id: string;
    title: string;
    kind: string;
    target: number | null;
    current: number;
    unit: string | null;
    habit_id: string | null;
    year: number | null;
    position: number;
    created_at: string;
}

export type GoalDraft = Omit<Goal, "id" | "createdAt">;

function toGoal(row: GoalRow): Goal {
    return {
        id: row.id,
        title: row.title,
        kind: row.kind as GoalKind,
        target: row.target === null ? null : Number(row.target),
        current: Number(row.current),
        unit: row.unit,
        habitId: row.habit_id,
        year: row.year,
        position: row.position,
        createdAt: row.created_at,
    };
}

function toRow(draft: GoalDraft) {
    return {
        title: draft.title,
        kind: draft.kind,
        target: draft.target,
        current: draft.current,
        unit: draft.unit,
        habit_id: draft.habitId,
        year: draft.year,
        position: draft.position,
    };
}

/** Goals ("where I'm going"). Built per request with the admin's own client (row level security). */
export class GoalRepository {
    constructor(private db: SupabaseClient) {}

    async findActive(): Promise<Goal[]> {
        const { data, error } = await this.db
            .from("goals")
            .select("*")
            .is("archived_at", null)
            .order("position")
            .order("created_at");
        if (error) throw new Error(error.message);
        return (data as GoalRow[]).map(toGoal);
    }

    async create(draft: GoalDraft): Promise<Goal> {
        const { data, error } = await this.db.from("goals").insert(toRow(draft)).select().single();
        if (error) throw new Error(error.message);
        return toGoal(data as GoalRow);
    }

    async update(id: string, draft: GoalDraft): Promise<Goal> {
        const { data, error } = await this.db.from("goals").update(toRow(draft)).eq("id", id).select().maybeSingle();
        if (error) throw new Error(error.message);
        if (!data) throw new Error("Goal not found");
        return toGoal(data as GoalRow);
    }

    /** Moves a manual goal's progress. */
    async setCurrent(id: string, current: number): Promise<void> {
        const { data, error } = await this.db.from("goals").update({ current }).eq("id", id).eq("kind", "manual").select("id").maybeSingle();
        if (error) throw new Error(error.message);
        if (!data) throw new Error("Goal not found");
    }

    async archive(id: string): Promise<void> {
        const { error } = await this.db.from("goals").update({ archived_at: new Date().toISOString() }).eq("id", id);
        if (error) throw new Error(error.message);
    }
}
