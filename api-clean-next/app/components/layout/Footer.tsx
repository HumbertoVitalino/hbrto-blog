import Link from 'next/link'
import { FOOTER_ITEMS } from '@/app/components/layout/navigation'

export default function Footer() {
  return (
    // the same nesting as the frame in app/layout.tsx, so the rule spans the content column exactly
    <footer className="mt-32 sm:px-8">
      <div className="mx-auto w-full max-w-7xl lg:px-8">
        <div className="border-t border-border pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-10">
          <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-8">
            <nav aria-label="Footer">
              <ul className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-sm font-medium">
                {FOOTER_ITEMS.map(item => (
                  <li key={item.href}>
                    <Link href={item.href} className="transition-colors hover:text-brand-accent">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Humberto Vitalino</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
