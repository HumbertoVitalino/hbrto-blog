import { TopArtistData } from '@/app/hooks/useTopArtists'

function joinNames(names: string[]) {
    if (names.length <= 1) return names[0] ?? ''
    return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
}

/**
 * "Lately it's Niink, A$AP Rocky and Sain on repeat. Over the years, Yung Buda and Brent Faiyaz."
 * Read from the last four weeks and from all time, so it moves with the listening.
 */
export function musicSummary(lately: TopArtistData[], allTime: TopArtistData[]): { lately: string[]; always: string[] } | null {
    const recent = lately.slice(0, 3).map(a => a.name)
    // long-time favourites that aren't already the current obsession
    const always = allTime.map(a => a.name).filter(name => !recent.includes(name)).slice(0, 2)
    if (recent.length === 0 && always.length === 0) return null
    return { lately: recent, always }
}

export { joinNames }
