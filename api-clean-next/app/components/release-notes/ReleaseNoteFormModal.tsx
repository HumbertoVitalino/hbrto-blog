'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { MarkdownRenderer } from '@/app/components/reviews/MarkdownRenderer'

interface ReleaseNoteFormModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (data: { version: string; title: string; description: string }) => Promise<void>
    initialValues?: { version: string; title: string; description: string }
    mode?: 'create' | 'edit'
}

export function ReleaseNoteFormModal({
    open,
    onOpenChange,
    onSubmit,
    initialValues,
    mode = 'create',
}: ReleaseNoteFormModalProps) {
    const [version, setVersion] = useState(initialValues?.version ?? '')
    const [title, setTitle] = useState(initialValues?.title ?? '')
    const [description, setDescription] = useState(initialValues?.description ?? '')
    const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (open) {
            setVersion(initialValues?.version ?? '')
            setTitle(initialValues?.title ?? '')
            setDescription(initialValues?.description ?? '')
            setActiveTab('write')
            setError(null)
        }
    }, [open, initialValues])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!version.trim()) return setError('Version is required')
        if (!title.trim()) return setError('Title is required')
        if (!description.trim()) return setError('Description is required')

        try {
            setIsLoading(true)
            setError(null)
            await onSubmit({ version: version.trim(), title: title.trim(), description: description.trim() })
            onOpenChange(false)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {mode === 'edit' ? 'Edit Release Note' : 'New Release Note'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                Version
                            </label>
                            <Input
                                value={version}
                                onChange={(e) => setVersion(e.target.value)}
                                placeholder="e.g. Music Feature, Image Support"
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                Title
                            </label>
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Short summary of this release"
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                Description
                            </label>
                            <div className="flex gap-1 border rounded-md p-0.5 text-xs">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('write')}
                                    className={`px-2.5 py-1 rounded transition-colors ${activeTab === 'write' ? 'bg-muted font-medium' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    Write
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('preview')}
                                    className={`px-2.5 py-1 rounded transition-colors ${activeTab === 'preview' ? 'bg-muted font-medium' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    Preview
                                </button>
                            </div>
                        </div>

                        {activeTab === 'write' ? (
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe what changed. Supports **markdown**."
                                disabled={isLoading}
                                rows={10}
                                className="w-full rounded-md border bg-background px-3 py-2 text-sm font-mono resize-none focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
                            />
                        ) : (
                            <div className="min-h-60 rounded-md border bg-muted/20 px-4 py-3">
                                {description ? (
                                    <MarkdownRenderer content={description} />
                                ) : (
                                    <p className="text-sm text-muted-foreground italic">Nothing to preview.</p>
                                )}
                            </div>
                        )}
                    </div>

                    {error && (
                        <p className="text-sm text-destructive">{error}</p>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Saving…' : mode === 'edit' ? 'Save changes' : 'Publish'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
