'use client'

import { useEffect, useState } from 'react'
import { LifeArea, ScheduleBlock } from '@/domain/Habit'
import type { BlockInput } from '@/application/usecases/habitDrafts'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Segmented } from '@/app/components/layout/Segmented'
import { AreaPicker, DialogActions, Field, fieldClass, WeekdayPicker } from './FormBits'

type When = 'repeats' | 'once'

/** Create or change a block of time on the schedule: one that repeats on weekdays, or a one-off. */
export function BlockEditor({ open, block, defaultDay, onOpenChange, onSave, onArchive }: {
    open: boolean
    block?: ScheduleBlock
    /** the day a one-off block lands on by default */
    defaultDay: string
    onOpenChange: (open: boolean) => void
    onSave: (input: BlockInput, id?: string) => Promise<void>
    onArchive: (id: string) => Promise<void>
}) {
    const [title, setTitle] = useState('')
    const [area, setArea] = useState<LifeArea | null>(null)
    const [startsAt, setStartsAt] = useState('09:00')
    const [endsAt, setEndsAt] = useState('10:00')
    const [when, setWhen] = useState<When>('repeats')
    const [weekdays, setWeekdays] = useState<number[]>([1, 2, 3, 4, 5])
    const [day, setDay] = useState(defaultDay)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!open) return
        setTitle(block?.title ?? '')
        setArea(block?.area ?? null)
        setStartsAt(block?.startsAt ?? '09:00')
        setEndsAt(block?.endsAt ?? '10:00')
        setWhen(block?.oneOffDay ? 'once' : 'repeats')
        setWeekdays(block?.weekdays ?? [1, 2, 3, 4, 5])
        setDay(block?.oneOffDay ?? defaultDay)
        setError(null)
    }, [open, block, defaultDay])

    const submit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!area) return setError('Pick the area this time goes to.')
        setSaving(true)
        setError(null)
        try {
            await onSave({
                title,
                area,
                startsAt,
                endsAt,
                weekdays: when === 'repeats' ? weekdays : null,
                oneOffDay: when === 'once' ? day : null,
            }, block?.id)
            onOpenChange(false)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'The block couldn’t be saved.')
        } finally {
            setSaving(false)
        }
    }

    const archive = async () => {
        if (!block) return
        setSaving(true)
        try {
            await onArchive(block.id)
            onOpenChange(false)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'The block couldn’t be removed.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={o => !saving && onOpenChange(o)}>
            <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{block ? 'Edit block' : 'New block'}</DialogTitle>
                    <DialogDescription>A stretch of the day you plan for, so you can see how it actually went.</DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="grid gap-5">
                    <Field label="Title">
                        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Gym, deep work, postgrad…" className={fieldClass} autoFocus={!block} />
                    </Field>

                    <Field label="Area">
                        <AreaPicker value={area} onChange={setArea} />
                    </Field>

                    {/* the hint is about the pair, so it sits under both and the two fields stay level */}
                    <div className="grid gap-1.5">
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Starts">
                                <input type="time" value={startsAt} onChange={e => setStartsAt(e.target.value)} className={fieldClass} />
                            </Field>
                            <Field label="Ends">
                                <input type="time" value={endsAt} onChange={e => setEndsAt(e.target.value)} className={fieldClass} />
                            </Field>
                        </div>
                        <span className="text-xs text-muted-foreground">An end earlier than the start runs past midnight, like sleep.</span>
                    </div>

                    <Field label="Happens">
                        <Segmented id="block-when" label="Happens" value={when} onChange={setWhen}
                            options={[{ value: 'repeats', label: 'Every week' }, { value: 'once', label: 'Just once' }]} />
                        <div className="mt-2">
                            {when === 'repeats'
                                ? <WeekdayPicker value={weekdays} onChange={setWeekdays} />
                                : <input type="date" value={day} onChange={e => setDay(e.target.value)} className={fieldClass} aria-label="Day" />}
                        </div>
                    </Field>

                    {error && <p role="alert" className="text-sm text-destructive-text">{error}</p>}

                    <DialogActions
                        onArchive={block ? archive : undefined}
                        archiveLabel="Remove"
                        saving={saving}
                        saveLabel={block ? 'Save' : 'Add block'}
                        onCancel={() => onOpenChange(false)}
                    />
                </form>
            </DialogContent>
        </Dialog>
    )
}
