import { ReviewRepository } from "@/infrastructure/repositories/ReviewRepository";
import {
    GetReviewByIdUseCase,
    UpdateReviewUseCase,
    DeleteReviewUseCase,
} from "@/application/usecases";
import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/infrastructure/supabase/client";

async function isAdmin(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');

        if (!authHeader?.startsWith('Bearer ')) {
            return false;
        }

        const token = authHeader.slice(7);

        // Verify token with Supabase
        const { data, error } = await supabase.auth.getUser(token);

        if (error || !data.user) {
            return false;
        }

        // Check if user is admin
        const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
        return data.user.email === adminEmail;
    } catch (error) {
        return false;
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ bookId: string; reviewId: string }> }
) {
    try {
        const { reviewId } = await params;
        const repo = new ReviewRepository();
        const useCase = new GetReviewByIdUseCase(repo);
        const review = await useCase.execute(reviewId);

        if (!review) {
            return NextResponse.json(
                { error: "Review not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(review);
    }
    catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ bookId: string; reviewId: string }> }
) {
    try {
        // Verify admin status
        if (!await isAdmin(request)) {
            return NextResponse.json(
                { error: "Unauthorized. Only admin can update reviews." },
                { status: 401 }
            );
        }

        const { reviewId } = await params;
        const body = await request.json();
        const repo = new ReviewRepository();
        const useCase = new UpdateReviewUseCase(repo);

        const review = await useCase.execute(reviewId, {
            rating: body.rating,
            comment: body.comment
        });

        return NextResponse.json(review);
    }
    catch (error: any) {
        if (error.message === "Review not found") {
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

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ bookId: string; reviewId: string }> }
) {
    try {
        // Verify admin status
        if (!await isAdmin(request)) {
            return NextResponse.json(
                { error: "Unauthorized. Only admin can delete reviews." },
                { status: 401 }
            );
        }

        const { reviewId } = await params;
        const repo = new ReviewRepository();
        const useCase = new DeleteReviewUseCase(repo);

        await useCase.execute(reviewId);

        return NextResponse.json(
            { message: "Review deleted successfully" },
            { status: 200 }
        );
    }
    catch (error: any) {
        if (error.message === "Review not found") {
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
