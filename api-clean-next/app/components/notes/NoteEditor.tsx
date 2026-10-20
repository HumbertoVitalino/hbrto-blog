'use client'

import { useEffect, useMemo, useState } from 'react'
import { Dialog } from 'radix-ui'
import { X } from 'lucide-react'
import { NOTE_LANGUAGES, type NoteLanguage, type NoteSubject, type NoteSubjectKind } from '@/domain/Note'
import type { NoteData } from '@/lib/mappers'
import { LANGUAGE_LABEL, NOTE_TIME_ZONE, noteDateInputValue } from '@/lib/notes'
import { parseMarkdown } from '@/lib/markdown'
import { useBooks } from '@/app/hooks/useBooks'
import { useGames } from '@/app/hooks/useGames'
import { noteApi, type NoteNotification } from '@/app/hooks/useNotes'
import { cn } from '@/lib/utils'

type Drafts = Record<NoteLanguage, { title: string; body: string }>

const EMPTY: Drafts = { en: { title: '', body: '' }, 'pt-BR': { title: '', body: '' } }

const PLATFORM_LABEL: Record<string, string> = { psn: 'PlayStation', 'nintendo-switch': 'Nintendo Switch' }

export interface NoteEditorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Present when editing. */
  note?: NoteData
  /** Cited from the start, e.g. when writing from a book's page. */
  preset?: { kind: NoteSubjectKind; id: string }
  onSaved: (note: NoteData, notification: NoteNotification) => void
}

function today() {
  return noteDateInputValue(new Date().toISOString())
}

/** Noon in São Paulo, so the chosen day never shifts across a time zone. */
function dayToIso(day: string) {
  return new Date(`${day}T12:00:00-03:00`).toISOString()
}

function Segmented<T extends string>({ label, options, value, onChange, render }: {
  label: string
  options: readonly T[]
  value: T
  onChange: (v: T) => void
  render: (v: T) => React.ReactNode
}) {
  return (
    <div role="tablist" aria-label={label} className="inline-flex rounded-full bg-muted p-0.5">
      {options.map(o => (
        <button
          key={o}
          type="button"
          role="tab"
          aria-selected={value === o}
          onClick={() => onChange(o)}
          className={cn(
            'rounded-full px-3 py-1 text-[13px] font-medium leading-6 transition-colors',
            value === o ? 'bg-card text-foreground shadow-sm ring-1 ring-border' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {render(o)}
        </button>
      ))}
    </div>
  )
}

export default function NoteEditor({ open, onOpenChange, note, preset, onSaved }: NoteEditorProps) {
  const mode = note ? 'edit' : 'create'
  const { books } = useBooks()
  const { games } = useGames()

  const [drafts, setDrafts] = useState<Drafts>(EMPTY)
  const [lang, setLang] = useState<NoteLanguage>('en')
  const [tab, setTab] = useState<'write' | 'preview'>('write')
  const [subjects, setSubjects] = useState<NoteSubject[]>([])
  const [query, setQuery] = useState('')
  const [day, setDay] = useState(today)
  const [notify, setNotify] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const originalDay = note ? noteDateInputValue(note.createdAt) : today()

  // Everything that can be cited, in one list.
  const catalog = useMemo<NoteSubject[]>(() => [
    ...books.filter(b => b.id).map(b => ({
      kind: 'book' as const, id: b.id!, title: b.title, byline: b.author, coverImageUrl: b.coverImageUrl,
    })),
    ...games.filter(g => g.id).map(g => ({
      kind: 'game' as const, id: g.id!, title: g.title, byline: PLATFORM_LABEL[g.platform] ?? g.platform, coverImageUrl: g.coverImageUrl,
    })),
  ], [books, games])

  // Start from a clean slate every time the editor opens.
  useEffect(() => {
    if (!open) return
    const next: Drafts = { en: { ...EMPTY.en }, 'pt-BR': { ...EMPTY['pt-BR'] } }
    for (const e of note?.entries ?? []) next[e.language] = { title: e.title, body: e.body }
    setDrafts(next)
    setLang(note?.entries[0]?.language ?? 'en')
    setTab('write')
    setSubjects(note?.subjects ?? [])
    setQuery('')
    setDay(note ? noteDateInputValue(note.createdAt) : today())
    setNotify(true)
    setError(null)
  }, [open, note])

  // The preset resolves once the catalog has loaded.
  useEffect(() => {
    if (!open || note || !preset) return
    const found = catalog.find(s => s.kind === preset.kind && s.id === preset.id)
    if (found) setSubjects(prev => (prev.some(s => s.id === found.id) ? prev : [found, ...prev]))
  }, [open, note, preset, catalog])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return catalog
      .filter(s => !subjects.some(x => x.kind === s.kind && x.id === s.id))
      .filter(s => s.title.toLowerCase().includes(q) || s.byline?.toLowerCase().includes(q))
      .slice(0, 8)
  }, [catalog, query, subjects])

  const draft = drafts[lang]
  const written = (l: NoteLanguage) => Boolean(drafts[l].title.trim() || drafts[l].body.trim())
  const previewHtml = useMemo(() => (tab === 'preview' ? parseMarkdown(draft.body) : ''), [tab, draft.body])

  const update = (field: 'title' | 'body', value: string) =>
    setDrafts(prev => ({ ...prev, [lang]: { ...prev[lang], [field]: value } }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const entries = NOTE_LANGUAGES.filter(written).map(l => ({
      language: l, title: drafts[l].title.trim(), body: drafts[l].body.trim(),
    }))

    if (entries.length === 0) return setError('Write a title and the note in at least one language.')
    const half = entries.find(x => !x.title || !x.body)
    if (half) {
      setLang(half.language)
      return setError(`The ${LANGUAGE_LABEL[half.language]} version needs both a title and the note itself.`)
    }

    const input = {
      entries,
      subjects: subjects.map(s => ({ kind: s.kind, id: s.id })),
      // an untouched date keeps the note's own timestamp (or "now" for a new one)
      createdAt: day && day !== originalDay ? dayToIso(day) : undefined,
    }
    try {
      setSaving(true)
      setError(null)
      if (note) {
        onSaved(await noteApi.update(note.id, input), null)
      } else {
        const { note: created, notification } = await noteApi.create({ ...input, notify })
        onSaved(created, notification)
      }
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The note could not be saved. Try again.')
    } finally {
      setSaving(false)
    }
  }

  const input = 'w-full rounded-md border border-border bg-card px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-brand-accent focus:outline-none focus:ring-3 focus:ring-brand-accent/20'

  return (
    <Dialog.Root open={open} onOpenChange={o => !saving && onOpenChange(o)}>
      <Dialog.Portal>
        <Dialog.Content aria-describedby={undefined} className="fixed inset-0 z-60 overflow-y-auto overscroll-contain bg-background">
          <form onSubmit={handleSubmit} className="flex min-h-full flex-col">
            <div className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur-sm">
              <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-8">
                <Dialog.Title className="text-sm font-semibold">
                  {mode === 'create' ? 'New note' : 'Edit note'}
                </Dialog.Title>
                <div className="flex items-center gap-2">
                  <Dialog.Close asChild>
                    <button type="button" disabled={saving} className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50">
                      Cancel
                    </button>
                  </Dialog.Close>
                  <button type="submit" disabled={saving} className="rounded-md bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60">
                    {saving
                      ? (mode === 'create' ? 'Publishing…' : 'Saving…')
                      : (mode === 'create' ? 'Publish' : 'Save')}
                  </button>
                </div>
              </div>
            </div>

            <div className="mx-auto grid w-full max-w-5xl flex-1 gap-12 px-4 pb-24 pt-8 sm:px-8 lg:grid-cols-[1fr_18rem]">
              <div className="min-w-0">
                <Segmented
                  label="Language version"
                  options={NOTE_LANGUAGES}
                  value={lang}
                  onChange={setLang}
                  render={l => (
                    <>
                      {LANGUAGE_LABEL[l]}
                      <span className="ml-1.5 text-muted-foreground">{written(l) ? '· written' : '· empty'}</span>
                    </>
                  )}
                />
                <p className="mt-2 text-[13px] text-muted-foreground">
                  Each language is its own version of the same note. An empty version isn’t published
                  {mode === 'edit' ? '; clear both fields to remove one' : ''}.
                </p>

                <label className="mt-8 block">
                  <span className="sr-only">Title ({LANGUAGE_LABEL[lang]})</span>
                  <input
                    value={draft.title}
                    onChange={e => update('title', e.target.value)}
                    lang={lang}
                    placeholder={lang === 'pt-BR' ? 'Título' : 'Title'}
                    className="w-full border-0 bg-transparent p-0 text-3xl font-semibold tracking-tight placeholder:text-muted-foreground/60 focus:outline-none sm:text-4xl"
                  />
                </label>

                <div className="mt-8 flex items-center justify-between gap-4">
                  <Segmented label="Editor view" options={['write', 'preview'] as const} value={tab} onChange={setTab} render={t => (t === 'write' ? 'Write' : 'Preview')} />
                  <span className="text-[13px] text-muted-foreground">Markdown</span>
                </div>

                {tab === 'write' ? (
                  <label className="mt-3 block">
                    <span className="sr-only">Note ({LANGUAGE_LABEL[lang]})</span>
                    <textarea
                      value={draft.body}
                      onChange={e => update('body', e.target.value)}
                      lang={lang}
                      placeholder={lang === 'pt-BR' ? 'O que você queria dizer?' : 'What did you want to say?'}
                      className="min-h-[55svh] w-full resize-y rounded-xl border border-border bg-card p-4 text-[15px] leading-7 placeholder:text-muted-foreground focus:border-brand-accent focus:outline-none focus:ring-3 focus:ring-brand-accent/20"
                    />
                  </label>
                ) : (
                  <div lang={lang} className="mt-3 min-h-[55svh] rounded-xl border border-border bg-card p-6">
                    {draft.body.trim()
                      ? <div className="prose-note" dangerouslySetInnerHTML={{ __html: previewHtml }} />
                      : <p className="text-sm text-muted-foreground">Nothing to preview yet.</p>}
                  </div>
                )}
              </div>

              <aside className="flex flex-col gap-10">
                <div>
                  <h3 className="text-sm font-semibold">Cites</h3>
                  <p className="mt-1 text-[13px] text-muted-foreground">
                    Books from the library and games from the catalog, as many as the note is about. None is fine too.
                  </p>

                  {subjects.length > 0 && (
                    <ol className="mt-4 flex flex-col gap-2">
                      {subjects.map(s => (
                        <li key={`${s.kind}-${s.id}`} className="flex items-center gap-3 rounded-lg border border-border bg-card py-2 pl-3 pr-1">
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium">{s.title}</span>
                            <span className="block truncate text-[13px] text-muted-foreground">
                              {s.kind === 'book' ? 'Book' : 'Game'}{s.byline ? ` · ${s.byline}` : ''}
                            </span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setSubjects(prev => prev.filter(x => !(x.kind === s.kind && x.id === s.id)))}
                            aria-label={`Stop citing ${s.title}`}
                            className="grid size-9 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          >
                            <X className="size-4" />
                          </button>
                        </li>
                      ))}
                    </ol>
                  )}

                  <label className="mt-4 block">
                    <span className="block text-[13px] font-medium">Add a book or game</span>
                    <input
                      type="search"
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      placeholder="Search by title, author or platform"
                      className={cn(input, 'mt-1.5')}
                    />
                  </label>
                  {query.trim() && (
                    <ul aria-label="Matches" className="mt-1 overflow-hidden rounded-lg border border-border bg-card">
                      {results.length === 0 && (
                        <li className="px-3 py-2.5 text-[13px] text-muted-foreground">Nothing in the library or the games catalog matches.</li>
                      )}
                      {results.map(s => (
                        <li key={`${s.kind}-${s.id}`} className="border-b border-border last:border-0">
                          <button
                            type="button"
                            onClick={() => { setSubjects(prev => [...prev, s]); setQuery('') }}
                            className="block w-full px-3 py-2 text-left transition-colors hover:bg-muted focus-visible:bg-muted"
                          >
                            <span className="block truncate text-sm font-medium">{s.title}</span>
                            <span className="block truncate text-[13px] text-muted-foreground">
                              {s.kind === 'book' ? 'Book' : 'Game'}{s.byline ? ` · ${s.byline}` : ''}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <label className="block">
                  <span className="block text-sm font-semibold">Published on</span>
                  <span className="mt-1 block text-[13px] text-muted-foreground">
                    The date readers see, in {NOTE_TIME_ZONE.split('/')[1].replace('_', ' ')} time.
                  </span>
                  <input type="date" value={day} max={today()} onChange={e => setDay(e.target.value)} className={cn(input, 'mt-2')} />
                </label>

                {mode === 'create' && (
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={notify}
                      onChange={e => setNotify(e.target.checked)}
                      className="mt-0.5 size-4 shrink-0 accent-brand-accent"
                    />
                    <span>
                      <span className="block text-sm font-semibold">Email subscribers</span>
                      <span className="block text-[13px] text-muted-foreground">
                        Sends the title and a link. Leave it off for quick notes.
                      </span>
                    </span>
                  </label>
                )}

                {error && (
                  <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive-text">
                    {error}
                  </p>
                )}
              </aside>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
