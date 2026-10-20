'use client'

import { useState, useCallback, useMemo, useRef } from 'react'
import { useStudyTopics, StudyTopicData } from '@/app/hooks/useStudyTopics'
import { useStudyEpics, StudyEpicData } from '@/app/hooks/useStudyEpics'
import { useStudySessions } from '@/app/hooks/useStudySessions'
import { usePomodoroTimer } from '@/app/hooks/usePomodoroTimer'
import { StudyTopicStatus } from '@/domain/StudyTopicStatus'
import { useAuth } from '@/app/context/AuthContext'
import { StudyTopicFormModal } from '@/app/components/studies/StudyTopicFormModal'
import { StudyEpicFormModal } from '@/app/components/studies/StudyEpicFormModal'
import { StudyingNow } from '@/app/components/studies/StudyingNow'
import { FocusChart } from '@/app/components/studies/FocusChart'
import { EpicList } from '@/app/components/studies/EpicList'
import { TopicList } from '@/app/components/studies/TopicList'
import { SessionDays } from '@/app/components/studies/SessionDays'
import { PomodoroTimer } from '@/app/components/studies/PomodoroTimer'
import { PageContainer, PageHeader, PageLead } from '@/app/components/layout/PageHeader'
import { Segmented } from '@/app/components/layout/Segmented'
import { FadeIn } from '@/app/components/motion/FadeIn'
import {
  ACTIVITY_PERIODS,
  ActivityPeriod,
  computeEpicStats,
  defaultActivityPeriod,
  focusSessions,
  secondsByTopic,
} from '@/lib/studyStats'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { AlertCircle, Plus, X } from 'lucide-react'
import { toast } from 'sonner'

type StatusFilter = StudyTopicStatus | 'all'

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: StudyTopicStatus.InProgress, label: 'In progress' },
  { value: StudyTopicStatus.Planned, label: 'Planned' },
  { value: StudyTopicStatus.OnHold, label: 'On hold' },
  { value: StudyTopicStatus.Completed, label: 'Completed' },
]

const hours = (seconds: number) => (seconds / 3600).toFixed(1).replace(/\.0$/, '')
const monthYear = new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' })

function Spinner() {
  return (
    <div className="flex justify-center py-20">
      <div className="h-5 w-5 rounded-full border border-muted border-t-foreground animate-spin" />
    </div>
  )
}

export default function StudiesPage() {
  const { topics, isLoading, error, createTopic, updateTopic, deleteTopic } = useStudyTopics()
  const { epics, error: epicsError, createEpic, updateEpic, deleteEpic } = useStudyEpics()
  const { sessions, isLoading: sessionsLoading, createSession } = useStudySessions()
  const timer = usePomodoroTimer(createSession)
  const { isAdmin } = useAuth()

  const focusPanelRef = useRef<HTMLDivElement>(null)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState<StudyTopicData | undefined>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | undefined>()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [pendingTopicId, setPendingTopicId] = useState<string | undefined>()
  const [pendingDeleteTopicId, setPendingDeleteTopicId] = useState<string | undefined>()

  const [isEpicFormOpen, setIsEpicFormOpen] = useState(false)
  const [selectedEpic, setSelectedEpic] = useState<StudyEpicData | undefined>()
  const [isEpicSubmitting, setIsEpicSubmitting] = useState(false)
  const [deletingEpicId, setDeletingEpicId] = useState<string | undefined>()
  const [epicSubmitError, setEpicSubmitError] = useState<string | null>(null)
  const [pendingDeleteEpicId, setPendingDeleteEpicId] = useState<string | undefined>()
  const [activeEpicId, setActiveEpicId] = useState<string | undefined>()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  // null until picked: the chart opens on the shortest period that has any focus in it
  const [chosenPeriod, setChosenPeriod] = useState<ActivityPeriod | null>(null)

  const epicById = useMemo(() => {
    const map = new Map<string, StudyEpicData>()
    epics.forEach(e => e.id && map.set(e.id, e))
    return map
  }, [epics])

  const epicStats = useMemo(() => computeEpicStats(epics, topics, sessions), [epics, topics, sessions])
  const topicSeconds = useMemo(() => secondsByTopic(sessions), [sessions])
  const period = chosenPeriod ?? defaultActivityPeriod(sessions)

  const studyingNow = topics.find(t => t.status === StudyTopicStatus.InProgress)
  const studyingNowEpic = studyingNow?.epicId ? epicById.get(studyingNow.epicId) : undefined

  const summary = useMemo(() => {
    const focus = focusSessions(sessions)
    if (focus.length === 0) return null
    const total = focus.reduce((sum, s) => sum + s.actualSeconds, 0)
    const first = focus.reduce((min, s) => (s.startedAt < min ? s.startedAt : min), focus[0].startedAt)
    return { total, count: focus.length, since: monthYear.format(new Date(first)) }
  }, [sessions])

  const onEpic = useMemo(() => topics.filter(t => !activeEpicId || t.epicId === activeEpicId), [topics, activeEpicId])
  // a status with nothing in it isn't offered, unless it's the one currently picked
  const statusOptions = useMemo(() => STATUS_OPTIONS
    .map(o => ({ ...o, count: o.value === 'all' ? onEpic.length : onEpic.filter(t => t.status === o.value).length }))
    .filter(o => o.value === 'all' || o.count > 0 || o.value === statusFilter),
  [onEpic, statusFilter])
  const visibleTopics = useMemo(
    () => onEpic.filter(t => statusFilter === 'all' || t.status === statusFilter),
    [onEpic, statusFilter],
  )

  const handleEdit = useCallback((topic: StudyTopicData) => {
    setSelectedTopic(topic)
    setSubmitError(null)
    setIsFormOpen(true)
  }, [])

  const handleNew = useCallback(() => {
    setSelectedTopic(undefined)
    setSubmitError(null)
    setIsFormOpen(true)
  }, [])

  const handleSubmit = useCallback(async (data: Omit<StudyTopicData, 'id'>) => {
    try {
      setIsSubmitting(true)
      setSubmitError(null)
      if (selectedTopic?.id) {
        await updateTopic(selectedTopic.id, data)
        toast.success('Topic updated')
      } else {
        await createTopic(data)
        toast.success('Topic added')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save study topic'
      setSubmitError(message)
      throw err
    } finally {
      setIsSubmitting(false)
    }
  }, [selectedTopic, createTopic, updateTopic])

  const confirmDeleteTopic = useCallback(async () => {
    if (!pendingDeleteTopicId) return
    try {
      setDeletingId(pendingDeleteTopicId)
      await deleteTopic(pendingDeleteTopicId)
      toast.success('Topic deleted')
    } finally {
      setDeletingId(undefined)
      setPendingDeleteTopicId(undefined)
    }
  }, [pendingDeleteTopicId, deleteTopic])

  const handleStudy = useCallback((id: string) => {
    setPendingTopicId(id)
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    focusPanelRef.current?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
  }, [])

  const handleEpicEdit = useCallback((epic: StudyEpicData) => {
    setSelectedEpic(epic)
    setEpicSubmitError(null)
    setIsEpicFormOpen(true)
  }, [])

  const handleEpicNew = useCallback(() => {
    setSelectedEpic(undefined)
    setEpicSubmitError(null)
    setIsEpicFormOpen(true)
  }, [])

  const handleEpicSubmit = useCallback(async (data: Omit<StudyEpicData, 'id'>) => {
    try {
      setIsEpicSubmitting(true)
      setEpicSubmitError(null)
      if (selectedEpic?.id) {
        await updateEpic(selectedEpic.id, data)
        toast.success('Epic updated')
      } else {
        await createEpic(data)
        toast.success('Epic added')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save epic'
      setEpicSubmitError(message)
      throw err
    } finally {
      setIsEpicSubmitting(false)
    }
  }, [selectedEpic, createEpic, updateEpic])

  const confirmDeleteEpic = useCallback(async () => {
    if (!pendingDeleteEpicId) return
    const id = pendingDeleteEpicId
    try {
      setDeletingEpicId(id)
      await deleteEpic(id)
      setActiveEpicId(prev => prev === id ? undefined : prev)
      toast.success('Epic deleted')
    } finally {
      setDeletingEpicId(undefined)
      setPendingDeleteEpicId(undefined)
    }
  }, [pendingDeleteEpicId, deleteEpic])

  const handleEpicSelect = useCallback((id: string) => {
    setActiveEpicId(prev => prev === id ? undefined : id)
    setStatusFilter('all')
  }, [])

  const activeEpic = activeEpicId ? epicById.get(activeEpicId) : undefined
  const loading = isLoading || sessionsLoading

  return (
    <PageContainer>
      <PageHeader title="What I’m studying, and the hours behind it.">
        {summary && (
          <PageLead>
            <b className="font-semibold text-foreground">{hours(summary.total)} hours</b> of focus across{' '}
            <b className="font-semibold text-foreground">{summary.count} {summary.count === 1 ? 'session' : 'sessions'}</b> since {summary.since}.
            {studyingNow && (
              <> Right now it’s <b className="font-semibold text-foreground">{studyingNow.title}</b>{studyingNowEpic && <>, part of {studyingNowEpic.title}</>}.</>
            )}
          </PageLead>
        )}
        {isAdmin && (
          <Button size="sm" onClick={handleNew} className="mt-8 gap-2">
            <Plus className="size-4" />
            Add topic
          </Button>
        )}
      </PageHeader>

      {(error || submitError || epicsError || epicSubmitError) && (
        <Alert variant="destructive" className="mt-10">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || submitError || epicsError || epicSubmitError}</AlertDescription>
        </Alert>
      )}

      {loading ? <Spinner /> : (
        <>
          {studyingNow && (
            <FadeIn index={1} className="mt-14">
              <StudyingNow topic={studyingNow} epic={studyingNowEpic} seconds={studyingNow.id ? topicSeconds.get(studyingNow.id) ?? 0 : 0} />
            </FadeIn>
          )}

          {focusSessions(sessions).length > 0 && (
            <FadeIn index={2}>
              <section aria-labelledby="focus-heading" className="mt-18">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                  <h2 id="focus-heading" className="text-sm font-semibold">Focus time</h2>
                  <Segmented
                    id="studies-period"
                    label="Period"
                    options={ACTIVITY_PERIODS.map(p => ({ value: String(p) as `${ActivityPeriod}`, label: `${p} days` }))}
                    value={String(period) as `${ActivityPeriod}`}
                    onChange={value => setChosenPeriod(Number(value) as ActivityPeriod)}
                  />
                </div>
                <FocusChart sessions={sessions} period={period} />
              </section>
            </FadeIn>
          )}

          <FadeIn index={3}>
            <div className="mt-18">
              <EpicList
                epics={epics}
                statsByEpicId={epicStats}
                selectedEpicId={activeEpicId}
                isAdmin={isAdmin}
                deletingId={deletingEpicId}
                onSelect={handleEpicSelect}
                onNew={handleEpicNew}
                onEdit={handleEpicEdit}
                onDelete={setPendingDeleteEpicId}
              />
            </div>

            <section aria-labelledby="topics-heading" className="mt-18">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 id="topics-heading" className="text-sm font-semibold">Topics</h2>
                {topics.length > 0 && (
                  <Segmented id="studies-status" label="Filter by status" options={statusOptions} value={statusFilter} onChange={setStatusFilter} />
                )}
              </div>
              {activeEpic && (
                <button
                  type="button"
                  onClick={() => setActiveEpicId(undefined)}
                  className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-brand-accent/6 px-3 py-1 text-[13px] font-medium text-brand-accent ring-1 ring-inset ring-brand-accent/40 transition-transform active:scale-[0.97]"
                >
                  {activeEpic.title}
                  <X className="size-3" />
                  <span className="sr-only">Show topics from every epic</span>
                </button>
              )}
              {visibleTopics.length === 0 ? (
                <p className="py-8 text-sm text-muted-foreground">
                  {topics.length === 0 ? 'No study topics yet.' : 'No topics match these filters.'}
                </p>
              ) : (
                <TopicList
                  topics={visibleTopics}
                  epicById={epicById}
                  secondsByTopicId={topicSeconds}
                  isAdmin={isAdmin}
                  deletingId={deletingId}
                  onEdit={handleEdit}
                  onDelete={setPendingDeleteTopicId}
                  onStudy={handleStudy}
                />
              )}
            </section>

            {focusSessions(sessions).length > 0 && (
              <section aria-labelledby="recent-heading" className="mt-18">
                <h2 id="recent-heading" className="mb-6 text-sm font-semibold">Recent sessions</h2>
                <SessionDays sessions={sessions} topics={topics} />
              </section>
            )}
          </FadeIn>

          {/* the timer writes sessions, so it's only there for the admin */}
          {isAdmin && (
            <section ref={focusPanelRef} aria-labelledby="timer-heading" className="mt-18 scroll-mt-28">
              <h2 id="timer-heading" className="mb-6 text-sm font-semibold">Focus session</h2>
              <PomodoroTimer
                topics={topics}
                epics={epics}
                sessions={sessions}
                timer={timer}
                pendingTopicId={pendingTopicId}
                onPendingTopicChange={setPendingTopicId}
              />
            </section>
          )}
        </>
      )}

      {isAdmin && (
        <StudyTopicFormModal
          isOpen={isFormOpen}
          topic={selectedTopic}
          isLoading={isSubmitting}
          onSubmit={handleSubmit}
          onOpenChange={setIsFormOpen}
        />
      )}

      {isAdmin && (
        <StudyEpicFormModal
          isOpen={isEpicFormOpen}
          epic={selectedEpic}
          isLoading={isEpicSubmitting}
          onSubmit={handleEpicSubmit}
          onOpenChange={setIsEpicFormOpen}
        />
      )}

      <AlertDialog open={!!pendingDeleteTopicId} onOpenChange={(open) => !open && setPendingDeleteTopicId(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this topic?</AlertDialogTitle>
            <AlertDialogDescription>
              This action can&apos;t be undone. The topic will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel />
            <AlertDialogAction onClick={confirmDeleteTopic}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!pendingDeleteEpicId} onOpenChange={(open) => !open && setPendingDeleteEpicId(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this epic?</AlertDialogTitle>
            <AlertDialogDescription>
              This action can&apos;t be undone. Its topics will remain, unassigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel />
            <AlertDialogAction onClick={confirmDeleteEpic}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  )
}
