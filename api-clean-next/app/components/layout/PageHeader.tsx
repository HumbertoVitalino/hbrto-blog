import type { ReactNode } from 'react'
import { FadeIn } from '@/app/components/motion/FadeIn'

/**
 * The opening of every top-level page: same top spacing, same title scale, left-aligned
 * with the header's avatar. Pages put it first inside a <PageContainer>; it arrives first
 * (FadeIn index 0), so a page's own sections continue the stagger from index 1.
 */
export function PageHeader({ title, children }: { title: ReactNode; children?: ReactNode }) {
  return (
    <FadeIn>
      <header className="max-w-2xl pt-16 sm:pt-24">
        <h1 className="text-[2rem] font-semibold leading-10 tracking-tight text-balance sm:text-5xl sm:leading-14">
          {title}
        </h1>
        {children}
      </header>
    </FadeIn>
  )
}

/** The lead paragraph under a page title. */
export function PageLead({ children }: { children: ReactNode }) {
  return <p className="mt-6 text-base text-muted-foreground text-pretty">{children}</p>
}

/** The page's horizontal frame; matches the header and footer so every edge lines up. */
export function PageContainer({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-5xl px-4 sm:px-8">{children}</div>
}
