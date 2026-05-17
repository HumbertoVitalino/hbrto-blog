'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'
import { useEffect, useState, useCallback } from 'react'
import { useBooks } from '@/app/hooks/useBooks'
import { useReviews } from '@/app/hooks/useReviews'
import { useReleaseNotes } from '@/app/hooks/useReleaseNotes'
import { useSubscribers } from '@/app/hooks/useSubscribers'
import { BookStatus } from '@/domain/BookStatus'
import Link from 'next/link'
import {
  Loader2, BookOpen, Star, Zap, CheckCircle, Clock,
  Library, Mail, Trash2, Send, ArrowUpRight, Users, FileText
} from 'lucide-react'

type Tab = 'overview' | 'books' | 'reviews' | 'newsletter'

export default function AdminPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { books, isLoading: booksLoading } = useBooks()
  const { reviews, isLoading: reviewsLoading } = useReviews()
  const { notes, isLoading: notesLoading } = useReleaseNotes()
  const { subscribers, isLoading: subscribersLoading, removeSubscriber } = useSubscribers()

  const [tab, setTab] = useState<Tab>('overview')
  const [removingEmail, setRemovingEmail] = useState<string | null>(null)
  const [compose, setCompose] = useState(false)
  const [broadcastSubject, setBroadcastSubject] = useState('')
  const [broadcastMessage, setBroadcastMessage] = useState('')
  const [broadcastStatus, setBroadcastStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [broadcastError, setBroadcastError] = useState('')

  useEffect(() => {
    if (!authLoading && !user) router.push('/admin/login')
  }, [user, authLoading, router])

  const handleRemove = useCallback(async (email: string) => {
    setRemovingEmail(email)
    try { await removeSubscriber(email) }
    finally { setRemovingEmail(null) }
  }, [removeSubscriber])

  const handleBroadcast = useCallback(async (e: { preventDefault(): void }) => {
    e.preventDefault()
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
      setBroadcastSubject('')
      setBroadcastMessage('')
    } catch (err: any) {
      setBroadcastStatus('error')
      setBroadcastError(err.message)
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

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview',   label: 'Overview'   },
    { id: 'books',      label: 'Books'      },
    { id: 'reviews',    label: 'Reviews'    },
    { id: 'newsletter', label: 'Newsletter' },
  ]

  return (
    <main className="min-h-screen bg-background">

      {/* PAGE HEADER */}
      <section className="border-b bg-muted/10">
        <div className="max-w-5xl mx-auto px-6 pt-12 pb-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Admin</p>
          <h1 className="text-3xl font-bold tracking-tight mb-8">Dashboard</h1>

          {/* TABS */}
          <div className="flex gap-1">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2 -mb-px ${
                  tab === t.id
                    ? 'border-foreground text-foreground bg-background'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {t.label}
                {t.id === 'newsletter' && !subscribersLoading && subscribers.length > 0 && (
                  <span className="ml-2 text-xs bg-pink-500/15 text-pink-600 dark:text-pink-400 px-1.5 py-0.5 rounded-full font-medium">
                    {subscribers.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <div className="space-y-8">

            {/* STAT CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: 'Total books',  value: booksLoading ? null : books.length,            icon: BookOpen,    color: 'text-primary',    bg: 'bg-primary/10',    border: 'border-primary/20'    },
                { label: 'Reading now',  value: booksLoading ? null : reading,                 icon: Clock,       color: 'text-blue-500',   bg: 'bg-blue-500/10',   border: 'border-blue-500/20'   },
                { label: 'Completed',    value: booksLoading ? null : completed,               icon: CheckCircle, color: 'text-green-500',  bg: 'bg-green-500/10',  border: 'border-green-500/20'  },
                { label: 'Reviews',      value: reviewsLoading ? null : reviews.length,        icon: Star,        color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
                { label: 'Releases',     value: notesLoading ? null : notes.length,            icon: Zap,         color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
                { label: 'Subscribers',  value: subscribersLoading ? null : subscribers.length, icon: Users,      color: 'text-pink-500',   bg: 'bg-pink-500/10',   border: 'border-pink-500/20'   },
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
                  { label: 'Library',    icon: Library,  href: '/library',       targetTab: null             as Tab | null },
                  { label: 'Reviews',    icon: FileText, href: '/reviews',       targetTab: null             as Tab | null },
                  { label: 'Releases',   icon: Zap,      href: '/release-notes', targetTab: null             as Tab | null },
                  { label: 'Newsletter', icon: Mail,     href: null,             targetTab: 'newsletter'     as Tab | null },
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
                      { label: 'Reading', count: reading,   color: 'bg-blue-500'           },
                      { label: 'To read',  count: toRead,    color: 'bg-muted-foreground/30' },
                      { label: 'Done',     count: completed, color: 'bg-green-500'           },
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

        {/* ── BOOKS ── */}
        {tab === 'books' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                {booksLoading ? '—' : `${books.length} books total`}
              </p>
              <Link href="/library" className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                <Library className="w-3.5 h-3.5" /> Manage in Library
              </Link>
            </div>

            {booksLoading ? <Spinner /> : books.length === 0 ? (
              <Empty message="No books yet." />
            ) : (
              <div className="divide-y divide-border/50 border border-border/60 rounded-2xl overflow-hidden bg-card">
                {books.map((book) => (
                  <div key={book.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/30 transition-colors">
                    {book.coverImageUrl ? (
                      <img src={book.coverImageUrl} alt="" className="w-8 h-10 object-cover rounded shrink-0" />
                    ) : (
                      <div className="w-8 h-10 bg-muted rounded shrink-0 flex items-center justify-center">
                        <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{book.title}</p>
                      <p className="text-xs text-muted-foreground">{book.author}</p>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${
                      book.status === BookStatus.Completed  ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                      book.status === BookStatus.InProgress ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'   :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {book.status === BookStatus.Completed  ? 'Completed' :
                       book.status === BookStatus.InProgress ? 'Reading'   : 'To read'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── REVIEWS ── */}
        {tab === 'reviews' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                {reviewsLoading ? '—' : `${reviews.length} reviews total`}
              </p>
              <Link href="/reviews" className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                <FileText className="w-3.5 h-3.5" /> Manage in Reviews
              </Link>
            </div>

            {reviewsLoading ? <Spinner /> : reviews.length === 0 ? (
              <Empty message="No reviews yet." />
            ) : (
              <div className="divide-y divide-border/50 border border-border/60 rounded-2xl overflow-hidden bg-card">
                {reviews.map((review) => (
                  <div key={review.id} className="flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{review.title}</p>
                      {review.createdAt && (
                        <p className="text-xs text-muted-foreground mt-0.5">{formatDate(review.createdAt)}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0 ml-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-border'}`} />
                      ))}
                    </div>
                  </div>
                ))}
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
                      : 'bg-foreground text-background hover:opacity-90'
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
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">
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
                  <form onSubmit={handleBroadcast} className="flex flex-col gap-3">
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
                      <p className="text-sm text-red-500">{broadcastError}</p>
                    )}
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={broadcastStatus === 'loading'}
                        className="flex items-center gap-2 bg-foreground text-background rounded-lg px-5 py-2.5 text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
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
                      <div className="w-8 h-8 rounded-full bg-pink-500/10 flex items-center justify-center shrink-0">
                        <Mail className="w-3.5 h-3.5 text-pink-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{sub.email}</p>
                        <p className="text-xs text-muted-foreground">Subscribed {formatDate(sub.subscribedAt)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemove(sub.email)}
                      disabled={removingEmail === sub.email}
                      className="shrink-0 ml-4 p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-40"
                      aria-label="Remove subscriber"
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
    </main>
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
