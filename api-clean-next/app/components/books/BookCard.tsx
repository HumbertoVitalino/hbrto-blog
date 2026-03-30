'use client'

import { memo } from 'react'
import { BookData } from '@/app/hooks/useBooks'
import { BookStatus } from '@/domain/BookStatus'
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

// Configuração simplificada: apenas definimos a cor do dot indicador
function getStatusConfig(status?: BookStatus) {
  switch (status) {
    case BookStatus.Completed:
      return {
        label: 'Completed',
        dotColor: 'bg-green-500'
      }
    case BookStatus.InProgress:
      return {
        label: 'In Progress',
        dotColor: 'bg-blue-500'
      }
    case BookStatus.NotStarted:
    default:
      return {
        label: 'Not Started',
        dotColor: 'bg-slate-500'
      }
  }
}

function BookCardComponent({
  book,
  onEdit,
  onDelete,
  isDeleting,
  isPublic = false
}: BookCardProps) {
  const statusConfig = getStatusConfig(book.status)

  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-all duration-300 overflow-hidden group">
      {/* Cover Image */}
      {book.coverImageUrl && (
        <div className="relative w-full h-48 bg-muted overflow-hidden">
          <img
            src={book.coverImageUrl}
            alt={`${book.title} cover`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Status Badge Minimalista com Glassmorphism */}
          <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm border border-border/50 shadow-sm px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 z-10">
            <span className={`w-2 h-2 rounded-full ${statusConfig.dotColor} shadow-sm`}></span>
            <span className="text-foreground/90 tracking-tight">{statusConfig.label}</span>
          </div>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="line-clamp-2 text-lg leading-tight">
              {book.title}
            </CardTitle>
            <CardDescription className="text-sm mt-1.5">
              por{' '}
              <span className="font-medium text-foreground">
                {book.author}
              </span>
            </CardDescription>
          </div>
          {/* Status Badge Minimalista (para quando não tem imagem) */}
          {!book.coverImageUrl && (
            <div className="bg-muted/50 border border-border/50 px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 w-fit whitespace-nowrap shadow-sm">
              <span className={`w-2 h-2 rounded-full ${statusConfig.dotColor}`}></span>
              <span className="text-foreground/90">{statusConfig.label}</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="flex flex-wrap gap-2">
          <div className="inline-flex items-center justify-center bg-secondary/30 text-secondary-foreground text-xs font-medium px-2.5 py-1 rounded-md">
            {book.pages} pages
          </div>
          {book.genre && (
            <div className="inline-flex items-center justify-center bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-md capitalize">
              {book.genre.replace('-', ' ')}
            </div>
          )}
        </div>
      </CardContent>

      {/* Actions */}
      <div className="border-t p-4 bg-muted/10">
        <div className="flex flex-col gap-2">
          {/* Reviews - always visible */}
          <Link href={`/library/${book.id}`} className="w-full">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-center gap-2 bg-background hover:bg-muted transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              Reviews
            </Button>
          </Link>

          {/* Authenticated actions */}
          {!isPublic && (
            <div className="flex gap-2">
              <Button
                onClick={() => onEdit(book)}
                variant="secondary"
                size="sm"
                className="flex-1 justify-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </Button>

              <Button
                onClick={() => book.id && onDelete(book.id)}
                variant="destructive"
                size="sm"
                disabled={isDeleting || !book.id}
                className="flex-1 justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? '...' : 'Delete'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

export const BookCard = memo(BookCardComponent)