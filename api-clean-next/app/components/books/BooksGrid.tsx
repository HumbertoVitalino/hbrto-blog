'use client'

import { memo } from 'react'
import { BookData } from '@/app/hooks/useBooks'
import { BookShelfItem } from './BookShelfItem'

interface BooksGridProps {
    books: BookData[]
    onEdit: (book: BookData) => void
    onDelete: (id: string) => void
    deletingId?: string
    isPublic?: boolean
    onAuthorClick?: (author: string) => void
}

/** A shelf of covers: three across on a phone (about nine books a screen), six on a desktop. */
function BooksGridComponent({ books, onEdit, onDelete, deletingId, isPublic = false, onAuthorClick }: BooksGridProps) {
    return (
        <ul className="grid grid-cols-3 gap-x-4 gap-y-8 sm:grid-cols-4 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-6">
            {books.map(book => (
                <BookShelfItem
                    key={book.id}
                    book={book}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    isDeleting={deletingId === book.id}
                    isPublic={isPublic}
                    onAuthorClick={onAuthorClick}
                />
            ))}
        </ul>
    )
}

export const BooksGrid = memo(BooksGridComponent)
