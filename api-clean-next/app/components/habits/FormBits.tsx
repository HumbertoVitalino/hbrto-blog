'use client'

import { LIFE_AREAS, LIFE_AREA_LABEL, LifeArea } from '@/domain/Habit'
import { cn } from '@/lib/utils'

const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0]
const WEEKDAY_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const WEEKDAY_NAME = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export const fieldClass = 'w-full rounded-xl bg-muted px-3 py-2 text-base outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring sm:text-sm'

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
    return (
        // content-start: in a row of fields, a taller neighbour never stretches this one's input
        <div className="grid content-start gap-1.5">
            <span className="text-[13px] font-semibold">{label}</span>
            {children}
            {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
        </div>
    )
}

export function AreaPicker({ value, onChange }: { value: LifeArea | null; onChange: (area: LifeArea) => void }) {
    return (
        <div role="radiogroup" aria-label="Area" className="flex flex-wrap gap-1.5">
            {LIFE_AREAS.map(area => (
                <button
                    key={area}
                    type="button"
                    role="radio"
                    aria-checked={value === area}
                    onClick={() => onChange(area)}
                    className={cn(
                        'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium ring-1 ring-inset transition-[background-color,transform] duration-100 active:scale-[0.97]',
                        value === area ? 'bg-card text-foreground ring-foreground/30 shadow-sm' : 'text-muted-foreground ring-border',
                    )}
                >
                    <span aria-hidden className="size-2 rounded-full" style={{ background: `var(--area-${area})` }} />
                    {LIFE_AREA_LABEL[area]}
                </button>
            ))}
        </div>
    )
}

/** Monday-first weekday toggles; values use 0 = Sunday like the database. */
export function WeekdayPicker({ value, onChange }: { value: number[]; onChange: (days: number[]) => void }) {
    return (
        <div role="group" aria-label="Weekdays" className="flex gap-1.5">
            {WEEKDAY_ORDER.map(d => {
                const on = value.includes(d)
                return (
                    <button
                        key={d}
                        type="button"
                        aria-pressed={on}
                        aria-label={WEEKDAY_NAME[d]}
                        onClick={() => onChange(on ? value.filter(x => x !== d) : [...value, d].sort())}
                        className={cn(
                            'grid size-9 place-items-center rounded-full text-[13px] font-semibold transition-[background-color,color,transform] duration-100 active:scale-90',
                            on ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                        )}
                    >
                        {WEEKDAY_SHORT[d]}
                    </button>
                )
            })}
        </div>
    )
}

export function DialogActions({ onArchive, archiveLabel, saving, saveLabel, onCancel }: {
    onArchive?: () => void
    archiveLabel: string
    saving: boolean
    saveLabel: string
    onCancel: () => void
}) {
    return (
        <div className="flex items-center gap-2 pt-2">
            {onArchive && (
                <button type="button" onClick={onArchive} disabled={saving} className="rounded-full px-3 py-2 text-sm font-medium text-destructive-text transition-colors hover:bg-destructive/10 disabled:opacity-50">
                    {archiveLabel}
                </button>
            )}
            <div className="ml-auto flex gap-2">
                <button type="button" onClick={onCancel} disabled={saving} className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50">
                    Cancel
                </button>
                <button type="submit" disabled={saving} className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-[opacity,transform] duration-100 hover:opacity-90 active:scale-[0.97] disabled:opacity-60">
                    {saving ? 'Saving…' : saveLabel}
                </button>
            </div>
        </div>
    )
}
