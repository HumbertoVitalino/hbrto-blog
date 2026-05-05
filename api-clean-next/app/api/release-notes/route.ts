import { ReleaseNoteRepository } from "@/infrastructure/repositories/ReleaseNoteRepository"
import { GetAllReleaseNotesUseCase, CreateReleaseNoteUseCase } from "@/application/usecases"
import { releaseNotesToPlain, releaseNoteToPlain } from "@/lib/mappers"
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

export async function GET() {
    try {
        const repo = new ReleaseNoteRepository()
        const notes = await new GetAllReleaseNotesUseCase(repo).execute()
        return NextResponse.json(releaseNotesToPlain(notes))
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        if (!await isAdmin(request)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const repo = new ReleaseNoteRepository()
        const note = await new CreateReleaseNoteUseCase(repo).execute({
            version: body.version,
            title: body.title,
            description: body.description,
        })

        return NextResponse.json(releaseNoteToPlain(note), { status: 201 })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }
}
