import { StudySessionData } from '@/app/hooks/useStudySessions'
import { StudyTopicData } from '@/app/hooks/useStudyTopics'
import { StudyEpicData } from '@/app/hooks/useStudyEpics'
import { PomodoroPhaseType } from '@/domain/PomodoroPhaseType'
import { StudyTopicStatus } from '@/domain/StudyTopicStatus'
import { StudyEpicStatus } from '@/domain/StudyEpicStatus'

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

export interface EpicStats {
    epicId: string
    totalSeconds: number
    topicCount: number
    completedTopicCount: number
}

export function computeEpicStats(
    epics: StudyEpicData[],
    topics: StudyTopicData[],
    sessions: StudySessionData[]
): Map<string, EpicStats> {
    const stats = new Map<string, EpicStats>()

    for (const epic of epics) {
        if (!epic.id) continue
        stats.set(epic.id, { epicId: epic.id, totalSeconds: 0, topicCount: 0, completedTopicCount: 0 })
    }

    const epicIdByTopicId = new Map<string, string>()
    for (const topic of topics) {
        if (!topic.id || !topic.epicId) continue
        const entry = stats.get(topic.epicId)
        if (!entry) continue

        epicIdByTopicId.set(topic.id, topic.epicId)
        entry.topicCount += 1
        if (topic.status === StudyTopicStatus.Completed) {
            entry.completedTopicCount += 1
        }
    }

    for (const session of focusSessions(sessions)) {
        const epicId = epicIdByTopicId.get(session.topicId)
        if (!epicId) continue
        const entry = stats.get(epicId)
        if (!entry) continue

        entry.totalSeconds += session.actualSeconds
    }

    return stats
}

export interface OverviewStats {
    totalSeconds: number
    streak: number
    activeEpics: number
    completedTopics: number
}

export function computeOverviewStats(
    epics: StudyEpicData[],
    topics: StudyTopicData[],
    sessions: StudySessionData[]
): OverviewStats {
    const focus = focusSessions(sessions)

    let totalSeconds = 0
    const completedDayKeys = new Set<string>()
    for (const s of focus) {
        totalSeconds += s.actualSeconds
        if (s.completed) completedDayKeys.add(dayKey(new Date(s.startedAt)))
    }

    return {
        totalSeconds,
        streak: computeStreak(completedDayKeys),
        activeEpics: epics.filter(e => e.status === StudyEpicStatus.InProgress).length,
        completedTopics: topics.filter(t => t.status === StudyTopicStatus.Completed).length,
    }
}
