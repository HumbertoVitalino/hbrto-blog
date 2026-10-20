'use client'

import { useMemo } from 'react'
import { StudyTopicData } from '@/app/hooks/useStudyTopics'
import { StudyEpicData } from '@/app/hooks/useStudyEpics'
import { StudySessionData } from '@/app/hooks/useStudySessions'
import { usePomodoroTimer } from '@/app/hooks/usePomodoroTimer'
import { POMODORO_CYCLE, PHASE_LABEL } from '@/lib/pomodoroCycle'
import { PomodoroPhaseType } from '@/domain/PomodoroPhaseType'
import { computeTodayStats, formatMinutes } from '@/lib/studyStats'
import { cn } from '@/lib/utils'

function formatTime(totalSeconds: number) {
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

const RADIUS = 112
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const FOCUS_ROUNDS = POMODORO_CYCLE.filter(p => p.type === PomodoroPhaseType.Focus).length

interface PomodoroTimerProps {
    topics: StudyTopicData[]
    epics: StudyEpicData[]
    sessions: StudySessionData[]
    timer: ReturnType<typeof usePomodoroTimer>
    pendingTopicId?: string
    onPendingTopicChange: (id: string) => void
}

// Clock-app round buttons: a ring of the button's own colour, separated from the fill by the card colour
const round = 'grid size-18 place-items-center rounded-full text-sm font-medium shadow-[0_0_0_3px_var(--card),0_0_0_4.5px_currentColor] transition-[transform,opacity] duration-100 ease-out active:scale-[0.96] disabled:opacity-40'

/** The focus timer as the Clock app draws one: a ring that empties, a thin readout, two round buttons. */
export function PomodoroTimer({ topics, epics, sessions, timer, pendingTopicId, onPendingTopicChange }: PomodoroTimerProps) {
    const { phase, phaseIndex, status, remainingSeconds, topicId, start, pause, resume, stop } = timer
    const isIdle = status === 'idle'
    const activeTopic = topics.find(t => t.id === (isIdle ? pendingTopicId : topicId))
    const progress = 1 - remainingSeconds / (phase.minutes * 60)
    const today = useMemo(() => computeTodayStats(sessions), [sessions])

    // which focus round of the cycle this is (breaks count toward the round they follow)
    const round_ = POMODORO_CYCLE.slice(0, phaseIndex + 1).filter(p => p.type === PomodoroPhaseType.Focus).length || 1

    const topicsByEpic = useMemo(() => {
        const epicTitleById = new Map(epics.filter(e => e.id).map(e => [e.id as string, e.title]))
        const groups = new Map<string, StudyTopicData[]>()
        for (const topic of topics) {
            const label = (topic.epicId && epicTitleById.get(topic.epicId)) || 'No epic'
            if (!groups.has(label)) groups.set(label, [])
            groups.get(label)!.push(topic)
        }
        return groups
    }, [topics, epics])

    return (
        <div className="raised-card grid justify-items-center gap-6 px-6 py-8">
            <div className="relative size-60">
                <svg viewBox="0 0 240 240" className="size-full" aria-hidden>
                    <circle cx="120" cy="120" r={RADIUS} fill="none" strokeWidth="8" className="stroke-muted" />
                    <circle
                        cx="120"
                        cy="120"
                        r={RADIUS}
                        fill="none"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={CIRCUMFERENCE}
                        strokeDashoffset={CIRCUMFERENCE * progress}
                        className={cn('origin-center -rotate-90 transition-[stroke-dashoffset] duration-1000 ease-linear', isIdle ? 'stroke-muted-foreground/40' : 'stroke-brand-accent')}
                    />
                </svg>
                <div className="absolute inset-0 grid place-content-center text-center" aria-live="polite">
                    <p className="text-[3.25rem] font-light leading-none tracking-tight tabular-nums">
                        <span className="sr-only">Time left: </span>{formatTime(remainingSeconds)}
                    </p>
                    <p className="mt-2.5 text-[13px] text-muted-foreground">
                        {PHASE_LABEL[phase.type]}{phase.type === PomodoroPhaseType.Focus && ` · ${round_} of ${FOCUS_ROUNDS}`}
                    </p>
                </div>
            </div>

            {isIdle ? (
                <label className="w-full max-w-72">
                    <span className="sr-only">Topic for this session</span>
                    <select
                        value={pendingTopicId ?? ''}
                        onChange={(e) => onPendingTopicChange(e.target.value)}
                        disabled={topics.length === 0}
                        className="w-full rounded-full bg-muted px-4 py-2 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-sm"
                    >
                        <option value="" disabled>{topics.length === 0 ? 'Add a topic first' : 'Choose a topic'}</option>
                        {[...topicsByEpic.entries()].map(([label, group]) => (
                            <optgroup key={label} label={label}>
                                {group.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                            </optgroup>
                        ))}
                    </select>
                </label>
            ) : (
                <p className="max-w-full truncate text-[13px] text-muted-foreground">
                    On <span className="font-medium text-foreground">{activeTopic?.title ?? 'a topic'}</span>
                </p>
            )}

            <div className="flex gap-12">
                <button type="button" onClick={stop} disabled={isIdle} className={cn(round, 'bg-muted text-muted-foreground')}>
                    Cancel
                </button>
                {isIdle ? (
                    <button type="button" onClick={() => pendingTopicId && start(pendingTopicId)} disabled={!pendingTopicId} className={cn(round, 'bg-brand-accent/15 text-brand-accent')}>
                        Start
                    </button>
                ) : status === 'running' ? (
                    <button type="button" onClick={pause} className={cn(round, 'bg-brand-accent/15 text-brand-accent')}>
                        Pause
                    </button>
                ) : (
                    <button type="button" onClick={resume} className={cn(round, 'bg-brand-accent/15 text-brand-accent')}>
                        Resume
                    </button>
                )}
            </div>

            <dl className="flex gap-8 border-t border-border pt-5 text-center text-[13px] text-muted-foreground">
                <div><dt>Today</dt><dd className="mt-0.5 text-base font-semibold tabular-nums text-foreground">{today.todaySeconds > 0 ? formatMinutes(today.todaySeconds) : '—'}</dd></div>
                <div><dt>Sessions</dt><dd className="mt-0.5 text-base font-semibold tabular-nums text-foreground">{today.todayCount}</dd></div>
                <div><dt>Day streak</dt><dd className="mt-0.5 text-base font-semibold tabular-nums text-foreground">{today.streak}</dd></div>
            </dl>
        </div>
    )
}
