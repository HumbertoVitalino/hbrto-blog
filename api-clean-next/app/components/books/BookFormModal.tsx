'use client'

import { useState, useEffect } from 'react'
import { BookData } from '@/app/hooks/useBooks'
import { BookGenre } from '@/domain/BookGenre'
import { BookStatus } from '@/domain/BookStatus'
import { uploadBookCover } from '@/lib/uploadBookCover'
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
import { Loader2, Upload, X } from 'lucide-react'

interface BookFormModalProps {
    isOpen: boolean
    book?: BookData
    isLoading?: boolean
    onSubmit: (data: Omit<BookData, 'id'>) => Promise<void>
    onOpenChange: (open: boolean) => void
}

export function BookFormModal({
    isOpen,
    book,
    isLoading,
    onSubmit,
    onOpenChange,
}: BookFormModalProps) {
    const [formData, setFormData] = useState<Omit<BookData, 'id'>>({
        title: '',
        author: '',
        pages: 0,
        genre: undefined,
        coverImageUrl: undefined,
        status: BookStatus.NotStarted,
    })

    const [errors, setErrors] = useState<Record<string, string>>({})
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [uploadingImage, setUploadingImage] = useState(false)

    useEffect(() => {
        if (book) {
            setFormData({
                title: book.title,
                author: book.author,
                pages: book.pages,
                genre: book.genre,
                coverImageUrl: book.coverImageUrl,
                status: book.status || BookStatus.NotStarted,
            })
            setPreview(book.coverImageUrl || null)
        } else {
            setFormData({
                title: '',
                author: '',
                pages: 0,
                genre: undefined,
                coverImageUrl: undefined,
                status: BookStatus.NotStarted,
            })
            setPreview(null)
        }
        setErrors({})
        setSelectedFile(null)
    }, [book, isOpen])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const clearImage = () => {
        setSelectedFile(null)
        setPreview(null)
        setFormData({ ...formData, coverImageUrl: undefined })
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required'
        }
        if (!formData.author.trim()) {
            newErrors.author = 'Author is required'
        }
        if (!formData.pages || formData.pages <= 0) {
            newErrors.pages = 'Pages must be greater than 0'
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
            let imageUrl = formData.coverImageUrl

            // Se há novo arquivo, fazer upload
            if (selectedFile && book) {
                setUploadingImage(true)
                const result = await uploadBookCover(selectedFile, book.id!)
                imageUrl = result.url
                setUploadingImage(false)
            } else if (selectedFile && !book) {
                // Para novo livro, precisa ser feito após criar o livro
                // Vamos armazenar o arquivo no estado para processar depois
                // Por enquanto, enviamos sem imagem e o modal pode lidar com isso
            }

            await onSubmit({
                ...formData,
                coverImageUrl: imageUrl
            })
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
                        {book ? 'Edit Book' : 'New Book'}
                    </DialogTitle>
                    <DialogDescription>
                        {book
                            ? 'Update the book information.'
                            : 'Add a new book to your blog.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            placeholder="Ex: Clean Code"
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
                        <Label htmlFor="author">Author</Label>
                        <Input
                            id="author"
                            placeholder="Ex: Robert Martin"
                            value={formData.author}
                            onChange={(e) =>
                                setFormData({ ...formData, author: e.target.value })
                            }
                            disabled={isLoading}
                            className={errors.author ? 'border-destructive' : ''}
                        />
                        {errors.author && (
                            <p className="text-sm text-destructive">{errors.author}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="pages">Number of Pages</Label>
                        <Input
                            id="pages"
                            type="number"
                            placeholder="Ex: 464"
                            value={formData.pages || ''}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    pages: parseInt(e.target.value) || 0,
                                })
                            }
                            disabled={isLoading}
                            min="1"
                            className={errors.pages ? 'border-destructive' : ''}
                        />
                        {errors.pages && (
                            <p className="text-sm text-destructive">{errors.pages}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="genre">Genre</Label>
                        <select
                            id="genre"
                            value={formData.genre || ''}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    genre: (e.target.value as BookGenre) || undefined,
                                })
                            }
                            disabled={isLoading}
                            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        >
                            <option value="">Select a genre</option>
                            <option value={BookGenre.Fiction}>Fiction</option>
                            <option value={BookGenre.NonFiction}>Non-Fiction</option>
                            <option value={BookGenre.Fantasy}>Fantasy</option>
                            <option value={BookGenre.ScienceFiction}>Science Fiction</option>
                            <option value={BookGenre.Mystery}>Mystery</option>
                            <option value={BookGenre.Thriller}>Thriller</option>
                            <option value={BookGenre.Romance}>Romance</option>
                            <option value={BookGenre.Horror}>Horror</option>
                            <option value={BookGenre.Biography}>Biography</option>
                            <option value={BookGenre.History}>History</option>
                            <option value={BookGenre.SelfHelp}>Self-Help</option>
                            <option value={BookGenre.Business}>Business</option>
                            <option value={BookGenre.Technology}>Technology</option>
                            <option value={BookGenre.Philosophy}>Philosophy</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <select
                            id="status"
                            value={formData.status || BookStatus.NotStarted}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    status: (e.target.value as BookStatus),
                                })
                            }
                            disabled={isLoading}
                            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        >
                            <option value={BookStatus.NotStarted}>Not Started</option>
                            <option value={BookStatus.InProgress}>In Progress</option>
                            <option value={BookStatus.Completed}>Completed</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="cover">Cover Image</Label>
                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                            {preview ? (
                                <div className="space-y-3">
                                    <div className="relative w-full h-48">
                                        <img
                                            src={preview}
                                            alt="Cover preview"
                                            className="w-full h-full object-cover rounded-md"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                const input = document.getElementById('cover') as HTMLInputElement
                                                input?.click()
                                            }}
                                            disabled={isLoading || uploadingImage}
                                        >
                                            Change
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={clearImage}
                                            disabled={isLoading || uploadingImage}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-6">
                                    <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                                    <label htmlFor="cover" className="cursor-pointer">
                                        <span className="text-sm font-medium text-primary hover:underline">
                                            Click to upload
                                        </span>
                                    </label>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        JPG, PNG or WebP (max 5MB)
                                    </p>
                                </div>
                            )}
                            <Input
                                id="cover"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleFileChange}
                                disabled={isLoading || uploadingImage}
                                className="hidden"
                            />
                        </div>
                    </div>

                    {errors.submit && (
                        <p className="text-sm text-destructive">{errors.submit}</p>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading || uploadingImage}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading || uploadingImage}>
                            {(isLoading || uploadingImage) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {uploadingImage ? 'Uploading...' : (book ? 'Save' : 'Create')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
