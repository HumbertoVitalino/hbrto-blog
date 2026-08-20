import { StudySessionData } from '@/app/hooks/useStudySessions'
import { PomodoroPhaseType } from '@/domain/PomodoroPhaseType'

export function dayKey(date: Date) {
    return date.toISOString().slice(0, 10)
}

export function formatMinutes(seconds: number) {
    const minutes = Math.round(seconds / 60)
    if (minutes < 60) return `${minutes}min`
    const hours = Math.floor(minutes / 60)
    const rest = minutes % 60
    return rest ? `${hours}h ${rest}min` : `${hours}h`
}

export function computeStreak(focusDayKeys: Set<string>) {
    let streak = 0
    const cursor = new Date()
    // if nothing logged today yet, the streak still counts from yesterday backward
    if (!focusDayKeys.has(dayKey(cursor))) {
        cursor.setDate(cursor.getDate() - 1)
    }
    while (focusDayKeys.has(dayKey(cursor))) {
        streak += 1
        cursor.setDate(cursor.getDate() - 1)
    }
    return streak
}

export function focusSessions(sessions: StudySessionData[]) {
    return sessions.filter(s => s.phaseType === PomodoroPhaseType.Focus)
}

export interface TodayStats {
    todaySeconds: number
    todayCount: number
    streak: number
}

export function computeTodayStats(sessions: StudySessionData[]): TodayStats {
    const focus = focusSessions(sessions)
    const todayKey = dayKey(new Date())

    let todaySeconds = 0
    let todayCount = 0
    const completedDayKeys = new Set<string>()

    for (const s of focus) {
        const key = dayKey(new Date(s.startedAt))
        if (key === todayKey) {
            todaySeconds += s.actualSeconds
            todayCount += 1
        }
        if (s.completed) completedDayKeys.add(key)
    }

    return {
        todaySeconds,
        todayCount,
        streak: computeStreak(completedDayKeys),
    }
}
