import { SubscriberRepository } from "@/infrastructure/repositories/SubscriberRepository";
import { GetAllSubscribersUseCase, UnsubscribeUseCase } from "@/application/usecases";
import { subscribersToPlain } from "@/lib/mappers";
import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/infrastructure/supabase/client";

async function isAdmin(request: NextRequest) {
    try {
        const authHeader = request.headers.get("authorization");

        if (!authHeader?.startsWith("Bearer ")) {
            return false;
        }

        const token = authHeader.slice(7);
        const { data, error } = await supabase.auth.getUser(token);

        if (error || !data.user) {
            return false;
        }

        return data.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    } catch {
        return false;
    }
}

export async function GET(request: NextRequest) {
    try {
        if (!await isAdmin(request)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const repo = new SubscriberRepository();
        const useCase = new GetAllSubscribersUseCase(repo);
        const subscribers = await useCase.execute();
        return NextResponse.json(subscribersToPlain(subscribers));
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        if (!await isAdmin(request)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { email } = await request.json();
        const repo = new SubscriberRepository();
        const useCase = new UnsubscribeUseCase(repo);
        await useCase.execute({ email });
        return NextResponse.json({ message: "Subscriber removed" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
