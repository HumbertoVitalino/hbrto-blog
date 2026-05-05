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
            <div className="max-w-2xl mx-auto px-4 py-16 space-y-12">

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Release Notes</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            What's new on the blog.
                        </p>
                    </div>
                    {isAdmin && (
                        <Button size="sm" onClick={() => setIsFormOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            New
                        </Button>
                    )}
                </div>

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
                    <div className="text-center py-20">
                        <p className="text-sm text-muted-foreground">No releases yet.</p>
                        {isAdmin && (
                            <Button variant="ghost" onClick={() => setIsFormOpen(true)} className="mt-4">
                                Publish first release note
                            </Button>
                        )}
                    </div>
                )}

                {!isLoading && notes.length > 0 && (
                    <div className="space-y-6">
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
