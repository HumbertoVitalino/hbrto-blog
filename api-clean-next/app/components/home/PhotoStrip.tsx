'use client'

import { motion, useReducedMotion } from 'motion/react'
import { PhotoCard } from './PhotoCard'
import type { Photo } from './photos'

const EASE_IOS = [0.32, 0.72, 0, 1] as const

/**
 * A row of prints, tilted alternately, wider than the column on purpose: the ends run off
 * the edges. The wrapper clips sideways only, so tilted corners and shadows keep their room.
 */
export function PhotoStrip({ photos }: { photos: Photo[] }) {
    const reduceMotion = useReducedMotion()
    if (photos.length === 0) return null

    return (
        <div className="overflow-x-clip">
            <div className="-my-4 flex justify-center gap-5 py-4 sm:gap-8">
                {photos.map((photo, i) => (
                    <motion.div
                        key={photo.src}
                        className={`w-44 flex-none sm:w-72 ${i % 2 === 0 ? 'rotate-2' : '-rotate-2'}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={reduceMotion ? { duration: 0 } : { duration: 0.7, ease: EASE_IOS, delay: 0.2 + i * 0.07 }}
                    >
                        <PhotoCard photo={photo} priority={i < 3} />
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
