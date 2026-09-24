'use client'

import { memo } from 'react'
import { motion } from 'motion/react'
import { StudyEpicData } from '@/app/hooks/useStudyEpics'
import { StudyEpicStatus } from '@/domain/StudyEpicStatus'
import { EpicStats } from '@/lib/studyStats'
import { formatMinutes } from '@/lib/studyStats'
import { epicColorClasses } from '@/lib/studyEpicColors'
import { RevealGroup, RevealItem } from '@/app/components/motion/Reveal'
import { Pencil, Trash2, Loader2, Clock, Layers, Plus, ListChecks, CheckCircle2 } from 'lucide-react'

const STATUS_LABEL: Record<StudyEpicStatus, string> = {
    [StudyEpicStatus.Planned]: 'Planned',
    [StudyEpicStatus.InProgress]: 'In progress',
    [StudyEpicStatus.Completed]: 'Completed',
    [StudyEpicStatus.OnHold]: 'On hold',
}

const STATUS_PILL: Record<StudyEpicStatus, string> = {
    [StudyEpicStatus.Planned]: 'border-border/60 bg-muted text-muted-foreground',
    [StudyEpicStatus.InProgress]: 'border-info/40 bg-info/10 text-info',
    [StudyEpicStatus.Completed]: 'border-success/40 bg-success/10 text-success',
    [StudyEpicStatus.OnHold]: 'border-warning/40 bg-warning/10 text-warning',
}

interface StudyEpicGridProps {
    epics: StudyEpicData[]
    statsByEpicId: Map<string, EpicStats>
    selectedEpicId?: string
    isAdmin?: boolean
    deletingId?: string
    onSelect: (id: string) => void
    onNew: () => void
    onEdit: (epic: StudyEpicData) => void
    onDelete: (id: string) => void
}

function StudyEpicGridComponent({
    epics,
    statsByEpicId,
    selectedEpicId,
    isAdmin,
    deletingId,
    onSelect,
    onNew,
    onEdit,
    onDelete,
}: StudyEpicGridProps) {
    if (epics.length === 0 && !isAdmin) {
        return null
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-muted-foreground" />
                    <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Epics</h2>
                </div>
                {isAdmin && (
                    <button
                        onClick={onNew}
                        className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
                    >
                        <Plus className="w-3.5 h-3.5" /> New epic
                    </button>
                )}
            </div>

            {epics.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/50 py-10 text-center">
                    <p className="text-sm text-muted-foreground">
                        Group topics under an initiative — like a course or program — to see total time invested.
                    </p>
                    <button
                        onClick={onNew}
                        className="mt-3 text-xs font-medium text-primary hover:underline"
                    >
                        Create your first epic
                    </button>
                </div>
            ) : (
                <RevealGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {epics.map((epic) => {
                        if (!epic.id) return null
                        const status = epic.status ?? StudyEpicStatus.Planned
                        const colors = epicColorClasses(epic.color)
                        const stats = statsByEpicId.get(epic.id)
                        const isSelected = selectedEpicId === epic.id
                        const topicCount = stats?.topicCount ?? 0
                        const completedCount = stats?.completedTopicCount ?? 0
                        const totalSeconds = stats?.totalSeconds ?? 0
                        const hasTarget = !!epic.targetSeconds && epic.targetSeconds > 0
                        const goalReached = hasTarget && totalSeconds >= epic.targetSeconds!
                        const progress = hasTarget
                            ? Math.min(1, totalSeconds / epic.targetSeconds!)
                            : topicCount > 0 ? completedCount / topicCount : 0

                        return (
                            <RevealItem key={epic.id}>
                                <motion.div
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => epic.id && onSelect(epic.id)}
                                    onKeyDown={(e) => {
                                        if ((e.key === 'Enter' || e.key === ' ') && epic.id) {
                                            e.preventDefault()
                                            onSelect(epic.id)
                                        }
                                    }}
                                    whileHover={{ y: -3 }}
                                    whileTap={{ scale: 0.98 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                                    className={`group relative flex flex-col h-full text-left rounded-2xl border bg-card p-5 gap-3 cursor-pointer transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                                        isSelected
                                            ? `border-transparent ring-2 ${colors.ring} shadow-md`
                                            : 'border-border/60 hover:border-primary/30 hover:shadow-sm'
                                    }`}
                                >
                                    {isAdmin && (
                                        <div
                                            role="group"
                                            onClick={(e) => e.stopPropagation()}
                                            onKeyDown={(e) => e.stopPropagation()}
                                            className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity"
                                        >
                                            <button
                                                onClick={() => onEdit(epic)}
                                                aria-label={`Edit ${epic.title}`}
                                                className="w-6 h-6 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                                            >
                                                <Pencil className="w-3 h-3" />
                                            </button>
                                            <button
                                                onClick={() => epic.id && onDelete(epic.id)}
                                                disabled={deletingId === epic.id}
                                                aria-label={`Delete ${epic.title}`}
                                                className="w-6 h-6 flex items-center justify-center rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                                            >
                                                {deletingId === epic.id
                                                    ? <Loader2 className="w-3 h-3 animate-spin" />
                                                    : <Trash2 className="w-3 h-3" />}
                                            </button>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 pr-12">
                                        <span className={`w-2 h-2 rounded-full shrink-0 ${colors.dot}`} />
                                        <h3 className="font-semibold text-base leading-snug line-clamp-1 text-foreground">
                                            {epic.title}
                                        </h3>
                                    </div>

                                    <span className={`self-start text-[10px] font-medium uppercase tracking-wide px-2 py-0.5 rounded-full border ${STATUS_PILL[status]}`}>
                                        {STATUS_LABEL[status]}
                                    </span>

                                    {epic.description && (
                                        <p className="text-xs text-muted-foreground line-clamp-2">{epic.description}</p>
                                    )}

                                    <div className="mt-auto pt-2 space-y-2.5">
                                        <div className="flex items-end justify-between">
                                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span className="text-[11px] uppercase tracking-wide">Invested</span>
                                            </div>
                                            <span className={`text-2xl font-semibold tabular-nums ${goalReached ? 'text-success' : colors.text}`}>
                                                {hasTarget
                                                    ? `${totalSeconds > 0 ? formatMinutes(totalSeconds) : '0min'} / ${formatMinutes(epic.targetSeconds!)}`
                                                    : totalSeconds > 0 ? formatMinutes(totalSeconds) : '—'}
                                            </span>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all ${goalReached ? 'bg-success' : colors.dot}`}
                                                    style={{ width: `${Math.round(progress * 100)}%` }}
                                                />
                                            </div>
                                            {goalReached ? (
                                                <div className="flex items-center gap-1 text-[11px] text-success font-medium">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    Goal reached
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                                    <ListChecks className="w-3 h-3" />
                                                    {completedCount}/{topicCount} topics done
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            </RevealItem>
                        )
                    })}
                </RevealGroup>
            )}
        </div>
    )
}

export const StudyEpicGrid = memo(StudyEpicGridComponent)
