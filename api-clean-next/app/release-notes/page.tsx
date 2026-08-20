'use client'

import { useState, useCallback } from 'react'
import { useReleaseNotes } from '@/app/hooks/useReleaseNotes'
import { useAuth } from '@/app/context/AuthContext'
import { ReleaseNoteCard } from '@/app/components/release-notes/ReleaseNoteCard'
import { ReleaseNoteFormModal } from '@/app/components/release-notes/ReleaseNoteFormModal'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, Plus } from 'lucide-react'

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

            {/* HERO */}
            <section className="border-b bg-muted/10">
                <div className="max-w-5xl mx-auto px-6 py-14">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Changelog</p>
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                            <h1 className="font-display text-4xl font-medium tracking-tight">Release Notes</h1>
                            <p className="text-muted-foreground mt-2 leading-relaxed">
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
                        <div className="flex items-center gap-2 mt-8 pt-6 border-t border-border/50 text-sm flex-wrap">
                            <span>
                                <span className="font-semibold text-foreground tabular-nums">{notes.length}</span>
                                <span className="text-muted-foreground ml-1">releases published</span>
                            </span>
                        </div>
                    )}
                </div>
            </section>

            <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">

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
                    <div>
                        {notes.map((note) => (
                            <ReleaseNoteCard
                                key={note.id}
                                note={note}
                                isAdmin={isAdmin}
                                onDelete={isAdmin ? handleDelete : undefined}
                                onUpdate={isAdmin ? handleUpdate : undefined}
                            />
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
