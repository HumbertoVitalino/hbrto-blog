import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { NoteRepository } from '@/infrastructure/repositories/NoteRepository'
import { GetAllNotesUseCase } from '@/application/usecases'
import { notesToPlain, type NoteData } from '@/lib/mappers'
import { noteDate, noteDay, noteExcerpt, noteOpening, noteYear } from '@/lib/notes'
import { NotesArchive, Cites, type ArchiveRow } from '@/app/components/notes/NotesArchive'
import { NotesSubscribe } from '@/app/components/notes/NotesSubscribe'
import { NewNoteButton } from '@/app/components/notes/NoteAdmin'
import { PageContainer, PageHeader, PageLead } from '@/app/components/layout/PageHeader'
import { FadeIn } from '@/app/components/motion/FadeIn'

// Publishing revalidates this page right away; the timer only covers edits made elsewhere.
export const revalidate = 60

async function loadNotes() {
  try {
    return notesToPlain(await new GetAllNotesUseCase(new NoteRepository()).execute())
  } catch (error) {
    console.error('[notes] failed to load', error)
    return null
  }
}

function citesOf(note: NoteData): ArchiveRow['cites'] {
  return note.subjects.map(s => ({ kind: s.kind, title: s.title, byline: s.byline }))
}

function toRow(note: NoteData): ArchiveRow {
  const entry = note.entries[0]
  return {
    id: note.id,
    title: entry.title,
    iso: note.createdAt,
    day: noteDay(note.createdAt),
    year: noteYear(note.createdAt),
    excerpt: noteExcerpt(entry.body, 180),
    cites: citesOf(note),
  }
}

function countLine(notes: NoteData[]) {
  const count = notes.length === 1 ? '1 note' : `${notes.length} notes`
  const first = noteYear(notes[notes.length - 1].createdAt)
  return first < noteYear(new Date().toISOString()) ? `${count} since ${first}.` : `${count} so far.`
}

export default async function NotesPage() {
  const notes = await loadNotes()
  const [latest, ...rest] = notes ?? []

  return (
    <PageContainer>
      {/* left-aligned like every page; the list keeps a reading width */}
      <div className="max-w-3xl">
        <PageHeader title="Notes on what I read, play and build.">
          <PageLead>
            Things I wanted to write down after finishing a book or a game, or after a week of work.
            {notes && notes.length > 0 && <> {countLine(notes)}</>}
          </PageLead>
          <NewNoteButton className="mt-8" />
        </PageHeader>

        {notes === null && (
          <p role="alert" className="mt-16 text-sm text-muted-foreground">
            The notes couldn’t be loaded right now. Try again in a minute.
          </p>
        )}

        {notes?.length === 0 && (
          <p className="mt-16 text-sm text-muted-foreground">Nothing written yet.</p>
        )}

        {latest && (
          <FadeIn index={1}>
          <section aria-labelledby="latest-heading" className="mt-16 sm:mt-20">
            <h2 id="latest-heading" className="text-sm font-semibold">Latest</h2>
            <article className="hover-surface mt-10 flex flex-col items-start">
              <h3 className="text-2xl font-semibold tracking-tight text-balance sm:text-[1.875rem] sm:leading-[2.375rem]">
                <Link href={`/notes/${latest.id}`} className="stretched-link">{latest.entries[0].title}</Link>
              </h3>
              <time dateTime={latest.createdAt} className="order-first mb-3 flex items-center gap-2.5 text-sm text-muted-foreground">
                <span aria-hidden className="h-3.5 w-0.5 rounded-full bg-border" />
                {noteDate(latest.createdAt)}
              </time>
              <p className="mt-4 text-base text-muted-foreground text-pretty">{noteOpening(latest.entries[0].body)}</p>
              <Cites cites={citesOf(latest)} className="mt-4" />
              <span aria-hidden className="mt-4 flex items-center text-sm font-medium text-brand-accent">
                Read the note
                <ChevronRight className="ml-0.5 size-4" />
              </span>
            </article>
          </section>
          </FadeIn>
        )}

        {rest.length > 0 && (
          <FadeIn index={2}>
            <NotesArchive rows={rest.map(toRow)} />
          </FadeIn>
        )}

      </div>

      {/* outside the reading width: the box spans the whole content column, edge to edge with the footer */}
      <FadeIn index={3}>
        <NotesSubscribe className="mt-28" />
      </FadeIn>
    </PageContainer>
  )
}
