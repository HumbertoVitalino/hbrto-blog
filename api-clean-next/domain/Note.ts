export type NoteLanguage = 'en' | 'pt-BR'

export const NOTE_LANGUAGES: NoteLanguage[] = ['en', 'pt-BR']

/** One language version of a note. */
export interface NoteEntry {
    language: NoteLanguage
    title: string
    body: string
}

export type NoteSubjectKind = 'book' | 'game'

/** Something a note cites, resolved from the library or the games catalog. */
export interface NoteSubject {
    kind: NoteSubjectKind
    id: string
    title: string
    /** Author for a book, platform for a game. */
    byline?: string
    coverImageUrl?: string
}

export class Note {
    private _id: string
    private _createdAt: Date
    private _updatedAt: Date
    private _entries: NoteEntry[]
    private _subjects: NoteSubject[]

    constructor(props: {
        id: string
        createdAt?: Date
        updatedAt?: Date
        entries: NoteEntry[]
        subjects?: NoteSubject[]
    }) {
        if (props.entries.length === 0) {
            throw new Error('A note needs at least one language version')
        }
        this._id = props.id
        this._createdAt = props.createdAt ?? new Date()
        this._updatedAt = props.updatedAt ?? this._createdAt
        // English first, so the default version is stable
        this._entries = [...props.entries].sort(
            (a, b) => NOTE_LANGUAGES.indexOf(a.language) - NOTE_LANGUAGES.indexOf(b.language),
        )
        this._subjects = props.subjects ?? []
    }

    get id() { return this._id }
    get createdAt() { return this._createdAt }
    get updatedAt() { return this._updatedAt }
    get entries() { return this._entries }
    get subjects() { return this._subjects }
    get languages() { return this._entries.map(e => e.language) }

    /** The version in `language`, falling back to the first one written. */
    entry(language?: NoteLanguage): NoteEntry {
        return this._entries.find(e => e.language === language) ?? this._entries[0]
    }

    get title() { return this.entry().title }

    cites(kind: NoteSubjectKind, id: string) {
        return this._subjects.some(s => s.kind === kind && s.id === id)
    }
}
