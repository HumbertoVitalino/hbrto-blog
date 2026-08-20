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
import { useBooks } from '@/app/hooks/useBooks'
import { formatDate } from '@/lib/formatDate'
import { MarkdownPreview } from './MarkdownPreview'
import { Star, BookOpen, Info, ChevronLeft } from 'lucide-react'
import { ReviewLanguage } from '@/domain/Review'

const LANGUAGES: { value: ReviewLanguage; flag: string; label: string }[] = [
  { value: 'en', flag: '🇺🇸', label: 'EN' },
  { value: 'pt-BR', flag: '🇧🇷', label: 'PT' },
]

interface ReviewFormData {
  title: string
  bookId: string | null
  rating: number
  comment: string
  language: ReviewLanguage
}

interface ReviewFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: ReviewFormData) => Promise<void>
  initialValues?: { title?: string; rating: number; comment: string; createdAt?: Date; language?: ReviewLanguage }
  mode?: 'create' | 'edit'
  bookId?: string | null
}

export function ReviewFormModal({
  open,
  onOpenChange,
  onSubmit,
  initialValues,
  mode = 'create',
  bookId,
}: ReviewFormModalProps) {
  const { books, isLoading: booksLoading } = useBooks()

  const [title, setTitle] = useState(initialValues?.title ?? '')
  const [rating, setRating] = useState(initialValues?.rating ?? 5)
  const [hoveredStar, setHoveredStar] = useState<number | null>(null)

  // Create mode: independent content per language
  const [comments, setComments] = useState<Record<ReviewLanguage, string>>({ en: '', 'pt-BR': '' })
  const [activeLang, setActiveLang] = useState<ReviewLanguage>('en')

  // Edit mode: single language
  const [singleComment, setSingleComment] = useState(initialValues?.comment ?? '')
  const [language, setLanguage] = useState<ReviewLanguage>(initialValues?.language ?? 'en')

  const [selectedBookId, setSelectedBookId] = useState<string | null>(bookId ?? null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'book' | 'form'>(bookId ? 'form' : mode === 'create' ? 'book' : 'form')
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write')

  // Reset all state every time the modal opens — fixes stale values after submit/cancel
  useEffect(() => {
    if (!open) return
    setTitle(initialValues?.title ?? '')
    setRating(initialValues?.rating ?? 5)
    setSingleComment(initialValues?.comment ?? '')
    setLanguage(initialValues?.language ?? 'en')
    setComments({ en: '', 'pt-BR': '' })
    setActiveLang('en')
    setActiveTab('write')
    setError(null)
    setStep(bookId ? 'form' : mode === 'create' ? 'book' : 'form')
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const activeComment = mode === 'create' ? comments[activeLang] : singleComment
  const setActiveComment = (val: string) => {
    if (mode === 'create') {
      setComments(prev => ({ ...prev, [activeLang]: val }))
    } else {
      setSingleComment(val)
    }
  }

  const filledLanguages = LANGUAGES.filter(l => comments[l.value].trim())

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) { setError('Title is required'); return }
    if (rating < 1 || rating > 5) { setError('Rating must be between 1 and 5'); return }

    if (mode === 'create') {
      if (filledLanguages.length === 0) {
        setError('Write content in at least one language')
        return
      }
      try {
        setError(null)
        setIsLoading(true)
        for (const lang of filledLanguages) {
          await onSubmit({ title, bookId: selectedBookId, rating, comment: comments[lang.value], language: lang.value })
        }
        onOpenChange(false)
      } catch (err: any) {
        setError(err.message || 'An error occurred while saving the review.')
      } finally {
        setIsLoading(false)
      }
    } else {
      if (!singleComment.trim()) { setError('Comment is required'); return }
      try {
        setError(null)
        setIsLoading(true)
        await onSubmit({ title, bookId: selectedBookId, rating, comment: singleComment, language })
        onOpenChange(false)
      } catch (err: any) {
        setError(err.message || 'An error occurred while saving the review.')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen && !isLoading) setError(null)
    onOpenChange(isOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl">
            {step === 'form' && !bookId && mode === 'create' && (
              <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2" onClick={() => setStep('book')}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
            )}
            {mode === 'create' ? (step === 'book' ? 'Select a Book' : 'Write a Review') : 'Edit Review'}
          </DialogTitle>
        </DialogHeader>

        {/* STEP 1: BOOK SELECTION */}
        {step === 'book' && (
          <div className="py-4 space-y-3">
            {booksLoading ? (
              <div className="flex justify-center py-8">
                <div className="h-6 w-6 rounded-full border-2 border-muted border-t-primary animate-spin" />
              </div>
            ) : (
              <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2">
                <button
                  onClick={() => { setSelectedBookId(''); setStep('form') }}
                  className="w-full flex items-center gap-4 text-left p-4 rounded-xl border border-dashed border-border/60 hover:border-primary/50 hover:bg-primary/5 transition-all group"
                >
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <BookOpen className="w-5 h-5 opacity-50 group-hover:opacity-100" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">General Review</div>
                    <div className="text-sm text-muted-foreground">Not linked to a specific book</div>
                  </div>
                </button>

                {books.map((book) => (
                  <button
                    key={book.id}
                    onClick={() => { setSelectedBookId(book.id || null); setStep('form') }}
                    className={`w-full flex items-center gap-4 text-left p-4 rounded-xl border transition-all ${
                      selectedBookId === book.id
                        ? 'bg-primary/5 border-primary shadow-sm'
                        : 'hover:bg-muted/50 border-border/50 hover:border-border'
                    }`}
                  >
                    <div className="h-12 w-8 bg-muted rounded shrink-0 flex items-center justify-center overflow-hidden">
                      {book.coverImageUrl ? (
                        <img src={book.coverImageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <BookOpen className="w-4 h-4 text-muted-foreground/50" />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground line-clamp-1">{book.title}</div>
                      <div className="text-sm text-muted-foreground line-clamp-1">{book.author}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 2: FORM */}
        {step === 'form' && (
          <form onSubmit={handleSubmit} className="py-4 space-y-6 flex-1">

            {!bookId && selectedBookId && (
              <div className="bg-muted/50 p-3 rounded-lg border border-border/50 flex items-center gap-3">
                <div className="p-2 bg-background rounded shadow-sm">
                  <BookOpen className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Linked Book</p>
                  <p className="text-sm font-semibold text-foreground">
                    {books.find(b => b.id === selectedBookId)?.title}
                  </p>
                </div>
              </div>
            )}

            {mode === 'edit' && initialValues?.createdAt && (
              <div className="bg-muted/30 p-3 rounded-lg border border-border/50 flex items-center gap-2">
                <Info className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  Original review published on <span className="font-medium">{formatDate(initialValues.createdAt)}</span>
                </p>
              </div>
            )}

            {/* Title + Rating */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-start">
              <div className="space-y-2">
                <label className="text-sm font-semibold tracking-tight">Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., A masterpiece of system design..."
                  className="font-medium placeholder:font-normal"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold tracking-tight">Rating</label>
                <div className="flex items-center gap-1 bg-muted/30 p-2 rounded-lg border border-border/50 w-fit">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(null)}
                      className="p-1 transition-transform hover:scale-110 focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 transition-colors ${
                          star <= (hoveredStar ?? rating)
                            ? 'fill-warning text-warning'
                            : 'fill-muted text-muted-foreground/30'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm font-medium text-muted-foreground w-4 text-center">
                    {hoveredStar ?? rating}
                  </span>
                </div>
              </div>
            </div>

            {/* Language tabs */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold tracking-tight">
                  {mode === 'create' ? 'Languages' : 'Language'}
                </label>
                {mode === 'create' && (
                  <span className="text-xs text-muted-foreground">
                    Switch tabs to write each version — both will be published
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 bg-muted/30 p-1.5 rounded-lg border border-border/50 w-fit">
                {LANGUAGES.map((lang) => {
                  const isActive = mode === 'create' ? activeLang === lang.value : language === lang.value
                  const hasContent = mode === 'create' && comments[lang.value].trim().length > 0
                  return (
                    <button
                      key={lang.value}
                      type="button"
                      onClick={() => mode === 'create' ? setActiveLang(lang.value) : setLanguage(lang.value)}
                      className={`relative flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                      {hasContent && (
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary border-2 border-background" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Markdown editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <div className="flex items-center gap-4">
                  {(['write', 'preview'] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={`text-sm font-medium pb-2 border-b-2 transition-colors -mb-2.25 capitalize ${
                        activeTab === tab
                          ? 'border-primary text-foreground'
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                  <Info className="w-3 h-3" />
                  Markdown supported
                </div>
              </div>

              {activeTab === 'write' ? (
                <textarea
                  value={activeComment}
                  onChange={(e) => setActiveComment(e.target.value)}
                  placeholder={
                    mode === 'create' && activeLang === 'pt-BR'
                      ? 'Compartilhe seus pensamentos em português...'
                      : 'Share your thoughts, notes, and takeaways...'
                  }
                  className="w-full min-h-62.5 p-4 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y leading-relaxed"
                />
              ) : (
                <div className="min-h-62.5 p-4 bg-muted/20 border border-border rounded-lg overflow-y-auto">
                  {activeComment.trim() ? (
                    <MarkdownPreview text={activeComment} showPreview={true} />
                  ) : (
                    <p className="text-sm text-muted-foreground italic text-center mt-10">
                      Nothing to preview yet.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Create mode: language status hint */}
            {mode === 'create' && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2 border border-border/50">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {filledLanguages.length === 0
                    ? 'Write content in at least one language to publish.'
                    : filledLanguages.length === 1
                    ? `${filledLanguages[0].label} ready. Switch tabs to also add a ${LANGUAGES.find(l => !comments[l.value].trim())?.label} version.`
                    : 'Both languages ready — will publish 2 reviews.'}
                </span>
              </div>
            )}

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <DialogFooter className="pt-4 border-t">
              <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="min-w-30">
                {isLoading
                  ? (mode === 'create' ? 'Publishing...' : 'Saving...')
                  : mode === 'create'
                  ? (filledLanguages.length > 1 ? 'Publish Both' : 'Publish Review')
                  : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
