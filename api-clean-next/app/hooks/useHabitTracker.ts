'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import type { BlockStatus, Habit, HabitLog, ScheduleBlock, WeeklyReview, BlockLog } from '@/domain/Habit'
import type { HabitInput, BlockInput } from '@/application/usecases/habitDrafts'
import { supabase } from '@/infrastructure/supabase/client'
import { addDays } from '@/lib/habitDates'

export interface TrackerData {
    from: string
    to: string
    habits: Habit[]
    logs: HabitLog[]
    blocks: ScheduleBlock[]
    blockLogs: BlockLog[]
    reviews: WeeklyReview[]
}

// enough history behind the week for streaks and the 12-week heatmaps
const HISTORY_DAYS = 7 * 12

async function call<T>(url: string, method = 'GET', body?: unknown): Promise<T> {
    const { data: { session } } = await supabase.auth.getSession()
    const response = await fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
    })
    if (response.status === 204) return undefined as T
    const json = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(json.error || `Request failed (${response.status})`)
    return json as T
}

/** The habit tracker's data around one week, with writes that show up before the server answers. */
export function useHabitTracker(weekStart: string) {
    const [data, setData] = useState<TrackerData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const from = addDays(weekStart, -HISTORY_DAYS)
    const to = addDays(weekStart, 6)

    const reload = useCallback(async () => {
        try {
            setError(null)
            setData(await call<TrackerData>(`/api/tracker?from=${from}&to=${to}`))
        } catch (err) {
            setError(err instanceof Error ? err.message : 'The tracker couldn’t be loaded')
        } finally {
            setIsLoading(false)
        }
    }, [from, to])

    useEffect(() => {
        reload()
    }, [reload])

    /** Sets a habit's value for a day, showing it at once and undoing it if the save fails. */
    const logHabit = useCallback(async (habitId: string, day: string, value: number) => {
        const same = (l: HabitLog) => l.habitId === habitId && l.day === day
        const put = (logs: HabitLog[], entry: HabitLog | undefined) =>
            entry && entry.value > 0 ? [...logs.filter(l => !same(l)), entry] : logs.filter(l => !same(l))

        let before: HabitLog | undefined
        setData(current => {
            if (!current) return current
            before = current.logs.find(same)
            return { ...current, logs: put(current.logs, { habitId, day, value }) }
        })
        try {
            await call(`/api/habits/${habitId}/log`, 'PUT', { day, value })
        } catch (err) {
            // undo only this entry, so other taps made meanwhile survive
            setData(current => (current ? { ...current, logs: put(current.logs, before) } : current))
            toast.error('That didn’t save', { description: err instanceof Error ? err.message : undefined })
        }
    }, [])

    const logBlock = useCallback(async (blockId: string, day: string, status: BlockStatus | null) => {
        const same = (l: BlockLog) => l.blockId === blockId && l.day === day
        const put = (logs: BlockLog[], entry: BlockLog | undefined) =>
            entry ? [...logs.filter(l => !same(l)), entry] : logs.filter(l => !same(l))

        let before: BlockLog | undefined
        setData(current => {
            if (!current) return current
            before = current.blockLogs.find(same)
            return { ...current, blockLogs: put(current.blockLogs, status ? { blockId, day, status } : undefined) }
        })
        try {
            await call(`/api/schedule-blocks/${blockId}/log`, 'PUT', { day, status })
        } catch (err) {
            setData(current => (current ? { ...current, blockLogs: put(current.blockLogs, before) } : current))
            toast.error('That didn’t save', { description: err instanceof Error ? err.message : undefined })
        }
    }, [])

    const saveHabit = useCallback(async (input: HabitInput, id?: string) => {
        await call<Habit>(id ? `/api/habits/${id}` : '/api/habits', id ? 'PUT' : 'POST', input)
        await reload()
    }, [reload])

    const archiveHabit = useCallback(async (id: string) => {
        await call(`/api/habits/${id}`, 'DELETE')
        await reload()
    }, [reload])

    const saveBlock = useCallback(async (input: BlockInput, id?: string) => {
        await call<ScheduleBlock>(id ? `/api/schedule-blocks/${id}` : '/api/schedule-blocks', id ? 'PUT' : 'POST', input)
        await reload()
    }, [reload])

    const archiveBlock = useCallback(async (id: string) => {
        await call(`/api/schedule-blocks/${id}`, 'DELETE')
        await reload()
    }, [reload])

    const saveReview = useCallback(async (review: WeeklyReview) => {
        await call<WeeklyReview>(`/api/weekly-reviews/${review.weekStart}`, 'PUT', review)
        setData(current => current && {
            ...current,
            reviews: [...current.reviews.filter(r => r.weekStart !== review.weekStart), review],
        })
    }, [])

    return { data, isLoading, error, reload, logHabit, logBlock, saveHabit, archiveHabit, saveBlock, archiveBlock, saveReview }
}
