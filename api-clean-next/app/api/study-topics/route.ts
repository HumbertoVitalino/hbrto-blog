import { StudyTopicRepository } from "@/infrastructure/repositories/StudyTopicRepository";
import {
    GetAllStudyTopicsUseCase,
    GetStudyTopicByIdUseCase,
    CreateStudyTopicUseCase,
    UpdateStudyTopicUseCase,
    DeleteStudyTopicUseCase
} from "@/application/usecases";
import { studyTopicsToPlain, studyTopicToPlain } from "@/lib/mappers";
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

        const repo = new StudyTopicRepository();

        if (id) {
            const useCase = new GetStudyTopicByIdUseCase(repo);
            const topic = await useCase.execute(id);

            if (!topic) {
                return NextResponse.json(
                    { error: "Study topic not found" },
                    { status: 404 }
                );
            }

            return NextResponse.json(studyTopicToPlain(topic));
        }

        const useCase = new GetAllStudyTopicsUseCase(repo);
        const topics = await useCase.execute();
        return NextResponse.json(studyTopicsToPlain(topics));
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
        const repo = new StudyTopicRepository();
        const useCase = new CreateStudyTopicUseCase(repo);

        const topic = await useCase.execute({
            title: body.title,
            description: body.description,
            status: body.status,
            priority: body.priority,
            resourceUrl: body.resourceUrl
        });

        return NextResponse.json(studyTopicToPlain(topic), { status: 201 });
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
                { error: "Study topic ID is required" },
                { status: 400 }
            );
        }

        const body = await request.json();
        const repo = new StudyTopicRepository();
        const useCase = new UpdateStudyTopicUseCase(repo);

        const topic = await useCase.execute(id, {
            title: body.title,
            description: body.description,
            status: body.status,
            priority: body.priority,
            resourceUrl: body.resourceUrl
        });

        return NextResponse.json(studyTopicToPlain(topic));
    }
    catch (error: any) {
        if (error.message === "Study topic not found") {
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
                { error: "Study topic ID is required" },
                { status: 400 }
            );
        }

        const repo = new StudyTopicRepository();
        const useCase = new DeleteStudyTopicUseCase(repo);

        await useCase.execute(id);

        return NextResponse.json(
            { message: "Study topic deleted successfully" },
            { status: 200 }
        );
    }
    catch (error: any) {
        if (error.message === "Study topic not found") {
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
