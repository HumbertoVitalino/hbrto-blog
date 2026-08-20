'use client'

import { useMemo } from 'react'
import { StudySessionData } from '@/app/hooks/useStudySessions'
import { StudyTopicData } from '@/app/hooks/useStudyTopics'
import { PomodoroPhaseType } from '@/domain/PomodoroPhaseType'
import { PHASE_LABEL } from '@/lib/pomodoroCycle'
import { formatMinutes, focusSessions } from '@/lib/studyStats'
import { Brain, Coffee } from 'lucide-react'

interface StudySessionHistoryProps {
    sessions: StudySessionData[]
    topics: StudyTopicData[]
    isLoading?: boolean
}

export function StudySessionHistory({ sessions, topics, isLoading }: StudySessionHistoryProps) {
    const topicTitleById = useMemo(() => {
        const map = new Map<string, string>()
        topics.forEach(t => t.id && map.set(t.id, t.title))
        return map
    }, [topics])

    const totals = useMemo(() => {
        const focus = focusSessions(sessions)
        const totalSeconds = focus.reduce((sum, s) => sum + s.actualSeconds, 0)
        return { totalSeconds, count: focus.length }
    }, [sessions])

    const recent = sessions.slice(0, 12)

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <div className="h-5 w-5 rounded-full border border-muted border-t-foreground animate-spin" />
            </div>
        )
    }

    if (sessions.length === 0) {
        return (
            <div className="text-center py-14 border border-dashed border-border/50 rounded-2xl">
                <p className="text-sm text-muted-foreground">No study sessions logged yet.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground tabular-nums">{formatMinutes(totals.totalSeconds)}</span>
                {' '}total focus time across{' '}
                <span className="font-semibold text-foreground tabular-nums">{totals.count}</span>
                {' '}sessions
            </p>

            <div className="divide-y divide-border/50 border border-border/60 rounded-2xl overflow-hidden bg-card">
                {recent.map((session) => {
                    const isFocus = session.phaseType === PomodoroPhaseType.Focus
                    return (
                        <div key={session.id} className="flex items-center gap-3 px-4 py-3">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                                isFocus ? 'bg-info/10' : 'bg-warning/10'
                            }`}>
                                {isFocus
                                    ? <Brain className="w-3.5 h-3.5 text-info" />
                                    : <Coffee className="w-3.5 h-3.5 text-warning" />
                                }
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate">
                                    {topicTitleById.get(session.topicId) ?? 'Untitled topic'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {PHASE_LABEL[session.phaseType]} · {new Date(session.startedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </p>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="text-sm font-medium tabular-nums">{formatMinutes(session.actualSeconds)}</p>
                                {!session.completed && (
                                    <p className="text-xs text-muted-foreground">stopped early</p>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
