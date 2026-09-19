'use client'

import { useState, useCallback } from 'react'
import { motion } from 'motion/react'
import { useReleaseNotes } from '@/app/hooks/useReleaseNotes'
import { useAuth } from '@/app/context/AuthContext'
import { ReleaseNoteCard } from '@/app/components/release-notes/ReleaseNoteCard'
import { ReleaseNoteFormModal } from '@/app/components/release-notes/ReleaseNoteFormModal'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, Plus, Tag } from 'lucide-react'

export default function ReleaseNotesPage() {
    const { notes, isLoading, error, createNote, updateNote, deleteNote } = useReleaseNotes()
    const { isAdmin } = useAuth()
    const [isFormOpen, setIsFormOpen] = useState(false)

    const handleCreate = useCallback(async (data: { version: string; title: string; description: string }) => {
        await createNote(data)
    }, [createNote])

    const handleUpdate = useCallback(async (id: string, data: { version: string; title: string; description: string }) => {
        await updateNote(id, data)
    }, [updateNote])

    const handleDelete = useCallback(async (id: string) => {
        await deleteNote(id)
    }, [deleteNote])

    return (
        <main className="min-h-screen bg-background">
            <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">

                {/* TITLE BAR */}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="font-display text-3xl font-medium tracking-tight">Release Notes</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            What&apos;s new — features, fixes and improvements to this blog.
                        </p>
                    </div>
                    {isAdmin && (
                        <Button size="sm" onClick={() => setIsFormOpen(true)} className="gap-2 shrink-0">
                            <Plus className="w-4 h-4" />
                            New release
                        </Button>
                    )}
                </div>

                {!isLoading && notes.length > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                        <span className="font-semibold text-foreground tabular-nums">{notes.length}</span>
                        <span className="text-muted-foreground">releases published</span>
                        <span className="text-muted-foreground/40">·</span>
                        <span className="text-muted-foreground">
                            latest <span className="font-mono text-foreground">{notes[0].version}</span>
                        </span>
                    </div>
                )}

                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {isLoading && (
                    <div className="flex justify-center py-20">
                        <div className="h-5 w-5 rounded-full border border-muted border-t-foreground animate-spin" />
                    </div>
                )}

                {!isLoading && notes.length === 0 && (
                    <div className="text-center py-20 border border-dashed border-border/50 rounded-2xl">
                        <p className="text-sm text-muted-foreground">No releases yet.</p>
                        {isAdmin && (
                            <Button variant="ghost" onClick={() => setIsFormOpen(true)} className="mt-4">
                                Publish first release note
                            </Button>
                        )}
                    </div>
                )}

                {!isLoading && notes.length > 0 && (
                    <div className="border-l-2 border-border ml-3 pl-8 relative space-y-10 py-2">
                        {notes.map((note, i) => (
                            <motion.div
                                key={note.id}
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.3 }}
                                transition={{ type: 'spring', stiffness: 280, damping: 28, delay: (i % 3) * 0.06 }}
                                className="relative"
                            >
                                <span
                                    className={`absolute -left-11.5 top-0 h-7 w-7 rounded-full ring-4 ring-background flex items-center justify-center ${
                                        i === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                                    }`}
                                >
                                    <Tag className="w-3.5 h-3.5" />
                                </span>
                                <ReleaseNoteCard
                                    note={note}
                                    isLatest={i === 0}
                                    isAdmin={isAdmin}
                                    onDelete={isAdmin ? handleDelete : undefined}
                                    onUpdate={isAdmin ? handleUpdate : undefined}
                                />
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {isAdmin && (
                <ReleaseNoteFormModal
                    open={isFormOpen}
                    onOpenChange={setIsFormOpen}
                    onSubmit={handleCreate}
                    mode="create"
                />
            )}
        </main>
    )
}
