'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { POMODORO_CYCLE } from '@/lib/pomodoroCycle'
import { StudySessionData } from '@/app/hooks/useStudySessions'

export type PomodoroStatus = 'idle' | 'running' | 'paused'
type CreateSessionFn = (session: Omit<StudySessionData, 'id'>) => Promise<unknown>

function playBeep() {
    try {
        const AudioContextClass = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext
        const ctx = new AudioContextClass()
        const oscillator = ctx.createOscillator()
        const gain = ctx.createGain()
        oscillator.type = 'sine'
        oscillator.frequency.value = 880
        gain.gain.setValueAtTime(0.001, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
        oscillator.connect(gain)
        gain.connect(ctx.destination)
        oscillator.start()
        oscillator.stop(ctx.currentTime + 0.5)
        oscillator.onended = () => ctx.close()
    } catch {
        // sound isn't critical — ignore if the browser blocks it
    }
}

/**
 * Runs the fixed 25 -> 5 -> 25 -> 5 -> 25 -> 15 cycle client-side.
 * Uses refs alongside state so the setInterval tick always reads fresh
 * values instead of closing over stale state.
 *
 * Takes the caller's `createSession` (from `useStudySessions`) instead of
 * calling the hook itself, so a logged session lands in the same state the
 * page renders its history from.
 */
export function usePomodoroTimer(createSession: CreateSessionFn) {
    const [topicId, setTopicId] = useState<string | undefined>(undefined)
    const [phaseIndex, setPhaseIndex] = useState(0)
    const [status, setStatus] = useState<PomodoroStatus>('idle')
    const [remainingSeconds, setRemainingSeconds] = useState(POMODORO_CYCLE[0].minutes * 60)
    const [elapsedSeconds, setElapsedSeconds] = useState(0)

    const remainingRef = useRef(remainingSeconds)
    const elapsedRef = useRef(elapsedSeconds)
    const phaseIndexRef = useRef(phaseIndex)
    const topicIdRef = useRef(topicId)
    const startedAtRef = useRef<Date | null>(null)

    useEffect(() => { topicIdRef.current = topicId }, [topicId])

    const logPhase = useCallback((actualSeconds: number, completed: boolean) => {
        const tId = topicIdRef.current
        const startedAt = startedAtRef.current
        if (!tId || !startedAt || actualSeconds <= 0) return

        const phase = POMODORO_CYCLE[phaseIndexRef.current]
        createSession({
            topicId: tId,
            phaseType: phase.type,
            plannedSeconds: phase.minutes * 60,
            actualSeconds,
            completed,
            startedAt: startedAt.toISOString(),
            endedAt: new Date().toISOString(),
        }).catch(() => {})
    }, [createSession])

    useEffect(() => {
        if (status !== 'running') return

        const interval = setInterval(() => {
            const nextRemaining = remainingRef.current - 1
            const nextElapsed = elapsedRef.current + 1
            elapsedRef.current = nextElapsed
            setElapsedSeconds(nextElapsed)

            if (nextRemaining <= 0) {
                logPhase(nextElapsed, true)
                playBeep()

                const nextIndex = (phaseIndexRef.current + 1) % POMODORO_CYCLE.length
                phaseIndexRef.current = nextIndex
                setPhaseIndex(nextIndex)

                elapsedRef.current = 0
                setElapsedSeconds(0)

                remainingRef.current = POMODORO_CYCLE[nextIndex].minutes * 60
                setRemainingSeconds(remainingRef.current)

                startedAtRef.current = new Date()
            } else {
                remainingRef.current = nextRemaining
                setRemainingSeconds(nextRemaining)
            }
        }, 1000)

        return () => clearInterval(interval)
    }, [status, logPhase])

    const resetToPhaseZero = useCallback(() => {
        phaseIndexRef.current = 0
        setPhaseIndex(0)

        const seconds = POMODORO_CYCLE[0].minutes * 60
        remainingRef.current = seconds
        setRemainingSeconds(seconds)

        elapsedRef.current = 0
        setElapsedSeconds(0)
    }, [])

    const start = useCallback((newTopicId: string) => {
        setTopicId(newTopicId)
        topicIdRef.current = newTopicId
        resetToPhaseZero()
        startedAtRef.current = new Date()
        setStatus('running')
    }, [resetToPhaseZero])

    const pause = useCallback(() => {
        setStatus(prev => (prev === 'running' ? 'paused' : prev))
    }, [])

    const resume = useCallback(() => {
        setStatus(prev => (prev === 'paused' ? 'running' : prev))
    }, [])

    const stop = useCallback(() => {
        setStatus(prev => {
            if (prev === 'running' || prev === 'paused') {
                logPhase(elapsedRef.current, false)
            }
            return 'idle'
        })
        resetToPhaseZero()
        startedAtRef.current = null
    }, [logPhase, resetToPhaseZero])

    return {
        topicId,
        phase: POMODORO_CYCLE[phaseIndex],
        phaseIndex,
        cycleLength: POMODORO_CYCLE.length,
        status,
        remainingSeconds,
        elapsedSeconds,
        start,
        pause,
        resume,
        stop,
    }
}
