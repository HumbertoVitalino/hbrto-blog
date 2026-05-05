import { ReleaseNoteRepository } from "@/infrastructure/repositories/ReleaseNoteRepository"
import {
    GetReleaseNoteByIdUseCase,
    UpdateReleaseNoteUseCase,
    DeleteReleaseNoteUseCase,
} from "@/application/usecases"
import { releaseNoteToPlain } from "@/lib/mappers"
import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/infrastructure/supabase/client"

async function isAdmin(request: NextRequest) {
    try {
        const token = request.headers.get("authorization")?.slice(7)
        if (!token) return false
        const { data, error } = await supabase.auth.getUser(token)
        if (error || !data.user) return false
        return data.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL
    } catch {
        return false
    }
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ noteId: string }> }) {
    try {
        const { noteId } = await params
        const repo = new ReleaseNoteRepository()
        const note = await new GetReleaseNoteByIdUseCase(repo).execute(noteId)

        if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 })

        return NextResponse.json(releaseNoteToPlain(note))
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ noteId: string }> }) {
    try {
        if (!await isAdmin(request)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { noteId } = await params
        const body = await request.json()
        const repo = new ReleaseNoteRepository()
        const note = await new UpdateReleaseNoteUseCase(repo).execute(noteId, {
            version: body.version,
            title: body.title,
            description: body.description,
        })

        return NextResponse.json(releaseNoteToPlain(note))
    } catch (error: any) {
        const status = error.message === "Release note not found" ? 404 : 400
        return NextResponse.json({ error: error.message }, { status })
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ noteId: string }> }) {
    try {
        if (!await isAdmin(request)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { noteId } = await params
        const repo = new ReleaseNoteRepository()
        await new DeleteReleaseNoteUseCase(repo).execute(noteId)

        return NextResponse.json({ message: "Deleted successfully" })
    } catch (error: any) {
        const status = error.message === "Release note not found" ? 404 : 400
        return NextResponse.json({ error: error.message }, { status })
    }
}
