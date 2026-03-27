'use client'

import { BookData } from '@/app/hooks/useBooks'
import { BookCard } from './BookCard'

interface BooksGridProps {
    books: BookData[]
    onEdit: (book: BookData) => void
    onDelete: (id: string) => void
    deletingId?: string
    isPublic?: boolean
}

export function BooksGrid({ books, onEdit, onDelete, deletingId, isPublic = false }: BooksGridProps) {
    if (books.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                    Nenhum artigo cadastrado
                </h3>
                <p className="text-muted-foreground">
                    {isPublic ? 'Volte em breve para novos artigos' : 'Comece adicionando seu primeiro artigo'}
                </p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
                <BookCard
                    key={book.id}
                    book={book}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    isDeleting={deletingId === book.id}
                    isPublic={isPublic}
                />
            ))}
        </div>
    )
}
