import type { NoteLanguage, NoteSubject } from '@/domain/Note'
import { stripMarkdown } from '@/lib/plainText'

// Dates are read where they were written, so a note from late Dec 31 stays in its year.
export const NOTE_TIME_ZONE = 'America/Sao_Paulo'

export const LANGUAGE_LABEL: Record<NoteLanguage, string> = {
    en: 'English',
    'pt-BR': 'Português',
}

function format(iso: string, options: Intl.DateTimeFormatOptions) {
    return new Intl.DateTimeFormat('en', { timeZone: NOTE_TIME_ZONE, ...options }).format(new Date(iso))
}

export function noteYear(iso: string): number {
    return Number(format(iso, { year: 'numeric' }))
}

/** "Oct 14" */
export function noteDay(iso: string): string {
    return format(iso, { month: 'short', day: 'numeric' })
}

/** "October 14, 2026" */
export function noteDate(iso: string): string {
    return format(iso, { month: 'long', day: 'numeric', year: 'numeric' })
}

/** "2026-10-14", the day as an <input type="date"> holds it. */
export function noteDateInputValue(iso: string): string {
    return new Intl.DateTimeFormat('en-CA', { timeZone: NOTE_TIME_ZONE }).format(new Date(iso))
}

export function noteExcerpt(body: string, max = 180): string {
    const text = stripMarkdown(body)
    return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text
}

/** The opening paragraph of prose, skipping headings, rules, code and lists. */
export function noteOpening(body: string, max = 340): string {
    const paragraph = body
        .split(/\r?\n\s*\r?\n/)
        .map(p => p.trim())
        .find(p => p && !/^(#|---|\*\*\*|```|>|[-*+]\s|\d+\.\s)/.test(p))
    return noteExcerpt(paragraph ?? body, max)
}

export function subjectHref(subject: Pick<NoteSubject, 'kind' | 'id'>): string {
    return subject.kind === 'book' ? `/library/${subject.id}` : '/games'
}
