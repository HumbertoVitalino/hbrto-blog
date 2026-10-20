import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { ArrowLeft } from 'lucide-react'
import { NoteRepository } from '@/infrastructure/repositories/NoteRepository'
import { GetAllNotesUseCase, GetNoteByIdUseCase } from '@/application/usecases'
import { noteToPlain, notesToPlain, type NoteData } from '@/lib/mappers'
import { parseMarkdown } from '@/lib/markdown'
import { noteDate, noteExcerpt, subjectHref } from '@/lib/notes'
import { NoteBody } from '@/app/components/notes/NoteBody'
import { NoteActions } from '@/app/components/notes/NoteAdmin'
import { NotesSubscribe } from '@/app/components/notes/NotesSubscribe'

export const revalidate = 60

type Props = { params: Promise<{ noteId: string }> }

// metadata and the page share one fetch per request
const getNote = cache(async (id: string) => {
  const note = await new GetNoteByIdUseCase(new NoteRepository()).execute(id)
  return note ? noteToPlain(note) : null
})

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { noteId } = await params
  const note = await getNote(noteId)
  if (!note) return { title: 'Note not found' }
  const entry = note.entries[0]
  return {
    title: entry.title,
    description: noteExcerpt(entry.body, 160),
    openGraph: { type: 'article', publishedTime: note.createdAt, modifiedTime: note.updatedAt },
  }
}

async function neighbours(id: string): Promise<{ newer?: NoteData; older?: NoteData }> {
  // a failure here only loses the links at the end of the page
  try {
    const all = notesToPlain(await new GetAllNotesUseCase(new NoteRepository()).execute())
    const i = all.findIndex(n => n.id === id)
    return { newer: i > 0 ? all[i - 1] : undefined, older: i >= 0 ? all[i + 1] : undefined }
  } catch {
    return {}
  }
}

function PagerLink({ note, label, align }: { note: NoteData; label: string; align: 'start' | 'end' }) {
  return (
    <div className={`hover-surface flex flex-col ${align === 'end' ? 'sm:items-end sm:text-right' : 'items-start'}`}>
      <h3 className="text-[15px] font-semibold leading-snug tracking-tight text-balance">
        <Link href={`/notes/${note.id}`} className="stretched-link">{note.entries[0].title}</Link>
      </h3>
      <span className="order-first mb-1.5 text-sm text-muted-foreground">{label}</span>
    </div>
  )
}

export default async function NotePage({ params }: Props) {
  const { noteId } = await params
  const note = await getNote(noteId)
  if (!note) notFound()

  const versions = note.entries.map(e => ({ language: e.language, title: e.title, html: parseMarkdown(e.body) }))
  const { newer, older } = await neighbours(note.id)
  const edited = new Date(note.updatedAt).getTime() - new Date(note.createdAt).getTime() > 86_400_000

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-8">
      <div className="relative mx-auto max-w-2xl pt-16 sm:pt-24">
        <Link
          href="/notes"
          aria-label="Back to notes"
          className="group mb-8 grid size-10 place-items-center rounded-full bg-card shadow-md shadow-foreground/5 ring-1 ring-border transition dark:bg-muted xl:absolute xl:-left-20 xl:top-24 xl:mb-0"
        >
          <ArrowLeft className="size-4 text-muted-foreground transition group-hover:-translate-x-0.5 group-hover:text-brand-accent" />
        </Link>

        <article>
          <NoteBody
            versions={versions}
            date={
              <p className="flex items-center gap-3 text-base text-muted-foreground">
                <span aria-hidden className="h-4 w-0.5 rounded-full bg-border" />
                <time dateTime={note.createdAt}>{noteDate(note.createdAt)}</time>
                {edited && (
                  <span className="text-sm">
                    · edited <time dateTime={note.updatedAt}>{noteDate(note.updatedAt)}</time>
                  </span>
                )}
              </p>
            }
            meta={
              <>
                {note.subjects.length > 0 && (
                  <p className="mt-5 text-sm text-muted-foreground">
                    On{' '}
                    {note.subjects.map((s, i) => (
                      <span key={`${s.kind}-${s.id}`}>
                        {i > 0 && (i === note.subjects.length - 1 ? ' and ' : ', ')}
                        <Link
                          href={subjectHref(s)}
                          className="font-medium text-brand-accent underline-offset-3 hover:underline"
                        >
                          {s.title}
                        </Link>
                        {s.byline && <> by {s.byline}</>}
                      </span>
                    ))}
                  </p>
                )}
                <NoteActions note={note} className="-ml-2.5 mt-4" />
              </>
            }
          />
        </article>

        {(newer || older) && (
          <nav aria-label="More notes" className="mt-20 grid gap-12 border-t border-border pt-10 sm:grid-cols-2">
            {newer ? <PagerLink note={newer} label="Newer" align="start" /> : <span className="hidden sm:block" />}
            {older && <PagerLink note={older} label="Older" align="end" />}
          </nav>
        )}

        <NotesSubscribe className="mt-28" />
      </div>
    </div>
  )
}
