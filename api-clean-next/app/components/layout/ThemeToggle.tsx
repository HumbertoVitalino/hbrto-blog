'use client'

import { useTheme } from 'next-themes'
import { useSyncExternalStore } from 'react'
import { Sun, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'

const noop = () => () => {}

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  // false on the server and during hydration, true once running in the browser
  const mounted = useSyncExternalStore(noop, () => true, () => false)

  const isDark = mounted && resolvedTheme === 'dark'

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className={cn('group grid place-items-center', className)}
    >
      {/* the icon waits for the theme to resolve, so it never shows the wrong one first */}
      {mounted && (isDark
        ? <Moon className="size-4.5 text-muted-foreground transition-colors group-hover:text-brand-accent" />
        : <Sun className="size-4.5 text-muted-foreground transition-colors group-hover:text-brand-accent" />)}
    </button>
  )
}
