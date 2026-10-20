'use client'

import { useEffect, useState } from 'react'
import { AutoSource, Habit, LifeArea, TimeOfDay } from '@/domain/Habit'
import type { HabitInput } from '@/application/usecases/habitDrafts'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Segmented } from '@/app/components/layout/Segmented'
import { AreaPicker, DialogActions, Field, fieldClass, WeekdayPicker } from './FormBits'

type Repeat = 'daily' | 'days'
type Auto = 'none' | AutoSource

/** Create or change a habit. Archiving keeps its history in past weeks. */
export function HabitEditor({ open, habit, onOpenChange, onSave, onArchive }: {
    open: boolean
    habit?: Habit
    onOpenChange: (open: boolean) => void
    onSave: (input: HabitInput, id?: string) => Promise<void>
    onArchive: (id: string) => Promise<void>
}) {
    const [name, setName] = useState('')
    const [area, setArea] = useState<LifeArea | null>(null)
    const [kind, setKind] = useState<'bool' | 'qty'>('bool')
    const [target, setTarget] = useState('')
    const [unit, setUnit] = useState('')
    const [step, setStep] = useState('')
    const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('anytime')
    const [repeat, setRepeat] = useState<Repeat>('daily')
    const [days, setDays] = useState<number[]>([1, 3, 5])
    const [auto, setAuto] = useState<Auto>('none')
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // start from the habit (or a blank one) every time the sheet opens
    useEffect(() => {
        if (!open) return
        setName(habit?.name ?? '')
        setArea(habit?.area ?? null)
        setKind(habit?.kind ?? 'bool')
        setTarget(habit?.target ? String(habit.target) : '')
        setUnit(habit?.unit ?? '')
        setStep(habit?.step ? String(habit.step) : '')
        setTimeOfDay(habit?.timeOfDay ?? 'anytime')
        setRepeat(habit?.days ? 'days' : 'daily')
        setDays(habit?.days ?? [1, 3, 5])
        setAuto(habit?.autoSource ?? 'none')
        setError(null)
    }, [open, habit])

    const submit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!area) return setError('Pick the area this habit feeds.')
        setSaving(true)
        setError(null)
        try {
            await onSave({
                name,
                area,
                kind,
                target: kind === 'qty' ? Number(target) : null,
                unit: kind === 'qty' ? unit : null,
                step: kind === 'qty' && step ? Number(step) : null,
                timeOfDay,
                days: repeat === 'daily' ? null : days,
                autoSource: auto === 'none' ? null : auto,
                position: habit?.position ?? 0,
            }, habit?.id)
            onOpenChange(false)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'The habit couldn’t be saved.')
        } finally {
            setSaving(false)
        }
    }

    const archive = async () => {
        if (!habit) return
        setSaving(true)
        try {
            await onArchive(habit.id)
            onOpenChange(false)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'The habit couldn’t be archived.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={o => !saving && onOpenChange(o)}>
            <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{habit ? 'Edit habit' : 'New habit'}</DialogTitle>
                    <DialogDescription>Small and specific beats ambitious. You can change it any time.</DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="grid gap-5">
                    <Field label="Name">
                        <input value={name} onChange={e => setName(e.target.value)} placeholder="Read, work out, drink water…" className={fieldClass} autoFocus={!habit} />
                    </Field>

                    <Field label="Area">
                        <AreaPicker value={area} onChange={setArea} />
                    </Field>

                    <Field label="How it’s measured">
                        <Segmented id="habit-kind" label="How it’s measured" value={kind} onChange={setKind}
                            options={[{ value: 'bool', label: 'Done or not' }, { value: 'qty', label: 'An amount' }]} />
                    </Field>

                    {kind === 'qty' && (
                        <div className="grid grid-cols-3 gap-3">
                            <Field label="Target">
                                <input inputMode="decimal" value={target} onChange={e => setTarget(e.target.value)} placeholder="20" className={fieldClass} />
                            </Field>
                            <Field label="Unit">
                                <input value={unit} onChange={e => setUnit(e.target.value)} placeholder="pages" className={fieldClass} />
                            </Field>
                            <Field label="Per tap">
                                <input inputMode="decimal" value={step} onChange={e => setStep(e.target.value)} placeholder="5" className={fieldClass} />
                            </Field>
                        </div>
                    )}

                    <Field label="When">
                        <Segmented id="habit-when" label="When" value={timeOfDay} onChange={setTimeOfDay}
                            options={[{ value: 'morning', label: 'Morning' }, { value: 'anytime', label: 'Anytime' }, { value: 'evening', label: 'Evening' }]} />
                    </Field>

                    <Field label="Repeat">
                        <Segmented id="habit-repeat" label="Repeat" value={repeat} onChange={setRepeat}
                            options={[{ value: 'daily', label: 'Every day' }, { value: 'days', label: 'Some days' }]} />
                        {repeat === 'days' && <div className="mt-2"><WeekdayPicker value={days} onChange={setDays} /></div>}
                    </Field>

                    <Field label="Fill in automatically" hint="Counted from the rest of the site, so there’s nothing to tap.">
                        <Segmented id="habit-auto" label="Fill in automatically" value={auto} onChange={setAuto}
                            options={[{ value: 'none', label: 'No' }, { value: 'study_focus', label: 'Focus in Studies' }, { value: 'note_published', label: 'Note published' }]} />
                    </Field>

                    {error && <p role="alert" className="text-sm text-destructive-text">{error}</p>}

                    <DialogActions
                        onArchive={habit ? archive : undefined}
                        archiveLabel="Archive"
                        saving={saving}
                        saveLabel={habit ? 'Save' : 'Add habit'}
                        onCancel={() => onOpenChange(false)}
                    />
                </form>
            </DialogContent>
        </Dialog>
    )
}
