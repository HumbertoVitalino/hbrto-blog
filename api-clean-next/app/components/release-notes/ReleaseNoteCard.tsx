'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2, Edit2, ChevronDown, ChevronUp } from 'lucide-react'
import { ReleaseNoteData } from '@/app/hooks/useReleaseNotes'
import { ReleaseNoteFormModal } from './ReleaseNoteFormModal'
import { MarkdownRenderer } from '@/app/components/reviews/MarkdownRenderer'
import { formatDate } from '@/lib/formatDate'

interface ReleaseNoteCardProps {
    note: ReleaseNoteData
    isAdmin?: boolean
    onDelete?: (id: string) => Promise<void>
    onUpdate?: (id: string, data: { version: string; title: string; description: string }) => Promise<void>
}

export function ReleaseNoteCard({ note, isAdmin, onDelete, onUpdate }: ReleaseNoteCardProps) {
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isExpanded, setIsExpanded] = useState(false)

    const isLong = note.description.length > 400

    const handleDelete = async () => {
        if (!onDelete || !confirm('Delete this release note?')) return
        try {
            setIsDeleting(true)
            await onDelete(note.id)
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <>
            <article className="group relative rounded-2xl border bg-card/50 p-6 shadow-sm hover:shadow-md hover:bg-card transition-all duration-300">
                <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 pb-4 border-b border-border/50">
                    <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="inline-flex items-center text-xs font-mono font-medium bg-muted px-2.5 py-1 rounded-full border border-border/50">
                                {note.version}
                            </span>
                            <time className="text-xs text-muted-foreground" dateTime={new Date(note.publishedAt).toISOString()}>
                                {formatDate(note.publishedAt)}
                            </time>
                        </div>
                        <h3 className="text-xl font-semibold tracking-tight leading-tight text-foreground">
                            {note.title}
                        </h3>
                    </div>

                    {isAdmin && (
                        <div className="flex gap-2 sm:opacity-50 sm:group-hover:opacity-100 transition-opacity">
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => setIsEditOpen(true)}>
                                <Edit2 className="w-3.5 h-3.5" />
                                <span className="sr-only">Edit</span>
                            </Button>
                            <Button size="sm" variant="destructive" className="h-8 w-8 p-0" onClick={handleDelete} disabled={isDeleting}>
                                <Trash2 className="w-3.5 h-3.5" />
                                <span className="sr-only">Delete</span>
                            </Button>
                        </div>
                    )}
                </header>

                <div className="relative">
                    <div className={`transition-all duration-500 ease-in-out overflow-hidden ${!isExpanded && isLong ? 'max-h-64' : 'max-h-[5000px]'}`}>
                        <MarkdownRenderer content={note.description} />
                    </div>
                    {!isExpanded && isLong && (
                        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-card/90 via-card/50 to-transparent" />
                    )}
                </div>

                {isLong && (
                    <div className="mt-4 flex justify-center border-t border-border/30 pt-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-foreground text-xs gap-1.5"
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            {isExpanded ? <><ChevronUp className="w-3 h-3" /> Show less</> : <><ChevronDown className="w-3 h-3" /> Read more</>}
                        </Button>
                    </div>
                )}
            </article>

            {isAdmin && (
                <ReleaseNoteFormModal
                    open={isEditOpen}
                    onOpenChange={setIsEditOpen}
                    initialValues={{ version: note.version, title: note.title, description: note.description }}
                    onSubmit={async (data) => { if (onUpdate) await onUpdate(note.id, data) }}
                    mode="edit"
                />
            )}
        </>
    )
}
