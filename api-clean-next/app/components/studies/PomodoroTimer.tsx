'use client'

import { useMemo } from 'react'
import { StudyTopicData } from '@/app/hooks/useStudyTopics'
import { StudySessionData } from '@/app/hooks/useStudySessions'
import { usePomodoroTimer } from '@/app/hooks/usePomodoroTimer'
import { POMODORO_CYCLE, PHASE_LABEL } from '@/lib/pomodoroCycle'
import { PomodoroPhaseType } from '@/domain/PomodoroPhaseType'
import { computeTodayStats, formatMinutes } from '@/lib/studyStats'
import { Play, Pause, Square, Coffee, Brain, Clock, CalendarCheck2, Flame } from 'lucide-react'

function formatTime(totalSeconds: number) {
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

interface PomodoroTimerProps {
    topics: StudyTopicData[]
    sessions: StudySessionData[]
    timer: ReturnType<typeof usePomodoroTimer>
    pendingTopicId?: string
    onPendingTopicChange: (id: string) => void
}

export function PomodoroTimer({ topics, sessions, timer, pendingTopicId, onPendingTopicChange }: PomodoroTimerProps) {
    const { phase, phaseIndex, status, remainingSeconds, topicId, start, pause, resume, stop } = timer
    const isFocus = phase.type === PomodoroPhaseType.Focus
    const isIdle = status === 'idle'
    const isRunning = status === 'running'
    const activeTopic = topics.find(t => t.id === (isIdle ? pendingTopicId : topicId))

    const progress = 1 - remainingSeconds / (phase.minutes * 60)
    const today = useMemo(() => computeTodayStats(sessions), [sessions])

    return (
        <div className="relative rounded-2xl border border-border/60 bg-card p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Pomodoro
                </p>
                <div className="flex items-center gap-1.5">
                    {POMODORO_CYCLE.map((p, i) => (
                        <span
                            key={i}
                            title={`${PHASE_LABEL[p.type]} · ${p.minutes}min`}
                            className={`w-1.5 h-1.5 rounded-full transition-colors ${
                                i === phaseIndex && !isIdle
                                    ? 'bg-brand-accent'
                                    : i < phaseIndex
                                    ? 'bg-muted-foreground/50'
                                    : 'bg-muted'
                            }`}
                        />
                    ))}
                </div>
            </div>

            <div className="relative flex flex-col items-center gap-4">
                {/* ambient glow — only while a phase is actively running */}
                <div
                    className={`pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 w-72 h-72 blur-3xl transition-opacity duration-700 ${
                        isRunning ? 'opacity-40' : 'opacity-0'
                    }`}
                    style={{ background: 'radial-gradient(circle, var(--brand-accent) 0%, transparent 70%)' }}
                />

                <div className="relative flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    {isFocus ? <Brain className="w-4 h-4" /> : <Coffee className="w-4 h-4" />}
                    {PHASE_LABEL[phase.type]}
                </div>

                <div className="relative w-52 h-52 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="46" className="stroke-muted" strokeWidth="3.5" fill="none" />
                        <circle
                            cx="50" cy="50" r="46"
                            className={`${isRunning ? 'stroke-brand-accent pulse-glow' : 'stroke-muted-foreground/40'}`}
                            strokeWidth="3.5"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={2 * Math.PI * 46}
                            strokeDashoffset={2 * Math.PI * 46 * (1 - progress)}
                            style={{ transition: 'stroke-dashoffset 1s linear' }}
                        />
                    </svg>
                    <span className="absolute text-4xl font-bold tabular-nums">
                        {formatTime(remainingSeconds)}
                    </span>
                </div>

                <div className="relative w-full max-w-70">
                    <select
                        value={isIdle ? (pendingTopicId ?? '') : (topicId ?? '')}
                        onChange={(e) => onPendingTopicChange(e.target.value)}
                        disabled={!isIdle || topics.length === 0}
                        className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-70"
                    >
                        <option value="" disabled>
                            {topics.length === 0 ? 'Add a topic first' : 'Select a topic'}
                        </option>
                        {topics.map(t => (
                            <option key={t.id} value={t.id}>{t.title}</option>
                        ))}
                    </select>
                    {!isIdle && activeTopic && (
                        <p className="text-center text-xs text-muted-foreground mt-2 truncate">
                            Studying <span className="text-foreground font-medium">{activeTopic.title}</span>
                        </p>
                    )}
                </div>

                <div className="relative flex items-center gap-2">
                    {isIdle && (
                        <button
                            onClick={() => pendingTopicId && start(pendingTopicId)}
                            disabled={!pendingTopicId}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40"
                        >
                            <Play className="w-4 h-4" /> Start
                        </button>
                    )}

                    {status === 'running' && (
                        <>
                            <button
                                onClick={pause}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium border border-border hover:bg-muted/60 transition-colors"
                            >
                                <Pause className="w-4 h-4" /> Pause
                            </button>
                            <button
                                onClick={stop}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            >
                                <Square className="w-4 h-4" /> Stop
                            </button>
                        </>
                    )}

                    {status === 'paused' && (
                        <>
                            <button
                                onClick={resume}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                            >
                                <Play className="w-4 h-4" /> Resume
                            </button>
                            <button
                                onClick={stop}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            >
                                <Square className="w-4 h-4" /> Stop
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* TODAY strip */}
            <div className="relative grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-border/50">
                <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-1.5 text-success">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-sm font-semibold tabular-nums">
                            {today.todaySeconds > 0 ? formatMinutes(today.todaySeconds) : '—'}
                        </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Today</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-1.5 text-info">
                        <CalendarCheck2 className="w-3.5 h-3.5" />
                        <span className="text-sm font-semibold tabular-nums">{today.todayCount}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Sessions</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-1.5 text-brand-accent">
                        <Flame className="w-3.5 h-3.5" />
                        <span className="text-sm font-semibold tabular-nums">{today.streak}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Streak</span>
                </div>
            </div>
        </div>
    )
}
