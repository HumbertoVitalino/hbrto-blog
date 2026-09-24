'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { MotionConfig } from 'motion/react'
import { ReactNode } from 'react'

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      <MotionConfig reducedMotion="user">
        {children}
      </MotionConfig>
    </NextThemesProvider>
  )
}
