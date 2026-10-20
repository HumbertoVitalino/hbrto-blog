import { StudyTopicData } from '@/app/hooks/useStudyTopics'
import { StudyEpicData } from '@/app/hooks/useStudyEpics'
import { StudyPriority } from '@/domain/StudyPriority'
import { formatMinutes } from '@/lib/studyStats'

/** The topic in progress, as the page's one raised card, with the focus it has had so far. */
export function StudyingNow({ topic, epic, seconds }: { topic: StudyTopicData; epic?: StudyEpicData; seconds: number }) {
    return (
        <article className="raised-card grid gap-5 p-6 sm:grid-cols-[1fr_auto] sm:items-center sm:px-8 sm:py-7">
            <div className="min-w-0">
                <p className="flex items-center gap-2 text-[13px] font-semibold text-brand-accent">
                    <span aria-hidden className="size-1.5 rounded-full bg-brand-accent" />
                    Studying now
                </p>
                <h2 className="mt-2 text-[1.375rem] font-semibold leading-7 tracking-tight text-balance">{topic.title}</h2>
                <p className="mt-1.5 text-sm text-muted-foreground">
                    {epic ? epic.title : 'No epic'}
                    {topic.priority === StudyPriority.High && <> · high priority</>}
                </p>
            </div>
            <div className="sm:text-right">
                <p className="text-4xl font-semibold leading-none tracking-tight tabular-nums">{seconds > 0 ? formatMinutes(seconds) : '0min'}</p>
                <p className="mt-1.5 text-[13px] text-muted-foreground">focused on it so far</p>
            </div>
        </article>
    )
}
