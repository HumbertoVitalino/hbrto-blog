'use client'

import { useEffect, useRef } from 'react'

const SIZE = 600

/**
 * A soft light that follows the pointer across the control it sits in, the way light moves
 * over glass. Put it as the first child of a `group relative` element with a rounded shape;
 * it only shows on hover with a precise pointer, never on touch.
 */
export function Halo({ strength = 0.16 }: { strength?: number }) {
  const clip = useRef<HTMLSpanElement>(null)
  const light = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const host = clip.current?.parentElement
    if (!host || !light.current) return
    const glow = light.current

    // writes straight to the style so tracking never re-renders React
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      const rect = host.getBoundingClientRect()
      glow.style.setProperty('--x', `${e.clientX - rect.left - SIZE / 2}px`)
      glow.style.setProperty('--y', `${e.clientY - rect.top - SIZE / 2}px`)
    }
    host.addEventListener('pointermove', move)
    return () => host.removeEventListener('pointermove', move)
  }, [])

  return (
    <span ref={clip} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] max-md:hidden">
      <span
        ref={light}
        className="absolute left-0 top-0 translate-x-(--x) translate-y-(--y) opacity-0 transition-opacity duration-300 group-hover:opacity-(--halo-strength) [@media(hover:none)]:hidden"
        style={{
          '--x': `-${SIZE}px`,
          '--y': `-${SIZE}px`,
          '--halo-strength': strength,
          width: SIZE,
          height: SIZE,
          background: 'radial-gradient(circle, color-mix(in oklab, var(--foreground) 28%, transparent) 0%, transparent 60%)',
        } as React.CSSProperties}
      />
    </span>
  )
}
