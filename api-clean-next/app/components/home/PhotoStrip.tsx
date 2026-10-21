'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { PhotoCard } from './PhotoCard'
import type { Photo } from './photos'

const PHONE = '(max-width: 639px)'

/**
 * A row of prints, tilted alternately. From `sm` up it's wider than the column on purpose (the
 * ends run off the edges) and each print is loose: it can be picked up and moved anywhere. On a
 * phone the whole row slides sideways instead, held at both ends, and a tap still turns a print
 * over. The wrapper clips sideways only, so tilted corners, shadows and a lifted print keep their room.
 */
export function PhotoStrip({ photos }: { photos: Photo[] }) {
    const [isPhone, setIsPhone] = useState(false)
    const track = useRef<HTMLDivElement>(null)
    const [travel, setTravel] = useState(0)

    useEffect(() => {
        const query = window.matchMedia(PHONE)
        const update = () => setIsPhone(query.matches)
        update()
        query.addEventListener('change', update)
        return () => query.removeEventListener('change', update)
    }, [])

    // how far the row can slide left before its last print reaches the right edge
    useEffect(() => {
        const el = track.current
        if (!isPhone || !el) return
        const measure = () => setTravel(Math.max(0, el.scrollWidth - el.offsetWidth))
        measure()
        const observer = new ResizeObserver(measure)
        observer.observe(el)
        return () => observer.disconnect()
    }, [isPhone])

    if (photos.length === 0) return null

    const cards = photos.map((photo, i) => (
        <PhotoCard
            key={photo.src}
            photo={photo}
            priority={i < 3}
            draggable={!isPhone}
            enterDelay={0.2 + i * 0.07}
            className={`w-44 flex-none sm:w-72 ${i % 2 === 0 ? 'rotate-2' : '-rotate-2'}`}
        />
    ))

    if (isPhone) {
        return (
            <div className="-my-4 overflow-hidden py-4">
                <motion.div
                    ref={track}
                    drag="x"
                    dragElastic={0.15}
                    dragConstraints={{ left: -travel, right: 0 }}
                    dragTransition={{ bounceStiffness: 400, bounceDamping: 40 }}
                    className="flex cursor-grab gap-5 will-change-transform active:cursor-grabbing"
                >
                    {cards}
                </motion.div>
            </div>
        )
    }

    return (
        <div className="overflow-x-clip">
            <div className="-my-4 flex justify-center gap-5 py-4 sm:gap-8">{cards}</div>
        </div>
    )
}
