import { ReviewRepository } from "@/infrastructure/repositories/ReviewRepository";
import {
    GetReviewsByBookIdUseCase,
    CreateReviewUseCase,
} from "@/application/usecases";
import { reviewsToPlain, reviewToPlain } from "@/lib/mappers";
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

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ bookId: string }> }
) {
    try {
        const { bookId } = await params;
        const repo = new ReviewRepository();
        const useCase = new GetReviewsByBookIdUseCase(repo);
        const reviews = await useCase.execute(bookId);
        return NextResponse.json(reviewsToPlain(reviews));
    }
    catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ bookId: string }> }
) {
    try {
        if (!await isAdmin(request)) {
            return NextResponse.json(
                { error: "Unauthorized. Only admin can create reviews." },
                { status: 401 }
            );
        }

        const { bookId } = await params;
        const body = await request.json();
        const repo = new ReviewRepository();
        const useCase = new CreateReviewUseCase(repo);

        const review = await useCase.execute({
            title: body.title,
            bookId: bookId,
            rating: body.rating,
            comment: body.comment
        });

        return NextResponse.json(reviewToPlain(review), { status: 201 });
    }
    catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 400 }
        );
    }
}
