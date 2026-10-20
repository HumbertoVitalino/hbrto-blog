'use client'

import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'

// iOS's own deceleration curve: quick to start, long soft landing
const EASE_IOS = [0.32, 0.72, 0, 1] as const

/**
 * A section arriving on load: it rises 18px out of a slight blur and settles. `index` staggers
 * sections of one page so they land in reading order. Reduced motion shows them at once
 * (same element either way, so the server and client markup always match).
 */
export function FadeIn({ index = 0, className, children }: { index?: number; className?: string; children: ReactNode }) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18, filter: 'blur(2px)' }}
      // a leftover filter (even blur(0)) would trap fixed and sticky children, so it's cleared on arrival
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)', transitionEnd: { filter: 'none' } }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.7, ease: EASE_IOS, delay: 0.06 + index * 0.08 }}
    >
      {children}
    </motion.div>
  )
}
