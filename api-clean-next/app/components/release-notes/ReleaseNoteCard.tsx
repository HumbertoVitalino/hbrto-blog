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
            <article className="group relative py-8 border-b border-border/50 last:border-0">

                {/* ADMIN ACTIONS */}
                {isAdmin && (
                    <div className="absolute top-8 right-0 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => setIsEditOpen(true)}>
                            <Edit2 className="w-3 h-3" />
                            <span className="sr-only">Edit</span>
                        </Button>
                        <Button size="sm" variant="destructive" className="h-7 w-7 p-0" onClick={handleDelete} disabled={isDeleting}>
                            <Trash2 className="w-3 h-3" />
                            <span className="sr-only">Delete</span>
                        </Button>
                    </div>
                )}

                {/* META */}
                <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-mono font-medium bg-muted px-2.5 py-1 rounded-full border border-border/50">
                        {note.version}
                    </span>
                    <span className="text-muted-foreground/40 text-xs">·</span>
                    <time className="text-xs text-muted-foreground" dateTime={new Date(note.publishedAt).toISOString()}>
                        {formatDate(note.publishedAt)}
                    </time>
                </div>

                {/* TITLE */}
                <h2 className="text-xl font-semibold tracking-tight text-foreground mb-4 leading-snug pr-16">
                    {note.title}
                </h2>

                {/* CONTENT */}
                <div className="relative">
                    <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
                        !isExpanded && isLong ? 'max-h-48' : 'max-h-1250'
                    }`}>
                        <MarkdownRenderer content={note.description} />
                    </div>
                    {!isExpanded && isLong && (
                        <div className="absolute bottom-0 left-0 right-0 h-20 bg-linear-to-t from-background to-transparent pointer-events-none" />
                    )}
                </div>

                {/* EXPAND TOGGLE */}
                {isLong && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="mt-4 flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        {isExpanded
                            ? <><ChevronUp className="w-3.5 h-3.5" /> Show less</>
                            : <><ChevronDown className="w-3.5 h-3.5" /> Read more</>}
                    </button>
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
