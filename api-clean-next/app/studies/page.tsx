'use client'

import { useState, useCallback, useMemo, useRef } from 'react'
import { useStudyTopics, StudyTopicData } from '@/app/hooks/useStudyTopics'
import { useStudySessions } from '@/app/hooks/useStudySessions'
import { usePomodoroTimer } from '@/app/hooks/usePomodoroTimer'
import { StudyTopicStatus } from '@/domain/StudyTopicStatus'
import { useAuth } from '@/app/context/AuthContext'
import { StudyTopicFormModal } from '@/app/components/studies/StudyTopicFormModal'
import { StudyTopicCard } from '@/app/components/studies/StudyTopicCard'
import { PomodoroTimer } from '@/app/components/studies/PomodoroTimer'
import { WeeklyActivityChart } from '@/app/components/studies/WeeklyActivityChart'
import { StudySessionHistory } from '@/app/components/studies/StudySessionHistory'
import { RevealGroup, RevealItem } from '@/app/components/motion/Reveal'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, Plus } from 'lucide-react'

const columnOrder: { status: StudyTopicStatus; label: string; accent: string }[] = [
  { status: StudyTopicStatus.Planned, label: 'Planned', accent: 'bg-muted-foreground/50' },
  { status: StudyTopicStatus.InProgress, label: 'In progress', accent: 'bg-info' },
  { status: StudyTopicStatus.OnHold, label: 'On hold', accent: 'bg-warning' },
  { status: StudyTopicStatus.Completed, label: 'Completed', accent: 'bg-success' },
]

export default function StudiesPage() {
  const { topics, isLoading, error, createTopic, updateTopic, deleteTopic } = useStudyTopics()
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

  const topicsByStatus = useMemo(() => ({
    [StudyTopicStatus.Planned]: topics.filter(t => t.status === StudyTopicStatus.Planned),
    [StudyTopicStatus.InProgress]: topics.filter(t => t.status === StudyTopicStatus.InProgress),
    [StudyTopicStatus.Completed]: topics.filter(t => t.status === StudyTopicStatus.Completed),
    [StudyTopicStatus.OnHold]: topics.filter(t => t.status === StudyTopicStatus.OnHold),
  }), [topics])

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
      } else {
        await createTopic(data)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save study topic'
      setSubmitError(message)
      throw err
    } finally {
      setIsSubmitting(false)
    }
  }, [selectedTopic, createTopic, updateTopic])

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Are you sure you want to delete this study topic?')) return
    try {
      setDeletingId(id)
      await deleteTopic(id)
    } finally {
      setDeletingId(undefined)
    }
  }, [deleteTopic])

  const handleStudy = useCallback((id: string) => {
    setPendingTopicId(id)
    focusPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const hasVisibleTopics = topics.length > 0

  return (
    <main className="min-h-screen bg-background">
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

        {(error || submitError) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error || submitError}</AlertDescription>
          </Alert>
        )}

        {/* FOCUS PANEL + THIS WEEK */}
        <div ref={focusPanelRef} className={`grid gap-5 ${isAdmin ? 'lg:grid-cols-2 items-start' : ''}`}>
          {isAdmin && (
            <PomodoroTimer
              topics={topics}
              sessions={sessions}
              timer={timer}
              pendingTopicId={pendingTopicId}
              onPendingTopicChange={setPendingTopicId}
            />
          )}
          <WeeklyActivityChart sessions={sessions} />
        </div>

        {/* TOPICS — KANBAN */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="h-6 w-6 rounded-full border border-muted border-t-foreground animate-spin" />
          </div>
        ) : !hasVisibleTopics ? (
          <div className="text-center py-20 border border-dashed border-border/50 rounded-2xl">
            <p className="text-sm text-muted-foreground">No study topics yet.</p>
            {isAdmin && (
              <Button variant="ghost" onClick={handleNew} className="mt-4">
                Add your first topic
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {columnOrder.map(({ status, label, accent }) => {
              const columnTopics = topicsByStatus[status]
              return (
                <div key={status} className="space-y-3">
                  <div className="flex items-center gap-2 px-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${accent}`} />
                    <h2 className="text-xs font-semibold uppercase tracking-wide text-foreground">{label}</h2>
                    <span className="text-xs tabular-nums text-muted-foreground ml-auto">{columnTopics.length}</span>
                  </div>
                  {columnTopics.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border/50 py-6 text-center">
                      <p className="text-xs text-muted-foreground">Empty</p>
                    </div>
                  ) : (
                    <RevealGroup className="flex flex-col gap-2">
                      {columnTopics.map(topic => (
                        <RevealItem key={topic.id}>
                          <StudyTopicCard
                            compact
                            topic={topic}
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
              )
            })}
          </div>
        )}

        {/* RECENT SESSIONS */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-foreground">Recent sessions</h2>
            <div className="flex-1 h-px bg-border/40" />
          </div>
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
    </main>
  )
}
