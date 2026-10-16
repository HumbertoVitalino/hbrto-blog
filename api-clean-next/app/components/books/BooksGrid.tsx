'use client'

import { memo, useMemo } from 'react'
import { BookData } from '@/app/hooks/useBooks'
import { BookCard } from './BookCard'
import { BookFeedItem } from './BookFeedItem'
import { RevealGroup, RevealItem } from '@/app/components/motion/Reveal'

interface BooksGridProps {
    books: BookData[]
    onEdit: (book: BookData) => void
    onDelete: (id: string) => void
    deletingId?: string
    isPublic?: boolean
    onAuthorClick?: (author: string) => void
}

function EmptyState({ isPublic }: { isPublic: boolean }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                No books added
            </h3>
            <p className="text-muted-foreground">
                {isPublic
                    ? 'Check back soon for new books'
                    : 'Start by adding your first book'}
            </p>
        </div>
    )
}

function BooksGridComponent({
    books,
    onEdit,
    onDelete,
    deletingId,
    isPublic = false,
    onAuthorClick,
}: BooksGridProps) {

    const hasBooks = books.length > 0

    const renderedBooks = useMemo(() => {
        return books.map((book) => (
            <RevealItem key={book.id}>
                <BookCard
                    book={book}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    isDeleting={deletingId === book.id}
                    isPublic={isPublic}
                    onAuthorClick={onAuthorClick}
                />
            </RevealItem>
        ))
    }, [books, onEdit, onDelete, deletingId, isPublic, onAuthorClick])

    const feedItems = useMemo(() => {
        return books.map((book) => (
            <BookFeedItem
                key={book.id}
                book={book}
                onEdit={onEdit}
                onDelete={onDelete}
                isDeleting={deletingId === book.id}
                isPublic={isPublic}
                onAuthorClick={onAuthorClick}
            />
        ))
    }, [books, onEdit, onDelete, deletingId, isPublic, onAuthorClick])

    if (!hasBooks) {
        return <EmptyState isPublic={isPublic} />
    }

    // phones get a dense log (5–6 books per screen) instead of one full-width cover at a time;
    // the cover grid takes over once there's room for two columns. Lazy covers in the hidden
    // layout aren't fetched, so rendering both costs only markup.
    return (
        <>
            <ul className="divide-y divide-border/40 md:hidden">
                {feedItems}
            </ul>
            <RevealGroup className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {renderedBooks}
            </RevealGroup>
        </>
    )
}

export const BooksGrid = memo(BooksGridComponent)