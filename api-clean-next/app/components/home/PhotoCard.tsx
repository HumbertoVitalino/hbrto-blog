'use client'

import { useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils'
import type { Photo } from './photos'

const EASE_IOS = [0.32, 0.72, 0, 1] as const
// past this many pixels a press is a drag, not a tap
const TAP_SLOP = 8

/**
 * A loose print. Tap (or Enter) turns it over to the caption on its back; when `draggable`, it
 * can be picked up and thrown anywhere, carries on a little with the finger's speed and stays
 * where it lands. `enterDelay` fades it in on mount, for prints laid down one after another.
 */
export function PhotoCard({
    photo,
    className,
    priority = false,
    draggable = true,
    enterDelay,
}: {
    photo: Photo
    className?: string
    priority?: boolean
    draggable?: boolean
    enterDelay?: number
}) {
    const reduceMotion = useReducedMotion()
    const [flipped, setFlipped] = useState(false)
    const press = useRef<{ x: number; y: number } | null>(null)
    const moved = useRef(false)
    const flip = () => setFlipped(f => !f)

    const enters = enterDelay !== undefined
    return (
        <motion.div
            role="button"
            tabIndex={0}
            aria-pressed={flipped}
            aria-label={`${photo.alt}. ${flipped ? 'Show photo' : 'Show caption'}`}
            onPointerDownCapture={e => {
                press.current = { x: e.clientX, y: e.clientY }
                moved.current = false
            }}
            onPointerMoveCapture={e => {
                const p = press.current
                if (p && !moved.current && Math.hypot(e.clientX - p.x, e.clientY - p.y) > TAP_SLOP) moved.current = true
            }}
            onPointerUpCapture={() => {
                if (press.current && !moved.current) flip()
                press.current = null
            }}
            onPointerCancelCapture={() => { press.current = null }}
            onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    flip()
                }
            }}
            drag={draggable}
            dragTransition={{ bounceStiffness: 400, bounceDamping: 40 }}
            whileTap={{ scale: 1.06 }}
            whileDrag={{ scale: 1.1, zIndex: 40 }}
            initial={enters ? { opacity: 0, y: 20 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.7, ease: EASE_IOS, delay: enterDelay ?? 0 }}
            className={cn(
                'photo-card relative aspect-4/5 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background sm:rounded-2xl',
                draggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer',
                className,
            )}
        >
            <motion.div
                className="photo-card-inner rounded-[inherit]"
                initial={false}
                animate={{ rotateY: flipped ? 180 : 0 }}
                transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 220, damping: 24 }}
            >
                <div className="photo-face bg-muted" aria-hidden={flipped}>
                    <img
                        src={photo.src}
                        alt={photo.alt}
                        draggable={false}
                        loading={priority ? 'eager' : 'lazy'}
                        decoding="async"
                        className="pointer-events-none absolute inset-0 size-full object-cover"
                    />
                </div>
                <div className="photo-face photo-paper flex items-center" aria-hidden={!flipped}>
                    <p className="relative px-6 font-mono uppercase leading-tight">
                        <span className="block text-sm">{photo.file}</span>
                        <span className="block text-xs">{photo.caption}</span>
                    </p>
                </div>
            </motion.div>
        </motion.div>
    )
}
