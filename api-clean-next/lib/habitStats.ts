import { Habit, HabitLog, habitProgress, isHabitDue } from '@/domain/Habit'
import { addDays } from '@/lib/habitDates'

/** Logs indexed by habit and day, for quick lookups while drawing. */
export function indexLogs(logs: HabitLog[]): Map<string, HabitLog> {
    return new Map(logs.map(l => [`${l.habitId}|${l.day}`, l]))
}

export function logFor(index: Map<string, HabitLog>, habitId: string, day: string): HabitLog | undefined {
    return index.get(`${habitId}|${day}`)
}

/** Habits that existed and were planned on a day. */
export function habitsDueOn(habits: Habit[], day: string): Habit[] {
    return habits.filter(h => h.createdAt.slice(0, 10) <= day && isHabitDue(h, day))
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
    const created = habit.createdAt.slice(0, 10)
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
        const created = habit.createdAt.slice(0, 10)
        for (let day = addDays(today, -1), i = 0; day >= created && i < 7; day = addDays(day, -1), i++) {
            if (!isHabitDue(habit, day)) continue
            if (habitProgress(habit, logFor(index, habit.id, day)?.value) < 1) missed.add(habit.id)
            break
        }
    }
    return missed
}
