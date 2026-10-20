import { GameData } from '@/app/hooks/useGames'
import { GamePlatform } from '@/domain/GamePlatform'
import { GameStatus } from '@/domain/GameStatus'

export const PLATFORM_LABEL: Record<GamePlatform, string> = {
    [GamePlatform.PSN]: 'PlayStation',
    [GamePlatform.NintendoSwitch]: 'Switch',
}

const numberFormat = new Intl.NumberFormat('en-US')

/** "6 finished and 2 in progress, 210 hours on record. Mostly on Switch." Worked out from the games so it stays true. */
export function gamesSummary(games: GameData[]): string | null {
    if (games.length === 0) return null

    const finished = games.filter(g => g.status === GameStatus.Completed).length
    const playing = games.filter(g => g.status === GameStatus.Playing).length
    const hours = games.reduce((total, g) => total + (g.totalHours ?? 0), 0)

    const parts = [`${finished} finished`]
    if (playing > 0) parts.push(`${playing} in progress`)
    let line = parts.join(' and ')
    line += hours > 0 ? `, ${numberFormat.format(hours)} hours on record.` : '.'

    // only call a lean when one platform clearly holds most of the shelf
    const switchShare = games.filter(g => g.platform === GamePlatform.NintendoSwitch).length / games.length
    if (switchShare >= 0.6) line += ' Mostly on Switch.'
    else if (switchShare <= 0.4) line += ' Mostly on PlayStation.'

    return line
}

/** Playing first, then finished, then the backlog; alphabetical inside each. */
export function sortGames(games: GameData[]): GameData[] {
    const rank: Record<GameStatus, number> = {
        [GameStatus.Playing]: 0,
        [GameStatus.Completed]: 1,
        [GameStatus.NotStarted]: 2,
    }
    return [...games].sort((a, b) =>
        rank[a.status ?? GameStatus.NotStarted] - rank[b.status ?? GameStatus.NotStarted] || a.title.localeCompare(b.title))
}
