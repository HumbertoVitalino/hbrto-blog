export const EPIC_COLORS = ['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5'] as const

export type EpicColor = typeof EPIC_COLORS[number]

interface EpicColorClasses {
    dot: string
    bg: string
    text: string
    ring: string
}

// literal class names — Tailwind's scanner can't resolve `bg-${color}` template interpolation
const EPIC_COLOR_CLASSES: Record<EpicColor, EpicColorClasses> = {
    'chart-1': { dot: 'bg-chart-1', bg: 'bg-chart-1/10', text: 'text-chart-1', ring: 'ring-chart-1' },
    'chart-2': { dot: 'bg-chart-2', bg: 'bg-chart-2/10', text: 'text-chart-2', ring: 'ring-chart-2' },
    'chart-3': { dot: 'bg-chart-3', bg: 'bg-chart-3/10', text: 'text-chart-3', ring: 'ring-chart-3' },
    'chart-4': { dot: 'bg-chart-4', bg: 'bg-chart-4/10', text: 'text-chart-4', ring: 'ring-chart-4' },
    'chart-5': { dot: 'bg-chart-5', bg: 'bg-chart-5/10', text: 'text-chart-5', ring: 'ring-chart-5' },
}

export function epicColorClasses(color?: string | null): EpicColorClasses {
    return EPIC_COLOR_CLASSES[(color as EpicColor)] ?? EPIC_COLOR_CLASSES['chart-1']
}
