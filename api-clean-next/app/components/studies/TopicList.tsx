'use client'

import { StudyTopicData } from '@/app/hooks/useStudyTopics'
import { StudyEpicData } from '@/app/hooks/useStudyEpics'
import { StudyTopicStatus } from '@/domain/StudyTopicStatus'
import { StudyPriority } from '@/domain/StudyPriority'
import { formatMinutes } from '@/lib/studyStats'
import { cn } from '@/lib/utils'
import { ExternalLink, Loader2, Pencil, Play, Trash2 } from 'lucide-react'

const ORDER: StudyTopicStatus[] = [StudyTopicStatus.InProgress, StudyTopicStatus.Planned, StudyTopicStatus.OnHold, StudyTopicStatus.Completed]

const STATUS_LABEL: Record<StudyTopicStatus, string> = {
    [StudyTopicStatus.Planned]: 'Planned',
    [StudyTopicStatus.InProgress]: 'In progress',
    [StudyTopicStatus.Completed]: 'Completed',
    [StudyTopicStatus.OnHold]: 'On hold',
}

/** The Reminders-style circle: empty when planned, a dot when in progress, checked when done. */
function StatusMark({ status }: { status: StudyTopicStatus }) {
    if (status === StudyTopicStatus.Completed) {
        return (
            <span aria-hidden className="mt-0.5 grid size-5.5 shrink-0 place-items-center rounded-full bg-success">
                <svg viewBox="0 0 16 16" fill="none" className="size-3.5 text-white">
                    <path d="m3.5 8.5 3 3 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </span>
        )
    }
    return (
        <span
            aria-hidden
            className={cn(
                'mt-0.5 grid size-5.5 shrink-0 place-items-center rounded-full ring-[1.5px] ring-inset',
                status === StudyTopicStatus.InProgress
                    ? 'ring-brand-accent'
                    : status === StudyTopicStatus.OnHold ? 'ring-muted-foreground/30' : 'ring-muted-foreground/60',
            )}
        >
            {status === StudyTopicStatus.InProgress && <span className="size-2.5 rounded-full bg-brand-accent" />}
        </span>
    )
}

export function sortTopics(topics: StudyTopicData[]) {
    return [...topics].sort((a, b) =>
        ORDER.indexOf(a.status ?? StudyTopicStatus.Planned) - ORDER.indexOf(b.status ?? StudyTopicStatus.Planned))
}

export function TopicList({ topics, epicById, secondsByTopicId, isAdmin, deletingId, onEdit, onDelete, onStudy }: {
    topics: StudyTopicData[]
    epicById: Map<string, StudyEpicData>
    secondsByTopicId: Map<string, number>
    isAdmin?: boolean
    deletingId?: string
    onEdit: (topic: StudyTopicData) => void
    onDelete: (id: string) => void
    onStudy: (id: string) => void
}) {
    const action = 'grid size-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'

    return (
        <ul className="divide-y divide-border">
            {sortTopics(topics).map(topic => {
                const status = topic.status ?? StudyTopicStatus.Planned
                const done = status === StudyTopicStatus.Completed
                const epic = topic.epicId ? epicById.get(topic.epicId) : undefined
                const seconds = topic.id ? secondsByTopicId.get(topic.id) ?? 0 : 0
                return (
                    <li key={topic.id} className="group flex items-start gap-3.5 py-3.5">
                        <StatusMark status={status} />
                        <div className="min-w-0 flex-1">
                            <p className={cn('text-[15px] font-medium leading-snug', done && 'text-muted-foreground')}>{topic.title}</p>
                            <p className="mt-0.5 flex flex-wrap gap-x-2.5 gap-y-0.5 text-[13px] tabular-nums text-muted-foreground">
                                <span className={status === StudyTopicStatus.InProgress ? 'font-medium text-brand-accent' : undefined}>{STATUS_LABEL[status]}</span>
                                {epic && <span>{epic.title}</span>}
                                {seconds > 0 && <span>{formatMinutes(seconds)}</span>}
                                {topic.priority === StudyPriority.High && !done && <span>High priority</span>}
                            </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-0.5">
                            {topic.resourceUrl && (
                                <a href={topic.resourceUrl} target="_blank" rel="noopener noreferrer" aria-label={`Open the resource for ${topic.title}`} className={action}>
                                    <ExternalLink className="size-3.5" />
                                </a>
                            )}
                            {isAdmin && (
                                <div className="flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100">
                                    {!done && topic.id && (
                                        <button type="button" onClick={() => onStudy(topic.id!)} aria-label={`Start a focus session on ${topic.title}`} className={cn(action, 'hover:text-brand-accent')}>
                                            <Play className="size-3.5" />
                                        </button>
                                    )}
                                    <button type="button" onClick={() => onEdit(topic)} aria-label={`Edit ${topic.title}`} className={action}>
                                        <Pencil className="size-3.5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => topic.id && onDelete(topic.id)}
                                        disabled={deletingId === topic.id}
                                        aria-label={`Delete ${topic.title}`}
                                        className={cn(action, 'hover:text-destructive-text disabled:opacity-40')}
                                    >
                                        {deletingId === topic.id ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                                    </button>
                                </div>
                            )}
                        </div>
                    </li>
                )
            })}
        </ul>
    )
}
