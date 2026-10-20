import { Note, NoteEntry, NoteLanguage, NoteSubject, NoteSubjectKind } from "@/domain/Note";
import { supabase } from "../supabase/client";

/** What the write side needs: the versions and the ids of what the note cites, in display order. */
export interface NoteDraft {
    entries: NoteEntry[];
    subjects: { kind: NoteSubjectKind; id: string }[];
    createdAt?: Date;
}

// One round trip: the note, its language versions, and each citation joined to its book or game.
const NOTE_SELECT = `
    id, created_at, updated_at,
    note_entries ( language, title, body ),
    note_refs (
        position,
        book:books ( id, title, author, cover_image_url ),
        game:games ( id, title, platform, cover_image_url )
    )
`;

interface NoteRow {
    id: string;
    created_at: string;
    updated_at: string;
    note_entries: { language: string; title: string; body: string }[];
    note_refs: {
        position: number;
        book: { id: string; title: string; author: string; cover_image_url: string | null } | null;
        game: { id: string; title: string; platform: string; cover_image_url: string | null } | null;
    }[];
}

const PLATFORM_LABEL: Record<string, string> = {
    psn: "PlayStation",
    "nintendo-switch": "Nintendo Switch",
};

function toSubject(ref: NoteRow["note_refs"][number]): NoteSubject | null {
    if (ref.book) {
        return {
            kind: "book",
            id: ref.book.id,
            title: ref.book.title,
            byline: ref.book.author,
            coverImageUrl: ref.book.cover_image_url ?? undefined,
        };
    }
    if (ref.game) {
        return {
            kind: "game",
            id: ref.game.id,
            title: ref.game.title,
            byline: PLATFORM_LABEL[ref.game.platform] ?? ref.game.platform,
            coverImageUrl: ref.game.cover_image_url ?? undefined,
        };
    }
    return null;
}

function toNote(row: NoteRow): Note {
    return new Note({
        id: row.id,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
        entries: row.note_entries.map((e) => ({
            language: e.language as NoteLanguage,
            title: e.title,
            body: e.body,
        })),
        subjects: [...row.note_refs]
            .sort((a, b) => a.position - b.position)
            .map(toSubject)
            .filter((s): s is NoteSubject => s !== null),
    });
}

export class NoteRepository {
    async findAll(): Promise<Note[]> {
        const { data, error } = await supabase
            .from("notes")
            .select(NOTE_SELECT)
            .order("created_at", { ascending: false });

        if (error) throw new Error(error.message);

        return (data as unknown as NoteRow[]).map(toNote);
    }

    async findById(id: string): Promise<Note | null> {
        const { data, error } = await supabase
            .from("notes")
            .select(NOTE_SELECT)
            .eq("id", id)
            .maybeSingle();

        if (error) {
            // an id that is not a uuid is simply not a note
            if (error.code === "22P02") return null;
            throw new Error(error.message);
        }

        return data ? toNote(data as unknown as NoteRow) : null;
    }

    async findBySubject(kind: NoteSubjectKind, subjectId: string): Promise<Note[]> {
        const column = kind === "book" ? "book_id" : "game_id";
        const { data: refs, error: refsError } = await supabase
            .from("note_refs")
            .select("note_id")
            .eq(column, subjectId);

        if (refsError) throw new Error(refsError.message);
        if (refs.length === 0) return [];

        // a second query, so each note keeps every citation and not only the matching one
        const { data, error } = await supabase
            .from("notes")
            .select(NOTE_SELECT)
            .in("id", refs.map((r) => r.note_id))
            .order("created_at", { ascending: false });

        if (error) throw new Error(error.message);

        return (data as unknown as NoteRow[]).map(toNote);
    }

    async findIdByLegacyReviewId(reviewId: string): Promise<string | null> {
        const { data, error } = await supabase
            .from("note_entries")
            .select("note_id")
            .eq("legacy_review_id", reviewId)
            .maybeSingle();

        if (error) {
            if (error.code === "22P02") return null;
            throw new Error(error.message);
        }

        return data?.note_id ?? null;
    }

    /** Creates the note when `id` is omitted, otherwise replaces its versions and citations. Atomic. */
    async save(draft: NoteDraft, id?: string): Promise<Note> {
        const { data: savedId, error } = await supabase.rpc("save_note", {
            p_id: id ?? null,
            p_entries: draft.entries,
            p_refs: draft.subjects.map((s) => (s.kind === "book" ? { bookId: s.id } : { gameId: s.id })),
            p_created_at: draft.createdAt?.toISOString() ?? null,
        });

        if (error) {
            if (error.code === "P0002") throw new Error("Note not found");
            // a citation pointing at a book or game that no longer exists
            if (error.code === "23503") throw new Error("A cited book or game no longer exists");
            throw new Error(error.message);
        }

        const note = await this.findById(savedId as string);
        if (!note) throw new Error("Note not found");
        return note;
    }

    async delete(id: string): Promise<void> {
        const { error } = await supabase.from("notes").delete().eq("id", id);
        if (error) throw new Error(error.message);
    }
}
