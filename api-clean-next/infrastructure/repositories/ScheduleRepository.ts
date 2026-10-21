import { SupabaseClient } from "@supabase/supabase-js";
import { BlockLog, BlockStatus, LifeArea, ScheduleBlock, WeeklyReview } from "@/domain/Habit";

interface BlockRow {
    id: string;
    title: string;
    area: string;
    starts_at: string;
    ends_at: string;
    weekdays: number[] | null;
    one_off_day: string | null;
}

export type ScheduleBlockDraft = Omit<ScheduleBlock, "id">;

// Postgres returns "HH:MM:SS"; the app works in "HH:MM"
const hhmm = (time: string) => time.slice(0, 5);

function toBlock(row: BlockRow): ScheduleBlock {
    return {
        id: row.id,
        title: row.title,
        area: row.area as LifeArea,
        startsAt: hhmm(row.starts_at),
        endsAt: hhmm(row.ends_at),
        weekdays: row.weekdays,
        oneOffDay: row.one_off_day,
    };
}

function toRow(draft: ScheduleBlockDraft) {
    return {
        title: draft.title,
        area: draft.area,
        starts_at: draft.startsAt,
        ends_at: draft.endsAt,
        weekdays: draft.weekdays,
        one_off_day: draft.oneOffDay,
    };
}

/** Time blocks, how each one went, and the weekly review. Built per request with the admin's client. */
export class ScheduleRepository {
    constructor(private db: SupabaseClient) {}

    /** Every repeating block, plus one-off blocks that fall inside the range. */
    async findForRange(from: string, to: string): Promise<ScheduleBlock[]> {
        const { data, error } = await this.db
            .from("schedule_blocks")
            .select("id, title, area, starts_at, ends_at, weekdays, one_off_day")
            .is("archived_at", null)
            .or(`weekdays.not.is.null,and(one_off_day.gte.${from},one_off_day.lte.${to})`)
            .order("starts_at");
        if (error) throw new Error(error.message);
        return (data as BlockRow[]).map(toBlock);
    }

    async create(draft: ScheduleBlockDraft): Promise<ScheduleBlock> {
        const { data, error } = await this.db.from("schedule_blocks").insert(toRow(draft)).select().single();
        if (error) throw new Error(error.message);
        return toBlock(data as BlockRow);
    }

    async update(id: string, draft: ScheduleBlockDraft): Promise<ScheduleBlock> {
        const { data, error } = await this.db.from("schedule_blocks").update(toRow(draft)).eq("id", id).select().maybeSingle();
        if (error) throw new Error(error.message);
        if (!data) throw new Error("Block not found");
        return toBlock(data as BlockRow);
    }

    async archive(id: string): Promise<void> {
        const { error } = await this.db.from("schedule_blocks").update({ archived_at: new Date().toISOString() }).eq("id", id);
        if (error) throw new Error(error.message);
    }

    async findLogs(from: string, to: string): Promise<BlockLog[]> {
        const { data, error } = await this.db
            .from("schedule_block_logs")
            .select("block_id, day, status")
            .gte("day", from)
            .lte("day", to);
        if (error) throw new Error(error.message);
        return (data as { block_id: string; day: string; status: BlockStatus }[])
            .map(r => ({ blockId: r.block_id, day: r.day, status: r.status }));
    }

    /** null clears how the block went for that day. */
    async log(blockId: string, day: string, status: BlockStatus | null): Promise<void> {
        const { error } = status
            ? await this.db.from("schedule_block_logs").upsert({ block_id: blockId, day, status, updated_at: new Date().toISOString() })
            : await this.db.from("schedule_block_logs").delete().eq("block_id", blockId).eq("day", day);
        if (error) {
            if (error.code === "23503") throw new Error("Block not found");
            throw new Error(error.message);
        }
    }

    async findReviews(from: string, to: string): Promise<WeeklyReview[]> {
        const { data, error } = await this.db
            .from("weekly_reviews")
            .select("week_start, went_well, got_in_the_way, change_next")
            .gte("week_start", from)
            .lte("week_start", to);
        if (error) throw new Error(error.message);
        return (data as { week_start: string; went_well: string | null; got_in_the_way: string | null; change_next: string | null }[])
            .map(r => ({ weekStart: r.week_start, wentWell: r.went_well ?? "", gotInTheWay: r.got_in_the_way ?? "", changeNext: r.change_next ?? "" }));
    }

    async saveReview(review: WeeklyReview): Promise<void> {
        const { error } = await this.db.from("weekly_reviews").upsert({
            week_start: review.weekStart,
            went_well: review.wentWell,
            got_in_the_way: review.gotInTheWay,
            change_next: review.changeNext,
            updated_at: new Date().toISOString(),
        });
        if (error) throw new Error(error.message);
    }
}
