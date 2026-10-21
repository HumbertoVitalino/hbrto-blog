'use client'

import { useMemo } from 'react'
import { useHabitTracker } from '@/app/hooks/useHabitTracker'
import { todayKey, weekDays, weekStartOf } from '@/lib/habitDates'
import { Segmented } from '@/app/components/layout/Segmented'
import { TodayView } from './TodayView'
import { WeekView } from './WeekView'
import { HabitsView } from './HabitsView'

export type TrackerView = 'today' | 'week' | 'habits'

export const TRACKER_VIEW_TITLE: Record<TrackerView, string> = { today: 'Today', week: 'This week', habits: 'Habits' }

const VIEWS: { value: TrackerView; label: string }[] = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'Week' },
    { value: 'habits', label: 'Habits' },
]

/** The habit tracker inside the admin. Holds the data once so every view of it agrees. */
export function HabitTracker({ view, onViewChange }: { view: TrackerView; onViewChange: (view: TrackerView) => void }) {
    const today = useMemo(() => todayKey(), [])
    const weekStart = weekStartOf(today)
    const days = useMemo(() => weekDays(weekStart), [weekStart])
    const tracker = useHabitTracker(weekStart)

    if (tracker.isLoading) {
        return (
            <div className="flex justify-center py-20">
                <div className="h-5 w-5 animate-spin rounded-full border border-muted border-t-foreground" />
            </div>
        )
    }

    if (tracker.error || !tracker.data) {
        return (
            <div role="alert" className="rounded-2xl px-5 py-6 ring-1 ring-border">
                <p className="text-sm font-semibold">The tracker couldn’t load.</p>
                <p className="mt-1 text-sm text-muted-foreground">{tracker.error}</p>
                <button type="button" onClick={tracker.reload} className="mt-3 text-sm font-medium text-brand-accent hover:underline">Try again</button>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 gap-6">
            <Segmented id="tracker-view" label="Tracker view" options={VIEWS} value={view} onChange={onViewChange} />
            {view === 'today' && <TodayView data={tracker.data} tracker={tracker} today={today} days={days} />}
            {view === 'week' && <WeekView data={tracker.data} tracker={tracker} today={today} currentWeek={weekStart} />}
            {view === 'habits' && <HabitsView data={tracker.data} tracker={tracker} today={today} currentWeek={weekStart} />}
        </div>
    )
}
