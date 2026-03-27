'use client'

import { memo } from 'react'
import { BookData } from '@/app/hooks/useBooks'
import Link from 'next/link'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash2, Edit2, MessageSquare } from 'lucide-react'

interface BookCardProps {
    book: BookData
    onEdit: (book: BookData) => void
    onDelete: (id: string) => void
    isDeleting?: boolean
    isPublic?: boolean
}

function BookCardComponent({
    book,
    onEdit,
    onDelete,
    isDeleting,
    isPublic = false
}: BookCardProps) {
    return (
        <Card className="flex flex-col h-full hover:shadow-lg transition-all duration-200">
            <CardHeader>
                <CardTitle className="line-clamp-2">
                    {book.title}
                </CardTitle>

                <CardDescription className="text-sm">
                    por{' '}
                    <span className="font-semibold text-foreground">
                        {book.author}
                    </span>
                </CardDescription>
            </CardHeader>

            <CardContent className="flex-1">
                <div className="space-y-3">
                    <div className="inline-block bg-primary/10 text-primary text-sm px-3 py-1 rounded-full">
                        {book.pages} páginas
                    </div>
                    {book.genre && (
                        <div className="inline-block ml-2 bg-secondary/10 text-secondary text-sm px-3 py-1 rounded-full capitalize">
                            {book.genre.replace('-', ' ')}
                        </div>
                    )}
                </div>
            </CardContent>

            {/* Actions */}
            <div className="border-t p-4">
                <div className="flex flex-col gap-2">
                    {/* Reviews - sempre visível */}
                    <Link href={`/library/${book.id}`} className="w-full">
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-center gap-2"
                        >
                            <MessageSquare className="w-4 h-4" />
                            Reviews
                        </Button>
                    </Link>

                    {/* Ações autenticadas */}
                    {!isPublic && (
                        <>
                            <Button
                                onClick={() => onEdit(book)}
                                variant="default"
                                size="sm"
                                className="w-full justify-center"
                            >
                                <Edit2 className="w-4 h-4 mr-2" />
                                Edit
                            </Button>

                            <Button
                                onClick={() => book.id && onDelete(book.id)}
                                variant="destructive"
                                size="sm"
                                disabled={isDeleting || !book.id}
                                className="w-full justify-center"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </Card>
    )
}

export const BookCard = memo(BookCardComponent)