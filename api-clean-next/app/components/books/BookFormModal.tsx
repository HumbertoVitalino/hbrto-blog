'use client'

import { useState, useEffect, useRef } from 'react'
import { BookData } from '@/app/hooks/useBooks'
import { BookGenre } from '@/domain/BookGenre'
import { BookStatus } from '@/domain/BookStatus'
import { uploadBookCover, deleteBookCover, MAX_FILE_SIZE, VALID_MIMES } from '@/lib/uploadBookCover'
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
import { ImagePlus, Loader2 } from 'lucide-react'

type FormState = Omit<BookData, 'id'>

interface BookFormModalProps {
    isOpen: boolean
    book?: BookData
    isLoading?: boolean
    onSubmit: (data: FormState) => Promise<void>
    onOpenChange: (open: boolean) => void
}

const emptyForm: FormState = {
    title: '',
    author: '',
    pages: 0,
    genre: undefined,
    coverImageUrl: undefined,
    affiliateUrl: undefined,
    status: BookStatus.NotStarted,
}

const genreOptions: { value: BookGenre; label: string }[] = [
    { value: BookGenre.Fiction, label: 'Fiction' },
    { value: BookGenre.NonFiction, label: 'Non-Fiction' },
    { value: BookGenre.Fantasy, label: 'Fantasy' },
    { value: BookGenre.ScienceFiction, label: 'Science Fiction' },
    { value: BookGenre.Mystery, label: 'Mystery' },
    { value: BookGenre.Thriller, label: 'Thriller' },
    { value: BookGenre.Romance, label: 'Romance' },
    { value: BookGenre.Horror, label: 'Horror' },
    { value: BookGenre.Biography, label: 'Biography' },
    { value: BookGenre.History, label: 'History' },
    { value: BookGenre.SelfHelp, label: 'Self-Help' },
    { value: BookGenre.Business, label: 'Business' },
    { value: BookGenre.Technology, label: 'Technology' },
    { value: BookGenre.Philosophy, label: 'Philosophy' },
]

// taller fields on touch screens; text-base below md keeps iOS from zooming in on focus
const fieldClass = 'h-10 md:h-8'
const selectClass =
    'h-10 md:h-8 w-full rounded-lg border border-input bg-background px-2.5 text-base md:text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50'

export function BookFormModal({
    isOpen,
    book,
    isLoading,
    onSubmit,
    onOpenChange,
}: BookFormModalProps) {
    const [formData, setFormData] = useState<FormState>(emptyForm)
    const [errors, setErrors] = useState<Record<string, string | undefined>>({})
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [uploadingImage, setUploadingImage] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const isBusy = isLoading || uploadingImage

    // reset only when opening, so the content doesn't swap mid close-animation
    useEffect(() => {
        if (!isOpen) return
        setFormData(book
            ? {
                title: book.title,
                author: book.author,
                pages: book.pages,
                genre: book.genre,
                coverImageUrl: book.coverImageUrl,
                affiliateUrl: book.affiliateUrl,
                status: book.status || BookStatus.NotStarted,
            }
            : emptyForm)
        setPreview(book?.coverImageUrl || null)
        setErrors({})
        setSelectedFile(null)
    }, [book, isOpen])

    useEffect(() => {
        if (!preview?.startsWith('blob:')) return
        return () => URL.revokeObjectURL(preview)
    }, [preview])

    const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setFormData(prev => ({ ...prev, [key]: value }))
        if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }))
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        // allow picking the same file again after removing it
        e.target.value = ''
        if (!file) return

        if (!VALID_MIMES.includes(file.type)) {
            setErrors(prev => ({ ...prev, cover: 'Use a JPG, PNG or WebP image' }))
            return
        }
        if (file.size > MAX_FILE_SIZE) {
            setErrors(prev => ({ ...prev, cover: 'Image is larger than 5MB' }))
            return
        }

        setErrors(prev => ({ ...prev, cover: undefined }))
        setSelectedFile(file)
        setPreview(URL.createObjectURL(file))
    }

    const clearImage = () => {
        setSelectedFile(null)
        setPreview(null)
        setField('coverImageUrl', undefined)
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

        // on a phone the invalid field may be scrolled out of view — focusing it brings it back
        const firstInvalid = Object.keys(newErrors)[0]
        if (firstInvalid) document.getElementById(firstInvalid)?.focus()

        return !firstInvalid
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        let uploadedPath: string | undefined

        try {
            let coverImageUrl = formData.coverImageUrl

            if (selectedFile) {
                setUploadingImage(true)
                // a new book has no id yet; the folder only groups files, names are already unique
                const result = await uploadBookCover(selectedFile, book?.id ?? 'new')
                coverImageUrl = result.url
                uploadedPath = result.path
                setUploadingImage(false)
            }

            await onSubmit({
                ...formData,
                coverImageUrl,
            })
            onOpenChange(false)
        } catch (error) {
            // don't leave an orphaned cover in storage when the book itself failed to save
            if (uploadedPath) await deleteBookCover(uploadedPath)
            setErrors({
                submit: error instanceof Error ? error.message : 'Error submitting form'
            })
        } finally {
            setUploadingImage(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-md">
                <DialogHeader className="shrink-0 px-5 pt-5 pr-12 pb-4">
                    <DialogTitle>
                        {book ? 'Edit Book' : 'New Book'}
                    </DialogTitle>
                    <DialogDescription>
                        {book
                            ? 'Update the book information.'
                            : 'Add a new book to your library.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
                    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-5 pb-5">

                        {/* COVER */}
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isBusy}
                                aria-label={preview ? 'Change cover image' : 'Upload cover image'}
                                className="relative flex aspect-2/3 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md border border-dashed border-muted-foreground/30 bg-muted/40 transition-colors hover:border-foreground/40 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
                            >
                                {preview ? (
                                    <img src={preview} alt="Cover preview" className="h-full w-full object-cover" />
                                ) : (
                                    <ImagePlus className="h-5 w-5 text-muted-foreground" />
                                )}
                            </button>
                            <div className="flex min-w-0 flex-col justify-center gap-1.5">
                                <Label htmlFor="cover">Cover image</Label>
                                <p className="text-xs text-muted-foreground">JPG, PNG or WebP · max 5MB</p>
                                <div className="mt-1 flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isBusy}
                                    >
                                        {preview ? 'Change' : 'Upload'}
                                    </Button>
                                    {preview && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={clearImage}
                                            disabled={isBusy}
                                        >
                                            Remove
                                        </Button>
                                    )}
                                </div>
                                {errors.cover && (
                                    <p className="text-sm text-destructive-text">{errors.cover}</p>
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                id="cover"
                                type="file"
                                accept={VALID_MIMES.join(',')}
                                onChange={handleFileChange}
                                disabled={isBusy}
                                className="hidden"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                placeholder="Ex: Clean Code"
                                value={formData.title}
                                onChange={(e) => setField('title', e.target.value)}
                                disabled={isBusy}
                                aria-invalid={!!errors.title}
                                className={fieldClass}
                            />
                            {errors.title && (
                                <p className="text-sm text-destructive-text">{errors.title}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="author">Author</Label>
                            <Input
                                id="author"
                                placeholder="Ex: Robert Martin"
                                value={formData.author}
                                onChange={(e) => setField('author', e.target.value)}
                                disabled={isBusy}
                                aria-invalid={!!errors.author}
                                className={fieldClass}
                            />
                            {errors.author && (
                                <p className="text-sm text-destructive-text">{errors.author}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="pages">Pages</Label>
                                <Input
                                    id="pages"
                                    type="number"
                                    inputMode="numeric"
                                    placeholder="Ex: 464"
                                    value={formData.pages || ''}
                                    onChange={(e) => setField('pages', parseInt(e.target.value) || 0)}
                                    disabled={isBusy}
                                    min="1"
                                    aria-invalid={!!errors.pages}
                                    className={fieldClass}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <select
                                    id="status"
                                    value={formData.status || BookStatus.NotStarted}
                                    onChange={(e) => setField('status', e.target.value as BookStatus)}
                                    disabled={isBusy}
                                    className={selectClass}
                                >
                                    <option value={BookStatus.NotStarted}>Not Started</option>
                                    <option value={BookStatus.InProgress}>In Progress</option>
                                    <option value={BookStatus.Completed}>Completed</option>
                                </select>
                            </div>
                        </div>
                        {errors.pages && (
                            <p className="-mt-2 text-sm text-destructive-text">{errors.pages}</p>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="genre">Genre</Label>
                            <select
                                id="genre"
                                value={formData.genre || ''}
                                onChange={(e) => setField('genre', (e.target.value as BookGenre) || undefined)}
                                disabled={isBusy}
                                className={selectClass}
                            >
                                <option value="">Select a genre</option>
                                {genreOptions.map(({ value, label }) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="affiliateUrl">Amazon Affiliate Link <span className="text-muted-foreground font-normal">(optional)</span></Label>
                            <Input
                                id="affiliateUrl"
                                type="url"
                                inputMode="url"
                                placeholder="https://www.amazon.com.br/dp/ASIN?tag=yourtag-20"
                                value={formData.affiliateUrl || ''}
                                onChange={(e) => setField('affiliateUrl', e.target.value || undefined)}
                                disabled={isBusy}
                                className={fieldClass}
                            />
                        </div>

                        {errors.submit && (
                            <p role="alert" className="text-sm text-destructive-text">{errors.submit}</p>
                        )}
                    </div>

                    {/* always visible, so Save never ends up below the fold on a phone */}
                    <DialogFooter className="mx-0 mb-0 shrink-0 flex-row px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isBusy}
                            className="h-10 flex-1 sm:h-8 sm:flex-none"
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isBusy} className="h-10 flex-1 sm:h-8 sm:flex-none">
                            {isBusy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {uploadingImage ? 'Uploading...' : (book ? 'Save' : 'Create')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
