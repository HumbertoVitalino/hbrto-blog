import { StudySessionRepository } from "@/infrastructure/repositories/StudySessionRepository";
import {
    GetAllStudySessionsUseCase,
    CreateStudySessionUseCase,
    DeleteStudySessionUseCase
} from "@/application/usecases";
import { studySessionsToPlain, studySessionToPlain } from "@/lib/mappers";
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
        const topicId = searchParams.get("topicId") ?? undefined;

        const repo = new StudySessionRepository();
        const useCase = new GetAllStudySessionsUseCase(repo);
        const sessions = await useCase.execute(topicId);
        return NextResponse.json(studySessionsToPlain(sessions));
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
                { error: "Unauthorized. Only admin can log study sessions." },
                { status: 401 }
            );
        }

        const body = await request.json();
        const repo = new StudySessionRepository();
        const useCase = new CreateStudySessionUseCase(repo);

        const session = await useCase.execute({
            topicId: body.topicId,
            phaseType: body.phaseType,
            plannedSeconds: body.plannedSeconds,
            actualSeconds: body.actualSeconds,
            completed: body.completed,
            startedAt: body.startedAt,
            endedAt: body.endedAt
        });

        return NextResponse.json(studySessionToPlain(session), { status: 201 });
    }
    catch (error: any) {
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
                { error: "Study session ID is required" },
                { status: 400 }
            );
        }

        const repo = new StudySessionRepository();
        const useCase = new DeleteStudySessionUseCase(repo);

        await useCase.execute(id);

        return NextResponse.json(
            { message: "Study session deleted successfully" },
            { status: 200 }
        );
    }
    catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 400 }
        );
    }
}
