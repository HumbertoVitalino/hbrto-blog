import { Briefcase } from 'lucide-react'

interface Role {
    company: string
    initials: string
    title: string
    start: string
    /** a year, "Present", or "Paused" */
    end: string
    href?: string
}

// newest first; titles stay exactly as written elsewhere on the site
export const WORK: Role[] = [
    { company: 'Tegy', initials: 'T', title: 'Founder / Engineer', start: '2026', end: 'Paused', href: 'https://www.tegy.com.br' },
    { company: 'Itaú Unibanco', initials: 'I', title: 'Software Engineer', start: '2025', end: 'Present', href: 'https://www.itau.com.br' },
    { company: 'XP Inc.', initials: 'XP', title: 'Software Engineer', start: '2024', end: '2025', href: 'https://www.xpinc.com' },
]

export function WorkCard() {
    return (
        <section aria-labelledby="work-heading" className="rounded-2xl border border-border p-6">
            <h2 id="work-heading" className="flex items-center gap-3 text-sm font-semibold">
                <Briefcase className="size-5 text-muted-foreground" aria-hidden />
                Work
            </h2>
            <ol className="mt-6 flex flex-col gap-4">
                {WORK.map(role => (
                    <li key={role.company} className="flex items-center gap-4">
                        <span
                            aria-hidden
                            className="grid size-10 shrink-0 place-items-center rounded-full bg-card text-xs font-bold tracking-tight shadow-md shadow-foreground/5 ring-1 ring-border"
                        >
                            {role.initials}
                        </span>
                        <dl className="flex flex-auto flex-wrap gap-x-2">
                            <dt className="sr-only">Company</dt>
                            <dd className="w-full flex-none text-sm font-medium">
                                {role.href ? (
                                    <a href={role.href} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-brand-accent">
                                        {role.company}
                                    </a>
                                ) : role.company}
                            </dd>
                            <dt className="sr-only">Role</dt>
                            <dd className="text-xs text-muted-foreground">{role.title}</dd>
                            <dt className="sr-only">Date</dt>
                            <dd className="ml-auto text-xs tabular-nums text-muted-foreground" aria-label={`${role.start} until ${role.end}`}>
                                {role.start} <span aria-hidden>—</span> {role.end}
                            </dd>
                        </dl>
                    </li>
                ))}
            </ol>
        </section>
    )
}
