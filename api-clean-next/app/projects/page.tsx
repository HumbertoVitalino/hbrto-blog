import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { PageContainer, PageHeader, PageLead } from '@/app/components/layout/PageHeader'
import { FadeIn } from '@/app/components/motion/FadeIn'
import { ProductStage } from '@/app/components/projects/Devices'
import { PROJECTS } from '@/lib/projects'

export const metadata: Metadata = {
    title: 'Projects',
    description: 'Things I’ve built end to end, from the domain model to production.',
}

export default function ProjectsPage() {
    return (
        <PageContainer>
            <PageHeader title="Things I’ve built, end to end.">
                <PageLead>
                    From the domain model to production: the architecture, the tests, the pipeline that ships it,
                    and the screens people actually use. The code for each one is public.
                </PageLead>
            </PageHeader>

            <div className="mt-16 flex flex-col gap-24 pb-8 sm:mt-20">
                {PROJECTS.map((project, i) => (
                    <FadeIn key={project.slug} index={i + 1}>
                        <article className="product-card group relative">
                            <ProductStage desktop={project.desktop} phone={project.phone} priority={i === 0} />
                            <div className="grid gap-x-12 gap-y-4 px-1 pt-8 sm:grid-cols-[1fr_auto] sm:items-end">
                                <div>
                                    <p className="flex items-center gap-2.5 text-sm text-muted-foreground">
                                        {project.context}
                                        <span aria-hidden className="h-3.5 w-0.5 rounded-full bg-border" />
                                        {project.period}
                                    </p>
                                    <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                                        <Link
                                            href={`/projects/${project.slug}`}
                                            className="after:absolute after:inset-0 after:rounded-[1.75rem] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-ring"
                                        >
                                            {project.name}
                                        </Link>
                                    </h2>
                                    <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-muted-foreground text-pretty">{project.summary}</p>
                                    <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Built with">
                                        {project.tags.map(tag => (
                                            <li key={tag} className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">{tag}</li>
                                        ))}
                                    </ul>
                                </div>
                                <span aria-hidden className="flex items-center text-[15px] font-medium whitespace-nowrap text-brand-accent">
                                    Read the case
                                    <ChevronRight className="ml-0.5 size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                                </span>
                            </div>
                        </article>
                    </FadeIn>
                ))}
            </div>
        </PageContainer>
    )
}
