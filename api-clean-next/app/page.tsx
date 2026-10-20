import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { NoteRepository } from '@/infrastructure/repositories/NoteRepository'
import { GetAllNotesUseCase } from '@/application/usecases'
import { notesToPlain } from '@/lib/mappers'
import { noteDate, noteExcerpt } from '@/lib/notes'
import { PageContainer } from '@/app/components/layout/PageHeader'
import { FadeIn } from '@/app/components/motion/FadeIn'
import { PhotoStrip } from '@/app/components/home/PhotoStrip'
import { STRIP_PHOTOS } from '@/app/components/home/photos'
import { SocialIcons } from '@/app/components/home/SocialLinks'
import { WorkCard } from '@/app/components/home/WorkCard'
import { NotesSubscribe } from '@/app/components/notes/NotesSubscribe'

// publishing a note revalidates this page right away; the timer only covers edits made elsewhere
export const revalidate = 60

async function latestNotes() {
    try {
        return notesToPlain(await new GetAllNotesUseCase(new NoteRepository()).execute()).slice(0, 3)
    } catch (error) {
        console.error('[home] failed to load notes', error)
        return []
    }
}

const inline = 'text-foreground underline decoration-foreground/25 underline-offset-3 transition-colors hover:text-brand-accent hover:decoration-brand-accent'

export default async function HomePage() {
    const notes = await latestNotes()

    return (
        <>
            <PageContainer>
                <FadeIn>
                    <header className="max-w-2xl pt-14 sm:pt-22">
                        <h1 className="text-[2rem] font-semibold leading-10 tracking-tight text-pretty sm:text-5xl sm:leading-14">
                            Software engineer, looking for new hobbies.
                        </h1>
                        <p className="mt-6 text-base text-muted-foreground text-pretty">
                            Software Engineer at{' '}
                            <a href="https://www.itau.com.br" target="_blank" rel="noopener noreferrer" className={inline}>Itaú Unibanco</a>,
                            building .NET services on AWS. Clean Architecture and DDD are how I work every day.
                            Based in São Paulo, doing a postgrad in Software Architecture at FIAP.
                        </p>
                        <SocialIcons />
                    </header>
                </FadeIn>
            </PageContainer>

            {/* outside the container: the strip is wider than the column and runs off both edges */}
            <div className="mt-16 sm:mt-20">
                <PhotoStrip photos={STRIP_PHOTOS} />
            </div>

            <PageContainer>
                <div className="mt-24 grid grid-cols-1 gap-y-20 lg:mt-28 lg:grid-cols-2 lg:gap-x-20">
                    <FadeIn index={2}>
                        <section aria-labelledby="latest-heading">
                            <h2 id="latest-heading" className="text-sm font-semibold">Latest notes</h2>
                            {notes.length === 0 ? (
                                <p className="mt-10 text-sm text-muted-foreground">Nothing written yet.</p>
                            ) : (
                                <div className="mt-10 flex flex-col gap-14">
                                    {notes.map(note => (
                                        <article key={note.id} className="hover-surface flex flex-col items-start">
                                            <h3 className="text-base font-semibold tracking-tight text-balance">
                                                <Link href={`/notes/${note.id}`} className="stretched-link">{note.entries[0].title}</Link>
                                            </h3>
                                            <time dateTime={note.createdAt} className="order-first mb-3 flex items-center gap-2.5 text-sm text-muted-foreground">
                                                <span aria-hidden className="h-3.5 w-0.5 rounded-full bg-border" />
                                                {noteDate(note.createdAt)}
                                            </time>
                                            <p className="mt-2 text-sm text-muted-foreground text-pretty">{noteExcerpt(note.entries[0].body, 170)}</p>
                                            <span aria-hidden className="mt-4 flex items-center text-sm font-medium text-brand-accent">
                                                Read the note
                                                <ChevronRight className="ml-0.5 size-4" />
                                            </span>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </section>
                    </FadeIn>

                    <FadeIn index={3} className="flex flex-col gap-10 lg:pl-8">
                        <NotesSubscribe />
                        <WorkCard />
                    </FadeIn>
                </div>
            </PageContainer>
        </>
    )
}
