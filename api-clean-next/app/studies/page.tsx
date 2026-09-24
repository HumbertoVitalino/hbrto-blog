'use client'

import { useState, useCallback, useMemo, useRef } from 'react'
import { useStudyTopics, StudyTopicData } from '@/app/hooks/useStudyTopics'
import { useStudyEpics, StudyEpicData } from '@/app/hooks/useStudyEpics'
import { useStudySessions } from '@/app/hooks/useStudySessions'
import { usePomodoroTimer } from '@/app/hooks/usePomodoroTimer'
import { StudyTopicStatus } from '@/domain/StudyTopicStatus'
import { useAuth } from '@/app/context/AuthContext'
import { StudyTopicFormModal } from '@/app/components/studies/StudyTopicFormModal'
import { StudyTopicCard } from '@/app/components/studies/StudyTopicCard'
import { StudyEpicFormModal } from '@/app/components/studies/StudyEpicFormModal'
import { StudyEpicGrid } from '@/app/components/studies/StudyEpicGrid'
import { StudyOverviewStats } from '@/app/components/studies/StudyOverviewStats'
import { PomodoroTimer } from '@/app/components/studies/PomodoroTimer'
import { StudyActivityChart, ActivityPeriod } from '@/app/components/studies/StudyActivityChart'
import { StudySessionHistory } from '@/app/components/studies/StudySessionHistory'
import { RevealGroup, RevealItem } from '@/app/components/motion/Reveal'
import { computeEpicStats, computeOverviewStats } from '@/lib/studyStats'
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
import { AlertCircle, Plus, X, Circle, PlayCircle, PauseCircle, CheckCircle2, ListChecks } from 'lucide-react'
import { toast } from 'sonner'

type StatusToken = 'primary' | 'muted' | 'info' | 'warning' | 'success'

const STATUS_FILTERS: { label: string; value: StudyTopicStatus | 'all'; icon: typeof Circle; token: StatusToken }[] = [
  { label: 'All', value: 'all', icon: ListChecks, token: 'primary' },
  { label: 'Planned', value: StudyTopicStatus.Planned, icon: Circle, token: 'muted' },
  { label: 'In progress', value: StudyTopicStatus.InProgress, icon: PlayCircle, token: 'info' },
  { label: 'On hold', value: StudyTopicStatus.OnHold, icon: PauseCircle, token: 'warning' },
  { label: 'Completed', value: StudyTopicStatus.Completed, icon: CheckCircle2, token: 'success' },
]

const ACTIVITY_PERIODS: { label: string; value: ActivityPeriod }[] = [
  { label: '7 days', value: 7 },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
]

const STATUS_ACTIVE: Record<StatusToken, string> = {
  primary: 'border-primary/40 bg-primary/10 text-primary',
  muted: 'border-foreground/30 bg-muted text-foreground',
  info: 'border-info/40 bg-info/10 text-info',
  warning: 'border-warning/40 bg-warning/10 text-warning',
  success: 'border-success/40 bg-success/10 text-success',
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
      {children}
    </p>
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
  const [statusFilter, setStatusFilter] = useState<StudyTopicStatus | 'all'>('all')
  const [activityPeriod, setActivityPeriod] = useState<ActivityPeriod>(7)

  const epicById = useMemo(() => {
    const map = new Map<string, StudyEpicData>()
    epics.forEach(e => e.id && map.set(e.id, e))
    return map
  }, [epics])

  const epicStats = useMemo(() => computeEpicStats(epics, topics, sessions), [epics, topics, sessions])
  const overviewStats = useMemo(() => computeOverviewStats(epics, topics, sessions), [epics, topics, sessions])

  const visibleTopics = useMemo(() => topics.filter(t => {
    if (activeEpicId && t.epicId !== activeEpicId) return false
    if (statusFilter !== 'all' && t.status !== statusFilter) return false
    return true
  }), [topics, activeEpicId, statusFilter])

  const countForStatus = useCallback((status: StudyTopicStatus | 'all') =>
    status === 'all' ? topics.length : topics.filter(t => t.status === status).length,
  [topics])

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

  const handleDelete = useCallback((id: string) => {
    setPendingDeleteTopicId(id)
  }, [])

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
    focusPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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

  const handleEpicDelete = useCallback((id: string) => {
    setPendingDeleteEpicId(id)
  }, [])

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
  }, [])

  const hasVisibleTopics = visibleTopics.length > 0
  const activeEpic = activeEpicId ? epicById.get(activeEpicId) : undefined

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">

        {/* SLIM TITLE BAR */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-3xl font-medium tracking-tight">Studies</h1>
            <p className="text-sm text-muted-foreground mt-1">
              What I&apos;m studying, plan to study, and how the focus time adds up.
            </p>
          </div>
          {isAdmin && (
            <Button size="sm" onClick={handleNew} className="gap-2 shrink-0">
              <Plus className="w-4 h-4" />
              Add topic
            </Button>
          )}
        </div>

        {(error || submitError || epicsError || epicSubmitError) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error || submitError || epicsError || epicSubmitError}</AlertDescription>
          </Alert>
        )}

        {/* OVERVIEW — the headline numbers, public */}
        <StudyOverviewStats stats={overviewStats} />

        {/* EPICS — initiatives that group topics */}
        <StudyEpicGrid
          epics={epics}
          statsByEpicId={epicStats}
          selectedEpicId={activeEpicId}
          isAdmin={isAdmin}
          deletingId={deletingEpicId}
          onSelect={handleEpicSelect}
          onNew={handleEpicNew}
          onEdit={handleEpicEdit}
          onDelete={handleEpicDelete}
        />

        {/* TOPICS — filterable catalog */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <SectionLabel>Topics</SectionLabel>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {STATUS_FILTERS.map(({ label, value, icon: Icon, token }) => (
              <button
                key={value}
                onClick={() => setStatusFilter(value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  statusFilter === value
                    ? STATUS_ACTIVE[token]
                    : 'border-border/60 text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
                <span className="opacity-70 tabular-nums">{countForStatus(value)}</span>
              </button>
            ))}

            {activeEpic && (
              <button
                onClick={() => setActiveEpicId(undefined)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-primary/40 bg-primary/10 text-primary transition-colors"
              >
                {activeEpic.title}
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="h-6 w-6 rounded-full border border-muted border-t-foreground animate-spin" />
            </div>
          ) : !hasVisibleTopics ? (
            <div className="text-center py-20 border border-dashed border-border/50 rounded-2xl">
              <p className="text-sm text-muted-foreground">
                {activeEpic || statusFilter !== 'all' ? 'No topics match these filters.' : 'No study topics yet.'}
              </p>
              {isAdmin && (
                <Button variant="ghost" onClick={handleNew} className="mt-4">
                  Add your first topic
                </Button>
              )}
            </div>
          ) : (
            <RevealGroup className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {visibleTopics.map(topic => (
                <RevealItem key={topic.id}>
                  <StudyTopicCard
                    compact
                    topic={topic}
                    epic={topic.epicId ? epicById.get(topic.epicId) : undefined}
                    isAdmin={isAdmin}
                    isDeleting={deletingId === topic.id}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onStudy={handleStudy}
                  />
                </RevealItem>
              ))}
            </RevealGroup>
          )}
        </div>

        {/* ACTIVITY — public, filterable focus-time chart */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <SectionLabel>Activity</SectionLabel>
            <div className="flex gap-1.5">
              {ACTIVITY_PERIODS.map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => setActivityPeriod(value)}
                  className={`text-xs font-medium px-3 py-1 rounded-full transition-colors ${
                    activityPeriod === value
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <StudyActivityChart sessions={sessions} period={activityPeriod} />
        </div>

        {/* FOCUS SESSION — admin-only Pomodoro tool */}
        {isAdmin && (
          <div ref={focusPanelRef} className="space-y-3">
            <SectionLabel>Focus session</SectionLabel>
            <PomodoroTimer
              topics={topics}
              epics={epics}
              sessions={sessions}
              timer={timer}
              pendingTopicId={pendingTopicId}
              onPendingTopicChange={setPendingTopicId}
            />
          </div>
        )}

        {/* RECENT SESSIONS */}
        <div className="space-y-4">
          <SectionLabel>Recent sessions</SectionLabel>
          <StudySessionHistory sessions={sessions} topics={topics} isLoading={sessionsLoading} />
        </div>
      </div>

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
    </div>
  )
}
