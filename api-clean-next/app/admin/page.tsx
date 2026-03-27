'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'
import { useState, useCallback, useEffect } from 'react'
import { useBooks, BookData } from '@/app/hooks/useBooks'
import { BookFormModal } from '@/app/components/books/BookFormModal'
import { BooksGrid } from '@/app/components/books/BooksGrid'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, Plus } from 'lucide-react'

export default function AdminPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { books, isLoading, error, createBook, updateBook, deleteBook } = useBooks()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedBook, setSelectedBook] = useState<BookData | undefined>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | undefined>()
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Protect this route - redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/admin/login')
    }
  }, [user, authLoading, router])

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Return early if not authenticated (will redirect via useEffect)
  if (!user) {
    return null
  }

  const handleEdit = useCallback((book: BookData) => {
    setSelectedBook(book)
    setSubmitError(null)
    setIsFormOpen(true)
  }, [])

  const handleNewBook = useCallback(() => {
    setSelectedBook(undefined)
    setSubmitError(null)
    setIsFormOpen(true)
  }, [])

  const handleFormSubmit = useCallback(
    async (data: Omit<BookData, 'id'>) => {
      try {
        setIsSubmitting(true)
        setSubmitError(null)

        if (selectedBook && selectedBook.id) {
          await updateBook(selectedBook.id, data)
        } else {
          await createBook(data)
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao salvar livro'
        setSubmitError(message)
        throw err
      } finally {
        setIsSubmitting(false)
      }
    },
    [selectedBook, createBook, updateBook]
  )

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm('Tem certeza que deseja deletar este artigo? Esta ação não pode ser desfeita.')) {
        return
      }

      try {
        setDeletingId(id)
        await deleteBook(id)
      } finally {
        setDeletingId(undefined)
      }
    },
    [deleteBook]
  )

  return (
    <main className="min-h-screen bg-linear-to-b from-background to-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-3">
            Painel Administrativo
          </h1>
          <p className="text-lg text-muted-foreground mb-2">
            Gerencie seus artigos e conteúdo
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Autenticado como: <span className="font-semibold">{user?.email}</span>
          </p>

          <Button size="lg" onClick={handleNewBook}>
            <Plus className="w-5 h-5 mr-2" />
            Novo Artigo
          </Button>
        </div>

        {/* Error Messages */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro ao carregar artigos</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {submitError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro ao salvar</AlertTitle>
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <BooksGrid
            books={books}
            onEdit={handleEdit}
            onDelete={handleDelete}
            deletingId={deletingId}
            isPublic={false}
          />
        )}
      </div>

      {/* Form Modal */}
      <BookFormModal
        isOpen={isFormOpen}
        book={selectedBook}
        isLoading={isSubmitting}
        onSubmit={handleFormSubmit}
        onOpenChange={setIsFormOpen}
      />
    </main>
  )
}
