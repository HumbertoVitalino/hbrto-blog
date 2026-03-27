'use client'

import { BookData } from '@/app/hooks/useBooks'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash2, Edit2, MessageSquare } from 'lucide-react'

interface BookCardProps {
    book: BookData
    onEdit: (book: BookData) => void
    onDelete: (id: string) => void
    isDeleting?: boolean
    isPublic?: boolean
}

export function BookCard({ book, onEdit, onDelete, isDeleting, isPublic = false }: BookCardProps) {
    return (
        <Card className="flex flex-col h-full hover:shadow-lg transition-shadow">
            <CardHeader>
                <CardTitle className="line-clamp-2">
                    {book.title}
                </CardTitle>
                <CardDescription className="text-sm">
                    por <span className="font-semibold text-foreground">{book.author}</span>
                </CardDescription>
            </CardHeader>

            <CardContent className="flex-1">
                <div className="inline-block bg-primary/10 text-primary text-sm px-3 py-1 rounded-full">
                    {book.pages} páginas
                </div>
            </CardContent>

            <div className="border-t p-4">
                <div className="flex gap-2">
                    <Link href={`/library/${book.id}`} className="flex-1">
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full gap-2"
                        >
                            <MessageSquare className="w-4 h-4" />
                            Reviews
                        </Button>
                    </Link>
                    {!isPublic && (
                        <>
                            <Button
                                onClick={() => onEdit(book)}
                                variant="default"
                                size="sm"
                                className="flex-1"
                            >
                                <Edit2 className="w-4 h-4 mr-2" />
                                Edit
                            </Button>
                            <Button
                                onClick={() => book.id && onDelete(book.id)}
                                variant="destructive"
                                size="sm"
                                disabled={isDeleting}
                                className="flex-1"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </Card>
    )
}
