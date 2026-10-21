'use client'

import { useEffect, useState } from 'react'
import { Goal, GOAL_HABIT_WEEKS, GoalKind, Habit } from '@/domain/Habit'
import type { GoalInput } from '@/application/usecases/habitDrafts'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Segmented } from '@/app/components/layout/Segmented'
import { DialogActions, Field, fieldClass } from './FormBits'

const KIND_HINT: Record<GoalKind, string> = {
    manual: 'You move it yourself, one step at a time.',
    books: 'Counts the books you mark finished in the library that year.',
    habit: `Counts how many of the last ${GOAL_HABIT_WEEKS} weeks the habit was done on every day it was planned.`,
}

/** Create or change a goal. Archiving takes it off the list. */
export function GoalEditor({ open, goal, habits, onOpenChange, onSave, onArchive }: {
    open: boolean
    goal?: Goal
    habits: Habit[]
    onOpenChange: (open: boolean) => void
    onSave: (input: GoalInput, id?: string) => Promise<void>
    onArchive: (id: string) => Promise<void>
}) {
    const thisYear = new Date().getFullYear()
    const [title, setTitle] = useState('')
    const [kind, setKind] = useState<GoalKind>('manual')
    const [target, setTarget] = useState('')
    const [current, setCurrent] = useState('')
    const [unit, setUnit] = useState('')
    const [year, setYear] = useState(String(thisYear))
    const [habitId, setHabitId] = useState('')
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // start from the goal (or a blank one) every time the sheet opens
    useEffect(() => {
        if (!open) return
        setTitle(goal?.title ?? '')
        setKind(goal?.kind ?? 'manual')
        setTarget(goal?.target ? String(goal.target) : '')
        setCurrent(goal?.kind === 'manual' ? String(goal.current) : '0')
        setUnit(goal?.unit ?? '')
        setYear(String(goal?.year ?? thisYear))
        setHabitId(goal?.habitId ?? '')
        setError(null)
    }, [open, goal, thisYear])

    const submit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setError(null)
        try {
            await onSave({
                title,
                kind,
                target: kind === 'habit' ? null : Number(target),
                current: kind === 'manual' ? Number(current || 0) : 0,
                unit: kind === 'manual' ? unit : null,
                year: kind === 'books' ? Number(year) : null,
                habitId: kind === 'habit' ? habitId || null : null,
                position: goal?.position ?? 0,
            }, goal?.id)
            onOpenChange(false)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'The goal couldn’t be saved.')
        } finally {
            setSaving(false)
        }
    }

    const archive = async () => {
        if (!goal) return
        setSaving(true)
        try {
            await onArchive(goal.id)
            onOpenChange(false)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'The goal couldn’t be archived.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={o => !saving && onOpenChange(o)}>
            <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{goal ? 'Edit goal' : 'New goal'}</DialogTitle>
                    <DialogDescription>Where you want to be, and how you’ll know you’re getting there.</DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="grid gap-5">
                    <Field label="Goal">
                        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Finish the postgrad, read 15 books…" className={fieldClass} autoFocus={!goal} />
                    </Field>

                    <Field label="How it’s measured" hint={KIND_HINT[kind]}>
                        <Segmented id="goal-kind" label="How it’s measured" value={kind} onChange={setKind}
                            options={[{ value: 'manual', label: 'By hand' }, { value: 'books', label: 'Books' }, { value: 'habit', label: 'A habit' }]} />
                    </Field>

                    {kind === 'manual' && (
                        <div className="grid grid-cols-3 gap-3">
                            <Field label="Done so far">
                                <input inputMode="decimal" value={current} onChange={e => setCurrent(e.target.value)} placeholder="2" className={fieldClass} />
                            </Field>
                            <Field label="Target">
                                <input inputMode="decimal" value={target} onChange={e => setTarget(e.target.value)} placeholder="6" className={fieldClass} />
                            </Field>
                            <Field label="Unit">
                                <input value={unit} onChange={e => setUnit(e.target.value)} placeholder="phases" className={fieldClass} />
                            </Field>
                        </div>
                    )}

                    {kind === 'books' && (
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Books">
                                <input inputMode="numeric" value={target} onChange={e => setTarget(e.target.value)} placeholder="15" className={fieldClass} />
                            </Field>
                            <Field label="Year">
                                <input inputMode="numeric" value={year} onChange={e => setYear(e.target.value)} className={fieldClass} />
                            </Field>
                        </div>
                    )}

                    {kind === 'habit' && (
                        <Field label="Habit">
                            {habits.length === 0 ? (
                                <p className="text-sm text-muted-foreground">Add a habit first; this goal follows one.</p>
                            ) : (
                                <select value={habitId} onChange={e => setHabitId(e.target.value)} className={fieldClass}>
                                    <option value="" disabled>Pick a habit</option>
                                    {habits.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                                </select>
                            )}
                        </Field>
                    )}

                    {error && <p role="alert" className="text-sm text-destructive-text">{error}</p>}

                    <DialogActions
                        onArchive={goal ? archive : undefined}
                        archiveLabel="Archive"
                        saving={saving}
                        saveLabel={goal ? 'Save' : 'Add goal'}
                        onCancel={() => onOpenChange(false)}
                    />
                </form>
            </DialogContent>
        </Dialog>
    )
}
