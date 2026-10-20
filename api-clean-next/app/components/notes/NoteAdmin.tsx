'use client'

import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useState, type ReactNode } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/app/context/AuthContext'
import type { NoteData } from '@/lib/mappers'
import type { NoteSubjectKind } from '@/domain/Note'
import { noteApi, type NoteNotification } from '@/app/hooks/useNotes'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'

// The editor (and the markdown highlighter it previews with) only loads for the admin.
const NoteEditor = dynamic(() => import('./NoteEditor'), { ssr: false })

export function announceSaved(notification: NoteNotification, verb: 'published' | 'saved') {
  if (!notification) return toast.success(`Note ${verb}`)
  if ('error' in notification) {
    return toast.error(`Note ${verb}, but the email didn’t go out`, { description: notification.error, duration: 10000 })
  }
  toast.success(`Note ${verb}`, {
    description: notification.sent === 1 ? 'Emailed to 1 subscriber.' : `Emailed to ${notification.sent} subscribers.`,
  })
}

/** "New note" for the admin; renders nothing for everyone else. */
export function NewNoteButton({ preset, className, trigger }: {
  preset?: { kind: NoteSubjectKind; id: string }
  className?: string
  trigger?: (open: () => void) => ReactNode
}) {
  const { isAdmin } = useAuth()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  if (!isAdmin) return null

  return (
    <>
      {trigger ? trigger(() => setOpen(true)) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn('inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90', className)}
        >
          <Plus className="size-4" />
          New note
        </button>
      )}
      {open && (
        <NoteEditor
          open={open}
          onOpenChange={setOpen}
          preset={preset}
          onSaved={(note, notification) => {
            announceSaved(notification, 'published')
            router.push(`/notes/${note.id}`)
            router.refresh()
          }}
        />
      )}
    </>
  )
}

/** Edit and delete on a note's own page. */
export function NoteActions({ note, className }: { note: NoteData; className?: string }) {
  const { isAdmin } = useAuth()
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  if (!isAdmin) return null

  const remove = async () => {
    setDeleting(true)
    try {
      await noteApi.remove(note.id)
      toast.success('Note deleted')
      setConfirming(false)
      router.push('/notes')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'The note couldn’t be deleted')
      setDeleting(false)
    }
  }

  const action = 'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'

  return (
    <div className={cn('flex gap-1', className)}>
      <button type="button" onClick={() => setEditing(true)} className={action}>
        <Pencil className="size-3.5" /> Edit
      </button>
      <button type="button" onClick={() => setConfirming(true)} className={cn(action, 'hover:text-destructive-text')}>
        <Trash2 className="size-3.5" /> Delete
      </button>

      {editing && (
        <NoteEditor
          open={editing}
          onOpenChange={setEditing}
          note={note}
          onSaved={() => {
            announceSaved(null, 'saved')
            router.refresh()
          }}
        />
      )}

      <AlertDialog open={confirming} onOpenChange={o => !deleting && setConfirming(o)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this note?</AlertDialogTitle>
            <AlertDialogDescription>
              Every language version and its citations go with it. This can’t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Keep it</AlertDialogCancel>
            <AlertDialogAction
              onClick={e => { e.preventDefault(); remove() }}
              disabled={deleting}
            >
              {deleting ? 'Deleting…' : 'Delete note'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
