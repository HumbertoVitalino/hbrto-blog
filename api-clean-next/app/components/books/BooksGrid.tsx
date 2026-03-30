'use client'

import { memo, useMemo } from 'react'
import { BookData } from '@/app/hooks/useBooks'
import { BookCard } from './BookCard'

interface BooksGridProps {
    books: BookData[]
    onEdit: (book: BookData) => void
    onDelete: (id: string) => void
    deletingId?: string
    isPublic?: boolean
}

function EmptyState({ isPublic }: { isPublic: boolean }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                No articles added
            </h3>
            <p className="text-muted-foreground">
                {isPublic
                    ? 'Check back soon for new articles'
                    : 'Start by adding your first article'}
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
}: BooksGridProps) {

    const hasBooks = books.length > 0

    const renderedBooks = useMemo(() => {
        return books.map((book) => (
            <BookCard
                key={book.id}
                book={book}
                onEdit={onEdit}
                onDelete={onDelete}
                isDeleting={deletingId === book.id}
                isPublic={isPublic}
            />
        ))
    }, [books, onEdit, onDelete, deletingId, isPublic])

    if (!hasBooks) {
        return <EmptyState isPublic={isPublic} />
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {renderedBooks}
        </div>
    )
}

export const BooksGrid = memo(BooksGridComponent)