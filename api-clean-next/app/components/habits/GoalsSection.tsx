'use client'

import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { Goal, GOAL_HABIT_WEEKS, Habit, HabitLog } from '@/domain/Habit'
import type { GoalInput } from '@/application/usecases/habitDrafts'
import { weeksHit } from '@/lib/habitStats'
import { Ring } from './Ring'
import { GoalEditor } from './GoalEditor'

const count = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 })

/** How far along a goal is (0 to 1) and a line saying it in words. */
function progressOf(goal: Goal, habits: Habit[], index: Map<string, HabitLog>, currentWeek: string, today: string): { value: number; text: string } {
    if (goal.kind === 'habit') {
        const habit = habits.find(h => h.id === goal.habitId)
        if (!habit) return { value: 0, text: 'Its habit was archived. Pick another one.' }
        const { hit, of } = weeksHit(habit, index, currentWeek, GOAL_HABIT_WEEKS)
        return of === 0
            ? { value: 0, text: `No full week of “${habit.name}” yet` }
            : { value: hit / of, text: `Hit in ${hit} of the last ${of} ${of === 1 ? 'week' : 'weeks'} · ${habit.name}` }
    }

    const target = goal.target ?? 1
    const value = goal.current / target
    if (goal.kind === 'manual') {
        return { value, text: `${count.format(goal.current)} of ${count.format(target)}${goal.unit ? ` ${goal.unit}` : ''}` }
    }

    // books in a year
    const year = goal.year ?? 0
    const thisYear = Number(today.slice(0, 4))
    const finished = `${goal.current} of ${count.format(target)} finished`
    if (goal.current >= target) return { value, text: `Reached · ${finished}` }
    if (year > thisYear) return { value: 0, text: `Counts from January ${year}` }
    if (year < thisYear) return { value, text: `${year} ended at ${goal.current} of ${count.format(target)}` }
    const start = new Date(`${year}-01-01T12:00:00`).getTime()
    const daysIn = (new Date(`${year + 1}-01-01T12:00:00`).getTime() - start) / 864e5
    const dayOfYear = Math.max(1, Math.round((new Date(`${today}T12:00:00`).getTime() - start) / 864e5) + 1)
    const pace = Math.floor((goal.current / dayOfYear) * daysIn)
    return { value, text: `${finished} · on pace for ${pace}` }
}

/** Where I'm going: each goal as a ring, with the line that explains it. */
export function GoalsSection({ goals, habits, index, currentWeek, today, onSave, onArchive, onProgress }: {
    goals: Goal[]
    habits: Habit[]
    index: Map<string, HabitLog>
    currentWeek: string
    today: string
    onSave: (input: GoalInput, id?: string) => Promise<void>
    onArchive: (id: string) => Promise<void>
    onProgress: (id: string, current: number) => void
}) {
    const [editing, setEditing] = useState<Goal | 'new' | null>(null)

    return (
        <section aria-labelledby="goals-heading">
            <div className="mb-2.5 flex items-baseline justify-between">
                <h2 id="goals-heading" className="text-sm font-semibold">Where I’m going</h2>
                {goals.length > 0 && (
                    <button type="button" onClick={() => setEditing('new')} className="text-[13px] font-medium text-brand-accent hover:underline">Add a goal</button>
                )}
            </div>

            {goals.length === 0 ? (
                <div className="rounded-2xl px-5 py-7 text-center ring-1 ring-border">
                    <p className="text-[15px] font-semibold">Where do you want to be?</p>
                    <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">A goal gives the habits a reason. It can follow your books, a habit, or steps you move yourself.</p>
                    <button type="button" onClick={() => setEditing('new')} className="mt-4 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground active:scale-[0.97]">
                        Add a goal
                    </button>
                </div>
            ) : (
                <ul className="divide-y divide-border rounded-2xl bg-card px-5 ring-1 ring-border">
                    {goals.map(goal => {
                        const { value, text } = progressOf(goal, habits, index, currentWeek, today)
                        return (
                            <li key={goal.id} className="flex items-center gap-3.5 py-3.5">
                                <Ring value={value} size={44} stroke={6}>
                                    <span className="text-[11px] font-semibold tabular-nums">{Math.min(100, Math.round(value * 100))}%</span>
                                </Ring>
                                <div className="min-w-0 flex-1">
                                    <button type="button" onClick={() => setEditing(goal)} className="block max-w-full text-left text-sm font-semibold leading-snug text-pretty">
                                        {goal.title}
                                    </button>
                                    <p className="mt-0.5 text-xs text-muted-foreground text-pretty">{text}</p>
                                </div>
                                {goal.kind === 'manual' && (
                                    <div className="flex shrink-0 gap-1.5">
                                        <button type="button" onClick={() => onProgress(goal.id, Math.max(0, goal.current - 1))} disabled={goal.current <= 0} aria-label={`One less for ${goal.title}`} className="grid size-7.5 place-items-center rounded-full bg-muted transition-transform duration-100 active:scale-90 disabled:opacity-40">
                                            <Minus className="size-3.5" />
                                        </button>
                                        <button type="button" onClick={() => onProgress(goal.id, goal.current + 1)} aria-label={`One more for ${goal.title}`} className="grid size-7.5 place-items-center rounded-full bg-muted transition-transform duration-100 active:scale-90">
                                            <Plus className="size-3.5" />
                                        </button>
                                    </div>
                                )}
                            </li>
                        )
                    })}
                </ul>
            )}

            <GoalEditor
                open={editing !== null}
                goal={editing === 'new' || editing === null ? undefined : editing}
                habits={habits}
                onOpenChange={open => !open && setEditing(null)}
                onSave={onSave}
                onArchive={onArchive}
            />
        </section>
    )
}
