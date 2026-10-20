import { NoteRepository } from "@/infrastructure/repositories/NoteRepository";
import { SubscriberRepository } from "@/infrastructure/repositories/SubscriberRepository";
import { EmailService } from "@/infrastructure/email/EmailService";
import {
    GetAllNotesUseCase,
    GetNotesBySubjectUseCase,
    CreateNoteUseCase,
    NotifySubscribersOfNoteUseCase,
} from "@/application/usecases";
import { notesToPlain, noteToPlain } from "@/lib/mappers";
import { isAdminRequest } from "@/lib/adminAuth";
import { revalidateNotes } from "@/lib/revalidateNotes";
import { NextResponse, NextRequest } from "next/server";

// GET /api/notes, /api/notes?book=<id>, /api/notes?game=<id>
export async function GET(request: NextRequest) {
    try {
        const repo = new NoteRepository();
        const book = request.nextUrl.searchParams.get("book");
        const game = request.nextUrl.searchParams.get("game");

        const notes = book
            ? await new GetNotesBySubjectUseCase(repo).execute("book", book)
            : game
            ? await new GetNotesBySubjectUseCase(repo).execute("game", game)
            : await new GetAllNotesUseCase(repo).execute();

        return NextResponse.json(notesToPlain(notes));
    }
    catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    if (!await isAdminRequest(request)) {
        return NextResponse.json(
            { error: "Unauthorized. Only admin can publish notes." },
            { status: 401 }
        );
    }

    let note;
    let notify = false;
    try {
        const body = await request.json();
        notify = body.notify === true;
        note = await new CreateNoteUseCase(new NoteRepository()).execute({
            entries: body.entries,
            subjects: body.subjects,
            createdAt: body.createdAt,
        });
    }
    catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    revalidateNotes();

    // The note is published even when the email fails; the response says what happened to it.
    let notification: { sent: number } | { error: string } | null = null;
    if (notify) {
        try {
            const sent = await new NotifySubscribersOfNoteUseCase(
                new SubscriberRepository(),
                new EmailService(),
            ).execute(note);
            notification = { sent };
        } catch (error: any) {
            console.error("[notes] subscriber email failed", error);
            notification = { error: error.message };
        }
    }

    return NextResponse.json({ note: noteToPlain(note), notification }, { status: 201 });
}
