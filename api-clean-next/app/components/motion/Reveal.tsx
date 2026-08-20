'use client'

import { motion, type Variants } from 'motion/react'
import { ReactNode } from 'react'

const groupVariants: Variants = {
    hidden: {},
    show: {
        transition: {
            staggerChildren: 0.06,
        },
    },
}

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 12 },
    show: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 300, damping: 28 },
    },
}

interface RevealGroupProps {
    children: ReactNode
    className?: string
}

/** Stagger container — wrap a grid/list of `RevealItem`s to fade + rise them in sequence as it scrolls into view. */
export function RevealGroup({ children, className }: RevealGroupProps) {
    return (
        <motion.div
            className={className}
            variants={groupVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
        >
            {children}
        </motion.div>
    )
}

interface RevealItemProps {
    children: ReactNode
    className?: string
}

export function RevealItem({ children, className }: RevealItemProps) {
    return (
        <motion.div className={className} variants={itemVariants}>
            {children}
        </motion.div>
    )
}
