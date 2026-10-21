import { StudySessionData } from '@/app/hooks/useStudySessions'
import { StudyTopicData } from '@/app/hooks/useStudyTopics'
import { focusSessions, formatMinutes } from '@/lib/studyStats'

const heading = new Intl.DateTimeFormat('en', { weekday: 'long', month: 'short', day: 'numeric' })

/** The latest focus sessions, grouped under the day they happened. */
export function SessionDays({ sessions, topics, limit = 10 }: { sessions: StudySessionData[]; topics: StudyTopicData[]; limit?: number }) {
    const titleById = new Map(topics.filter(t => t.id).map(t => [t.id!, t.title]))
    const recent = [...focusSessions(sessions)].sort((a, b) => b.startedAt.localeCompare(a.startedAt)).slice(0, limit)
    if (recent.length === 0) return null

    const days = new Map<string, StudySessionData[]>()
    for (const s of recent) {
        const key = new Date(s.startedAt).toDateString()
        if (!days.has(key)) days.set(key, [])
        days.get(key)!.push(s)
    }

    return (
        <div className="grid gap-7">
            {[...days].map(([key, list]) => (
                <div key={key}>
                    <h3 className="mb-2 text-[13px] font-semibold text-muted-foreground">{heading.format(new Date(key))}</h3>
                    <ul className="divide-y divide-border">
                        {list.map(s => (
                            <li key={s.id} className="flex justify-between gap-4 py-2 text-sm">
                                <span className="min-w-0 truncate">{titleById.get(s.topicId) ?? 'Focus'}</span>
                                <span className="shrink-0 tabular-nums text-muted-foreground">
                                    {formatMinutes(s.actualSeconds)}
                                    {!s.completed && <span className="sr-only"> (stopped early)</span>}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    )
}
