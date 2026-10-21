// Days in the tracker are "YYYY-MM-DD" in the device's own time zone: "today" is today where you are.

const dayFormat = new Intl.DateTimeFormat('en-CA')

export function toDayKey(date: Date): string {
    return dayFormat.format(date)
}

export function todayKey(): string {
    return toDayKey(new Date())
}

/** Noon avoids a daylight-saving shift tipping the date over. */
export function fromDayKey(day: string): Date {
    return new Date(`${day}T12:00:00`)
}

export function addDays(day: string, amount: number): string {
    const date = fromDayKey(day)
    date.setDate(date.getDate() + amount)
    return toDayKey(date)
}

/** The Monday of the week a day falls in. */
export function weekStartOf(day: string): string {
    const weekday = fromDayKey(day).getDay()
    return addDays(day, -((weekday + 6) % 7))
}

export function weekDays(weekStart: string): string[] {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
}

/** "HH:MM" to minutes after midnight. */
export function minutesOf(time: string): number {
    const [h, m] = time.split(':').map(Number)
    return h * 60 + m
}

/** Length of a block in minutes, wrapping past midnight (23:30 → 07:00 is 7h30). */
export function blockMinutes(startsAt: string, endsAt: string): number {
    const start = minutesOf(startsAt)
    const end = minutesOf(endsAt)
    return end > start ? end - start : 24 * 60 - start + end
}

export function formatDuration(minutes: number): string {
    const m = Math.round(minutes)
    if (m < 60) return `${m}min`
    const h = Math.floor(m / 60)
    const rest = m % 60
    return rest ? `${h}h ${rest}min` : `${h}h`
}
