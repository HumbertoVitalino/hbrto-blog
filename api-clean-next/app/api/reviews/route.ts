import { ReviewRepository } from "@/infrastructure/repositories/ReviewRepository";
import { SubscriberRepository } from "@/infrastructure/repositories/SubscriberRepository";
import {
    GetAllReviewsUseCase,
    CreateReviewUseCase,
} from "@/application/usecases";
import { EmailService } from "@/infrastructure/email/EmailService";
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

export async function GET(request: NextRequest) {
    try {
        const repo = new ReviewRepository();
        const useCase = new GetAllReviewsUseCase(repo);
        const reviews = await useCase.execute();
        return NextResponse.json(reviewsToPlain(reviews));
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
        // Verify admin status
        if (!await isAdmin(request)) {
            return NextResponse.json(
                { error: "Unauthorized. Only admin can create reviews." },
                { status: 401 }
            );
        }

        const body = await request.json();
        const repo = new ReviewRepository();
        const useCase = new CreateReviewUseCase(repo);

        // Allow creating with or without bookId
        const review = await useCase.execute({
            title: body.title,
            bookId: body.bookId || null,
            rating: body.rating,
            comment: body.comment,
            language: body.language ?? 'en',
        });

        const subscribers = await new SubscriberRepository().findAll();
        const emails = subscribers.map(s => s.email);
        await new EmailService().sendNewReview(emails, review.title, review.id);

        return NextResponse.json(reviewToPlain(review), { status: 201 });
    }
    catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 400 }
        );
    }
}
