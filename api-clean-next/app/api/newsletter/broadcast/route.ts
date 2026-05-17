import { SubscriberRepository } from "@/infrastructure/repositories/SubscriberRepository";
import { EmailService } from "@/infrastructure/email/EmailService";
import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/infrastructure/supabase/client";

async function isAdmin(request: NextRequest) {
    try {
        const authHeader = request.headers.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) return false;

        const token = authHeader.slice(7);
        const { data, error } = await supabase.auth.getUser(token);

        if (error || !data.user) return false;
        return data.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    } catch {
        return false;
    }
}

export async function POST(request: NextRequest) {
    try {
        if (!await isAdmin(request)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { subject, message } = await request.json();

        if (!subject?.trim() || !message?.trim()) {
            return NextResponse.json({ error: "Subject and message are required" }, { status: 400 });
        }

        const subscribers = await new SubscriberRepository().findAll();
        const emails = subscribers.map(s => s.email);

        await new EmailService().sendBroadcast(emails, subject, message);

        return NextResponse.json({ sent: emails.length });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
