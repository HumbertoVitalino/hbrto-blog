'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'
import { useEffect } from 'react'
import { useBooks } from '@/app/hooks/useBooks'
import { useReviews } from '@/app/hooks/useReviews'
import { useReleaseNotes } from '@/app/hooks/useReleaseNotes'
import { BookStatus } from '@/domain/BookStatus'
import Link from 'next/link'
import { Loader2, BookOpen, Star, Zap, Plus, ArrowUpRight, CheckCircle, Clock, Library } from 'lucide-react'

export default function AdminPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { books, isLoading: booksLoading } = useBooks()
  const { reviews, isLoading: reviewsLoading } = useReviews()
  const { notes, isLoading: notesLoading } = useReleaseNotes()

  useEffect(() => {
    if (!authLoading && !user) router.push('/admin/login')
  }, [user, authLoading, router])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) return null

  const completed = books.filter(b => b.status === BookStatus.Completed).length
  const reading = books.filter(b => b.status === BookStatus.InProgress).length

  const stats = [
    { label: 'Total books', value: booksLoading ? '—' : books.length, icon: BookOpen, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Reading now', value: booksLoading ? '—' : reading, icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Completed', value: booksLoading ? '—' : completed, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Reviews', value: reviewsLoading ? '—' : reviews.length, icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { label: 'Releases', value: notesLoading ? '—' : notes.length, icon: Zap, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ]

  const quickActions = [
    { href: '/library', icon: Library, label: 'Manage Library', description: 'Add, edit or remove books from your library.', color: 'text-primary', bg: 'bg-primary/10' },
    { href: '/reviews', icon: Star, label: 'Manage Reviews', description: 'Write and manage book reviews.', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-500/10' },
    { href: '/release-notes', icon: Zap, label: 'Manage Releases', description: 'Publish and update release notes.', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-500/10' },
  ]

  const recentBooks = books.slice(0, 5)
  const recentNotes = notes.slice(0, 3)

  return (
    <main className="min-h-screen bg-background">

      {/* HEADER */}
      <section className="border-b bg-muted/10">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Admin</p>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground mt-2">
                Signed in as <span className="font-medium text-foreground">{user.email}</span>
              </p>
            </div>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-8 pt-8 border-t border-border/50">
            {stats.map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold leading-none">{value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-12">

        {/* QUICK ACTIONS */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Manage content</h2>
            <div className="flex-1 h-px bg-border/50" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {quickActions.map(({ href, icon: Icon, label, description, color, bg }) => (
              <Link
                key={href}
                href={href}
                className="group p-5 rounded-2xl border border-border/60 bg-card hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-4`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-sm">{label}</h3>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* RECENT BOOKS */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Recent books</h2>
            <div className="flex-1 h-px bg-border/50" />
            <Link href="/library" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          {booksLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          ) : recentBooks.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-border/50 rounded-2xl">
              <p className="text-sm text-muted-foreground">No books yet.</p>
              <Link href="/library" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 mt-3 transition-colors">
                <Plus className="w-3.5 h-3.5" /> Add first book
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border/50 border border-border/60 rounded-2xl overflow-hidden bg-card">
              {recentBooks.map((book) => (
                <div key={book.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    {book.coverImageUrl ? (
                      <img src={book.coverImageUrl} alt="" className="w-8 h-10 object-cover rounded shrink-0" />
                    ) : (
                      <div className="w-8 h-10 bg-muted rounded shrink-0 flex items-center justify-center">
                        <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{book.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{book.author}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ml-4 ${
                    book.status === BookStatus.Completed ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                    book.status === BookStatus.InProgress ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {book.status === BookStatus.Completed ? 'Completed' :
                     book.status === BookStatus.InProgress ? 'Reading' : 'To read'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RECENT RELEASES */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Recent releases</h2>
            <div className="flex-1 h-px bg-border/50" />
            <Link href="/release-notes" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          {notesLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          ) : recentNotes.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-border/50 rounded-2xl">
              <p className="text-sm text-muted-foreground">No releases yet.</p>
              <Link href="/release-notes" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 mt-3 transition-colors">
                <Plus className="w-3.5 h-3.5" /> Publish first release
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border/50 border border-border/60 rounded-2xl overflow-hidden bg-card">
              {recentNotes.map((note) => (
                <div key={note.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-mono font-medium bg-muted px-2 py-0.5 rounded border border-border/50 shrink-0">
                      {note.version}
                    </span>
                    <p className="text-sm font-medium truncate">{note.title}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
