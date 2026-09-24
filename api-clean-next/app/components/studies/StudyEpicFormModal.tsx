'use client'

import { useState, useEffect } from 'react'
import { StudyEpicData } from '@/app/hooks/useStudyEpics'
import { StudyEpicStatus } from '@/domain/StudyEpicStatus'
import { EPIC_COLORS, epicColorClasses } from '@/lib/studyEpicColors'
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
import { Loader2, Check } from 'lucide-react'

interface StudyEpicFormModalProps {
    isOpen: boolean
    epic?: StudyEpicData
    isLoading?: boolean
    onSubmit: (data: Omit<StudyEpicData, 'id'>) => Promise<void>
    onOpenChange: (open: boolean) => void
}

const emptyForm: Omit<StudyEpicData, 'id'> = {
    title: '',
    description: '',
    status: StudyEpicStatus.Planned,
    color: EPIC_COLORS[0],
}

export function StudyEpicFormModal({
    isOpen,
    epic,
    isLoading,
    onSubmit,
    onOpenChange,
}: StudyEpicFormModalProps) {
    const [formData, setFormData] = useState<Omit<StudyEpicData, 'id'>>(emptyForm)
    const [targetHours, setTargetHours] = useState('')
    const [errors, setErrors] = useState<Record<string, string>>({})

    useEffect(() => {
        if (epic) {
            setFormData({
                title: epic.title,
                description: epic.description,
                status: epic.status || StudyEpicStatus.Planned,
                color: epic.color || EPIC_COLORS[0],
            })
            setTargetHours(epic.targetSeconds ? String(epic.targetSeconds / 3600) : '')
        } else {
            setFormData(emptyForm)
            setTargetHours('')
        }
        setErrors({})
    }, [epic, isOpen])

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required'
        }

        if (targetHours.trim() !== '' && (isNaN(Number(targetHours)) || Number(targetHours) < 0)) {
            newErrors.targetHours = 'Target hours must be a positive number'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        const targetSeconds = targetHours.trim() === '' ? null : Math.round(Number(targetHours) * 3600)

        try {
            await onSubmit({ ...formData, targetSeconds })
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
                        {epic ? 'Edit Epic' : 'New Epic'}
                    </DialogTitle>
                    <DialogDescription>
                        {epic
                            ? 'Update this study initiative.'
                            : 'Group related topics under a larger initiative, like a course or program.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="epic-title">Title</Label>
                        <Input
                            id="epic-title"
                            placeholder="Ex: Postgraduate program"
                            value={formData.title}
                            onChange={(e) =>
                                setFormData({ ...formData, title: e.target.value })
                            }
                            disabled={isLoading}
                            className={errors.title ? 'border-destructive' : ''}
                        />
                        {errors.title && (
                            <p className="text-sm text-destructive-text">{errors.title}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="epic-description">Description <span className="text-muted-foreground font-normal">(optional)</span></Label>
                        <Textarea
                            id="epic-description"
                            placeholder="What does this initiative cover?"
                            value={formData.description || ''}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                            disabled={isLoading}
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="epic-status">Status</Label>
                        <select
                            id="epic-status"
                            value={formData.status || StudyEpicStatus.Planned}
                            onChange={(e) =>
                                setFormData({ ...formData, status: e.target.value as StudyEpicStatus })
                            }
                            disabled={isLoading}
                            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        >
                            <option value={StudyEpicStatus.Planned}>Planned</option>
                            <option value={StudyEpicStatus.InProgress}>In progress</option>
                            <option value={StudyEpicStatus.Completed}>Completed</option>
                            <option value={StudyEpicStatus.OnHold}>On hold</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label>Color</Label>
                        <div className="flex items-center gap-2">
                            {EPIC_COLORS.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, color })}
                                    disabled={isLoading}
                                    title={color}
                                    className={`w-7 h-7 rounded-full ${epicColorClasses(color).dot} flex items-center justify-center ring-2 ring-offset-2 ring-offset-background transition-shadow ${
                                        formData.color === color ? 'ring-foreground' : 'ring-transparent'
                                    }`}
                                >
                                    {formData.color === color && (
                                        <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="epic-target">Target hours <span className="text-muted-foreground font-normal">(optional)</span></Label>
                        <Input
                            id="epic-target"
                            type="number"
                            min="0"
                            step="0.5"
                            placeholder="e.g. 40"
                            value={targetHours}
                            onChange={(e) => setTargetHours(e.target.value)}
                            disabled={isLoading}
                            className={errors.targetHours ? 'border-destructive' : ''}
                        />
                        <p className="text-xs text-muted-foreground">
                            How much total time you&apos;re aiming to invest in this epic.
                        </p>
                        {errors.targetHours && (
                            <p className="text-sm text-destructive-text">{errors.targetHours}</p>
                        )}
                    </div>

                    {errors.submit && (
                        <p className="text-sm text-destructive-text">{errors.submit}</p>
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
                            {epic ? 'Save' : 'Create'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
