export const LIFE_AREAS = ['health', 'mind', 'career', 'people', 'rest'] as const
export type LifeArea = (typeof LIFE_AREAS)[number]

export const LIFE_AREA_LABEL: Record<LifeArea, string> = {
    health: 'Health',
    mind: 'Mind',
    career: 'Career',
    people: 'People',
    rest: 'Rest',
}

export const TIMES_OF_DAY = ['morning', 'anytime', 'evening'] as const
export type TimeOfDay = (typeof TIMES_OF_DAY)[number]

export type HabitKind = 'bool' | 'qty'

/** Habits that fill themselves in from the rest of the site. */
export const AUTO_SOURCES = ['study_focus', 'note_published'] as const
export type AutoSource = (typeof AUTO_SOURCES)[number]

export const AUTO_SOURCE_LABEL: Record<AutoSource, string> = {
    study_focus: 'Studies',
    note_published: 'Notes',
}

export interface Habit {
    id: string
    name: string
    area: LifeArea
    kind: HabitKind
    /** for 'qty': how much counts as done */
    target: number | null
    unit: string | null
    /** for 'qty': how much one tap of + adds */
    step: number | null
    timeOfDay: TimeOfDay
    /** weekdays it's planned on, 0 = Sunday; null = every day */
    days: number[] | null
    autoSource: AutoSource | null
    position: number
    createdAt: string
}

/** What was logged for a habit on a day (YYYY-MM-DD, local to where it was lived). */
export interface HabitLog {
    habitId: string
    day: string
    value: number
    /** true when the value came from the site (a focus session, a note) rather than a tap */
    auto?: boolean
}

export interface ScheduleBlock {
    id: string
    title: string
    area: LifeArea
    /** "HH:MM" */
    startsAt: string
    /** "HH:MM"; earlier than startsAt when the block runs past midnight */
    endsAt: string
    /** repeats on these weekdays (0 = Sunday)... */
    weekdays: number[] | null
    /** ...or happens once on this day */
    oneOffDay: string | null
}

export type BlockStatus = 'done' | 'partial' | 'missed'

export interface BlockLog {
    blockId: string
    day: string
    status: BlockStatus
}

export interface WeeklyReview {
    /** the Monday the week starts on */
    weekStart: string
    wentWell: string
    gotInTheWay: string
    changeNext: string
}

/** Whether a habit is planned on a given day (YYYY-MM-DD). */
export function isHabitDue(habit: Pick<Habit, 'days'>, day: string): boolean {
    if (!habit.days) return true
    return habit.days.includes(new Date(`${day}T12:00:00`).getDay())
}

/** How complete a logged value is, 0 to 1. */
export function habitProgress(habit: Pick<Habit, 'kind' | 'target'>, value: number | undefined): number {
    if (!value) return 0
    if (habit.kind === 'bool') return value > 0 ? 1 : 0
    return Math.min(1, value / (habit.target ?? 1))
}

/** Whether a block is on the schedule for a given day. */
export function isBlockOn(block: Pick<ScheduleBlock, 'weekdays' | 'oneOffDay'>, day: string): boolean {
    if (block.oneOffDay) return block.oneOffDay === day
    return block.weekdays?.includes(new Date(`${day}T12:00:00`).getDay()) ?? false
}

/**
 * How a goal is measured: by hand (current out of target), by books finished in a year, or by
 * how many recent weeks a habit was done on every day it was planned.
 */
export const GOAL_KINDS = ['manual', 'books', 'habit'] as const
export type GoalKind = (typeof GOAL_KINDS)[number]

/** How many weeks back a habit goal looks. */
export const GOAL_HABIT_WEEKS = 8

export interface Goal {
    id: string
    title: string
    kind: GoalKind
    /** manual and books: how much counts as reached */
    target: number | null
    /** manual: stored, moved by hand; books: counted from the library on read */
    current: number
    /** manual: what's counted (phases, km) */
    unit: string | null
    /** habit: the habit that drives it */
    habitId: string | null
    /** books: whose books count */
    year: number | null
    position: number
    createdAt: string
}
