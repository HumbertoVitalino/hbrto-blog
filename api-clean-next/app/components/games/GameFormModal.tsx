'use client'

import { useState, useEffect } from 'react'
import { GameData } from '@/app/hooks/useGames'
import { GamePlatform } from '@/domain/GamePlatform'
import { GameStatus } from '@/domain/GameStatus'
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
import { Loader2 } from 'lucide-react'

interface GameFormModalProps {
    isOpen: boolean
    game?: GameData
    isLoading?: boolean
    onSubmit: (data: Omit<GameData, 'id'>) => Promise<void>
    onOpenChange: (open: boolean) => void
}

const empty: Omit<GameData, 'id'> = {
    title: '',
    platform: GamePlatform.PSN,
    genre: undefined,
    status: GameStatus.NotStarted,
    coverImageUrl: undefined,
    totalHours: undefined,
}

export function GameFormModal({ isOpen, game, isLoading, onSubmit, onOpenChange }: GameFormModalProps) {
    const [formData, setFormData] = useState<Omit<GameData, 'id'>>(empty)
    const [errors, setErrors] = useState<Record<string, string>>({})

    useEffect(() => {
        if (game) {
            setFormData({
                title: game.title,
                platform: game.platform,
                genre: game.genre,
                status: game.status ?? GameStatus.NotStarted,
                coverImageUrl: game.coverImageUrl,
                totalHours: game.totalHours,
            })
        } else {
            setFormData(empty)
        }
        setErrors({})
    }, [game, isOpen])

    const validate = () => {
        const e: Record<string, string> = {}
        if (!formData.title.trim()) e.title = 'Title is required'
        if (!formData.platform) e.platform = 'Platform is required'
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validate()) return
        try {
            await onSubmit(formData)
            onOpenChange(false)
        } catch (err) {
            setErrors({ submit: err instanceof Error ? err.message : 'Error submitting form' })
        }
    }

    const select = 'w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{game ? 'Edit Game' : 'New Game'}</DialogTitle>
                    <DialogDescription>
                        {game ? 'Update the game information.' : 'Add a new game to your library.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            placeholder="Ex: The Last of Us"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            disabled={isLoading}
                            className={errors.title ? 'border-destructive' : ''}
                        />
                        {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="platform">Platform</Label>
                        <select
                            id="platform"
                            value={formData.platform}
                            onChange={e => setFormData({ ...formData, platform: e.target.value as GamePlatform })}
                            disabled={isLoading}
                            className={select}
                        >
                            <option value={GamePlatform.PSN}>PlayStation</option>
                            <option value={GamePlatform.NintendoSwitch}>Nintendo Switch</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <select
                            id="status"
                            value={formData.status ?? GameStatus.NotStarted}
                            onChange={e => setFormData({ ...formData, status: e.target.value as GameStatus })}
                            disabled={isLoading}
                            className={select}
                        >
                            <option value={GameStatus.NotStarted}>Backlog</option>
                            <option value={GameStatus.Playing}>Playing</option>
                            <option value={GameStatus.Completed}>Completed</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="genre">
                            Genre <span className="text-muted-foreground font-normal">(optional)</span>
                        </Label>
                        <Input
                            id="genre"
                            placeholder="Ex: Action RPG"
                            value={formData.genre ?? ''}
                            onChange={e => setFormData({ ...formData, genre: e.target.value || undefined })}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="totalHours">
                            Hours played <span className="text-muted-foreground font-normal">(optional)</span>
                        </Label>
                        <Input
                            id="totalHours"
                            type="number"
                            placeholder="Ex: 40"
                            min="0"
                            value={formData.totalHours ?? ''}
                            onChange={e => setFormData({ ...formData, totalHours: parseInt(e.target.value) || undefined })}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="coverImageUrl">
                            Cover image URL <span className="text-muted-foreground font-normal">(optional)</span>
                        </Label>
                        <Input
                            id="coverImageUrl"
                            placeholder="https://..."
                            value={formData.coverImageUrl ?? ''}
                            onChange={e => setFormData({ ...formData, coverImageUrl: e.target.value || undefined })}
                            disabled={isLoading}
                        />
                    </div>

                    {errors.submit && <p className="text-sm text-destructive">{errors.submit}</p>}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {game ? 'Save' : 'Create'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
