import { NoteRepository } from "@/infrastructure/repositories/NoteRepository";
import {
    GetNoteByIdUseCase,
    UpdateNoteUseCase,
    DeleteNoteUseCase,
} from "@/application/usecases";
import { noteToPlain } from "@/lib/mappers";
import { isAdminRequest } from "@/lib/adminAuth";
import { revalidateNotes } from "@/lib/revalidateNotes";
import { NextResponse, NextRequest } from "next/server";

type Params = { params: Promise<{ noteId: string }> };

export async function GET(request: NextRequest, { params }: Params) {
    try {
        const { noteId } = await params;
        const note = await new GetNoteByIdUseCase(new NoteRepository()).execute(noteId);

        if (!note) {
            return NextResponse.json({ error: "Note not found" }, { status: 404 });
        }

        return NextResponse.json(noteToPlain(note));
    }
    catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: Params) {
    try {
        if (!await isAdminRequest(request)) {
            return NextResponse.json(
                { error: "Unauthorized. Only admin can edit notes." },
                { status: 401 }
            );
        }

        const { noteId } = await params;
        const body = await request.json();
        const note = await new UpdateNoteUseCase(new NoteRepository()).execute(noteId, {
            entries: body.entries,
            subjects: body.subjects,
            createdAt: body.createdAt,
        });

        revalidateNotes();
        return NextResponse.json(noteToPlain(note));
    }
    catch (error: any) {
        const status = error.message === "Note not found" ? 404 : 400;
        return NextResponse.json({ error: error.message }, { status });
    }
}

export async function DELETE(request: NextRequest, { params }: Params) {
    try {
        if (!await isAdminRequest(request)) {
            return NextResponse.json(
                { error: "Unauthorized. Only admin can delete notes." },
                { status: 401 }
            );
        }

        const { noteId } = await params;
        await new DeleteNoteUseCase(new NoteRepository()).execute(noteId);

        revalidateNotes();
        return NextResponse.json({ message: "Note deleted" }, { status: 200 });
    }
    catch (error: any) {
        const status = error.message === "Note not found" ? 404 : 400;
        return NextResponse.json({ error: error.message }, { status });
    }
}
