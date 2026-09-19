import { StudyEpicRepository } from "@/infrastructure/repositories/StudyEpicRepository";
import {
    GetAllStudyEpicsUseCase,
    GetStudyEpicByIdUseCase,
    CreateStudyEpicUseCase,
    UpdateStudyEpicUseCase,
    DeleteStudyEpicUseCase
} from "@/application/usecases";
import { studyEpicsToPlain, studyEpicToPlain } from "@/lib/mappers";
import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/infrastructure/supabase/client";

async function isAdmin(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');

        if (!authHeader?.startsWith('Bearer ')) {
            return false;
        }

        const token = authHeader.slice(7);

        const { data, error } = await supabase.auth.getUser(token);

        if (error || !data.user) {
            return false;
        }

        const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
        return data.user.email === adminEmail;
    } catch (error) {
        return false;
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        const repo = new StudyEpicRepository();

        if (id) {
            const useCase = new GetStudyEpicByIdUseCase(repo);
            const epic = await useCase.execute(id);

            if (!epic) {
                return NextResponse.json(
                    { error: "Study epic not found" },
                    { status: 404 }
                );
            }

            return NextResponse.json(studyEpicToPlain(epic));
        }

        const useCase = new GetAllStudyEpicsUseCase(repo);
        const epics = await useCase.execute();
        return NextResponse.json(studyEpicsToPlain(epics));
    }
    catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        if (!await isAdmin(request)) {
            return NextResponse.json(
                { error: "Unauthorized. Only admin can create." },
                { status: 401 }
            );
        }

        const body = await request.json();
        const repo = new StudyEpicRepository();
        const useCase = new CreateStudyEpicUseCase(repo);

        const epic = await useCase.execute({
            title: body.title,
            description: body.description,
            status: body.status,
            color: body.color,
            targetSeconds: body.targetSeconds
        });

        return NextResponse.json(studyEpicToPlain(epic), { status: 201 });
    }
    catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 400 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        if (!await isAdmin(request)) {
            return NextResponse.json(
                { error: "Unauthorized. Only admin can update." },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { error: "Study epic ID is required" },
                { status: 400 }
            );
        }

        const body = await request.json();
        const repo = new StudyEpicRepository();
        const useCase = new UpdateStudyEpicUseCase(repo);

        const epic = await useCase.execute(id, {
            title: body.title,
            description: body.description,
            status: body.status,
            color: body.color,
            targetSeconds: body.targetSeconds
        });

        return NextResponse.json(studyEpicToPlain(epic));
    }
    catch (error: any) {
        if (error.message === "Study epic not found") {
            return NextResponse.json(
                { error: error.message },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: error.message },
            { status: 400 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        if (!await isAdmin(request)) {
            return NextResponse.json(
                { error: "Unauthorized. Only admin can delete." },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { error: "Study epic ID is required" },
                { status: 400 }
            );
        }

        const repo = new StudyEpicRepository();
        const useCase = new DeleteStudyEpicUseCase(repo);

        await useCase.execute(id);

        return NextResponse.json(
            { message: "Study epic deleted successfully" },
            { status: 200 }
        );
    }
    catch (error: any) {
        if (error.message === "Study epic not found") {
            return NextResponse.json(
                { error: error.message },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: error.message },
            { status: 400 }
        );
    }
}
