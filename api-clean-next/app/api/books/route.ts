import { BookRepository } from "@/infrastructure/repositories/BookRepository";
import {
    GetAllBooksUseCase,
    GetBookByIdUseCase,
    CreateBookUseCase,
    UpdateBookUseCase,
    DeleteBookUseCase
} from "@/application/usecases";
import { booksToPlain, bookToPlain } from "@/lib/mappers";
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

        const repo = new BookRepository();

        if (id) {
            const useCase = new GetBookByIdUseCase(repo);
            const book = await useCase.execute(id);

            if (!book) {
                return NextResponse.json(
                    { error: "Book not found" },
                    { status: 404 }
                );
            }

            return NextResponse.json(bookToPlain(book));
        }

        const useCase = new GetAllBooksUseCase(repo);
        const books = await useCase.execute();
        return NextResponse.json(booksToPlain(books));
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
        const repo = new BookRepository();
        const useCase = new CreateBookUseCase(repo);

        const book = await useCase.execute({
            title: body.title,
            author: body.author,
            pages: body.pages,
            genre: body.genre
        });

        return NextResponse.json(bookToPlain(book), { status: 201 });
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
                { error: "Book ID is required" },
                { status: 400 }
            );
        }

        const body = await request.json();
        const repo = new BookRepository();
        const useCase = new UpdateBookUseCase(repo);

        const book = await useCase.execute(id, {
            title: body.title,
            author: body.author,
            pages: body.pages
        });

        return NextResponse.json(bookToPlain(book));
    }
    catch (error: any) {
        if (error.message === "Book not found") {
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
                { error: "Book ID is required" },
                { status: 400 }
            );
        }

        const repo = new BookRepository();
        const useCase = new DeleteBookUseCase(repo);

        await useCase.execute(id);

        return NextResponse.json(
            { message: "Book deleted successfully" },
            { status: 200 }
        );
    }
    catch (error: any) {
        if (error.message === "Book not found") {
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
