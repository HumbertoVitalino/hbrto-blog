'use client'

import { StudyEpicData } from '@/app/hooks/useStudyEpics'
import { EpicStats, formatMinutes } from '@/lib/studyStats'
import { cn } from '@/lib/utils'
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react'

const RADIUS = 24
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/** Topics done over topics total, drawn as an Activity-style ring. */
function ProgressRing({ done, total }: { done: number; total: number }) {
    const fraction = total > 0 ? done / total : 0
    return (
        <svg viewBox="0 0 56 56" className="size-14 shrink-0" role="img" aria-label={`${done} of ${total} topics done`}>
            <circle cx="28" cy="28" r={RADIUS} fill="none" strokeWidth="7" className="stroke-muted" />
            <circle
                cx="28"
                cy="28"
                r={RADIUS}
                fill="none"
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={CIRCUMFERENCE * (1 - fraction)}
                className="origin-center -rotate-90 stroke-brand-accent transition-[stroke-dashoffset] duration-700 ease-(--ease-ios)"
            />
        </svg>
    )
}

export function EpicList({ epics, statsByEpicId, selectedEpicId, isAdmin, deletingId, onSelect, onNew, onEdit, onDelete }: {
    epics: StudyEpicData[]
    statsByEpicId: Map<string, EpicStats>
    selectedEpicId?: string
    isAdmin?: boolean
    deletingId?: string
    onSelect: (id: string) => void
    onNew: () => void
    onEdit: (epic: StudyEpicData) => void
    onDelete: (id: string) => void
}) {
    if (epics.length === 0 && !isAdmin) return null

    return (
        <section aria-labelledby="epics-heading">
            <div className="flex items-center justify-between gap-3">
                <h2 id="epics-heading" className="text-sm font-semibold">Epics</h2>
                {isAdmin && (
                    <button type="button" onClick={onNew} className="inline-flex items-center gap-1 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground">
                        <Plus className="size-3.5" /> New epic
                    </button>
                )}
            </div>

            {epics.length === 0 ? (
                <p className="mt-6 text-sm text-muted-foreground">
                    Group topics under an initiative, like a course, to see the time it has taken.
                </p>
            ) : (
                <div className="mt-7 grid gap-4 md:grid-cols-2">
                    {epics.map(epic => {
                        if (!epic.id) return null
                        const stats = statsByEpicId.get(epic.id)
                        const done = stats?.completedTopicCount ?? 0
                        const total = stats?.topicCount ?? 0
                        const seconds = stats?.totalSeconds ?? 0
                        const selected = selectedEpicId === epic.id
                        return (
                            <div
                                key={epic.id}
                                className={cn(
                                    'group relative flex items-center gap-5 rounded-2xl px-6 py-5 ring-1 transition-[box-shadow,background-color]',
                                    selected ? 'bg-brand-accent/5 ring-brand-accent/40' : 'ring-border hover:bg-muted/60',
                                )}
                            >
                                <ProgressRing done={done} total={total} />
                                <div className="min-w-0">
                                    <h3 className="text-[15px] font-semibold tracking-tight">
                                        <button
                                            type="button"
                                            aria-pressed={selected}
                                            onClick={() => onSelect(epic.id!)}
                                            className="text-left after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-ring"
                                        >
                                            {epic.title}
                                        </button>
                                    </h3>
                                    <p className="mt-0.5 text-[13px] tabular-nums text-muted-foreground">
                                        {seconds > 0 ? formatMinutes(seconds) : '0min'} invested
                                        {epic.targetSeconds ? <> of {formatMinutes(epic.targetSeconds)}</> : null}
                                        {' · '}{done} of {total} topics done
                                    </p>
                                </div>
                                {isAdmin && (
                                    <div className="relative z-10 ml-auto flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100">
                                        <button type="button" onClick={() => onEdit(epic)} aria-label={`Edit ${epic.title}`} className="grid size-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                                            <Pencil className="size-3.5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onDelete(epic.id!)}
                                            disabled={deletingId === epic.id}
                                            aria-label={`Delete ${epic.title}`}
                                            className="grid size-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-destructive-text disabled:opacity-40"
                                        >
                                            {deletingId === epic.id ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </section>
    )
}
