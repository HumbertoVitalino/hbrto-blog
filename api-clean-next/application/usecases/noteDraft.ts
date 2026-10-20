import { NOTE_LANGUAGES, NoteLanguage, NoteSubjectKind } from "@/domain/Note";
import { NoteDraft } from "@/infrastructure/repositories/NoteRepository";

export interface NoteDTO {
    entries: { language: NoteLanguage; title: string; body: string }[];
    subjects?: { kind: NoteSubjectKind; id: string }[];
    createdAt?: string | Date;
}

const KINDS: NoteSubjectKind[] = ["book", "game"];

/** Validates and normalises what create and update both accept. */
export function toNoteDraft(dto: NoteDTO): NoteDraft {
    const entries = (dto.entries ?? [])
        .map((e) => ({ language: e.language, title: e.title?.trim() ?? "", body: e.body?.trim() ?? "" }))
        // an untouched second language is not a version
        .filter((e) => e.title || e.body);

    if (entries.length === 0) {
        throw new Error("Write the note in at least one language");
    }

    const seen = new Set<NoteLanguage>();
    for (const e of entries) {
        if (!NOTE_LANGUAGES.includes(e.language)) throw new Error(`Unsupported language: ${e.language}`);
        if (seen.has(e.language)) throw new Error("Each language can only have one version");
        if (!e.title) throw new Error("Title is required");
        if (!e.body) throw new Error("The note is empty");
        seen.add(e.language);
    }

    const subjects: NoteDraft["subjects"] = [];
    for (const s of dto.subjects ?? []) {
        if (!KINDS.includes(s.kind) || !s.id) throw new Error("Invalid citation");
        if (!subjects.some((x) => x.kind === s.kind && x.id === s.id)) subjects.push({ kind: s.kind, id: s.id });
    }

    let createdAt: Date | undefined;
    if (dto.createdAt) {
        createdAt = new Date(dto.createdAt);
        if (Number.isNaN(createdAt.getTime())) throw new Error("Invalid date");
    }

    return { entries, subjects, createdAt };
}
