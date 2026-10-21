import { BlockLog, Habit, HabitLog, habitProgress, isBlockOn, isHabitDue, LIFE_AREAS, LifeArea, ScheduleBlock } from '@/domain/Habit'
import { addDays, blockMinutes, minutesOf, toDayKey } from '@/lib/habitDates'

/**
 * The day a habit was created, where you are. createdAt is a UTC timestamp: sliced as is, a habit
 * made at 21:30 in São Paulo would start tomorrow (00:30 UTC) and be missing from today.
 */
export function createdDay(habit: Pick<Habit, 'createdAt'>): string {
    return toDayKey(new Date(habit.createdAt))
}

/** Logs indexed by habit and day, for quick lookups while drawing. */
export function indexLogs(logs: HabitLog[]): Map<string, HabitLog> {
    return new Map(logs.map(l => [`${l.habitId}|${l.day}`, l]))
}

export function logFor(index: Map<string, HabitLog>, habitId: string, day: string): HabitLog | undefined {
    return index.get(`${habitId}|${day}`)
}

/** Habits that existed and were planned on a day. */
export function habitsDueOn(habits: Habit[], day: string): Habit[] {
    return habits.filter(h => createdDay(h) <= day && isHabitDue(h, day))
}

/** How much of a day's planned habits got done, 0 to 1 (partial amounts count partly). */
export function dayScore(habits: Habit[], index: Map<string, HabitLog>, day: string): number {
    const due = habitsDueOn(habits, day)
    if (due.length === 0) return 0
    return due.reduce((sum, h) => sum + habitProgress(h, logFor(index, h.id, day)?.value), 0) / due.length
}

/**
 * Days in a row the habit was fully done, counting only days it was planned on. Today only
 * adds to the streak once it's done; an unfinished today doesn't break it yet.
 */
export function streak(habit: Habit, index: Map<string, HabitLog>, today: string): number {
    const done = (day: string) => habitProgress(habit, logFor(index, habit.id, day)?.value) >= 1
    let count = done(today) && isHabitDue(habit, today) ? 1 : 0
    const created = createdDay(habit)
    for (let day = addDays(today, -1); day >= created; day = addDays(day, -1)) {
        if (!isHabitDue(habit, day)) continue
        if (!done(day)) break
        count++
    }
    return count
}

/** The habits missed on their last planned day: the ones that mustn't be missed twice. */
export function missedLastTime(habits: Habit[], index: Map<string, HabitLog>, today: string): Set<string> {
    const missed = new Set<string>()
    for (const habit of habits) {
        const created = createdDay(habit)
        for (let day = addDays(today, -1), i = 0; day >= created && i < 7; day = addDays(day, -1), i++) {
            if (!isHabitDue(habit, day)) continue
            if (habitProgress(habit, logFor(index, habit.id, day)?.value) < 1) missed.add(habit.id)
            break
        }
    }
    return missed
}

/** How much of the planned habits got done over some days: the sum of progress and how many were due. */
export function progressOver(habits: Habit[], index: Map<string, HabitLog>, days: string[]): { done: number; due: number } {
    let done = 0
    let due = 0
    for (const day of days) {
        for (const h of habitsDueOn(habits, day)) {
            done += habitProgress(h, logFor(index, h.id, day)?.value)
            due++
        }
    }
    return { done, due }
}

/** Each area's share of its planned habits done over some days; null when nothing in it was planned. */
export function areaScores(habits: Habit[], index: Map<string, HabitLog>, days: string[]): Map<LifeArea, number | null> {
    return new Map(LIFE_AREAS.map(area => {
        const { done, due } = progressOver(habits.filter(h => h.area === area), index, days)
        return [area, due ? done / due : null]
    }))
}

/** The first two planned days in a row a habit wasn't done on, within some days; null if it never happened. */
export function missedTwice(habit: Habit, index: Map<string, HabitLog>, days: string[]): [string, string] | null {
    let previousMiss: string | null = null
    for (const day of days) {
        if (createdDay(habit) > day || !isHabitDue(habit, day)) continue
        if (habitProgress(habit, logFor(index, habit.id, day)?.value) >= 1) {
            previousMiss = null
            continue
        }
        if (previousMiss) return [previousMiss, day]
        previousMiss = day
    }
    return null
}

/** Share of planned days fully done in the `span` days before today; null with nothing planned. */
export function consistency(habit: Habit, index: Map<string, HabitLog>, today: string, span = 30): number | null {
    let done = 0
    let due = 0
    for (let i = 1; i <= span; i++) {
        const day = addDays(today, -i)
        if (createdDay(habit) > day || !isHabitDue(habit, day)) continue
        due++
        if (habitProgress(habit, logFor(index, habit.id, day)?.value) >= 1) done++
    }
    return due ? done / due : null
}

/**
 * Schedule time over some days, counting only blocks that have already ended: what was planned,
 * and how much of it was marked done, partly done, or left unmarked.
 */
export function scheduleTime(
    blocks: ScheduleBlock[],
    blockLogs: BlockLog[],
    days: string[],
    today: string,
    nowMinutes: number,
): { planned: number; done: number; partial: number; unmarked: number } {
    const status = new Map(blockLogs.map(l => [`${l.blockId}|${l.day}`, l.status]))
    const totals = { planned: 0, done: 0, partial: 0, unmarked: 0 }
    for (const day of days) {
        if (day > today) continue
        for (const block of blocks) {
            if (!isBlockOn(block, day)) continue
            const length = blockMinutes(block.startsAt, block.endsAt)
            // a block that hasn't finished yet can't be judged
            if (day === today && minutesOf(block.startsAt) + length > nowMinutes) continue
            totals.planned += length
            const s = status.get(`${block.id}|${day}`)
            if (s === 'done') totals.done += length
            else if (s === 'partial') totals.partial += length
            else if (!s) totals.unmarked += length
        }
    }
    return totals
}

/**
 * Of the `weeks` full weeks before `currentWeek`, how many had the habit done on every day it
 * was planned. Weeks it didn't exist yet (or had no planned day) don't count either way.
 */
export function weeksHit(habit: Habit, index: Map<string, HabitLog>, currentWeek: string, weeks: number): { hit: number; of: number } {
    const created = createdDay(habit)
    let hit = 0
    let of = 0
    for (let w = 1; w <= weeks; w++) {
        const planned = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i - 7 * w))
            .filter(day => day >= created && isHabitDue(habit, day))
        if (planned.length === 0) continue
        of++
        if (planned.every(day => habitProgress(habit, logFor(index, habit.id, day)?.value) >= 1)) hit++
    }
    return { hit, of }
}
