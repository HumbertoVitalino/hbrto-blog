'use client'

import { useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import type { Photo } from './photos'

// how far the card turns per pixel dragged
const DEG_PER_PX = 0.6
// Apple's projection constant: a flick keeps turning a while before it settles
const DECELERATION = 0.99

/** Where a spin of `velocity` deg/s, released at `angle`, comes to rest. */
function project(angle: number, velocity: number) {
    return angle + (velocity / 1000) * DECELERATION / (1 - DECELERATION)
}

/**
 * A print that turns over to show its caption on the back. Tap (or Enter) flips it; dragging
 * turns it by hand, and on release the spin carries on from the finger's speed to the nearest
 * face, the way a flicked card would.
 */
export function PhotoCard({ photo, className, priority = false }: { photo: Photo; className?: string; priority?: boolean }) {
    const inner = useRef<HTMLDivElement>(null)
    const drag = useRef<{ x: number; from: number; samples: { x: number; t: number }[]; moved: boolean } | null>(null)
    const [angle, setAngle] = useState(0)
    const showingBack = Math.round(angle / 180) % 2 !== 0

    const turnTo = (deg: number) => {
        // written straight to the element too: a drag that settles back on the same face
        // doesn't change state, so React alone would leave the card at the dragged angle
        if (inner.current) {
            inner.current.style.transition = ''
            inner.current.style.transform = `rotateY(${deg}deg)`
        }
        setAngle(deg)
    }

    const onPointerDown = (e: React.PointerEvent) => {
        e.currentTarget.setPointerCapture(e.pointerId)
        drag.current = { x: e.clientX, from: angle, samples: [{ x: e.clientX, t: e.timeStamp }], moved: false }
    }

    const onPointerMove = (e: React.PointerEvent) => {
        const d = drag.current
        if (!d) return
        const dx = e.clientX - d.x
        // a small dead zone keeps a tap from becoming a drag
        if (!d.moved && Math.abs(dx) < 6) return
        d.moved = true
        d.samples.push({ x: e.clientX, t: e.timeStamp })
        if (d.samples.length > 5) d.samples.shift()
        // follow the pointer 1:1, no easing while held
        if (inner.current) {
            inner.current.style.transition = 'none'
            inner.current.style.transform = `rotateY(${d.from + dx * DEG_PER_PX}deg)`
        }
    }

    const onPointerUp = (e: React.PointerEvent) => {
        const d = drag.current
        drag.current = null
        if (!d) return
        if (!d.moved) return turnTo(angle + 180)
        const first = d.samples[0]
        const last = d.samples[d.samples.length - 1]
        const velocity = ((last.x - first.x) / Math.max(1, last.t - first.t)) * 1000 * DEG_PER_PX
        const released = d.from + (e.clientX - d.x) * DEG_PER_PX
        turnTo(Math.round(project(released, velocity) / 180) * 180)
    }

    return (
        <div
            role="button"
            tabIndex={0}
            aria-pressed={showingBack}
            aria-label={`${photo.alt}. Show caption`}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={() => { drag.current = null; turnTo(Math.round(angle / 180) * 180) }}
            onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    turnTo(angle + 180)
                }
            }}
            className={cn(
                'photo-card relative aspect-4/5 cursor-grab rounded-xl outline-none active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background sm:rounded-2xl',
                className,
            )}
        >
            <div ref={inner} className="photo-card-inner rounded-[inherit]" style={{ transform: `rotateY(${angle}deg)` }}>
                <div className="photo-face bg-muted" aria-hidden={showingBack}>
                    <img
                        src={photo.src}
                        alt={photo.alt}
                        draggable={false}
                        loading={priority ? 'eager' : 'lazy'}
                        decoding="async"
                        className="pointer-events-none absolute inset-0 size-full object-cover"
                    />
                </div>
                <div className="photo-face photo-paper flex items-center" aria-hidden={!showingBack}>
                    <p className="relative px-6 font-mono uppercase leading-tight">
                        <span className="block text-sm">{photo.file}</span>
                        <span className="block text-xs">{photo.caption}</span>
                    </p>
                </div>
            </div>
        </div>
    )
}
