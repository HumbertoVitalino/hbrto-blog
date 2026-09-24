'use client'

import { OverviewStats, formatMinutes } from '@/lib/studyStats'
import { Clock, Flame, Layers, CheckCircle2 } from 'lucide-react'

interface StudyOverviewStatsProps {
    stats: OverviewStats
}

export function StudyOverviewStats({ stats }: StudyOverviewStatsProps) {
    const tiles = [
        {
            icon: Clock,
            color: 'text-success',
            value: stats.totalSeconds > 0 ? formatMinutes(stats.totalSeconds) : '—',
            label: 'Total focus time',
        },
        {
            icon: Flame,
            color: 'text-brand-accent',
            value: stats.streak,
            label: 'Day streak',
        },
        {
            icon: Layers,
            color: 'text-info',
            value: stats.activeEpics,
            label: stats.activeEpics === 1 ? 'Active epic' : 'Active epics',
        },
        {
            icon: CheckCircle2,
            color: 'text-primary',
            value: stats.completedTopics,
            label: stats.completedTopics === 1 ? 'Topic completed' : 'Topics completed',
        },
    ]

    return (
        <div className="instrument-panel border border-border/60 p-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                {tiles.map(({ icon: Icon, color, value, label }) => (
                    <div key={label} className="flex flex-col items-center text-center gap-1.5">
                        <Icon className={`w-4 h-4 ${color}`} />
                        <span className="text-2xl font-semibold tabular-nums">{value}</span>
                        <span className="text-[11px] text-muted-foreground uppercase tracking-wide">{label}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
