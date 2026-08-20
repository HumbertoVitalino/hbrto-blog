'use client'

import { memo } from 'react'
import { motion } from 'motion/react'
import { StudyTopicData } from '@/app/hooks/useStudyTopics'
import { StudyTopicStatus } from '@/domain/StudyTopicStatus'
import { StudyPriority } from '@/domain/StudyPriority'
import { Pencil, Trash2, Loader2, ExternalLink, Play, BookMarked } from 'lucide-react'

const STATUS_LABEL: Record<StudyTopicStatus, string> = {
    [StudyTopicStatus.Planned]: 'Planned',
    [StudyTopicStatus.InProgress]: 'In progress',
    [StudyTopicStatus.Completed]: 'Completed',
    [StudyTopicStatus.OnHold]: 'On hold',
}

const STATUS_DOT: Record<StudyTopicStatus, string> = {
    [StudyTopicStatus.Planned]: 'bg-muted-foreground/50',
    [StudyTopicStatus.InProgress]: 'bg-info',
    [StudyTopicStatus.Completed]: 'bg-success',
    [StudyTopicStatus.OnHold]: 'bg-warning',
}

const PRIORITY_LABEL: Record<StudyPriority, string> = {
    [StudyPriority.Low]: 'Low',
    [StudyPriority.Medium]: 'Medium',
    [StudyPriority.High]: 'High',
}

const PRIORITY_COLOR: Record<StudyPriority, string> = {
    [StudyPriority.Low]: 'text-muted-foreground',
    [StudyPriority.Medium]: 'text-info',
    [StudyPriority.High]: 'text-destructive',
}

// left-edge stripe used in compact/kanban cards, where the status dot lives in the column header instead
const PRIORITY_STRIPE: Record<StudyPriority, string> = {
    [StudyPriority.Low]: 'border-l-border',
    [StudyPriority.Medium]: 'border-l-info',
    [StudyPriority.High]: 'border-l-destructive',
}

interface StudyTopicCardProps {
    topic: StudyTopicData
    isAdmin?: boolean
    isDeleting?: boolean
    compact?: boolean
    onEdit?: (topic: StudyTopicData) => void
    onDelete?: (id: string) => void
    onStudy?: (id: string) => void
}

function StudyTopicCardComponent({ topic, isAdmin, isDeleting, compact, onEdit, onDelete, onStudy }: StudyTopicCardProps) {
    const status = topic.status ?? StudyTopicStatus.Planned
    const priority = topic.priority ?? StudyPriority.Medium

    if (compact) {
        return (
            <motion.div
                className={`group flex flex-col bg-card border border-l-2 border-border/60 ${PRIORITY_STRIPE[priority]} rounded-lg p-2.5 gap-1.5 hover:shadow-sm hover:border-primary/30 transition-shadow`}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            >
                <div className="flex items-start justify-between gap-1.5">
                    <h3 className="text-xs font-medium leading-snug line-clamp-2 text-foreground">{topic.title}</h3>
                    {topic.resourceUrl && (
                        <a
                            href={topic.resourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ExternalLink className="w-3 h-3" />
                        </a>
                    )}
                </div>

                {isAdmin && (
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => topic.id && onStudy?.(topic.id)}
                            title="Study this"
                            className="w-5.5 h-5.5 flex items-center justify-center rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        >
                            <Play className="w-3 h-3" />
                        </button>
                        <button
                            onClick={() => onEdit?.(topic)}
                            title="Edit"
                            className="w-5.5 h-5.5 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                            <Pencil className="w-3 h-3" />
                        </button>
                        <button
                            onClick={() => topic.id && onDelete?.(topic.id)}
                            disabled={isDeleting}
                            title="Delete"
                            className="w-5.5 h-5.5 flex items-center justify-center rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-40"
                        >
                            {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                        </button>
                    </div>
                )}
            </motion.div>
        )
    }

    return (
        <motion.div
            className="group flex flex-col h-full rounded-2xl border border-border/60 bg-card p-4 gap-3 hover:shadow-md hover:border-primary/30 transition-shadow"
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                    <BookMarked className="w-4 h-4 text-muted-foreground shrink-0" />
                    <h3 className="font-semibold text-sm leading-snug line-clamp-2">{topic.title}</h3>
                </div>
                <span className={`shrink-0 text-xs font-medium ${PRIORITY_COLOR[priority]}`}>
                    {PRIORITY_LABEL[priority]}
                </span>
            </div>

            {topic.description && (
                <p className="text-xs text-muted-foreground line-clamp-3">{topic.description}</p>
            )}

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-auto pt-2 border-t border-border/40">
                <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[status]}`} />
                {STATUS_LABEL[status]}
                {topic.resourceUrl && (
                    <a
                        href={topic.resourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                        <ExternalLink className="w-3 h-3" /> Resource
                    </a>
                )}
            </div>

            {isAdmin && (
                <div className="flex gap-1.5 pt-1">
                    <button
                        onClick={() => topic.id && onStudy?.(topic.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
                    >
                        <Play className="w-3 h-3" /> Study
                    </button>
                    <button
                        onClick={() => onEdit?.(topic)}
                        className="flex items-center justify-center px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground rounded-md hover:bg-muted/60 transition-colors"
                    >
                        <Pencil className="w-3 h-3" />
                    </button>
                    <button
                        onClick={() => topic.id && onDelete?.(topic.id)}
                        disabled={isDeleting}
                        className="flex items-center justify-center px-2.5 py-1.5 text-xs text-muted-foreground hover:text-destructive rounded-md hover:bg-destructive/10 transition-colors disabled:opacity-40"
                    >
                        {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                    </button>
                </div>
            )}
        </motion.div>
    )
}

export const StudyTopicCard = memo(StudyTopicCardComponent)
