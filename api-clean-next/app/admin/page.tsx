'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'
import { useEffect, useState, useCallback } from 'react'
import { useBooks } from '@/app/hooks/useBooks'
import { useNotes } from '@/app/hooks/useNotes'
import { useSubscribers } from '@/app/hooks/useSubscribers'
import { BookStatus } from '@/domain/BookStatus'
import Link from 'next/link'
import {
  Loader2, BookOpen, NotebookPen, CheckCircle, Clock,
  Library, Mail, Trash2, Send, ArrowUpRight, Users, FileText, Gamepad2, BookMarked
} from 'lucide-react'
import { useGames } from '@/app/hooks/useGames'
import { useStudyTopics } from '@/app/hooks/useStudyTopics'
import { toast } from 'sonner'
import { PageContainer } from '@/app/components/layout/PageHeader'
import { Segmented } from '@/app/components/layout/Segmented'
import { HabitTracker, TRACKER_VIEW_TITLE, type TrackerView } from '@/app/components/habits/HabitTracker'
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

type Tab = 'tracker' | 'site' | 'newsletter'

export default function AdminPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { books, isLoading: booksLoading } = useBooks()
  const { notes: writtenNotes, isLoading: writtenNotesLoading } = useNotes()
  const { subscribers, isLoading: subscribersLoading, removeSubscriber } = useSubscribers()
  const { games, isLoading: gamesLoading } = useGames()
  const { topics, isLoading: topicsLoading } = useStudyTopics()

  const [tab, setTab] = useState<Tab>('tracker')
  const [trackerView, setTrackerView] = useState<TrackerView>('today')
  const [removingEmail, setRemovingEmail] = useState<string | null>(null)
  const [compose, setCompose] = useState(false)
  const [broadcastSubject, setBroadcastSubject] = useState('')
  const [broadcastMessage, setBroadcastMessage] = useState('')
  const [broadcastStatus, setBroadcastStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [broadcastError, setBroadcastError] = useState('')
  const [pendingRemoveEmail, setPendingRemoveEmail] = useState<string | null>(null)
  const [isBroadcastConfirmOpen, setIsBroadcastConfirmOpen] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) router.push('/admin/login')
  }, [user, authLoading, router])

  const handleRemove = useCallback((email: string) => {
    setPendingRemoveEmail(email)
  }, [])

  const confirmRemove = useCallback(async () => {
    if (!pendingRemoveEmail) return
    setRemovingEmail(pendingRemoveEmail)
    try {
      await removeSubscriber(pendingRemoveEmail)
      toast.success('Subscriber removed')
    } finally {
      setRemovingEmail(null)
      setPendingRemoveEmail(null)
    }
  }, [pendingRemoveEmail, removeSubscriber])

  const handleBroadcastSubmit = useCallback((e: { preventDefault(): void }) => {
    e.preventDefault()
    setIsBroadcastConfirmOpen(true)
  }, [])

  const confirmBroadcast = useCallback(async () => {
    setIsBroadcastConfirmOpen(false)
    setBroadcastStatus('loading')
    setBroadcastError('')
    try {
      const { data: { session } } = await (await import('@/infrastructure/supabase/client')).supabase.auth.getSession()
      const token = session?.access_token ? `Bearer ${session.access_token}` : ''
      const res = await fetch('/api/newsletter/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token },
        body: JSON.stringify({ subject: broadcastSubject, message: broadcastMessage })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send')
      setBroadcastStatus('success')
      toast.success('Newsletter sent')
      setBroadcastSubject('')
      setBroadcastMessage('')
    } catch (err) {
      setBroadcastStatus('error')
      setBroadcastError(err instanceof Error ? err.message : 'Failed to send')
    }
  }, [broadcastSubject, broadcastMessage])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) return null

  const completed = books.filter(b => b.status === BookStatus.Completed).length
  const reading   = books.filter(b => b.status === BookStatus.InProgress).length
  const toRead    = books.filter(b => b.status === BookStatus.NotStarted).length

  const formatDate = (date: string | Date) =>
    new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  const tabs: { value: Tab; label: string; count?: number }[] = [
    { value: 'tracker', label: 'Tracker' },
    { value: 'site', label: 'Site' },
    { value: 'newsletter', label: 'Newsletter', count: subscribersLoading ? undefined : subscribers.length },
  ]

  return (
    <PageContainer>
      <header className="pt-10 sm:pt-16">
        <p className="text-[13px] font-semibold text-muted-foreground">Admin</p>
        <h1 className="mt-1 text-[2rem] font-semibold leading-10 tracking-tight sm:text-[2.75rem] sm:leading-13">
          {tab === 'tracker' ? TRACKER_VIEW_TITLE[trackerView] : tab === 'site' ? 'The site' : 'Newsletter'}
        </h1>
        <div className="mt-6">
          <Segmented id="admin-tab" label="Admin section" options={tabs} value={tab} onChange={setTab} />
        </div>
      </header>

      <div className={tab === 'tracker' ? 'mx-auto mt-8 max-w-xl' : 'mt-10'}>

        {/* ── TRACKER: Today, Week, Habits ── */}
        {tab === 'tracker' && <HabitTracker view={trackerView} onViewChange={setTrackerView} />}

        {/* ── SITE (redesigned in a later step) ── */}
        {tab === 'site' && (
          <div className="space-y-8">

            {/* STAT CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: 'Total books',  value: booksLoading ? null : books.length,            icon: BookOpen,    color: 'text-primary',      bg: 'bg-primary/10',      border: 'border-primary/20'      },
                { label: 'Reading now',  value: booksLoading ? null : reading,                 icon: Clock,       color: 'text-info',         bg: 'bg-info/10',         border: 'border-info/20'         },
                { label: 'Completed',    value: booksLoading ? null : completed,               icon: CheckCircle, color: 'text-success',      bg: 'bg-success/10',      border: 'border-success/20'      },
                { label: 'Notes',        value: writtenNotesLoading ? null : writtenNotes.length, icon: NotebookPen, color: 'text-warning',      bg: 'bg-warning/10',      border: 'border-warning/20'      },
                { label: 'Games',        value: gamesLoading ? null : games.length,            icon: Gamepad2,    color: 'text-brand-accent', bg: 'bg-brand-accent/10', border: 'border-brand-accent/20' },
                { label: 'Study topics', value: topicsLoading ? null : topics.length,          icon: BookMarked,  color: 'text-info',         bg: 'bg-info/10',         border: 'border-info/20'         },
                { label: 'Subscribers',  value: subscribersLoading ? null : subscribers.length, icon: Users,      color: 'text-brand-accent', bg: 'bg-brand-accent/10', border: 'border-brand-accent/20' },
              ].map(({ label, value, icon: Icon, color, bg, border }) => (
                <div key={label} className={`p-5 rounded-2xl border ${border} ${bg}`}>
                  <div className="mb-4">
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <p className={`text-3xl font-bold ${color}`}>
                    {value === null
                      ? <Loader2 className="w-5 h-5 animate-spin" />
                      : value}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">{label}</p>
                </div>
              ))}
            </div>

            {/* QUICK LINKS */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Go to</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Library',    icon: Library,   href: '/library',       targetTab: null             as Tab | null },
                  { label: 'Notes',      icon: FileText,  href: '/notes',         targetTab: null             as Tab | null },
                  { label: 'Games',      icon: Gamepad2,  href: '/games',         targetTab: null             as Tab | null },
                  { label: 'Studies',    icon: BookMarked, href: '/studies',      targetTab: null             as Tab | null },
                  { label: 'Newsletter', icon: Mail,      href: null,             targetTab: 'newsletter'     as Tab | null },
                ].map(({ label, icon: Icon, href, targetTab }) =>
                  href ? (
                    <Link
                      key={label}
                      href={href}
                      className="group flex items-center gap-3 px-4 py-3 rounded-xl border border-border/60 bg-card hover:shadow-sm hover:border-border transition-all"
                    >
                      <Icon className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                      <span className="text-sm font-medium">{label}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  ) : (
                    <button
                      key={label}
                      onClick={() => setTab(targetTab!)}
                      className="group flex items-center gap-3 px-4 py-3 rounded-xl border border-border/60 bg-card hover:shadow-sm hover:border-border transition-all"
                    >
                      <Icon className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                      <span className="text-sm font-medium">{label}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  )
                )}
              </div>
            </div>

            {/* READING PROGRESS */}
            {!booksLoading && books.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Reading progress</p>
                <div className="p-5 rounded-2xl border border-border/60 bg-card">
                  <div className="flex items-center justify-between text-sm mb-3">
                    <span className="text-muted-foreground">{completed} of {books.length} books completed</span>
                    <span className="font-semibold">{Math.round((completed / books.length) * 100)}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-foreground rounded-full transition-all duration-500"
                      style={{ width: `${(completed / books.length) * 100}%` }}
                    />
                  </div>
                  <div className="flex gap-4 mt-4">
                    {[
                      { label: 'Reading', count: reading,   color: 'bg-info'                },
                      { label: 'To read',  count: toRead,    color: 'bg-muted-foreground/30' },
                      { label: 'Done',     count: completed, color: 'bg-success'             },
                    ].map(({ label, count, color }) => (
                      <div key={label} className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${color}`} />
                        <span className="text-xs text-muted-foreground">{count} {label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── NEWSLETTER ── */}
        {tab === 'newsletter' && (
          <div className="space-y-6">

            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">
                {subscribersLoading ? '—' : subscribers.length}
                <span className="text-base font-normal text-muted-foreground ml-2">
                  active subscriber{subscribers.length !== 1 ? 's' : ''}
                </span>
              </p>
              {!subscribersLoading && subscribers.length > 0 && (
                <button
                  onClick={() => { setCompose(v => !v); setBroadcastStatus('idle') }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    compose
                      ? 'border border-border text-muted-foreground hover:text-foreground'
                      : 'bg-primary text-primary-foreground hover:opacity-90'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  {compose ? 'Cancel' : 'Send email'}
                </button>
              )}
            </div>

            {compose && (
              <div className="p-5 rounded-2xl border border-border/60 bg-card">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
                  Compose — {subscribers.length} recipient{subscribers.length !== 1 ? 's' : ''}
                </p>
                {broadcastStatus === 'success' ? (
                  <div className="py-4 text-center">
                    <p className="text-sm font-medium text-success">
                      Sent to {subscribers.length} subscriber{subscribers.length !== 1 ? 's' : ''}.
                    </p>
                    <button
                      onClick={() => { setBroadcastStatus('idle'); setCompose(false) }}
                      className="text-xs text-muted-foreground hover:text-foreground mt-2 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleBroadcastSubmit} className="flex flex-col gap-3">
                    <input
                      type="text"
                      placeholder="Subject"
                      value={broadcastSubject}
                      onChange={e => setBroadcastSubject(e.target.value)}
                      required
                      disabled={broadcastStatus === 'loading'}
                      className="border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                    />
                    <textarea
                      placeholder="Write your message..."
                      value={broadcastMessage}
                      onChange={e => setBroadcastMessage(e.target.value)}
                      required
                      rows={6}
                      disabled={broadcastStatus === 'loading'}
                      className="border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 resize-none"
                    />
                    {broadcastStatus === 'error' && (
                      <p className="text-sm text-destructive-text">{broadcastError}</p>
                    )}
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={broadcastStatus === 'loading'}
                        className="flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-5 py-2.5 text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
                      >
                        {broadcastStatus === 'loading'
                          ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending...</>
                          : <><Send className="w-3.5 h-3.5" /> Send</>
                        }
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {subscribersLoading ? <Spinner /> : subscribers.length === 0 ? (
              <Empty message="No subscribers yet. Share the site and they'll show up here." />
            ) : (
              <div className="divide-y divide-border/50 border border-border/60 rounded-2xl overflow-hidden bg-card">
                {subscribers.map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-brand-accent/10 flex items-center justify-center shrink-0">
                        <Mail className="w-3.5 h-3.5 text-brand-accent" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{sub.email}</p>
                        <p className="text-xs text-muted-foreground">Subscribed {formatDate(sub.subscribedAt)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemove(sub.email)}
                      disabled={removingEmail === sub.email}
                      className="shrink-0 ml-4 p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-40"
                      aria-label={`Remove ${sub.email}`}
                    >
                      {removingEmail === sub.email
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Trash2 className="w-4 h-4" />
                      }
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      <AlertDialog open={!!pendingRemoveEmail} onOpenChange={(open) => !open && setPendingRemoveEmail(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this subscriber?</AlertDialogTitle>
            <AlertDialogDescription>
              This action can&apos;t be undone. {pendingRemoveEmail} will stop receiving updates and will need to subscribe again to rejoin.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel />
            <AlertDialogAction onClick={confirmRemove}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isBroadcastConfirmOpen} onOpenChange={setIsBroadcastConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send this newsletter?</AlertDialogTitle>
            <AlertDialogDescription>
              This will email &ldquo;{broadcastSubject || 'this message'}&rdquo; to all {subscribers.length} subscriber{subscribers.length === 1 ? '' : 's'} right now. This can&apos;t be undone or unsent.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel />
            <AlertDialogAction onClick={confirmBroadcast}>Send</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  )
}

function Spinner() {
  return (
    <div className="flex justify-center py-12">
      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
    </div>
  )
}

function Empty({ message }: { message: string }) {
  return (
    <div className="text-center py-16 border border-dashed border-border/50 rounded-2xl">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
