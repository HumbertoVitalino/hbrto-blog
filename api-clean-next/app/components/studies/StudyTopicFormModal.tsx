'use client'

import { useState, useEffect } from 'react'
import { StudyTopicData } from '@/app/hooks/useStudyTopics'
import { StudyTopicStatus } from '@/domain/StudyTopicStatus'
import { StudyPriority } from '@/domain/StudyPriority'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'

interface StudyTopicFormModalProps {
    isOpen: boolean
    topic?: StudyTopicData
    isLoading?: boolean
    onSubmit: (data: Omit<StudyTopicData, 'id'>) => Promise<void>
    onOpenChange: (open: boolean) => void
}

const emptyForm: Omit<StudyTopicData, 'id'> = {
    title: '',
    description: '',
    status: StudyTopicStatus.Planned,
    priority: StudyPriority.Medium,
    resourceUrl: undefined,
}

export function StudyTopicFormModal({
    isOpen,
    topic,
    isLoading,
    onSubmit,
    onOpenChange,
}: StudyTopicFormModalProps) {
    const [formData, setFormData] = useState<Omit<StudyTopicData, 'id'>>(emptyForm)
    const [errors, setErrors] = useState<Record<string, string>>({})

    useEffect(() => {
        if (topic) {
            setFormData({
                title: topic.title,
                description: topic.description,
                status: topic.status || StudyTopicStatus.Planned,
                priority: topic.priority || StudyPriority.Medium,
                resourceUrl: topic.resourceUrl,
            })
        } else {
            setFormData(emptyForm)
        }
        setErrors({})
    }, [topic, isOpen])

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        try {
            await onSubmit(formData)
            onOpenChange(false)
        } catch (error) {
            console.error('Error submitting form:', error)
            setErrors({
                submit: error instanceof Error ? error.message : 'Error submitting form'
            })
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-106.25">
                <DialogHeader>
                    <DialogTitle>
                        {topic ? 'Edit Study Topic' : 'New Study Topic'}
                    </DialogTitle>
                    <DialogDescription>
                        {topic
                            ? 'Update what you are studying.'
                            : 'Add something you want to study.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            placeholder="Ex: System Design fundamentals"
                            value={formData.title}
                            onChange={(e) =>
                                setFormData({ ...formData, title: e.target.value })
                            }
                            disabled={isLoading}
                            className={errors.title ? 'border-destructive' : ''}
                        />
                        {errors.title && (
                            <p className="text-sm text-destructive">{errors.title}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description <span className="text-muted-foreground font-normal">(optional)</span></Label>
                        <Textarea
                            id="description"
                            placeholder="What are you covering here?"
                            value={formData.description || ''}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                            disabled={isLoading}
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <select
                                id="status"
                                value={formData.status || StudyTopicStatus.Planned}
                                onChange={(e) =>
                                    setFormData({ ...formData, status: e.target.value as StudyTopicStatus })
                                }
                                disabled={isLoading}
                                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            >
                                <option value={StudyTopicStatus.Planned}>Planned</option>
                                <option value={StudyTopicStatus.InProgress}>In progress</option>
                                <option value={StudyTopicStatus.Completed}>Completed</option>
                                <option value={StudyTopicStatus.OnHold}>On hold</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="priority">Priority</Label>
                            <select
                                id="priority"
                                value={formData.priority || StudyPriority.Medium}
                                onChange={(e) =>
                                    setFormData({ ...formData, priority: e.target.value as StudyPriority })
                                }
                                disabled={isLoading}
                                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            >
                                <option value={StudyPriority.Low}>Low</option>
                                <option value={StudyPriority.Medium}>Medium</option>
                                <option value={StudyPriority.High}>High</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="resourceUrl">Resource link <span className="text-muted-foreground font-normal">(optional)</span></Label>
                        <Input
                            id="resourceUrl"
                            placeholder="https://..."
                            value={formData.resourceUrl || ''}
                            onChange={(e) =>
                                setFormData({ ...formData, resourceUrl: e.target.value || undefined })
                            }
                            disabled={isLoading}
                        />
                    </div>

                    {errors.submit && (
                        <p className="text-sm text-destructive">{errors.submit}</p>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {topic ? 'Save' : 'Create'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
