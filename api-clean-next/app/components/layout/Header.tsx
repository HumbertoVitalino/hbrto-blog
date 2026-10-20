'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'
import { ThemeToggle } from '@/app/components/layout/ThemeToggle'
import { NAV_ITEMS, isActive } from '@/app/components/layout/navigation'
import { Halo } from '@/app/components/motion/Halo'
import { ChevronDown, LogOut, X } from 'lucide-react'
import { cn } from '@/lib/utils'

// The floating surface every header control sits on.
const chip = 'pointer-events-auto rounded-full bg-card/90 shadow-lg shadow-foreground/5 ring-1 ring-border backdrop-blur-sm dark:bg-muted/90'

export default function Header() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  // the menu remembers the page it was opened on, so navigating away closes it
  const [openOn, setOpenOn] = useState<string | null>(null)
  const isOpen = openOn === pathname
  const setIsOpen = (open: boolean) => setOpenOn(open ? pathname : null)

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpenOn(null)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen])

  const handleLogout = async () => {
    await logout()
    setIsOpen(false)
  }

  return (
    <header className="pointer-events-none sticky top-0 z-50 pt-[max(1.5rem,env(safe-area-inset-top))] pb-2">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 sm:px-8">
        <Link href="/" aria-label="Home" className={cn(chip, 'group relative size-10 p-0.5')}>
          <Halo />
          <span className="grid size-full place-items-center rounded-full bg-muted text-[13px] font-semibold tracking-wide text-foreground">
            HV
          </span>
        </Link>

        <nav aria-label="Main" className={cn(chip, 'group relative hidden md:block')}>
          <Halo />
          <ul className="flex px-3 text-sm font-medium">
            {NAV_ITEMS.map(item => {
              const active = isActive(pathname, item.href)
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'relative block px-3 py-2 transition-colors hover:text-brand-accent',
                      active && 'text-brand-accent',
                    )}
                  >
                    {item.label}
                    {active && (
                      <span className="absolute inset-x-1 -bottom-px h-px bg-linear-to-r from-brand-accent/0 via-brand-accent/40 to-brand-accent/0" />
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-expanded={isOpen}
          aria-controls="mobile-nav"
          className={cn(chip, 'flex items-center gap-1.5 px-4 py-2 text-sm font-medium md:hidden')}
        >
          Menu
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </button>

        <div className="flex items-center gap-2">
          {user && (
            <button
              type="button"
              onClick={handleLogout}
              aria-label={`Sign out ${user.email}`}
              title={`Signed in as ${user.email}`}
              className={cn(chip, 'group relative hidden size-10 place-items-center md:grid')}
            >
              <Halo />
              <LogOut className="size-4 text-muted-foreground transition-colors group-hover:text-brand-accent" />
            </button>
          )}
          <ThemeToggle className={cn(chip, 'size-10')} />
        </div>
      </div>

      {isOpen && (
        <div className="pointer-events-auto md:hidden">
          <div aria-hidden className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-xs dark:bg-black/80" onClick={() => setIsOpen(false)} />
          <div
            id="mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            className="fixed inset-x-4 top-[max(2rem,env(safe-area-inset-top))] z-50 rounded-3xl bg-card p-8 ring-1 ring-border"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-muted-foreground">Navigation</h2>
              <button type="button" onClick={() => setIsOpen(false)} aria-label="Close menu" className="-m-1 p-1">
                <X className="size-5 text-muted-foreground" />
              </button>
            </div>
            <nav aria-label="Main" className="mt-6">
              <ul className="-my-2 divide-y divide-border text-base">
                {NAV_ITEMS.map(item => {
                  const active = isActive(pathname, item.href)
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? 'page' : undefined}
                        className={cn('block py-2.5', active && 'text-brand-accent')}
                      >
                        {item.label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>
            {user && (
              <div className="mt-6 border-t border-border pt-6">
                <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                <button type="button" onClick={handleLogout} className="mt-3 flex items-center gap-2 text-sm font-medium">
                  <LogOut className="size-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
